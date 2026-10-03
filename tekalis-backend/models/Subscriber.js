// ===============================================
// models/Subscriber.js
// Abonnés à la newsletter (double opt-in).
//
// Pourquoi un modèle distinct de User : un abonné n'a pas de compte, et un
// client n'est pas forcément abonné. Fusionner les deux poserait la question
// de la base légale (newsletter = consentement marketing, compte = contrat).
//
// Statut : pending (confirmation envoyée) → active | unsubscribed.
// On ne compte JAMAIS un abonné `pending` comme actif : c'est tout l'intérêt
// du double opt-in, et la preuve que l'adresse est réelle ET contrôlée.
// ===============================================
const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalide"]
  },

  status: {
    type: String,
    enum: ["pending", "active", "unsubscribed"],
    default: "pending"
  },

  // Jeton de confirmation (haché en base, comme resetPasswordToken : la base
  // ne doit jamais pouvoir servir un lien d'inscription ou de désabonnement).
  confirmationToken: {
    type: String,
    select: false
  },
  confirmationExpires: Date,

  // Jeton de désabonnement, distinct et NON consommé : il doit rester
  // valable pour tous les futurs emails de la campagne. On ne peut donc pas
  // réutiliser le jeton de confirmation, qui est à usage unique.
  unsubscribeToken: {
    type: String,
    select: false
  },

  confirmedAt: Date,
  unsubscribedAt: Date,

  // Point d'entrée de l'inscription, pour mesurer la performance par canal.
  source: {
    type: String,
    enum: ["footer", "blog", "cta", "api"],
    default: "footer"
  }
}, { timestamps: true });

subscriberSchema.index({ status: 1, createdAt: -1 });

// `unique: true` sur le champ email ci-dessus pose déjà l'index unique.

module.exports = mongoose.model("Subscriber", subscriberSchema);