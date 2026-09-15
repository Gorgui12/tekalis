const mongoose = require("mongoose");

// models/Trend.js — Suggestions de recherche Google (Autocomplete) mises en cache.
//
// Chaque document représente une requête tendance détectée via le service
// googleAutocomplete. Le champ `hasGuide` / `hasProduct` est alimenté par la
// route /trends/refresh qui croise la suggestion avec les guides de prix
// ( déduits des slugs connus ) et le catalogue produits.
//
//  - firstSeen  : première détection (une suggestion "récente" = nouvelle tendance)
//  - lastSeen   : dernière détection (actualisé à chaque refresh)
//  - isSeed     : les seeds admin sont stockées ici aussi (query + isSeed=true)
//  - TTL        : les documents expirés (90 jours sans détection) sont supprimés
const trendSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    seed: { type: String, default: "" },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    detectionCount: { type: Number, default: 1 },
    isSeed: { type: Boolean, default: false },
    hasCover: { type: Boolean, default: false },
    hasGuide: { type: Boolean, default: false },
    hasProduct: { type: Boolean, default: false },
    productSlug: { type: String, default: null },
    guideSlug: { type: String, default: null },
  },
  { timestamps: true }
);

trendSchema.index({ query: 1 }, { unique: true });
trendSchema.index({ firstSeen: 1 });
trendSchema.index({ lastSeen: 1 });
trendSchema.index({ createdAt: 1 }, { expires: "90d" });

module.exports = mongoose.model("Trend", trendSchema);