// ===============================================
// 4. NOUVEAU MODÈLE - models/Warranty.js
// ===============================================
const mongoose = require("mongoose");

const warrantySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  
  // Dates
  purchaseDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Type de garantie
  warrantyType: {
    type: String,
    enum: ["constructeur", "extension", "commerciale"],
    default: "constructeur"
  },
  
  // Durée en mois
  duration: {
    type: Number,
    required: true
  },
  
  // Statut
  status: {
    type: String,
    enum: ["active", "expired", "suspended", "claimed"],
    default: "active"
  },
  
  // Numéro de série du produit
  serialNumber: String,
  
  // Document de preuve d'achat
  proofOfPurchase: String, // URL
  
  // Notes
  notes: String
}, { timestamps: true });

warrantySchema.index({ user: 1, status: 1 });
warrantySchema.index({ endDate: 1 });

module.exports = mongoose.model("Warranty", warrantySchema);
