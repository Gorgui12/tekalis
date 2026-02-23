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

const connectDB = require("./config/database");

// ===== INITIALISATION =====
const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = "/api/v1";

// ===== CONNEXION MONGODB =====
connectDB().catch((err) => {
  console.error("❌ Erreur fatale de connexion MongoDB:", err.message);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// ===== MIDDLEWARES DE SÉCURITÉ =====
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ======================================================
// ✅ CORS FIX PRODUCTION + LOCAL
// ======================================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",

  // ✅ Ton domaine en production
  "https://tekalis.com",
  "https://www.tekalis.com",

  // ✅ Ton backend Render (optionnel)
  "https://tekalis.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Autoriser Postman / requêtes serveur sans origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("🚫 CORS bloqué pour:", origin);
        callback(new Error("Non autorisé par CORS"));
      }
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ⚠️ Important : Répondre aux preflight requests
app.options("*", cors());

// ======================================================
// BODY PARSING
// ======================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Protection contre injections NoSQL
app.use(mongoSanitize());

// Logging en développement
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


// ===== RATE LIMITING =====
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter plus strictement les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes"
  }
});

app.use(API_PREFIX, apiLimiter);
app.use(`${API_PREFIX}/auth/login`, authLimiter);
app.use(`${API_PREFIX}/auth/register`, authLimiter);

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.status(dbState === 1 ? 200 : 503).json({
    success: true,
    status: dbState === 1 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStates[dbState],
      connected: dbState === 1
    },
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    paydunya: {
      mode: process.env.PAYDUNYA_MODE || "test",
      configured: !!(process.env.PAYDUNYA_MASTER_KEY && process.env.PAYDUNYA_PRIVATE_KEY)
    }
  });
});

// ===== ROUTE PRINCIPALE =====
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Tekalis API v1.0",
    status: "Running",
    timestamp: new Date().toISOString(),
    documentation: `${API_PREFIX}/docs`,
    endpoints: {
      health: "/health",
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      products: `${API_PREFIX}/products`,
      categories: `${API_PREFIX}/categories`,
      cart: `${API_PREFIX}/cart`,
      orders: `${API_PREFIX}/orders`,
      reviews: `${API_PREFIX}/reviews`,
      warranties: `${API_PREFIX}/warranties`,
      rma: `${API_PREFIX}/rma`,
      articles: `${API_PREFIX}/articles`,
      configurator: `${API_PREFIX}/configurator`,
      payment: `${API_PREFIX}/payment`,
      adminStats: `${API_PREFIX}/admin/stats`
    }
  });
});

// ===== ROUTES API =====
console.log("\n📂 Chargement des routes...");

