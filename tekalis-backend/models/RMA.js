// ===============================================
// 5. NOUVEAU MODÈLE - models/RMA.js (SAV)
// ===============================================
const mongoose = require("mongoose");

const rmaSchema = new mongoose.Schema({
  // Numéro RMA unique
  rmaNumber: {
    type: String,
    unique: true,
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
  
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  
  // Type de demande
  type: {
    type: String,
    enum: ["retour", "reparation", "echange"],
    required: true
  },
  
  // Raison
  reason: {
    type: String,
    enum: [
      "defectueux",
      "non_conforme",
      "erreur_commande",
      "change_avis",
      "garantie",
      "autre"
    ],
    required: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Photos du problème
  images: [String],
  
  // Statut
  status: {
    type: String,
    enum: [
      "pending",      // En attente
      "approved",     // Approuvé
      "rejected",     // Rejeté
      "in_transit",   // En transit (retour)
      "received",     // Reçu par Tekalis
      "processing",   // En traitement
      "resolved",     // Résolu
      "cancelled"     // Annulé
    ],
    default: "pending"
  },
  
  // Suivi
  trackingNumber: String,
  
  // Résolution
  resolution: {
    type: String,
    enum: ["remboursement", "reparation", "remplacement", "aucune"],
    default: null
  },
  
  refundAmount: Number,
  
  // Notes internes
  internalNotes: String,
  
  // Historique des changements de statut
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

// Générer numéro RMA
rmaSchema.pre("save", async function(next) {
  if (!this.rmaNumber) {
    const count = await this.constructor.countDocuments();
    this.rmaNumber = `RMA${String(count + 10000).padStart(6, "0")}`;
  }
  next();
});

rmaSchema.index({ user: 1, status: 1 });
rmaSchema.index({ rmaNumber: 1 });

module.exports = mongoose.model("RMA", rmaSchema);
