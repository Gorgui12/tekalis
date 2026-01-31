// ===============================================
// 2. NOUVEAU MODÈLE - models/Review.js
// ===============================================
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Peut être lié à un produit OU un article de blog
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article"
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Note (étoiles)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  title: { 
    type: String,
    maxlength: 100 
  },
  
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Photos/vidéos de l'utilisateur
  media: [{
    type: { type: String, enum: ["image", "video"] },
    url: String
  }],
  
  // Avis vérifié (achat confirmé)
  isVerified: { type: Boolean, default: false },
  
  // Réponse du vendeur
  response: {
    text: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: Date
  },
  
  // Votes "utile"
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  
  // Modération
  isApproved: { type: Boolean, default: true },
  isReported: { type: Boolean, default: false }
}, { timestamps: true });

// Un utilisateur = 1 avis par produit/article
reviewSchema.index({ product: 1, user: 1 }, { unique: true, sparse: true });
reviewSchema.index({ article: 1, user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);
