// ===============================================
// routes/adminRoutes.js
// Toutes les routes /api/v1/admin/* — extraites de server.js le
// 2026-09-03 pour réduire la taille du fichier principal (660 → ~200
// lignes) et centraliser la logique admin dans un seul endroit.
//
// Changements apportés lors de l'extraction :
// - Recherche utilisateurs : échappement regex (voir utils/regexEscape.js)
// - Catégories / Settings / Codes promo : les routes acceptaient
//   auparavant req.body tel quel (Category.create(req.body), etc.),
//   ce qui permettait l'injection de champs arbitraires dans les
//   documents Mongo (mass assignment). Elles passent maintenant par
//   une liste blanche de champs (pickFields) avant d'atteindre Mongoose.
// ===============================================
const express = require("express");
const router = express.Router();

const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const { escapeRegex } = require("../utils/regexEscape");

router.use(verifyToken, isAdmin);

if (process.env.NODE_ENV === "development") {
  router.use((req, res, next) => {
    console.log("🔐 Admin:", req.method, req.path, "| Token:", !!req.headers.authorization);
    next();
  });
}

// ── Controllers & modèles ─────────────────────────────────────────────────────
const articleController = require("../controllers/articleController");
const reviewController = require("../controllers/reviewController");
const rmaController = require("../controllers/rmaController");
const orderController = require("../controllers/orderController");
const productController = require("../controllers/productController");
const warrantyController = require("../controllers/warrantyController");
const Settings = require("../models/Settings");
const Category = require("../models/Category");
const PromoCode = require("../models/PromoCode");
const User = require("../models/User");
const Order = require("../models/Order");
const Article = require("../models/Article");
const Product = require("../models/Product");
const Warranty = require("../models/Warranty");

