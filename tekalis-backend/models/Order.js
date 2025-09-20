const mongoose = require("mongoose");
// models/Order.js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    }
  ],
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cash", "wave", "om"], required: true },
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },

  // ✅ Champs de livraison ajoutés
  deliveryName: { type: String, required: true },
  deliveryPhone: { type: String, required: true },
  deliveryAddress: { type: String, required: true },

  stripePaymentIntentId: { type: String },
  mobileMoneyReference: { type: String },
  isMobileMoneyPaid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
