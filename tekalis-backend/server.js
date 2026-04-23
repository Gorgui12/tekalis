// ===============================================
// TEKALIS API - Server Principal
// ✅ FIX BUG 1 : ajout routes /admin/users dans adminRouter
// ✅ FIX BUG 2 : POST /admin/articles — author injecté depuis req.user
// ✅ FIX BUG 3 : POST /admin/promo-codes — mapping expiryDate → endDate
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

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = "/api/v1";

const sitemapRouter = require('./routes/sitemap');
app.use('/api/v1', sitemapRouter);

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

// ─── Routes publiques & authentifiées ────────────────────────────────────────
console.log("\n📂 Chargement des routes...");

const loadRoute = (path, file) => {
  try {
    app.use(path, require(file));
    console.log(`   ✅ ${file.split("/").pop()}`);
  } catch (e) {
    console.error(`   ❌ ${file.split("/").pop()} : ${e.message}`);
  }
};

loadRoute(`${API_PREFIX}/auth`,         "./routes/authRoutes");
loadRoute(`${API_PREFIX}/products`,     "./routes/productRoutes");
loadRoute(`${API_PREFIX}/categories`,   "./routes/categoryRoutes");
loadRoute(`${API_PREFIX}/articles`,     "./routes/articleRoutes");
loadRoute(`${API_PREFIX}/configurator`, "./routes/configuratorRoutes");
loadRoute(`${API_PREFIX}/hero`,         "./routes/heroRoutes");
loadRoute(`${API_PREFIX}/users`,        "./routes/userRoutes");
loadRoute(`${API_PREFIX}/cart`,         "./routes/cartRoutes");
loadRoute(`${API_PREFIX}/orders`,       "./routes/orderRoutes");
loadRoute(`${API_PREFIX}/reviews`,      "./routes/reviewRoutes");
loadRoute(`${API_PREFIX}/warranties`,   "./routes/warrantyRoutes");
loadRoute(`${API_PREFIX}/rma`,          "./routes/rmaRoutes");
loadRoute(`${API_PREFIX}/payment`,      "./routes/paymentRoutes");
loadRoute(`${API_PREFIX}/admin/stats`,  "./routes/stats");

console.log("✅ Routes chargées\n");

// ─── Routeur Admin ────────────────────────────────────────────────────────────
const adminRouter = require("express").Router();

if (isDev) {
  adminRouter.use((req, res, next) => {
    console.log("🔐 Admin:", req.method, req.path, "| Token:", !!req.headers.authorization);
    next();
  });
}

const { verifyToken, isAdmin } = require("./middlewares/authMiddleware");
adminRouter.use(verifyToken, isAdmin);

// ── Controllers ───────────────────────────────────────────────────────────────
const articleController = require("./controllers/articleController");
const reviewController  = require("./controllers/reviewController");
const rmaController     = require("./controllers/rmaController");
const orderController   = require("./controllers/orderController");
const productController = require("./controllers/productController");
const Settings          = require("./models/Settings");
const Category          = require("./models/Category");
const PromoCode         = require("./models/PromoCode");
const User              = require("./models/User");
const Order             = require("./models/Order");

