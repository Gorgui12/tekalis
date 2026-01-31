// ===============================================
// 17. ROUTES - routes/configuratorRoutes.js
// ===============================================
const express = require("express");
const router = express.Router();
const configuratorController = require("../controllers/configuratorController");

// POST /api/v1/configurator - Obtenir des recommandations
router.post("/", configuratorController.getRecommendations);

module.exports = router;
