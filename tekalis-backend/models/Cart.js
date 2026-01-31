// ===============================================
// 6. NOUVEAU MODÈLE - models/Cart.js
// ===============================================
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: Number, // Prix au moment de l'ajout
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Code promo appliqué
  promoCode: {
    code: String,
    discount: Number, // Pourcentage ou montant fixe
    type: { type: String, enum: ["percentage", "fixed"] }
  },
  
  // Totaux
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  
  // Date d'expiration (panier abandonné après 30 jours)
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000)
  }
}, { timestamps: true });

// Calculer les totaux avant sauvegarde
cartSchema.pre("save", async function(next) {
  if (this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Appliquer la réduction
    if (this.promoCode && this.promoCode.discount) {
      if (this.promoCode.type === "percentage") {
        this.discount = this.subtotal * (this.promoCode.discount / 100);
      } else {
        this.discount = this.promoCode.discount;
      }
    }
    
    // Frais de port (gratuit au-dessus de 50000 FCFA)
    this.shippingCost = this.subtotal >= 50000 ? 0 : 2500;
    
    this.total = this.subtotal - this.discount + this.shippingCost;
  }
  next();
});

module.exports = mongoose.model("Cart", cartSchema);

