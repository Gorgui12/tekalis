const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

// ── Routes utilisateur ────────────────────────────────────────────────────────

// POST /api/v1/orders
router.post("/", orderController.createOrder);

// GET /api/v1/orders/my-orders
router.get("/my-orders", orderController.getMyOrders);

// GET /api/v1/orders/:id
router.get("/:id", orderController.getOrderById);

// ── Routes admin ──────────────────────────────────────────────────────────────

// GET /api/v1/orders
router.get("/", isAdmin, orderController.getAllOrders);

// PUT /api/v1/orders/:id/status
router.put("/:id/status", isAdmin, orderController.updateOrderStatus);

// PUT /api/v1/orders/:id/pay
router.put("/:id/pay", isAdmin, orderController.markAsPaid);

// DELETE /api/v1/orders/:id
router.delete("/:id", isAdmin, orderController.deleteOrder);

module.exports = router;
