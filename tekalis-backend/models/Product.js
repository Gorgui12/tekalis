// ===============================================
// 7. AMÉLIORATION - models/Product.js
// ===============================================
const mongoose = require("mongoose");

const productSchemaEnhanced = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  
  price: { type: Number, required: true },
  comparePrice: Number, // Prix barré
  
  stock: { type: Number, required: true, default: 0 },
  
  // 🆕 Multi-images au lieu d'une seule
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Catégories (peut appartenir à plusieurs)
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }],
  
  brand: { type: String, required: true },

  // 🆕 Champs catalogue / Google Merchant Center
  gtin: String,        // EAN / UPC / GTIN-13 international
  mpn: String,         // Référence constructeur
  weight: { type: Number, default: 0 },  // Poids unitaire en kg
  condition: {
    type: String,
    enum: ["new", "refurbished", "used"],
    default: "new"
  },
  
  // 🆕 Spécifications techniques détaillées
  specs: {
    // PC / Laptops
    processor: String,
    processorBrand: String, // Intel, AMD, Apple
    processorGeneration: String,
    ram: String,
    ramType: String, // DDR4, DDR5
    storage: String,
    storageType: String, // SSD, HDD, NVMe
    screen: String,
    screenTech: String, // IPS, OLED, LCD
    refreshRate: String, // 60Hz, 120Hz, 144Hz
    graphics: String,
    graphicsMemory: String,
    
    // Connectivité
    connectivity: [String], // ["WiFi 6", "Bluetooth 5.2", "USB-C", "HDMI"]
    ports: [String],
    
    // Général
    os: String,
    battery: String,
    weight: String,
    dimensions: String,
    color: [String],
    
    // Smartphones
    camera: String,
    frontCamera: String,
    batteryCapacity: String,
    
    // Gaming
    rgb: Boolean,
    coolingSystem: String
  },
  
  // 🆕 Système de notation
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  
  // 🆕 Garantie
  warranty: {
    duration: { type: Number, default: 12 },
    type: { type: String, default: "constructeur" }
  },
  
  // 🆕 Tags pour recherche et filtres
  tags: [String],
  
  // 🆕 Statut du produit
  status: {
    type: String,
    enum: ["available", "preorder", "outofstock", "discontinued"],
    default: "available"
  },
  
  // 🆕 Mise en avant
  isFeatured: { type: Boolean, default: false },
  
  // 🆕 Statistiques
  viewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  
  // SEO
  metaTitle: String,
  metaDescription: String
}, { timestamps: true });

// Index de recherche
productSchemaEnhanced.index({ name: "text", description: "text", brand: "text" });
productSchemaEnhanced.index({ price: 1, "rating.average": -1 });
productSchemaEnhanced.index({ category: 1, stock: 1 });

module.exports = mongoose.model("Product", productSchemaEnhanced);
