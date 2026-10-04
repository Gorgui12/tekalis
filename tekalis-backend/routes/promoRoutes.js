const express = require("express");
const router = express.Router();
const promoController = require("../controllers/promoController");
const { optionalAuth } = require("../middlewares/authMiddleware");

// POST /api/v1/promo/validate — validation d'un code promo (auth optionnelle)
router.post("/validate", optionalAuth, promoController.validatePromoCode);

module.exports = router;
