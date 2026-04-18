// ===============================================
// routes/rmaRoutes.js (SAV)
// ✅ FIX : ajout de DELETE /:id pour cancelRMA (manquait)
// ✅ FIX : suppression des imports inutilisés (RMA, Order)
// ===============================================
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const rmaController = require("../controllers/rmaController");

// POST /api/v1/rma — Créer une demande SAV
router.post("/", verifyToken, rmaController.createRMA);

// GET /api/v1/rma — Mes demandes SAV
router.get("/", verifyToken, rmaController.getMyRMAs);

// GET /api/v1/rma/all — Toutes les demandes (Admin) — AVANT /:id
router.get("/all", verifyToken, isAdmin, rmaController.getAllRMAs);

// GET /api/v1/rma/:id — Détails d'une demande
router.get("/:id", verifyToken, rmaController.getRMA);

// ✅ FIX : DELETE /:id — Annuler une demande SAV (client)
// Cette route existait dans le controller mais n'était pas exposée
router.delete("/:id", verifyToken, rmaController.cancelRMA);

// PUT /api/v1/rma/:id/status — Mettre à jour le statut (Admin)
router.put("/:id/status", verifyToken, isAdmin, rmaController.updateRMAStatus);

module.exports = router;