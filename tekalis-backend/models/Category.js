// ===============================================
// 1. NOUVEAU MODÈLE - models/Category.js
// ===============================================
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true 
  },
  
  // Description SEO pour la page catégorie
  seoDescription: { 
    type: String,
    maxlength: 160 
  },
  seoTitle: String,
  
  // Catégorie parente (pour hiérarchie)
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category",
    default: null 
  },
  
  // Image de bannière pour la page catégorie
  banner: String,
  icon: String, // Pour le menu navigation
  
  // Ordre d'affichage
  order: { type: Number, default: 0 },
  
  // Visibilité
  isActive: { type: Boolean, default: true },
  
  // Statistiques
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

// Génération automatique du slug
categorySchema.pre("save", function(next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);

