// ===============================================
// models/RMA.js — VERSION CORRIGÉE
// MAJEUR 7 : Race condition sur rmaNumber
//   Ancienne version : countDocuments() → doublons en charge concurrente
//   Nouvelle version : crypto.randomBytes() → quasi-infaillible (même
//   pattern que la correction déjà appliquée sur orderNumber)
// ===============================================
const mongoose = require("mongoose");
const crypto = require("crypto");

const rmaSchema = new mongoose.Schema({
  // Numéro RMA unique — format : RMA-YYMMDD-XXXXXXXX
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
      "pending",
      "approved",
      "rejected",
      "in_transit",
      "received",
      "processing",
      "resolved",
      "cancelled"
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

  // Notes internes (admin uniquement)
  internalNotes: String,

  // Historique des changements de statut
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

// ──────────────────────────────────────────────────────────────────────────────
// MAJEUR 7 : Génération du numéro RMA avec crypto.randomBytes
//
// Ancienne version (PROBLÈME) :
//   const count = await this.constructor.countDocuments();
//   this.rmaNumber = `RMA${String(count + 10000).padStart(6, "0")}`;
//   ⚠️ Si deux RMA sont créés simultanément, countDocuments peut retourner
//   la même valeur avant que le premier document soit persisté → doublon.
//
// Nouvelle version (CORRECT) :
//   Format : RMA-YYMMDD-XXXXXXXX (8 hex chars = 4 milliards de combinaisons)
//   Identique au pattern déjà corrigé sur orderNumber dans Order.js
// ──────────────────────────────────────────────────────────────────────────────
rmaSchema.pre("save", function(next) {
  if (!this.rmaNumber) {
    const date = new Date();
    const year   = date.getFullYear().toString().slice(-2);
    const month  = String(date.getMonth() + 1).padStart(2, "0");
    const day    = String(date.getDate()).padStart(2, "0");
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    this.rmaNumber = `RMA${year}${month}${day}${randomSuffix}`;
  }
  next();
});

rmaSchema.index({ user: 1, status: 1 });
rmaSchema.index({ rmaNumber: 1 });
rmaSchema.index({ order: 1 });

module.exports = mongoose.model("RMA", rmaSchema);
