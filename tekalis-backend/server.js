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

const connectDB = require("./config/database");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = "/api/v1";

const sitemapRouter = require("./routes/sitemap");
app.use("/api/v1", sitemapRouter);

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(mongoSanitize());

if (isDev) {
  app.use(morgan("dev"));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const createLimiter = (options) => {
  if (isDev) {
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

loadRoute(`${API_PREFIX}/auth`, "./routes/authRoutes");
loadRoute(`${API_PREFIX}/products`, "./routes/productRoutes");
loadRoute(`${API_PREFIX}/categories`, "./routes/categoryRoutes");
loadRoute(`${API_PREFIX}/articles`, "./routes/articleRoutes");
loadRoute(`${API_PREFIX}/hero`, "./routes/heroRoutes");
loadRoute(`${API_PREFIX}/users`, "./routes/userRoutes");
loadRoute(`${API_PREFIX}/cart`, "./routes/cartRoutes");
loadRoute(`${API_PREFIX}/orders`, "./routes/orderRoutes");
loadRoute(`${API_PREFIX}/reviews`, "./routes/reviewRoutes");
loadRoute(`${API_PREFIX}/warranties`, "./routes/warrantyRoutes");
loadRoute(`${API_PREFIX}/rma`, "./routes/rmaRoutes");
loadRoute(`${API_PREFIX}/payment`, "./routes/paymentRoutes");
loadRoute(`${API_PREFIX}/admin/stats`, "./routes/stats");
loadRoute(`${API_PREFIX}/admin`, "./routes/adminRoutes");

console.log("✅ Routes chargées\n");

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
║  Rate limiting: ${(isDev ? "DÉSACTIVÉ (dev)" : "ACTIF").padEnd(27)} ║
╚════════════════════════════════════════════╝
  `);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM reçu — arrêt propre du serveur");
  server.close(() => process.exit(0));
});

module.exports = app;
