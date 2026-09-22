// ===============================================
// controllers/supplierController.js
// CRUD des fournisseurs / partenaires + agrégats de synthèse.
// Modèles : models/Supplier.js et models/SupplierOrder.js
// ===============================================
const Supplier = require("../models/Supplier");
const SupplierOrder = require("../models/SupplierOrder");
const { escapeRegex } = require("../utils/regexEscape");

// Liste blanche de champs (anti mass-assignment)
const SUPPLIER_FIELDS = [
  "supplierId", "status", "name", "contactName", "phone", "whatsapp",
  "email", "location", "categories", "brands", "leadTime", "paymentTerms",
  "discountRate", "minOrderAmount", "shippingMode", "returnsAccepted",
  "qualityRating", "lastContact", "notes"
];

const pickFields = (source, allowedKeys) => {
  const result = {};
  for (const key of allowedKeys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
};

// Normalisation des tableaux (Excel : "Smartphones, Laptops")
const toStringArray = (value) => {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map(v => v.trim()).filter(Boolean);
  }
  return [];
};

// ===============================================
// GET /api/v1/admin/suppliers
// ===============================================
exports.listSuppliers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status && ["active", "discussion", "suspended", "inactive"].includes(status)) {
      filter.status = status;
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { supplierId: { $regex: safeSearch, $options: "i" } },
        { contactName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter)
        .sort({ status: 1, supplierId: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Supplier.countDocuments(filter)
    ]);

    // Enrichit avec le nombre de produits référencés côté admin (optionnel)
    res.status(200).json({
      success: true,
      suppliers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error("❌ Erreur listSuppliers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// GET /api/v1/admin/suppliers/stats — synthèse (feuille Dashboard)
// Doit être déclarée AVANT /:id
// ===============================================
exports.getSupplierStats = async (_req, res) => {
  try {
    const [counts, orderAgg] = await Promise.all([
      Supplier.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      SupplierOrder.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            depositPaid: { $sum: "$depositPaid" }
          }
        }
      ])
    ]);

    const countMap = counts.reduce((acc, c) => {
      acc[c._id] = c.count;
      return acc;
    }, {});

    const active = countMap.active || 0;
    const discussion = countMap.discussion || 0;
    const suspended = countMap.suspended || 0;
    const inactive = countMap.inactive || 0;

    // Commandes "engagées" = pas encore livrées ni annulées
    const openOrders = await SupplierOrder.countDocuments({
      status: { $in: ["pending", "confirmed", "in_transit"] }
    });

    const totals = orderAgg[0] || { totalAmount: 0, depositPaid: 0 };
    const remaining = Math.max(0, (totals.totalAmount || 0) - (totals.depositPaid || 0));

    // Synthèse par fournisseur actif (note, délai, remise…)
    const suppliers = await Supplier.find({ status: { $in: ["active", "discussion"] } })
      .select("supplierId name status leadTime discountRate qualityRating categories")
      .sort({ status: 1, supplierId: 1 })
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        activeSuppliers: active,
        inDiscussion: discussion,
        suspendedSuppliers: suspended,
        inactiveSuppliers: inactive,
        openOrders,
        engagedAmount: Math.round(totals.totalAmount || 0),
        remainingToPay: Math.round(remaining)
      },
      suppliers: suppliers.map(s => ({
        supplierId: s.supplierId,
        name: s.name,
        status: s.status,
        leadTime: s.leadTime || "—",
        discountRate: s.discountRate || 0,
        qualityRating: s.qualityRating || 0,
        categories: s.categories || []
      }))
    });
  } catch (error) {
    console.error("❌ Erreur getSupplierStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// GET /api/v1/admin/suppliers/:id
// ===============================================
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).lean();
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Fournisseur introuvable" });
    }
    res.status(200).json({ success: true, supplier });
  } catch (error) {
    console.error("❌ Erreur getSupplierById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// POST /api/v1/admin/suppliers
// ===============================================
exports.createSupplier = async (req, res) => {
  try {
    const data = pickFields(req.body, SUPPLIER_FIELDS);
    data.categories = toStringArray(data.categories);
    data.brands = toStringArray(data.brands);
    if (data.supplierId) data.supplierId = String(data.supplierId).trim().toUpperCase();

    if (!data.name || !String(data.name).trim()) {
      return res.status(400).json({ success: false, message: "Le nom du fournisseur est requis" });
    }

    // supplierId auto-généré (F001…) si absent (modèle pre("save"))
    const supplier = await Supplier.create(data);

    res.status(201).json({
      success: true,
      supplier,
      message: "Fournisseur créé avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur createSupplier:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "supplierId";
      return res.status(409).json({
        success: false,
        message: field === "name"
          ? "Un fournisseur avec ce nom existe déjà"
          : `L'identifiant ${data?.supplierId || ""} est déjà utilisé`
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Données invalides", details: messages });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// PUT /api/v1/admin/suppliers/:id
// Mise à jour partielle (seuls les champs envoyés sont écrasés)
// ===============================================
exports.updateSupplier = async (req, res) => {
  try {
    const data = pickFields(req.body, SUPPLIER_FIELDS);
    if (data.categories !== undefined) data.categories = toStringArray(data.categories);
    if (data.brands !== undefined) data.brands = toStringArray(data.brands);
    if (data.supplierId !== undefined) data.supplierId = String(data.supplierId).trim().toUpperCase();

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Fournisseur introuvable" });
    }
    res.status(200).json({ success: true, supplier, message: "Fournisseur mis à jour" });
  } catch (error) {
    console.error("❌ Erreur updateSupplier:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Données invalides", details: messages });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// DELETE /api/v1/admin/suppliers/:id
// ===============================================
exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Fournisseur introuvable" });
    }
    // Les commandes fournisseurs historiques gardent le nom/ID en snapshot
    res.status(200).json({ success: true, message: "Fournisseur supprimé" });
  } catch (error) {
    console.error("❌ Erreur deleteSupplier:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;