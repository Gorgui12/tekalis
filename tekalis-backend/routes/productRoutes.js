const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// ── Routes publiques ──────────────────────────────────────────────────────────

// GET /api/v1/products
router.get("/", productController.getProducts);

// GET /api/v1/products/:id  (id OU slug)
router.get("/:id", productController.getProductById);

// ── Routes protégées (Admin uniquement) ──────────────────────────────────────

// POST /api/v1/products/bulk — AVANT /:id pour éviter le conflit de route
router.post("/bulk", verifyToken, isAdmin, productController.bulkCreateProducts);

// POST /api/v1/products
router.post("/", verifyToken, isAdmin, productController.createProduct);

// PUT /api/v1/products/:id
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);

// DELETE /api/v1/products/:id
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
