const mongoose = require("mongoose");

// models/Visit.js — Comptage des visites pour les analytics admin.
//
// Un document par (jour, session). `visits` est incrémenté à chaque
// page vue de cette session ; on déduit :
//   - sessions  = nombre de documents (une session ≈ un visiteur/jour)
//   - pageviews = somme des `visits`
// La session est générée côté frontend (localStorage) et transmise à
// l'endpoint POST /api/v1/tracking/visit.
const visitSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },      // YYYY-MM-DD (local)
    sessionId: { type: String, required: true }, // id de session navigateur
    path: { type: String, default: "/" },         // dernier chemin vu
    visits: { type: Number, default: 1 },
  },
  { timestamps: true }
);

visitSchema.index({ date: 1, sessionId: 1 }, { unique: true });
visitSchema.index({ createdAt: 1 }, { expires: "400d" });

module.exports = mongoose.model("Visit", visitSchema);