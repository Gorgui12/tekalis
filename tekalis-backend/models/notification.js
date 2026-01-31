// ===============================================
// 2. models/Notification.js
// ===============================================
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  type: {
    type: String,
    enum: [
      "order_confirmed",
      "order_shipped",
      "order_delivered",
      "order_cancelled",
      "rma_created",
      "rma_updated",
      "warranty_expiring",
      "review_request",
      "promo_alert",
      "system"
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Lien associé
  link: String,
  
  // Données additionnelles
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rmaId: { type: mongoose.Schema.Types.ObjectId, ref: "RMA" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
  },
  
  // Statut
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Envoi par email
  emailSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
