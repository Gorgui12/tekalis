// ===============================================
// TEKALIS API - Server Principal
// ===============================================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

require("dotenv").config();

// Validation des variables d'environnement critiques
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Variables d'environnement manquantes : ${missingVars.join(", ")}`);
  process.exit(1);
}

if (process.env.JWT_SECRET === "superSecretKey123") {
  console.warn("⚠️  ATTENTION: JWT_SECRET par défaut détecté. Changez-le en production !");
}

const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = "/api/v1";

// ─── Connexion MongoDB ────────────────────────────────────────────────────────
connectDB().catch((err) => {
  console.error("❌ Erreur fatale de connexion MongoDB:", err.message);
  if (process.env.NODE_ENV === "production") process.exit(1);
});

// ─── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://tekalis.com",
  "https://www.tekalis.com",
  "https://tekalis.onrender.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.error("🚫 CORS bloqué pour:", origin);
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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes" }
});

const adminLimiter = rateLimit({
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

// Routes admin
loadRoute(`${API_PREFIX}/admin/stats`, "./routes/stats");

console.log("✅ Routes chargées\n");

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
  if (process.env.NODE_ENV === "development") console.error(err.stack);

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
    message: process.env.NODE_ENV === "production"
      ? "Erreur serveur interne"
      : err.message
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
║  Health:        http://localhost:${PORT}/health   ║
╚════════════════════════════════════════════╝
  `);
});

// Gestion propre de l'arrêt
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
