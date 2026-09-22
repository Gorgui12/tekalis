// ===============================================
// controllers/supplierOrderController.js
// Suivi des commandes passées auprès des fournisseurs
// (fichier Excel "Suivi Commandes").
// ===============================================
const SupplierOrder = require("../models/SupplierOrder");
const Supplier = require("../models/Supplier");
const { escapeRegex } = require("../utils/regexEscape");

// Statuts disponibles (= colonne "Statut" du classeur Excel)
const STATUSES = ["pending", "confirmed", "in_transit", "received", "disputed"];

const ORDER_FIELDS = [
  "orderNumber", "date", "supplier", "supplierId", "supplierName",
  "productsOrdered", "quantity", "totalAmount", "depositPaid",
  "paymentMethod", "expectedDelivery", "actualDelivery", "status", "notes"
];

const pickFields = (source, allowedKeys) => {
  const result = {};
  for (const key of allowedKeys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
};

// Résout le fournisseur fourni (id ObjectId OU supplierId "F001")
// et complète supplierId/supplierName de façon cohérente.
// Renvoie TOUJOURS une valeur pour `supplier` (ObjectId valide ou null)
// afin d'éviter une CastError si la référence ne peut pas être résolue.
const resolveSupplierSnapshot = async (data) => {
  const result = {};

  if (data.supplier) {
    let supplier =
      typeof data.supplier === "string" && /^[a-f\d]{24}$/i.test(data.supplier)
        ? await Supplier.findById(data.supplier).lean()
        : null;
    if (!supplier && typeof data.supplier === "string") {
      supplier = await Supplier.findOne({
        supplierId: { $regex: new RegExp(`^${escapeRegex(data.supplier)}$`, "i") }
      }).lean();
    }
    if (supplier) {
      result.supplier = supplier._id;
      result.supplierId = supplier.supplierId;
      result.supplierName = supplier.name;
    }
  }

  // Permet une saisie libre (snapshot) quand aucun fournisseur n'est lié
  if (data.supplierId) result.supplierId = String(data.supplierId).trim().toUpperCase();
  if (data.supplierName) result.supplierName = String(data.supplierName).trim();

  return result;
};

// Normalise la référence fournisseur d'un update : si une référence valide
// a été résolue on la garde, sinon on la délie (null) pour éviter les CastError.
const normalizeUpdate = (data, snapshot) => {
  const update = { ...data, ...snapshot };
  if (data.supplier !== undefined && snapshot.supplier === undefined) {
    update.supplier = null;
  }
  return update;
};

// Génération du n° de commande CMD-YYYY-XXX
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const last = await SupplierOrder.findOne(
    { orderNumber: { $regex: `^CMD-${year}` } },
    { orderNumber: 1, _id: 0 }
  ).sort({ orderNumber: -1 }).lean();

  let n = 1;
  if (last && /^CMD-\d{4}-(\d+)$/.test(last.orderNumber)) {
    n = parseInt(last.orderNumber.replace(/^CMD-\d{4}-/, ""), 10) + 1;
  }
  return `CMD-${year}-${String(n).padStart(3, "0")}`;
};

