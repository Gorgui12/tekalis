const mongoose = require("mongoose");

// ===============================================
// models/WhatsAppConversation.js
// Historique par numéro de téléphone, pour donner du contexte à l'IA
// d'un message à l'autre (sans ça, chaque message serait traité isolément
// et le client devrait tout répéter).
// ===============================================
const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const whatsAppConversationSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    messages: { type: [messageSchema], default: [] },

    // ── Escalade ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["bot", "escalated", "resolved"],
      default: "bot",
    },
    escalatedAt: { type: Date },
    escalationReason: { type: String },

    // Compteur de répétitions — sert à détecter qu'un client tourne en rond
    // avec le bot (voir services/whatsappAI.js)
    lastIntent: { type: String },
    sameIntentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// On ne garde que les 20 derniers messages en mémoire de contexte — au-delà,
// le contexte pertinent pour Claude n'apporte plus rien et gonfle le coût
// de chaque appel API pour rien.
whatsAppConversationSchema.methods.pushMessage = function (role, content) {
  this.messages.push({ role, content });
  if (this.messages.length > 20) {
    this.messages = this.messages.slice(-20);
  }
};

module.exports = mongoose.model("WhatsAppConversation", whatsAppConversationSchema);
