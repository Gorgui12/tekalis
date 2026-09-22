// ===============================================
// models/Supplier.js
// Fournisseurs & partenaires Tekalis (fichier Excel "Fournisseurs").
// Relation de type dropshipping : aucune commande ne part du stock
// Tekalis, elle est passée auprès de ces partenaires qui détiennent
// le stock. Voir aussi models/SupplierOrder.js (suivi des commandes).
// ===============================================
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  // Identifiant métier du type "F001" (cohérent avec le fichier Excel)
  supplierId: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },

  // Statut de la relation (codes couleur du fichier Excel)
  status: {
    type: String,
    enum: ["active", "discussion", "suspended", "inactive"],
    default: "discussion"
  },

  // Coordonnées
  name: { type: String, required: true, trim: true },
  contactName: { type: String, trim: true },
  phone: String,
  whatsapp: String,
  email: String,
  location: String,

  // Périmètre fourni
  categories: [String],
  brands: [String],

  // Conditions commerciales
  leadTime: String,          // Délai livraison (ex: "24-48h", "3-5 jours")
  paymentTerms: String,      // Conditions de paiement
  discountRate: { type: Number, min: 0, max: 100, default: 0 }, // Remise négociée %
  minOrderAmount: { type: Number, default: 0 },                 // Commande min. (FCFA)
  shippingMode: String,      // Mode expédition
  returnsAccepted: {
    type: String,
    enum: ["yes", "no", "conditional"],
    default: "no",
    set: (v) => (v === true ? "yes" : v === false ? "no" : v || "no")
  },

  // Évaluation
  qualityRating: { type: Number, min: 0, max: 5, default: 0 },  // Note qualité /5
  lastContact: Date,
  notes: String
}, { timestamps: true });

// Génération automatique de l'ID métier F001, F002… à la création
supplierSchema.pre("save", async function (next) {
  if (!this.supplierId) {
    try {
      const last = await mongoose.model("Supplier")
        .findOne({}, { supplierId: 1, _id: 0 })
        .sort({ supplierId: -1 })
        .lean();
      let n = 1;
      if (last && /^F(\d+)$/i.test(last.supplierId)) {
        n = parseInt(last.supplierId.replace(/^F/i, ""), 10) + 1;
      }
      this.supplierId = `F${String(n).padStart(3, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Index de recherche texte
supplierSchema.index({ name: "text", contactName: "text", brand: "text" });
supplierSchema.index({ status: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);