// ===============================================
// GET /api/v1/admin/supplier-orders
// ===============================================
exports.listSupplierOrders = async (req, res) => {
  try {
    const { status, supplier, search, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status && STATUSES.includes(status)) filter.status = status;
    if (supplier) {
      if (/^[a-f\d]{24}$/i.test(supplier)) filter.supplier = supplier;
      else filter.supplierId = { $regex: new RegExp(`^${escapeRegex(supplier)}$`, "i") };
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { orderNumber: { $regex: safeSearch, $options: "i" } },
        { supplierName: { $regex: safeSearch, $options: "i" } },
        { supplierId: { $regex: safeSearch, $options: "i" } },
        { productsOrdered: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));

    const [orders, total] = await Promise.all([
      SupplierOrder.find(filter)
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("supplier", "supplierId name status")
        .lean(),
      SupplierOrder.countDocuments(filter)
    ]);

    // "Reste à payer" n'étant pas un champ Mongo (virtual), on le calcule ici
    const items = orders.map(o => ({
      ...o,
      remaining: Math.max(0, (o.totalAmount || 0) - (o.depositPaid || 0))
    }));

    res.status(200).json({
      success: true,
      orders: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error("❌ Erreur listSupplierOrders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// GET /api/v1/admin/supplier-orders/:id
// ===============================================
exports.getSupplierOrderById = async (req, res) => {
  try {
    const order = await SupplierOrder.findById(req.params.id)
      .populate("supplier", "supplierId name status")
      .lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande fournisseur introuvable" });
    }
    res.status(200).json({
      success: true,
      order: { ...order, remaining: Math.max(0, (order.totalAmount || 0) - (order.depositPaid || 0)) }
    });
  } catch (error) {
    console.error("❌ Erreur getSupplierOrderById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// POST /api/v1/admin/supplier-orders
// ===============================================
exports.createSupplierOrder = async (req, res) => {
  try {
    const data = pickFields(req.body, ORDER_FIELDS);

    if (!data.productsOrdered || !String(data.productsOrdered).trim()) {
      return res.status(400).json({ success: false, message: "Les produits commandés sont requis" });
    }

    // Snapshots fournisseur (référence + copie nom/id)
    Object.assign(data, await resolveSupplierSnapshot(data));

    if (!data.orderNumber) data.orderNumber = await generateOrderNumber();
    data.quantity = Number(data.quantity) || 0;
    data.totalAmount = Number(data.totalAmount) || 0;
    data.depositPaid = Number(data.depositPaid) || 0;

    if (!STATUSES.includes(data.status)) data.status = "pending";

    const order = await SupplierOrder.create(data);

    res.status(201).json({
      success: true,
      order: { ...order.toJSON(), remaining: order.remaining },
      message: "Commande fournisseur créée"
    });
  } catch (error) {
    console.error("❌ Erreur createSupplierOrder:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Données invalides", details: messages });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// PUT /api/v1/admin/supplier-orders/:id
// ===============================================
exports.updateSupplierOrder = async (req, res) => {
  try {
    const data = pickFields(req.body, ORDER_FIELDS);
    const snapshot = await resolveSupplierSnapshot(data);

    const update = normalizeUpdate(data, snapshot);
    if (update.quantity !== undefined) update.quantity = Number(update.quantity) || 0;
    if (update.totalAmount !== undefined) update.totalAmount = Number(update.totalAmount) || 0;
    if (update.depositPaid !== undefined) update.depositPaid = Number(update.depositPaid) || 0;

    const order = await SupplierOrder.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate("supplier", "supplierId name status");
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande fournisseur introuvable" });
    }
    res.status(200).json({
      success: true,
      order: { ...order.toJSON(), remaining: order.remaining },
      message: "Commande fournisseur mise à jour"
    });
  } catch (error) {
    console.error("❌ Erreur updateSupplierOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// PUT /api/v1/admin/supplier-orders/:id/status
// ===============================================
exports.updateSupplierOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }
    const order = await SupplierOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("supplier", "supplierId name status");
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande fournisseur introuvable" });
    }
    res.status(200).json({
      success: true,
      order: { ...order.toJSON(), remaining: order.remaining },
      message: "Statut mis à jour"
    });
  } catch (error) {
    console.error("❌ Erreur updateSupplierOrderStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// DELETE /api/v1/admin/supplier-orders/:id
// ===============================================
exports.deleteSupplierOrder = async (req, res) => {
  try {
    const deleted = await SupplierOrder.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Commande fournisseur introuvable" });
    }
    res.status(200).json({ success: true, message: "Commande fournisseur supprimée" });
  } catch (error) {
    console.error("❌ Erreur deleteSupplierOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;