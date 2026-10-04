// ===============================================
// TEKALIS API - Server Principal
// 2026-09-03 : routes admin extraites vers routes/adminRoutes.js,
// errorHandler centralisé (middlewares/errorHandler.js) monté au lieu
// d'un handler dupliqué inline. Voir audit-tekalis.md pour le détail.
// ===============================================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";

// ─── Validation des variables d'environnement critiques ──────────────────────
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Variables d'environnement manquantes : ${missingVars.join(", ")}`);
  process.exit(1);
}

const INSECURE_JWT_SECRETS = ["superSecretKey123", "secret", "changeme", "password", "tekalis"];
if (!isDev && INSECURE_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error("❌ FATAL: JWT_SECRET non sécurisé détecté en production. Arrêt du serveur.");
  process.exit(1);
}
if (isDev && INSECURE_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
  console.warn("⚠️  ATTENTION: JWT_SECRET non sécurisé. NE PAS utiliser en production !");
}

if (!process.env.ADMIN_EMAIL) {
  console.warn("⚠️  ADMIN_EMAIL non défini. Les notifications de commandes admin seront désactivées.");
}

// FRONTEND_URL et BACKEND_URL composent TOUTES les URL des emails (liens de
// commande, reset de mot de passe, confirmation/désabonnement newsletter).
// Sans FRONTEND_URL, un client qui clique sur "Suivre ma commande" atterrit sur
// localhost. Mieux vaut le signaler au boot que le découvrir en production.
if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
  const missing = [!process.env.FRONTEND_URL && "FRONTEND_URL", !process.env.BACKEND_URL && "BACKEND_URL"]
    .filter(Boolean)
    .join(", ");
  console.warn(`⚠️  ${missing} non défini(s) — les liens dans les emails seront invalides.`);
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️  GOOGLE_CLIENT_ID non défini. La connexion avec Google sera désactivée (bouton masqué côté boutique).");
}

const connectDB = require("./config/database");
const emailQueue = require("./services/emailQueue");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = "/api/v1";

// ─── Trust proxy (INDISPENSABLE) ──────────────────────────────────────────────
// L'API tourne derrière le reverse proxy de Render. Sans cette ligne, req.ip
// vaut l'IP INTERNE du proxy — identique pour tous les visiteurs — et les
// rate-limiters keyed par IP se retrouvent à compter TOUTE la boutique dans un
// seul seau. Symptôme observé : la boutique répond, puis plus rien pendant 15
// minutes (le temps que la fenêtre glisse). Le nombre de sauts pour Render est
// 1 ; `true` serait laxiste (un client pourrait usurper l'en-tête pour
// contourner le rate-limiting). D'où le 1 : on ne fait confiance qu'à Render.
app.set("trust proxy", 1);

const sitemapRouter = require("./routes/sitemap");
app.use("/api/v1", sitemapRouter);

// Feed Google Merchant (hors rate-limiter : consommé par les bots Google)
const productFeedRouter = require("./routes/productFeed");
app.use("/api/v1", productFeedRouter);

// Feed Catalog Dynamique Meta (hors rate-limiter : consommé par Meta)
const metaCatalogRouter = require("./routes/metaCatalogFeed");
app.use("/api/v1", metaCatalogRouter);

// Tracking (hors rate-limiter global : voir routes/trackingRoutes.js —
// un limiter dédié est appliqué à l'intérieur)
const trackingRouter = require("./routes/trackingRoutes");
app.use("/api/v1/tracking", trackingRouter);

// ─── Connexion MongoDB ────────────────────────────────────────────────────────
connectDB().catch((err) => {
  console.error("❌ Erreur fatale de connexion MongoDB:", err.message);
  if (!isDev) process.exit(1);
});

