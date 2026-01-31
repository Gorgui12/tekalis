// ===============================================
// 3. NOUVEAU MODÈLE - models/Article.js (Blog)
// ===============================================
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Auteur
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Contenu (Rich Text / Markdown)
  content: {
    type: String,
    required: true
  },
  excerpt: String, // Résumé court
  
  // Image de couverture
  coverImage: {
    url: String,
    alt: String
  },
  
  // Catégories d'article
  category: {
    type: String,
    enum: ["test", "comparatif", "tutoriel", "actualite"],
    required: true
  },
  
  // Tags
  tags: [String],
  
  // Type de contenu
  isTest: { type: Boolean, default: false },
  
  // Produits reliés (pour tests/comparatifs)
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Statistiques
  viewCount: { type: Number, default: 0 },
  readTime: Number, // minutes
  
  // Publication
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },
  publishedAt: Date,
  
  // Mise en avant
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

articleSchema.index({ title: "text", content: "text" });
articleSchema.index({ status: 1, publishedAt: -1 });

// Générer slug
articleSchema.pre("save", function(next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