// ===============================================
// Liste blanche de champs — empêche l'assignation de masse (mass
// assignment) quand req.body est transmis à Mongoose.
// ===============================================
const pickFields = (source = {}, allowedKeys = []) => {
  const result = {};
  for (const key of allowedKeys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
};

const CATEGORY_FIELDS = [
  "name", "seoDescription", "seoTitle", "parent",
  "banner", "icon", "order", "isActive"
];

const SETTINGS_FIELDS = [
  "siteName", "siteDescription", "logo", "favicon",
  "contactEmail", "contactPhone", "contactAddress",
  "socialLinks", "shipping", "tax", "loyalty", "warranty",
  "returns", "paymentMethods", "maintenance", "seo"
];

// ── Articles (/api/v1/admin/articles) ────────────────────────────────────────
router.get("/articles", async (req, res) => {
  try {
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

// POST /admin/articles — author injecté depuis req.user si absent (sécurité)
router.post("/articles", (req, res) => {
  if (!req.body.author) {
    req.body.author = req.user._id;
  }
  articleController.createArticle(req, res);
});

router.put("/articles/:id/publish", articleController.togglePublish);
router.put("/articles/:id", articleController.updateArticle);
router.delete("/articles/:id", articleController.deleteArticle);

// ── Reviews (/api/v1/admin/reviews) ──────────────────────────────────────────
router.get("/reviews", reviewController.getAllReviews);
router.patch("/reviews/:id/approve", reviewController.toggleApprove);
router.put("/reviews/:id/approve", (req, res) => {
  req.body.isApproved = true;
  reviewController.setApproval(req, res);
});
router.put("/reviews/:id/reject", (req, res) => {
  req.body.isApproved = false;
  reviewController.setApproval(req, res);
});
router.delete("/reviews/:id", reviewController.deleteReview);

// ── RMA (/api/v1/admin/rma) ───────────────────────────────────────────────────
router.get("/rma", rmaController.getAllRMAs);
router.put("/rma/:id/status", rmaController.updateRMAStatus);

// ── Commandes (/api/v1/admin/orders) ─────────────────────────────────────────
router.get("/orders", orderController.getAllOrders);
router.get("/orders/:id", orderController.getOrderById);
router.put("/orders/:id/status", orderController.updateOrderStatus);
router.put("/orders/:id/pay", orderController.markAsPaid);
router.delete("/orders/:id", orderController.deleteOrder);

// ── Paiements (/api/v1/admin/payments) — pilotés via le statut de commande ───
const PAYMENT_STATUS_MAP = {
  pending: "pending",
  awaiting: "pending",
  paid: "completed",
  failed: "failed",
  refunded: "refunded"
};

router.get("/payments", async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && ["pending", "completed", "failed", "refunded"].includes(status)) {
      filter.paymentStatus = status === "pending"
        ? { $in: ["pending", "awaiting"] }
        : status;
    }
    if (method) filter.paymentMethod = method;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const payments = orders.map(o => ({
      _id: o._id,
      transactionId: o.transactionId || o.mobileMoneyReference || o.orderNumber,
      orderId: {
        _id: o._id,
        orderNumber: o.orderNumber,
        totalPrice: o.totalPrice
      },
      customer: {
        name: o.customerInfo?.name || o.user?.name || o.deliveryName || "Client",
        email: o.customerInfo?.email || o.user?.email || ""
      },
      amount: o.totalPrice,
      method: o.paymentMethod,
      status: PAYMENT_STATUS_MAP[o.paymentStatus] || "pending",
      phoneNumber: o.customerInfo?.phone || o.deliveryPhone || "",
      reference: o.transactionId || o.mobileMoneyReference || "",
      failureReason: o.paymentFailedReason || "",
      paidAt: o.paidAt,
      updatedAt: o.updatedAt,
      createdAt: o.createdAt
    }));

    res.json({
      success: true,
      payments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (e) {
    console.error("❌ Erreur admin/payments:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/payments/:orderId/validate", (req, res) => {
  req.params.id = req.params.orderId;
  orderController.markAsPaid(req, res);
});

router.put("/payments/:orderId/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }
    order.paymentStatus = "failed";
    order.isPaid = false;
    if (reason) order.paymentFailedReason = String(reason).slice(0, 500);
    await order.save();
    res.json({ success: true, message: "Paiement rejeté", order });
  } catch (e) {
    console.error("❌ Erreur admin/payments/reject:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Garanties (/api/v1/admin/warranties) ──────────────────────────────────────
const WARRANTY_TYPE_LABELS = {
  constructeur: "manufacturer",
  extension: "extended",
  commerciale: "commercial"
};

router.get("/warranties", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (status === "expired") filter.endDate = { $lt: now };
    else if (status === "expiring_soon") filter.endDate = { $gte: now, $lte: soon };
    else if (status) filter.status = status;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [warranties, total] = await Promise.all([
      Warranty.find(filter)
        .populate("product", "name brand images")
        .populate("user", "name email phone")
        .populate("order", "orderNumber createdAt")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Warranty.countDocuments(filter)
    ]);

    const items = warranties.map(w => {
      const end = w.endDate ? new Date(w.endDate) : null;
      let derivedStatus = w.status;
      if (end && end < now) derivedStatus = "expired";
      else if (end && end <= soon) derivedStatus = "expiring_soon";
      return {
        ...w,
        status: derivedStatus,
        warrantyTypeLabel: WARRANTY_TYPE_LABELS[w.warrantyType] || w.warrantyType
      };
    });

    res.json({
      success: true,
      warranties: items,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (e) {
    console.error("❌ Erreur admin/warranties:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/warranties/:id/status", warrantyController.updateWarrantyStatus);

// ── Produits (/api/v1/admin/products) ────────────────────────────────────────
router.get("/products", productController.getProducts);
router.post("/products/bulk", productController.bulkCreateProducts);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

// ── Paramètres du site (/api/v1/admin/settings) ──────────────────────────────
router.get("/settings", async (req, res) => {
  try {
    let settings = await Settings.findById("site_settings");
    if (!settings) settings = await Settings.create({ _id: "site_settings" });
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/settings", async (req, res) => {
  try {
    const updateData = pickFields(req.body, SETTINGS_FIELDS);
    const settings = await Settings.findByIdAndUpdate(
      "site_settings", updateData, { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Catégories (/api/v1/admin/categories) ────────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json({ success: true, categories });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/categories", async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: "Le nom de la catégorie est requis" });
    }
    const cat = await Category.create(pickFields(req.body, CATEGORY_FIELDS));
    res.status(201).json({ success: true, category: cat });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      pickFields(req.body, CATEGORY_FIELDS),
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ success: false, message: "Catégorie introuvable" });
    res.json({ success: true, category: cat });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Catégorie supprimée" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Codes promo (/api/v1/admin/promo-codes) ───────────────────────────────────
router.get("/promo-codes", async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.json({ success: true, promoCodes });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Le frontend envoie { code, type, value, minPurchase, maxDiscount, usageLimit, expiryDate, isActive }
// Le modèle PromoCode attend : { code, type, discount, minAmount, maxDiscount, usageLimit, endDate, isActive }
// → mapping expiryDate → endDate, value → discount, minPurchase → minAmount
router.post("/promo-codes", async (req, res) => {
  try {
    const {
      code, type, value, discount, minPurchase, minAmount,
      maxDiscount, usageLimit, expiryDate, endDate, isActive, description
    } = req.body;

    if (!code || !type || (!expiryDate && !endDate)) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants: code, type, date d'expiration"
      });
    }

    const promoData = {
      code: String(code).trim().toUpperCase(),
      description: description || `Code ${String(code).trim().toUpperCase()}`,
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

router.put("/promo-codes/:id", async (req, res) => {
  try {
    const ALLOWED = [
      "description", "type", "value", "discount", "minPurchase", "minAmount",
      "maxDiscount", "usageLimit", "expiryDate", "endDate", "isActive"
    ];
    const body = pickFields(req.body, ALLOWED);
    const { value, discount, minPurchase, minAmount, expiryDate, endDate, ...rest } = body;

    const updateData = {
      ...rest,
      ...(value !== undefined && { discount: value }),
      ...(discount !== undefined && { discount }),
      ...(minPurchase !== undefined && { minAmount: minPurchase }),
      ...(minAmount !== undefined && { minAmount }),
      ...(expiryDate && { endDate: expiryDate }),
      ...(endDate && { endDate })
    };

    const promo = await PromoCode.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!promo) return res.status(404).json({ success: false, message: "Code promo introuvable" });
    res.json({ success: true, promoCode: promo });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete("/promo-codes/:id", async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Code promo supprimé" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Analytics (/api/v1/admin/analytics) ──────────────────────────────────────
// Agrégations réelles sur ventes payées, produits, catégories et clients.
// Périodes acceptées : 7days, 30days, 90days, year.
router.get("/analytics", async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    const periodDays = { "7days": 7, "30days": 30, "90days": 90, "year": 365 }[period] || 30;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (period === "year") start.setFullYear(start.getFullYear() - 1);
    else start.setDate(start.getDate() - periodDays);

    const prevStart = new Date(start.getTime() - (period === "year" ? 365 : periodDays) * 24 * 60 * 60 * 1000);

    // ── Stats globales (vs période précédente)
    const [currentRev, prevRev, currentOrders, prevOrders, newCustomers, prevCustomers] = await Promise.all([
      Order.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: start } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: prevStart, $lt: start } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: start } }),
      Order.countDocuments({ createdAt: { $gte: prevStart, $lt: start } }),
      User.countDocuments({ createdAt: { $gte: start } }),
      User.countDocuments({ createdAt: { $gte: prevStart, $lt: start } })
    ]);

    const totalRevenue = currentRev[0]?.total || 0;
    const totalOrders = currentOrders;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevRevenue = prevRev[0]?.total || 0;

    const pct = (a, b) => b > 0 ? Math.round(((a - b) / b) * 1000) / 10 : 0;

    const stats = {
      totalRevenue: Math.round(totalRevenue),
      revenueChange: pct(totalRevenue, prevRevenue),
      totalOrders,
      ordersChange: pct(totalOrders, prevOrders),
      avgOrderValue: Math.round(avgOrderValue),
      avgOrderChange: pct(avgOrderValue, prevOrders > 0 ? prevRevenue / prevOrders : 0),
      newCustomers,
      customersChange: pct(newCustomers, prevCustomers),
      conversionRate: 0,
      conversionChange: 0
    };

    // ── Série revenu par jour
    const revenueAgg = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const revenue = revenueAgg.map(d => ({ date: d._id, revenue: Math.round(d.revenue), orders: d.orders }));

    // ── Top produits vendus
    const productSales = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: start } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          sales: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    const productIds = productSales.map(p => p._id);
    const productDocs = productIds.length
      ? await Product.find({ _id: { $in: productIds } })
          .select("name images category")
          .populate("category", "name")
          .lean()
      : [];
    const productMap = productDocs.reduce((acc, p) => {
      acc[p._id.toString()] = p;
      return acc;
    }, {});

    const topProducts = productSales
      .filter(p => productMap[p._id.toString()])
      .slice(0, 5)
      .map(p => {
        const doc = productMap[p._id.toString()];
        return {
          _id: p._id,
          name: doc.name,
          sales: p.sales,
          revenue: Math.round(p.revenue),
          image: doc.images?.[0]?.url || doc.images?.[0] || null
        };
      });

    // ── Ventes par catégorie
    const catAgg = new Map();
    for (const doc of productDocs) {
      const sale = productSales.find(p => p._id.toString() === doc._id.toString());
      if (!sale) continue;
      const names = (doc.category || [])
        .map(c => c?.name)
        .filter(Boolean);
      (names.length ? names : ["Non catégorisé"]).forEach(name => {
        const entry = catAgg.get(name) || { name, value: 0, revenue: 0 };
        entry.value += sale.sales;
        entry.revenue += sale.revenue;
        catAgg.set(name, entry);
      });
    }
    const categories = [...catAgg.values()]
      .sort((a, b) => b.value - a.value)
      .map(c => ({ name: c.name, value: c.value, revenue: Math.round(c.revenue) }));

    // ── Clients nouveaux vs récurrents par jour
    const orderUsers = await Order.find({ createdAt: { $gte: start } })
      .select("user createdAt")
      .lean();
    const uids = [...new Set(orderUsers.map(o => o.user.toString()))];
    const userDocs = uids.length
      ? await User.find({ _id: { $in: uids } }).select("createdAt").lean()
      : [];
    const createdMap = new Map(userDocs.map(u => [u._id.toString(), new Date(u.createdAt)]));

    const bucket = new Map();
    const dayKey = d => d.toISOString().split("T")[0];
    for (const o of orderUsers) {
      const created = createdMap.get(o.user.toString());
      const key = dayKey(new Date(o.createdAt));
      const entry = bucket.get(key) || { date: key, new: 0, returning: 0 };
      const createdAt = created ? created.setHours(0, 0, 0, 0) : 0;
      const orderDay = new Date(o.createdAt).setHours(0, 0, 0, 0);
      if (createdAt >= orderDay) entry.new += 1;
      else entry.returning += 1;
      bucket.set(key, entry);
    }
    const customers = [...bucket.values()].sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, period, stats, revenue, categories, topProducts, customers });
  } catch (e) {
    console.error("❌ Erreur admin/analytics:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Utilisateurs (/api/v1/admin/users) ────────────────────────────────────────
// Seul jeu de routes canonique pour l'admin des utilisateurs — voir
// routes/userRoutes.js pour la note sur la suppression du doublon.
router.get("/users", async (req, res) => {
  try {
    const {
      page = 1, limit = 20, search, role,
      sortBy = "createdAt", order = "desc"
    } = req.query;

    const filter = {};
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }
    if (role === "admin") filter.isAdmin = true;
    else if (role === "customer") filter.isAdmin = false;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "desc" ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter)
    ]);

    const userIds = users.map(u => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" } } }
    ]);
    const statsMap = orderStats.reduce((acc, item) => {
      acc[item._id.toString()] = { totalOrders: item.totalOrders, totalSpent: item.totalSpent };
      return acc;
    }, {});

    const usersWithStats = users.map(user => ({
      ...user,
      password: undefined,
      role: user.isAdmin ? "admin" : "customer",
      totalOrders: statsMap[user._id.toString()]?.totalOrders || 0,
      totalSpent: statsMap[user._id.toString()]?.totalSpent || 0,
      isActive: user.isActive !== false
    }));

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (e) {
    console.error("❌ Erreur admin/users:", e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/users/:id", async (req, res) => {
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

router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, phone, isAdmin: setAdmin, isActive, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (setAdmin !== undefined) user.isAdmin = setAdmin;
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

// PUT /admin/users/:id/role — utilisée par Users.jsx → changeRole()
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const isAdminRole = (role === "admin");
    const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: isAdminRole }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({
      success: true,
      message: "Rôle mis à jour",
      user: { ...user.toObject(), role: user.isAdmin ? "admin" : "customer", password: undefined }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT /admin/users/:id/status — utilisée par Users.jsx → toggleUserStatus()
router.put("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({
      success: true,
      message: `Utilisateur ${isActive ? "activé" : "désactivé"}`,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Vous ne pouvez pas supprimer votre propre compte" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({ success: true, message: "Utilisateur supprimé" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