// ── Articles (/api/v1/admin/articles) ────────────────────────────────────────
adminRouter.get("/articles", async (req, res) => {
  try {
    const Article = require("./models/Article");
    const { page = 1, limit = 12, category, search, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };
    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("author", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-content"),
      Article.countDocuments(filter)
    ]);
    res.status(200).json({
      success: true,
      articles,
      pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ FIX BUG 2 : POST /admin/articles
// articleController.createArticle lit req.user._id comme author
// Mais il faut s'assurer que le body contient bien les champs requis du modèle
adminRouter.post("/articles", (req, res) => {
  // Injecter l'auteur si absent (sécurité)
  if (!req.body.author) {
    req.body.author = req.user._id;
  }
  articleController.createArticle(req, res);
});

adminRouter.put("/articles/:id/publish", articleController.togglePublish);
adminRouter.put("/articles/:id",         articleController.updateArticle);
adminRouter.delete("/articles/:id",      articleController.deleteArticle);

// ── Reviews (/api/v1/admin/reviews) ──────────────────────────────────────────
adminRouter.get("/reviews",               reviewController.getAllReviews);
adminRouter.patch("/reviews/:id/approve", reviewController.toggleApprove);
adminRouter.delete("/reviews/:id",        reviewController.deleteReview);

// ── RMA (/api/v1/admin/rma) ───────────────────────────────────────────────────
adminRouter.get("/rma",               rmaController.getAllRMAs);
adminRouter.put("/rma/:id/status",    rmaController.updateRMAStatus);

// ── Commandes (/api/v1/admin/orders) ─────────────────────────────────────────
adminRouter.get("/orders",             orderController.getAllOrders);
adminRouter.put("/orders/:id/status",  orderController.updateOrderStatus);
adminRouter.put("/orders/:id/pay",     orderController.markAsPaid);
adminRouter.delete("/orders/:id",      orderController.deleteOrder);

// ── Produits (/api/v1/admin/products) ────────────────────────────────────────
adminRouter.get("/products",           productController.getProducts);
adminRouter.post("/products/bulk",     productController.bulkCreateProducts);
adminRouter.post("/products",          productController.createProduct);
adminRouter.put("/products/:id",       productController.updateProduct);
adminRouter.delete("/products/:id",    productController.deleteProduct);

// ── Paramètres du site (/api/v1/admin/settings) ──────────────────────────────
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

// ── Catégories (/api/v1/admin/categories) ────────────────────────────────────
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

// ── Codes promo (/api/v1/admin/promo-codes) ───────────────────────────────────
adminRouter.get("/promo-codes", async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.json({ success: true, promoCodes });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ FIX BUG 3 : POST /admin/promo-codes
// Le frontend envoie { code, type, value, minPurchase, maxDiscount, usageLimit, expiryDate, isActive }
// Le modèle PromoCode attend : { code, type, discount, minAmount, maxDiscount, usageLimit, endDate, isActive }
// → mapping expiryDate → endDate, value → discount, minPurchase → minAmount
adminRouter.post("/promo-codes", async (req, res) => {
  try {
    const {
      code,
      type,
      value,       // frontend envoie "value", le modèle attend "discount"
      discount,    // au cas où le frontend envoie déjà "discount"
      minPurchase, // frontend envoie "minPurchase", le modèle attend "minAmount"
      minAmount,
      maxDiscount,
      usageLimit,
      expiryDate,  // frontend envoie "expiryDate", le modèle attend "endDate"
      endDate,
      isActive,
      description
    } = req.body;

    if (!code || !type || !expiryDate && !endDate) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants: code, type, date d'expiration"
      });
    }

    const promoData = {
      code: code.trim().toUpperCase(),
      description: description || `Code ${code.trim().toUpperCase()}`,
      type,
      discount: discount ?? value ?? 0,
      minAmount: minAmount ?? minPurchase ?? 0,
      maxDiscount: maxDiscount ?? null,
      usageLimit: usageLimit ?? null,
      endDate: endDate ?? expiryDate,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    };

    const promo = await PromoCode.create(promoData);
    res.status(201).json({ success: true, promoCode: promo });
  } catch (e) {
    console.error("❌ Erreur création promo-code:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

adminRouter.put("/promo-codes/:id", async (req, res) => {
  try {
    // Même mapping que pour le POST
    const {
      value, discount,
      minPurchase, minAmount,
      expiryDate, endDate,
      ...rest
    } = req.body;

    const updateData = {
      ...rest,
      ...(value !== undefined && { discount: value }),
      ...(discount !== undefined && { discount }),
      ...(minPurchase !== undefined && { minAmount: minPurchase }),
      ...(minAmount !== undefined && { minAmount }),
      ...(expiryDate && { endDate: expiryDate }),
      ...(endDate && { endDate }),
    };

    const promo = await PromoCode.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!promo) return res.status(404).json({ success: false, message: "Code promo introuvable" });
    res.json({ success: true, promoCode: promo });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

adminRouter.delete("/promo-codes/:id", async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Code promo supprimé" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Analytics (/api/v1/admin/analytics) ──────────────────────────────────────
adminRouter.get("/analytics", async (req, res) => {
  res.json({ success: true, stats: {}, revenue: [], categories: [], topProducts: [], customers: [] });
});

// ✅ FIX BUG 1 : Routes /admin/users — manquaient totalement dans adminRouter
// Le frontend (Users.jsx) appelle api.get('/admin/users'), api.put('/admin/users/:id/role'), etc.
// Ces routes n'existaient que sous /api/v1/users (userRoutes.js), pas sous /api/v1/admin/users

adminRouter.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role === "admin") filter.isAdmin = true;
    else if (role === "customer") filter.isAdmin = false;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "desc" ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Récupérer le count des commandes en une seule agrégation
    const userIds = users.map(u => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" }
        }
      }
    ]);
    const statsMap = orderStats.reduce((acc, item) => {
      acc[item._id.toString()] = {
        totalOrders: item.totalOrders,
        totalSpent: item.totalSpent
      };
      return acc;
    }, {});

    const usersWithStats = users.map(user => ({
      ...user,
      password: undefined,
      // Mapper isAdmin → role pour le frontend admin qui utilise user.role
      role: user.isAdmin ? "admin" : "customer",
      totalOrders: statsMap[user._id.toString()]?.totalOrders || 0,
      totalSpent: statsMap[user._id.toString()]?.totalSpent || 0,
      isActive: user.isActive !== false // défaut true si absent
    }));

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (e) {
    console.error("❌ Erreur admin/users:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

adminRouter.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    const [ordersCount, orderAgg, recentOrders] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: null, totalSpent: { $sum: "$totalPrice" }, averageOrder: { $avg: "$totalPrice" } } }
      ]),
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber totalPrice status createdAt")
        .lean()
    ]);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        password: undefined,
        role: user.isAdmin ? "admin" : "customer",
        stats: {
          ordersCount,
          totalSpent: orderAgg[0]?.totalSpent || 0,
          averageOrder: orderAgg[0]?.averageOrder || 0,
          recentOrders
        }
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

adminRouter.put("/users/:id", async (req, res) => {
  try {
    const { name, email, phone, isAdmin, isActive, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    // Supporter les deux formats : isAdmin (boolean) ou role (string)
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (role !== undefined) user.isAdmin = (role === "admin");

    await user.save();
    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? "admin" : "customer",
        isActive: user.isActive
      }
    });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
    res.status(500).json({ success: false, message: e.message });
  }
});

// Route PUT /admin/users/:id/role — utilisée par Users.jsx → changeRole()
adminRouter.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const isAdminRole = (role === "admin");
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: isAdminRole },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({
      success: true,
      message: "Rôle mis à jour",
      user: { ...user.toObject(), role: user.isAdmin ? "admin" : "customer", password: undefined }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Route PUT /admin/users/:id/status — utilisée par Users.jsx → toggleUserStatus()
adminRouter.put("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({
      success: true,
      message: `Utilisateur ${isActive ? "activé" : "désactivé"}`,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

adminRouter.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Vous ne pouvez pas supprimer votre propre compte" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({ success: true, message: "Utilisateur supprimé" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

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