// ─── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const buildAllowedOrigins = () => {
  const defaults = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
  ];
  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean);
    return [...new Set([...defaults, ...envOrigins])];
  }
  return defaults;
};

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn("🚫 CORS bloqué pour:", origin);
    callback(new Error("Non autorisé par CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
app.options("*", cors());

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({
  limit: "10mb",
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize({ allowDots: true }));

if (isDev) {
  app.use(morgan("dev"));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// RATE_LIMIT_DISABLED=true désactive tout (tests de charge, debug local
// ponctuel). En dehors de ça, les limiters de SÉCURITÉ — auth, mot de passe —
// restent actifs même en dev : c'est précisément le réglage qui laissait
// /forgot-password sans protection en local, et le comportement de dev doit
// ressembler à celui de prod sur ce point. Seuls les limiters de confort
// (API globale) cèdent devant isDev, pour ne pas bloquer une session de
// développement normale.
const rateLimitDisabled = process.env.RATE_LIMIT_DISABLED === "true";

const createLimiter = (options) => {
  if (rateLimitDisabled) {
    console.warn("⚠️  Rate limiting désactivé (RATE_LIMIT_DISABLED=true)");
    return (req, res, next) => next();
  }
  return rateLimit(options);
};

const createSoftLimiter = (options) => {
  if (isDev || rateLimitDisabled) {
    return (req, res, next) => next();
  }
  return rateLimit(options);
};

// ── Lectures publiques : hors budget du limiteur global ───────────────────────
// Les pages catalogue sont lues par les crawlers (SEO), par le rendu serveur de
// Vercel (ISR) et par les visiteurs. Les facturer sur le quota global revient à
// laisser un robot réveiller le quota que le visiteur suivant doit payer —
// c'est-à-dire recréer le bug de coupure globale, plus lentement et de façon
// incompréhensible.
//
// Chemins RELATIFS à /api/v1 : c'est ce que vaut req.path dans un app.use
// monté sur API_PREFIX (req.url y est déjà amputé du préfixe). Écrire
// "/api/v1/products" ici ne matchait jamais — l'exemption était morte.
const PUBLIC_READ_PATHS = [
  "/products",
  "/categories",
  "/articles",
  "/hero",
  "/trends",
  "/settings/public",
];

// Liste seulement : /products/:id incrémente viewCount et écrit en base, ce
// n'est pas une lecture. isPublicRead ne retient que le GET, donc un POST
// admin sur /products reste soumis au quota global.
const isPublicRead = (req) =>
  req.method === "GET" && PUBLIC_READ_PATHS.includes(req.path);

// AloneLimiter borne quand même ces endpoints par IP, plus bas que l'ancien
// plafond global — un 429 reste un vrai 429, on ne perd pas de page SEO.
const aloneLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PUBLIC_READ_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard" },
});

app.use(API_PREFIX, (req, res, next) =>
  isPublicRead(req) ? aloneLimiter(req, res, next) : next()
);

// 600 et non 100 : avec `trust proxy` actif chaque visiteur a son propre seau,
// mais les appels serveur de Vercel (ISR, sitemap) sortent d'un petit pool d'IP
// de sortie partagées. Une session de navigation réelle plafonne autour de 40
// appels par quart d'heure — 100 la tuait, 600 laisse dix fois de marge.
const apiLimiter = createSoftLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 600,
  message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
  // Indispensable : aloneLimiter appelle next() en cas de succès, et l'appel
  // retombait donc sur ce limiteur. Sans ce skip, une lecture publique
  // consommerait les DEUX seaux — l'exemption serait sans effet.
  skip: (req) => isPublicRead(req)
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes" }
});

// Réinitialisation de mot de passe : chaque appel déclenche un email, donc le
// plafond est bas et les succès sont COMPTÉS (skipSuccessfulRequests reste
// faux). Sans cela, la route sert de relais : un attaquant y injecte une
// adresse tierce et inonde sa boîte, ou la nôtre via le support.
const passwordResetLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_RESET_PASSWORD_MAX) || 5,
  message: {
    success: false,
    message: "Trop de demandes de réinitialisation. Réessayez dans quelques minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Trop de requêtes admin" }
});

const newsletterLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_NEWSLETTER_MAX) || 10,
  message: {
    success: false,
    message: "Trop de demandes d'inscription. Réessayez dans quelques minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(API_PREFIX, apiLimiter);
app.use(`${API_PREFIX}/auth/login`, authLimiter);
app.use(`${API_PREFIX}/auth/register`, authLimiter);
app.use(`${API_PREFIX}/auth/google`, authLimiter);
app.use(`${API_PREFIX}/auth/forgot-password`, passwordResetLimiter);
app.use(`${API_PREFIX}/auth/reset-password`, passwordResetLimiter);
// Même limiteur que le reset : cet endpoint envoie aussi un email à une
// adresse fournie par l'appelant.
app.use(`${API_PREFIX}/auth/resend-verification`, passwordResetLimiter);
app.use(`${API_PREFIX}/newsletter`, newsletterLimiter);
app.use(`${API_PREFIX}/admin`, adminLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Tekalis API v1.0", status: "Running" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
console.log("\n📂 Chargement des routes...");

const loadRoute = (path, file) => {
  try {
    app.use(path, require(file));
    console.log(`   ✅ ${file.split("/").pop()}`);
  } catch (e) {
    console.error(`   ❌ ${file.split("/").pop()} : ${e.message}`);
  }
};

loadRoute(`${API_PREFIX}/auth`, "./routes/authRoutes");
loadRoute(`${API_PREFIX}/newsletter`, "./routes/newsletterRoutes");
loadRoute(`${API_PREFIX}/products`, "./routes/productRoutes");
loadRoute(`${API_PREFIX}/categories`, "./routes/categoryRoutes");
loadRoute(`${API_PREFIX}/articles`, "./routes/articleRoutes");
loadRoute(`${API_PREFIX}/hero`, "./routes/heroRoutes");
loadRoute(`${API_PREFIX}/users`, "./routes/userRoutes");
loadRoute(`${API_PREFIX}/cart`, "./routes/cartRoutes");
loadRoute(`${API_PREFIX}/promo`, "./routes/promoRoutes");
loadRoute(`${API_PREFIX}/orders`, "./routes/orderRoutes");
loadRoute(`${API_PREFIX}/reviews`, "./routes/reviewRoutes");
loadRoute(`${API_PREFIX}/warranties`, "./routes/warrantyRoutes");
loadRoute(`${API_PREFIX}/rma`, "./routes/rmaRoutes");
loadRoute(`${API_PREFIX}/payment`, "./routes/paymentRoutes");
loadRoute(`${API_PREFIX}/trends`, "./routes/trendsRoutes");
loadRoute(`${API_PREFIX}/admin/stats`, "./routes/stats");
loadRoute(`${API_PREFIX}/admin`, "./routes/adminRoutes");
loadRoute(`${API_PREFIX}`, "./routes/settingsRoutes");
loadRoute(`${API_PREFIX}/whatsapp`, "./routes/whatsappRoutes");

console.log("✅ Routes chargées\n");

// ─── File d'attente email ─────────────────────────────────────────────────────
// Les emails sont envoyés APRÈS la réponse HTTP : une panne SMTP ne doit pas
// coûter une confirmation de commande. Le balayeur reprend ce qui a échoué,
// y compris après un redémarrage (c'est tout l'intérêt de la persistance).
emailQueue.start();

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Gestion globale des erreurs (centralisée, middlewares/errorHandler.js) ──
app.use(errorHandler);

// ─── Démarrage ────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║        🚀 TEKALIS API DÉMARRÉ 🚀          ║
╠════════════════════════════════════════════╣
║  Port:          ${PORT.toString().padEnd(27)} ║
║  Environnement: ${(process.env.NODE_ENV || "development").padEnd(27)} ║
║  URL:           http://localhost:${PORT}${API_PREFIX.padEnd(10)} ║
║  Rate limiting: ${(rateLimitDisabled
      ? "DÉSACTIVÉ (RATE_LIMIT_DISABLED)"
      : isDev
        ? "PARTIEL (API globale off en dev)"
        : "ACTIF").padEnd(27)} ║
╚════════════════════════════════════════════╝
  `);
});

// ─── Arrêt du process ─────────────────────────────────────────────────────────
// server.close() cesse d'écouter immédiatement (les nouvelles connexions sont
// refusées) mais son callback ne part qu'une fois TOUTES les connexions
// terminées. Sans le filet de sécurité ci-dessous, une seule connexion qui
// traîne — requête Mongo sans réponse, socket client jamais fermé — laissait un
// process VIVANT mais sourd : le port ne répondait plus, `process.exit` n'était
// jamais atteint, donc aucun redémarrage. C'était le second mode de panne,
// celui qui ne se résorbait pas tout seul.
let _shuttingDown = false;

const shutdown = (reason, code) => {
  if (_shuttingDown) return;
  _shuttingDown = true;
  console.log(`🛑 Arrêt du serveur (${reason})`);

  try {
    emailQueue.stop();
  } catch (e) {
    console.error("emailQueue.stop():", e.message);
  }

  // Les sockets Mongo tiennent la boucle d'événements ouverte : sans cette
  // fermeture, la sortie peut être repoussée de plusieurs secondes.
  require("mongoose").connection.close().catch(() => {});

  server.close(() => process.exit(code));

  // D'abord les connexions inactives (aucune requête en vol), puis les
  // restantes : closeAllConnections ne doit pas tomber comme une brique sur
  // une requête légitime en cours de traitement.
  server.closeIdleConnections?.();
  setTimeout(() => server.closeAllConnections?.(), 3000);

  // Filet ultime : on sort quoi qu'il arrive, pour que Render redémarre le
  // service. unref() évite de maintenir la boucle en vie pour ce seul timer.
  setTimeout(() => process.exit(code), 8000).unref();
};

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason?.stack || reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err?.stack || err);
  shutdown("uncaughtException", 1);
});

process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));

module.exports = app;
