// ===============================================
// TEKALIS API - Server Principal
// VERSION CORRIGÉE — Audit sécurité
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
// CRITIQUE 1 & 2 : Bloquer le démarrage si secrets manquants ou par défaut
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Variables d'environnement manquantes : ${missingVars.join(", ")}`);
  process.exit(1);
}

// CRITIQUE 2 : JWT_SECRET par défaut = faille critique. Bloquer en production.
const INSECURE_JWT_SECRETS = ["superSecretKey123", "secret", "changeme", "password", "tekalis"];
if (!isDev && INSECURE_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error("❌ FATAL: JWT_SECRET non sécurisé détecté en production. Arrêt du serveur.");
  process.exit(1);
}
if (isDev && INSECURE_JWT_SECRETS.includes(process.env.JWT_SECRET)) {
  console.warn("⚠️  ATTENTION: JWT_SECRET non sécurisé. NE PAS utiliser en production !");
}

// MAJEUR 8 : Avertir si ADMIN_EMAIL manquant (emails commandes silencieux)
if (!process.env.ADMIN_EMAIL) {
  console.warn("⚠️  ADMIN_EMAIL non défini. Les notifications de commandes admin seront désactivées.");
}

const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = "/api/v1";

// ─── Connexion MongoDB ────────────────────────────────────────────────────────
connectDB().catch((err) => {
  console.error("❌ Erreur fatale de connexion MongoDB:", err.message);
  if (!isDev) process.exit(1);
});

// ─── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// MINEUR 14 : CORS lit maintenant CORS_ORIGIN depuis .env (plus de hardcode)
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
    // Requêtes sans origin (Postman, cron, etc.) autorisées
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

if (isDev) {
  app.use(morgan("dev"));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// MAJEUR 6 : En développement, React StrictMode double-mount déclencherait les
// limiteurs. On les désactive en dev pour éviter les faux positifs.
const createLimiter = (options) => {
  if (isDev) {
    // En dev : middleware passthrough, pas de limitation
    return (req, res, next) => next();
  }
  return rateLimit(options);
};

const apiLimiter = createLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes" }
});

const adminLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Trop de requêtes admin" }
});

app.use(API_PREFIX, apiLimiter);
app.use(`${API_PREFIX}/auth/login`, authLimiter);
app.use(`${API_PREFIX}/auth/register`, authLimiter);
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

const heroRoutes = require('./routes/heroRoutes');
app.use('/api/hero', heroRoutes);

// Routes publiques
loadRoute(`${API_PREFIX}/auth`, "./routes/authRoutes");
loadRoute(`${API_PREFIX}/products`, "./routes/productRoutes");
loadRoute(`${API_PREFIX}/categories`, "./routes/categoryRoutes");
loadRoute(`${API_PREFIX}/articles`, "./routes/articleRoutes");
loadRoute(`${API_PREFIX}/configurator`, "./routes/configuratorRoutes");

// Routes authentifiées
loadRoute(`${API_PREFIX}/users`, "./routes/userRoutes");
loadRoute(`${API_PREFIX}/cart`, "./routes/cartRoutes");
loadRoute(`${API_PREFIX}/orders`, "./routes/orderRoutes");
loadRoute(`${API_PREFIX}/reviews`, "./routes/reviewRoutes");
loadRoute(`${API_PREFIX}/warranties`, "./routes/warrantyRoutes");
loadRoute(`${API_PREFIX}/rma`, "./routes/rmaRoutes");
loadRoute(`${API_PREFIX}/payment`, "./routes/paymentRoutes");

// Routes admin stats
loadRoute(`${API_PREFIX}/admin/stats`, "./routes/stats");

console.log("✅ Routes chargées\n");

// ─── Routeur Admin ────────────────────────────────────────────────────────────
// MAJEUR 9 : adminRouter ne duplique plus les routes déjà montées ci-dessus.
// Il expose uniquement les ressources purement admin (settings, categories CRUD,
// promo-codes, analytics) qui n'ont PAS de route publique correspondante.
const adminRouter = require("express").Router();
// Au tout début du adminRouter, AVANT verifyToken et isAdmin
adminRouter.use((req, res, next) => {
  const auth = req.headers.authorization;
  console.log("🔐 Admin route:", req.method, req.path);
  console.log("   Token présent:", !!auth);
  next();
});
const { verifyToken, isAdmin } = require("./middlewares/authMiddleware");

// Double protection : verifyToken + isAdmin sur tout le routeur admin
adminRouter.use(verifyToken, isAdmin);

// Paramètres du site
const Settings = require("./models/Settings");
adminRouter.get("/settings", async (req, res) => {
  try {
    let settings = await Settings.findById("site_settings");
    if (!settings) settings = await Settings.create({ _id: "site_settings" });
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.put("/settings", async (req, res) => {
  try {
    const settings = await Settings.findByIdAndUpdate(
      "site_settings", req.body, { new: true, upsert: true }
    );
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Catégories (CRUD admin uniquement)
const Category = require("./models/Category");
adminRouter.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json({ success: true, categories });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.post("/categories", async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.put("/categories/:id", async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Catégorie supprimée" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Codes promo
const PromoCode = require("./models/PromoCode");
adminRouter.get("/promo-codes", async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.json({ success: true, promoCodes });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.post("/promo-codes", async (req, res) => {
  try {
    const promo = await PromoCode.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, promoCode: promo });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.put("/promo-codes/:id", async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, promoCode: promo });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
adminRouter.delete("/promo-codes/:id", async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Code promo supprimé" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Analytics
adminRouter.get("/analytics", async (req, res) => {
  res.json({ success: true, stats: {}, revenue: [], categories: [], topProducts: [], customers: [] });
});

// Articles admin
const articleController = require("./controllers/articleController");
adminRouter.get("/articles", articleController.getAllArticles);  // ou une version admin
adminRouter.post("/articles", articleController.createArticle);
adminRouter.put("/articles/:id", articleController.updateArticle);
adminRouter.delete("/articles/:id", articleController.deleteArticle);
adminRouter.put("/articles/:id/publish", articleController.togglePublish);

// Reviews admin — route correcte
const reviewController = require("./controllers/reviewController");
adminRouter.get("/reviews", reviewController.getAllReviews);
adminRouter.patch("/reviews/:id/approve", reviewController.toggleApprove);
adminRouter.delete("/reviews/:id", reviewController.deleteReview);

app.use(`${API_PREFIX}/admin`, adminRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable",
    path: req.originalUrl
  });
});

// ─── Gestion globale des erreurs ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`\n❌ ERREUR : ${req.method} ${req.originalUrl}`);
  console.error(`   ${err.name}: ${err.message}`);
  if (isDev) console.error(err.stack);

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "ID de ressource invalide" });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "champ";
    return res.status(400).json({ success: false, message: `Ce ${field} existe déjà` });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Erreur de validation" });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expiré" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: isDev ? err.message : "Erreur serveur interne"
  });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║        🚀 TEKALIS API DÉMARRÉ 🚀          ║
╠════════════════════════════════════════════╣
║  Port:          ${PORT.toString().padEnd(27)} ║
║  Environnement: ${(process.env.NODE_ENV || "development").padEnd(27)} ║
║  URL:           http://localhost:${PORT}${API_PREFIX.padEnd(10)} ║
║  Rate limiting: ${(isDev ? "DÉSACTIVÉ (dev)" : "ACTIF").padEnd(27)} ║
╚════════════════════════════════════════════╝
  `);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
