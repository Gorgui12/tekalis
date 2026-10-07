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

  // 🆕 Sous-objet SOLAIRE (additif, 100% optionnel)
  // Alimenté par le configurateur de kit solaire (SOLAR_AUDIT.md / SOLAR_DECISIONS.md).
  // Chaque clé est optionnelle : un produit peut être partiellement décrit. Aucune
  // valeur n'est écrite automatiquement en base : elle passe par la validation
  // humaine d'un CSV (voir scripts/solar-apply.mjs).
  solar: {
    role: {
      type: String,
      enum: [
        "panel",      // panneau photovoltaïque
        "battery",    // batterie (gel / AGM / lithium)
        "inverter",   // onduleur / convertisseur
        "controller", // régulateur de charge (MPPT / PWM)
        "kit",        // kit solaire complet
        "accessory"   // câbles, supports, protections…
      ]
    },
    powerW: Number,          // puissance nominale panneau (Wc) ou kit
    voltageV: Number,        // tension nominale (ex. 12, 24, 48) batterie/panneau
    capacityAh: Number,      // capacité batterie (Ah)
    chemistry: {             // technologie batterie
      type: String,
      enum: ["gel", "agm", "lithium", "lead-acid"]
    },
    inverterContinuousW: Number, // puissance continue onduleur (W)
    inverterPeakW: Number,       // puissance crête onduleur (W)
    systemVoltageV: Number,      // tension système de l'onduleur (12/24/48 V)
    inverterType: {              // type d'onduleur
      type: String,
      enum: ["hybrid", "off-grid", "grid-tie", "converter"]
    },
    mpptMaxVocV: Number,     // tension max d'entrée solaire du MPPT (V)
    mpptMaxA: Number,        // courant max d'entrée solaire du MPPT (A)
    panelVocV: Number,       // tension circuit ouvert du panneau (V)
    panelVmpV: Number,       // tension max power point du panneau (V)
    cycles: Number           // cycles de vie de la batterie (durée de vie)
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
  
  // 🆕 Section de la page d'accueil où afficher le produit
  //    "none"       → pas affiché dans les sections produits de l'accueil
  //    "new"        → section "Nouveautés"
  //    "bestseller" → section "Meilleures ventes"
  //    "promo"      → section "Promotions"
  homepageSection: {
    type: String,
    enum: ["none", "new", "bestseller", "promo"],
    default: "none"
  },
  
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
