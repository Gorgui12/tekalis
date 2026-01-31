// ===============================================
// 12. ROUTES - routes/categoryRoutes.js
// ===============================================
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET /api/v1/categories - Toutes les catégories
router.get("/", categoryController.getAllCategories);

// GET /api/v1/categories/:slug - Produits d'une catégorie avec filtres
router.get("/:slug", categoryController.getProductsByCategory);

module.exports = router;
