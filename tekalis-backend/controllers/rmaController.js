// ===============================================
// 6. controllers/rmaController.js
// ===============================================
const RMA = require("../models/RMA");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

// Créer une demande SAV
const createRMA = async (req, res) => {
  try {
    const { orderId, productId, type, reason, description, images } = req.body;
    
    // Vérifier la commande
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    }).populate("products.product");
    
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    
    // Vérifier que le produit est dans la commande
    const productInOrder = order.products.find(
      p => p.product._id.toString() === productId
    );
    
    if (!productInOrder) {
      return res.status(400).json({ 
        message: "Ce produit ne fait pas partie de cette commande" 
      });
    }
    
    // Vérifier le délai de retour (14 jours)
    const daysSinceOrder = Math.ceil(
      (new Date() - order.createdAt) / (1000 * 60 * 60 * 24)
    );
    
    if (type === "retour" && daysSinceOrder > 14) {
      return res.status(400).json({ 
        message: "Le délai de retour de 14 jours est dépassé" 
      });
    }
    
    // Créer le RMA
    const rma = await RMA.create({
      user: req.user._id,
      order: orderId,
      product: productId,
      type,
      reason,
      description,
      images: images || []
    });
    
    // Créer une notification
    await Notification.create({
      user: req.user._id,
      type: "rma_created",
      title: "Demande SAV créée",
      message: `Votre demande ${rma.rmaNumber} a été créée avec succès`,
      link: `/rma/${rma._id}`,
      data: { rmaId: rma._id }
    });
    
    // TODO: Envoyer email de confirmation
    
    res.status(201).json({
      success: true,
      message: "Demande SAV créée avec succès",
      rma
    });
  } catch (error) {
    console.error("Erreur createRMA:", error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer mes demandes SAV
const getMyRMAs = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const rmas = await RMA.find(filter)
      .populate("product", "name images brand")
      .populate("order", "orderNumber createdAt")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, rmas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une deman
const getRMA = async (req, res) => {
  try {
    const rma = await RMA.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate("product", "name images brand warranty")
      .populate("order", "orderNumber createdAt totalPrice")
      .populate("statusHistory.updatedBy", "name");
    
    if (!rma) {
      return res.status(404).json({ message: "Demande introuvable" });
    }
    
    res.status(200).json({ success: true, rma });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Annuler une demande SAV
const cancelRMA = async (req, res) => {
  try {
    const rma = await RMA.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!rma) {
      return res.status(404).json({ message: "Demande introuvable" });
    }
    
    if (["resolved", "cancelled"].includes(rma.status)) {
      return res.status(400).json({ 
        message: "Cette demande ne peut plus être annulée" 
      });
    }
    
    rma.status = "cancelled";
    rma.statusHistory.push({
      status: "cancelled",
      updatedBy: req.user._id,
      note: "Annulé par le client"
    });
    
    await rma.save();
    
    res.status(200).json({
      success: true,
      message: "Demande annulée",
      rma
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le statut (Admin)
const updateRMAStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, resolution, refundAmount } = req.body;
    
    const rma = await RMA.findById(req.params.id)
      .populate("user", "name email");
    
    if (!rma) {
      return res.status(404).json({ message: "RMA introuvable" });
    }
    
    // Ajouter à l'historique
    rma.statusHistory.push({
      status,
      updatedBy: req.user._id,
      note
    });
    
    rma.status = status;
    if (trackingNumber) rma.trackingNumber = trackingNumber;
    if (resolution) rma.resolution = resolution;
    if (refundAmount) rma.refundAmount = refundAmount;
    
    await rma.save();
    
    // Créer une notification pour le client
    await Notification.create({
      user: rma.user._id,
      type: "rma_updated",
      title: "Mise à jour de votre demande SAV",
      message: `Votre demande ${rma.rmaNumber} a été mise à jour: ${status}`,
      link: `/rma/${rma._id}`,
      data: { rmaId: rma._id }
    });
    
    // TODO: Envoyer email
    
    res.status(200).json({
      success: true,
      message: "Statut mis à jour",
      rma
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les demandes (Admin)
const getAllRMAs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (page - 1) * limit;
    
    const rmas = await RMA.find(filter)
      .populate("user", "name email phone")
      .populate("product", "name brand images")
      .populate("order", "orderNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await RMA.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      rmas,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRMA,
  getMyRMAs,
  getRMA,
  cancelRMA,
  updateRMAStatus,
  getAllRMAs
};
