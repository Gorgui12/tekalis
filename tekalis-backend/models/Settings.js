// ===============================================
// 3. models/Settings.js
// ===============================================
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  // Il n'y aura qu'un seul document de settings
  _id: {
    type: String,
    default: "site_settings"
  },
  
  // Informations site
  siteName: {
    type: String,
    default: "Tekalis"
  },
  siteDescription: String,
  logo: String,
  favicon: String,
  
  // Contact
  contactEmail: String,
  contactPhone: String,
  contactAddress: String,
  
  // Réseaux sociaux
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  
  // Frais de livraison
  shipping: {
    standardCost: { type: Number, default: 2500 }, // FCFA
    freeShippingThreshold: { type: Number, default: 50000 },
    expressAvailable: { type: Boolean, default: true },
    expressCost: { type: Number, default: 5000 },
    regions: [{
      name: String,
      cost: Number,
      deliveryTime: String // Ex: "2-3 jours"
    }]
  },
  
  // Taxes
  tax: {
    enabled: { type: Boolean, default: false },
    rate: { type: Number, default: 0 },
    included: { type: Boolean, default: true }
  },
  
  // Points de fidélité
  loyalty: {
    enabled: { type: Boolean, default: true },
    pointsPerFCFA: { type: Number, default: 0.001 }, // 1 point par 1000 FCFA
    redemptionRate: { type: Number, default: 1 }, // 1 point = 1 FCFA
    minPointsToRedeem: { type: Number, default: 100 }
  },
  
  // Garanties
  warranty: {
    defaultDuration: { type: Number, default: 12 }, // mois
    extensionAvailable: { type: Boolean, default: true },
    extensionCost: { type: Number, default: 5000 }
  },
  
  // Retours/SAV
  returns: {
    enabled: { type: Boolean, default: true },
    periodDays: { type: Number, default: 14 },
    conditions: String
  },
  
  // Paiements acceptés
  paymentMethods: {
    cash: { type: Boolean, default: true },
    wave: { type: Boolean, default: true },
    orangeMoney: { type: Boolean, default: true },
    freeMoney: { type: Boolean, default: true },
    stripe: { type: Boolean, default: false }
  },
  
  // Maintenance
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: String
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    googleAnalyticsId: String,
    facebookPixelId: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);