// Routes publiques
try {
  app.use(`${API_PREFIX}/auth`, require("./routes/authRoutes"));
  console.log("   ✅ authRoutes");
} catch (e) {
  console.error("   ❌ authRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/products`, require("./routes/productRoutes"));
  console.log("   ✅ productRoutes");
} catch (e) {
  console.error("   ❌ productRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/categories`, require("./routes/categoryRoutes"));
  console.log("   ✅ categoryRoutes");
} catch (e) {
  console.error("   ❌ categoryRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/articles`, require("./routes/articleRoutes"));
  console.log("   ✅ articleRoutes");
} catch (e) {
  console.error("   ❌ articleRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/configurator`, require("./routes/configuratorRoutes"));
  console.log("   ✅ configuratorRoutes");
} catch (e) {
  console.error("   ❌ configuratorRoutes:", e.message);
}

// Routes authentifiées
try {
  app.use(`${API_PREFIX}/users`, require("./routes/userRoutes"));
  console.log("   ✅ userRoutes");
} catch (e) {
  console.error("   ❌ userRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/cart`, require("./routes/cartRoutes"));
  console.log("   ✅ cartRoutes");
} catch (e) {
  console.error("   ❌ cartRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/orders`, require("./routes/orderRoutes"));
  console.log("   ✅ orderRoutes");
} catch (e) {
  console.error("   ❌ orderRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/reviews`, require("./routes/reviewRoutes"));
  console.log("   ✅ reviewRoutes");
} catch (e) {
  console.error("   ❌ reviewRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/warranties`, require("./routes/warrantyRoutes"));
  console.log("   ✅ warrantyRoutes");
} catch (e) {
  console.error("   ❌ warrantyRoutes:", e.message);
}

try {
  app.use(`${API_PREFIX}/rma`, require("./routes/rmaRoutes"));
  console.log("   ✅ rmaRoutes");
} catch (e) {
  console.error("   ❌ rmaRoutes:", e.message);
}

// ✅ Routes de paiement PayDunya
try {
  console.log("🔍 Tentative de chargement de paymentRoutes...");
  const paymentRoutes = require("./routes/paymentRoutes");
  console.log("✅ Fichier paymentRoutes chargé");
  app.use(`${API_PREFIX}/payment`, paymentRoutes);
  console.log("   ✅ paymentRoutes (PayDunya) - Routes montées");
} catch (e) {
  console.error("   ❌ paymentRoutes ERREUR DÉTAILLÉE:");
  console.error("   Message:", e.message);
  console.error("   Stack:", e.stack);
}

// Routes admin
try {
  app.use(`${API_PREFIX}/admin/stats`, require("./routes/stats"));
  console.log("   ✅ stats (admin)");
} catch (e) {
  console.error("   ❌ stats:", e.message);
}

console.log("✅ Chargement des routes terminé\n");

// ===== MIDDLEWARE DE GESTION D'ERREURS =====

// Erreur 404 - Route non trouvée
app.use((req, res, next) => {
  console.log(`⚠️  404 - Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route introuvable",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: `Vérifiez l'URL (ex: ${API_PREFIX}/products)`
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error("\n" + "❌".repeat(35));
  console.error("💥 ERREUR CAPTURÉE");
  console.error("❌".repeat(35));
  console.error(`   Route: ${req.method} ${req.originalUrl}`);
  console.error(`   Type: ${err.name}`);
  console.error(`   Message: ${err.message}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.error(`   Body:`, JSON.stringify(req.body, null, 2));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.error(`   Query:`, req.query);
  }

  if (process.env.NODE_ENV === "development" || process.env.DEBUG_MODE === "true") {
    console.error("\n📚 Stack Trace:");
    console.error(err.stack);
  }
  console.error("❌".repeat(35) + "\n");

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID de ressource invalide"
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existe déjà`
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Erreur de validation"
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token invalide"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expiré"
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne"
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║        🚀 TEKALIS API DÉMARRÉ 🚀          ║
╠════════════════════════════════════════════╣
║  Port:          ${PORT.toString().padEnd(27)} ║
║  Environnement: ${(process.env.NODE_ENV || "development").padEnd(27)} ║
║  Node:          ${process.version.padEnd(27)} ║
║  Date:          ${new Date().toLocaleString("fr-FR").padEnd(27)} ║
╠════════════════════════════════════════════╣
║  URL API:       http://localhost:${PORT}${API_PREFIX}
║  Health Check:  http://localhost:${PORT}/health
║  Dashboard:     http://localhost:${PORT}${API_PREFIX}/admin/stats
╠════════════════════════════════════════════╣
║  MongoDB:       ${(require("mongoose").connection.readyState === 1 ? "✅ Connecté" : "⏳ En attente...").padEnd(27)} ║
║  PayDunya:      ${(process.env.PAYDUNYA_MODE || "test").padEnd(27)} ║
╚════════════════════════════════════════════╝

💡 Endpoints Paiement PayDunya:
   💳 POST ${API_PREFIX}/payment/paydunya/create
   🔍 GET  ${API_PREFIX}/payment/paydunya/status/:token
   ✅ GET  ${API_PREFIX}/payment/paydunya/confirm/:id
   📄 GET  ${API_PREFIX}/payment/paydunya/receipt/:id
   📨 POST ${API_PREFIX}/payment/paydunya/callback

💡 Endpoints Admin Dashboard:
   📊 GET ${API_PREFIX}/admin/stats
   🏆 GET ${API_PREFIX}/admin/stats/top-products
   📋 GET ${API_PREFIX}/admin/stats/recent-orders

💥 Endpoints Utilisateurs:
   GET ${API_PREFIX}/users
   GET ${API_PREFIX}/users/me
   PUT ${API_PREFIX}/users/me

📝 Logs: ${process.env.NODE_ENV === "development" ? "Activés (mode développement)" : "Production"}
🔐 Sécurité: Rate limiting actif (100 req/15min)
💳 PayDunya: Mode ${process.env.PAYDUNYA_MODE || "test"} activé
`);
});

module.exports = app;
