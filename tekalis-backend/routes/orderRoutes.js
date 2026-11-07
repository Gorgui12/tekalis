const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken, isAdmin, optionalAuth } = require("../middlewares/authMiddleware");
const { orderValidation } = require("../middlewares/validation");

// ── Route publique (commande invité) ─────────────────────────────────────────
// Le jeton opaque dans le query string prouve l'accès à la commande.
// Déclarée AVANT /:id pour éviter que "guest" soit interprété comme un id.
router.get("/guest/:id", orderController.getGuestOrder);

// ── Routes admin (AVANT /:id pour éviter les conflits) ───────────────────────

// GET /api/v1/orders — toutes les commandes (Admin)
router.get("/", verifyToken, isAdmin, orderController.getAllOrders);

// PUT /api/v1/orders/:id/status
router.put("/:id/status", verifyToken, isAdmin, orderController.updateOrderStatus);

// PUT /api/v1/orders/:id/pay
router.put("/:id/pay", verifyToken, isAdmin, orderController.markAsPaid);

// DELETE /api/v1/orders/:id
router.delete("/:id", verifyToken, isAdmin, orderController.deleteOrder);

// ── Routes utilisateur / invité ──────────────────────────────────────────────

// POST /api/v1/orders — authentification optionnelle (checkout invité)
router.post("/", optionalAuth, orderValidation.create, orderController.createOrder);

// GET /api/v1/orders/my-orders (AVANT /:id)
router.get("/my-orders", verifyToken, orderController.getMyOrders);

// PUT /api/v1/orders/:id/cancel — Annuler sa commande (client)
router.put("/:id/cancel", verifyToken, orderController.cancelOrder);

// GET /api/v1/orders/:id
router.get("/:id", verifyToken, orderController.getOrderById);

module.exports = router;
