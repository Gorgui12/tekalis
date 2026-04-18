// ===============================================
// routes/productRoutes.js
// ✅ FIX : POST /bulk déclaré AVANT POST / et GET /:id
//    pour éviter tout risque de conflit de routing
// ===============================================
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// ── Routes Admin (nommées — AVANT les routes dynamiques) ─────────────────────

// POST /api/v1/products/bulk — Import en masse (AVANT /:id)
router.post("/bulk", verifyToken, isAdmin, productController.bulkCreateProducts);

// ── Routes publiques ──────────────────────────────────────────────────────────

// GET /api/v1/products
router.get("/", productController.getProducts);

// GET /api/v1/products/:id (id OU slug)
router.get("/:id", productController.getProductById);

// ── Routes protégées (Admin) ──────────────────────────────────────────────────

// POST /api/v1/products
router.post("/", verifyToken, isAdmin, productController.createProduct);

// PUT /api/v1/products/:id
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);

// DELETE /api/v1/products/:id
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;