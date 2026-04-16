const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
// Middleware auth admin à importer selon votre structure
// const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/hero — Public : slides actifs ordonnés ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ slides });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── GET /api/hero/all — Admin : tous les slides ──────────────────────────────
router.get('/all', /* protect, adminOnly, */ async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ slides });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ── POST /api/hero — Admin : créer un slide ──────────────────────────────────
router.post('/', /* protect, adminOnly, */ async (req, res) => {
  try {
    const slide = new HeroSlide(req.body);
    await slide.save();
    res.status(201).json({ slide, message: 'Slide créé avec succès' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PUT /api/hero/:id — Admin : modifier un slide ────────────────────────────
router.put('/:id', /* protect, adminOnly, */ async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!slide) return res.status(404).json({ message: 'Slide introuvable' });
    res.json({ slide, message: 'Slide mis à jour' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/hero/:id/toggle — Admin : activer/désactiver ─────────────────
router.patch('/:id/toggle', /* protect, adminOnly, */ async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide introuvable' });
    slide.isActive = !slide.isActive;
    await slide.save();
    res.json({ slide, message: `Slide ${slide.isActive ? 'activé' : 'désactivé'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/hero/reorder — Admin : réordonner les slides ─────────────────
router.patch('/reorder', /* protect, adminOnly, */ async (req, res) => {
  try {
    // req.body.order = [{ id, order }, ...]
    const updates = req.body.order || [];
    await Promise.all(
      updates.map(({ id, order }) =>
        HeroSlide.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ message: 'Ordre mis à jour' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/hero/:id — Admin : supprimer un slide ───────────────────────
router.delete('/:id', /* protect, adminOnly, */ async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide introuvable' });
    res.json({ message: 'Slide supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
