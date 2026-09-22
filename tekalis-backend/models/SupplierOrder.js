// ===============================================
// models/SupplierOrder.js
// Suivi des commandes passées auprès des fournisseurs partenaires
// (fichier Excel "Suivi Commandes"). Depuis Tekalis n'a pas de stock,
// chaque commande client est déclinée en commande(s) fournisseur.
// ===============================================
const mongoose = require("mongoose");

const supplierOrderSchema = new mongoose.Schema({
  // N° commande du type "CMD-YYYY-XXX"
  orderNumber: {
    type: String,
    unique: true,
    trim: true
  },

  date: { type: Date, default: Date.now },

  // Fournisseur lié (référence) + copie du nom/id pour lecture robuste
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    default: null
  },
  supplierId: String, // ex: "F001" (du fournisseur au moment de la commande)
  supplierName: String,

  // Produits commandés sous forme libre (ex: "iPhone 15 x2, JBL Flip 6 x3")
  productsOrdered: { type: String, default: "" },
  quantity: { type: Number, default: 0 },

  // Aspects financiers
  totalAmount: { type: Number, default: 0 },   // Montant total (FCFA)
  depositPaid: { type: Number, default: 0 },   // Acompte versé (FCFA)
  paymentMethod: String,                       // Wave, Orange Money, Virement, À la livraison…

  // Livraison
  expectedDelivery: Date,
  actualDelivery: Date,

  // Statut du suivi
  status: {
    type: String,
    enum: ["pending", "confirmed", "in_transit", "received", "disputed"],
    default: "pending"
  },

  notes: String
}, { timestamps: true });

// "Reste à payer" calculé à la volée (FCFA)
supplierOrderSchema.virtual("remaining").get(function () {
  return Math.max(0, (this.totalAmount || 0) - (this.depositPaid || 0));
});

supplierOrderSchema.set("toJSON", { virtuals: true });
supplierOrderSchema.set("toObject", { virtuals: true });

supplierOrderSchema.index({ status: 1 });
supplierOrderSchema.index({ supplier: 1 });
supplierOrderSchema.index({ date: -1 });

module.exports = mongoose.model("SupplierOrder", supplierOrderSchema);