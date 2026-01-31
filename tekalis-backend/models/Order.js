const mongoose = require("mongoose");

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
  
  // ✅ Champs de paiement mis à jour
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
  
  // ✅ Champs PayDunya
  paymentToken: {
    type: String,
    index: true
  },
  
  transactionId: {
    type: String,
    index: true
  },
  
  // Informations client PayDunya (remplies après paiement)
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  
  // ✅ Statut de la commande
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
    default: "pending" 
  },
  
  // ✅ Champs de livraison
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
  
  // Remboursement
  refundAmount: {
    type: Number,
    default: 0
  },
  
  refundedAt: {
    type: Date
  },
  
  // Anciens champs (conservés pour compatibilité)
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

// Générer un numéro de commande unique avant la sauvegarde
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Compter les commandes du jour pour avoir un numéro séquentiel
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    
    this.orderNumber = `ORD${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index pour les recherches
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);