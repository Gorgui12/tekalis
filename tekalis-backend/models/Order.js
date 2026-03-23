const mongoose = require("mongoose");
const crypto = require("crypto");

// models/Order.js
const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  products: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  
  totalPrice: { 
    type: Number, 
    required: true 
  },
  
  shippingCost: {
    type: Number,
    default: 0
  },
  
  paymentMethod: { 
    type: String, 
    enum: ["cash", "online", "wave", "om", "free", "card"], 
    required: true,
    default: "cash"
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'awaiting', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  isPaid: { 
    type: Boolean, 
    default: false 
  },
  
  paidAt: { 
    type: Date 
  },
  
  paymentToken: {
    type: String,
    index: true
  },
  
  transactionId: {
    type: String,
    index: true
  },
  
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
    default: "pending" 
  },
  
  deliveryName: { 
    type: String, 
    required: true 
  },
  
  deliveryPhone: { 
    type: String, 
    required: true 
  },
  
  deliveryAddress: { 
    type: String, 
    required: true 
  },
  
  deliveryCity: {
    type: String,
    default: "Dakar"
  },
  
  deliveryRegion: {
    type: String,
    default: "Dakar"
  },
  
  // Numéro de commande unique
  orderNumber: {
    type: String,
    unique: true
  },
  
  refundAmount: {
    type: Number,
    default: 0
  },
  
  refundedAt: {
    type: Date
  },
  
  stripePaymentIntentId: { 
    type: String 
  },
  
  mobileMoneyReference: { 
    type: String 
  },
  
  isMobileMoneyPaid: { 
    type: Boolean, 
    default: false 
  },
  
}, { 
  timestamps: true 
});

/**
 * Générer un numéro de commande unique avant la sauvegarde.
 * 
 * ✅ FIX race condition : on utilise un suffixe aléatoire crypto au lieu de
 * compter les documents du jour (qui peut retourner la même valeur si deux
 * commandes sont créées simultanément et que MongoDB n'a pas encore persisté
 * la première).
 *
 * Format : ORD-YYMMDD-XXXXXXXX (8 hex chars aléatoires → 4 milliards de combos)
 */
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year  = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');

    // 4 octets aléatoires → 8 caractères hex, unicité quasi-garantie
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();

    this.orderNumber = `ORD${year}${month}${day}${randomSuffix}`;
  }
  next();
});

// Index pour les recherches
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);