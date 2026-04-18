// ===============================================
// routes/heroRoutes.js
// ✅ FIX : routes de mutation protégées par verifyToken + isAdmin
// ✅ FIX : ce fichier est monté sur /api/v1/hero dans server.js
// ===============================================
const express = require("express");
const router = express.Router();
const HeroSlide = require("../models/HeroSlide");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// ── GET /api/v1/hero — Public : slides actifs ordonnés ──────────────────────
router.get("/", async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, slides });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── GET /api/v1/hero/all — Admin : tous les slides (actifs + inactifs) ───────
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, slides });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// ── POST /api/v1/hero — Admin : créer un slide ───────────────────────────────
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const slide = new HeroSlide(req.body);
    await slide.save();
    res.status(201).json({ success: true, slide, message: "Slide créé avec succès" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/v1/hero/reorder — Admin : réordonner (AVANT /:id) ─────────────
// ✅ Déclaré AVANT /:id pour éviter qu'Express interprète "reorder" comme un id
router.patch("/reorder", verifyToken, isAdmin, async (req, res) => {
  try {
    const updates = req.body.order || [];
    await Promise.all(
      updates.map(({ id, order }) =>
        HeroSlide.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ success: true, message: "Ordre mis à jour" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/v1/hero/:id — Admin : modifier un slide ────────────────────────
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!slide) return res.status(404).json({ message: "Slide introuvable" });
    res.json({ success: true, slide, message: "Slide mis à jour" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/v1/hero/:id/toggle — Admin : activer/désactiver ──────────────
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide introuvable" });
    slide.isActive = !slide.isActive;
    await slide.save();
    res.json({
      success: true,
      slide,
      message: `Slide ${slide.isActive ? "activé" : "désactivé"}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/v1/hero/:id — Admin : supprimer un slide ────────────────────
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide introuvable" });
    res.json({ success: true, message: "Slide supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;