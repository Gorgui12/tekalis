// ===============================================
// 5. controllers/warrantyController.js
// ===============================================
const Warranty = require("../models/Warranty");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Récupérer mes garanties
exports.getMyWarranties = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const warranties = await Warranty.find(filter)
      .populate("product", "name images brand")
      .populate("order", "orderNumber createdAt")
      .sort({ endDate: 1 });
    
    res.status(200).json({ success: true, warranties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une garantie
exports.getWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate("product", "name images brand specs warranty")
      .populate("order", "orderNumber createdAt");
    
    if (!warranty) {
      return res.status(404).json({ message: "Garantie introuvable" });
    }
    
    res.status(200).json({ success: true, warranty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer une garantie (automatique après commande)
exports.createWarranty = async (orderData) => {
  try {
    const warranties = [];
    
    for (const item of orderData.products) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.warranty) continue;
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + product.warranty.duration);
      
      const warranty = await Warranty.create({
        product: product._id,
        user: orderData.user,
        order: orderData._id,
        purchaseDate: startDate,
        startDate,
        endDate,
        warrantyType: product.warranty.type,
        duration: product.warranty.duration,
        status: "active"
      });
      
      warranties.push(warranty);
    }
    
    return warranties;
  } catch (error) {
    console.error("Erreur création garantie:", error);
    return [];
  }
};

// Vérifier le statut d'une garantie
exports.checkWarrantyStatus = async (req, res) => {
  try {
    const { serialNumber } = req.body;
    
    if (!serialNumber) {
      return res.status(400).json({ message: "Numéro de série requis" });
    }
    
    const warranty = await Warranty.findOne({ serialNumber })
      .populate("product", "name images");
    
    if (!warranty) {
      return res.status(404).json({ 
        message: "Aucune garantie trouvée pour ce numéro de série" 
      });
    }
    
    const now = new Date();
    const daysRemaining = Math.ceil((warranty.endDate - now) / (1000 * 60 * 60 * 24));
    
    res.status(200).json({
      success: true,
      warranty,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      isExpired: daysRemaining <= 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Demander une extension de garantie
exports.requestExtension = async (req, res) => {
  try {
    const { warrantyId, duration } = req.body;
    
    const warranty = await Warranty.findOne({
      _id: warrantyId,
      user: req.user._id
    });
    
    if (!warranty) {
      return res.status(404).json({ message: "Garantie introuvable" });
    }
    
    if (warranty.status !== "active") {
      return res.status(400).json({ 
        message: "Seules les garanties actives peuvent être étendues" 
      });
    }
    
    // TODO: Créer une commande pour l'extension
    // Pour l'instant, juste prolonger la garantie
    
    const newEndDate = new Date(warranty.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + duration);
    
    warranty.endDate = newEndDate;
    warranty.warrantyType = "extension";
    await warranty.save();
    
    res.status(200).json({
      success: true,
      message: "Garantie étendue avec succès",
      warranty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le statut (Admin)
exports.updateWarrantyStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const warranty = await Warranty.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    
    if (!warranty) {
      return res.status(404).json({ message: "Garantie introuvable" });
    }
    
    res.status(200).json({
      success: true,
      message: "Statut mis à jour",
      warranty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
