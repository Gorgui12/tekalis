// ===============================================
// 16. ROUTES - routes/rmaRoutes.js (SAV)
// ===============================================
const express = require("express");
const router = express.Router();
const RMA = require("../models/RMA");
const Order = require("../models/Order");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const rmaController = require("../controllers/rmaController");
console.log(rmaController);


// POST /api/v1/user/rma - Créer une demande SAV
router.post("/", verifyToken, rmaController.createRMA);

// GET /api/v1/user/rma - Mes demandes SAV
router.get("/", verifyToken, rmaController.getMyRMAs);

// GET /api/v1/user/rma/:id - Détails d'une demande
router.get("/:id", verifyToken, rmaController.getRMA);

// PUT /api/v1/admin/rma/:id/status - Mettre à jour le statut (Admin)
router.put("/:id/status", verifyToken, isAdmin, rmaController.updateRMAStatus);

module.exports = router;
