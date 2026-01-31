// ===============================================
// 1. models/PromoCode.js
// ===============================================
const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Type de réduction
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },
  
  // Valeur de la réduction
  discount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Montant minimum d'achat
  minAmount: {
    type: Number,
    default: 0
  },
  
  // Montant maximum de réduction (pour percentage)
  maxDiscount: {
    type: Number,
    default: null
  },
  
  // Dates de validité
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Nombre d'utilisations
  usageLimit: {
    type: Number,
    default: null // null = illimité
  },
  usageCount: {
    type: Number,
    default: 0
  },
  
  // Limite par utilisateur
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  
  // Utilisateurs qui ont utilisé ce code
  usedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    usedAt: { type: Date, default: Date.now },
    orderAmount: Number
  }],
  
  // Restrictions
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Créé par (admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

// Méthode pour vérifier la validité
promoCodeSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) return { valid: false, reason: "Code inactif" };
  if (now < this.startDate) return { valid: false, reason: "Code pas encore actif" };
  if (now > this.endDate) return { valid: false, reason: "Code expiré" };
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, reason: "Limite d'utilisation atteinte" };
  }
  
  return { valid: true };
};

// Méthode pour calculer la réduction
promoCodeSchema.methods.calculateDiscount = function(amount) {
  if (amount < this.minAmount) {
    return { 
      discount: 0, 
      error: `Montant minimum requis: ${this.minAmount} FCFA` 
    };
  }
  
  let discount = 0;
  
  if (this.type === "percentage") {
    discount = amount * (this.discount / 100);
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discount;
  }
  
  return { discount: Math.round(discount) };
};

module.exports = mongoose.model("PromoCode", promoCodeSchema);
