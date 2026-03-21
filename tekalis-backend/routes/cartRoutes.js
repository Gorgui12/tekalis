const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

// GET  /api/v1/cart
router.get("/", cartController.getCart);

// GET  /api/v1/cart/count
router.get("/count", cartController.getCartItemsCount);

// POST /api/v1/cart
router.post("/", cartController.addToCart);

// POST /api/v1/cart/promo — appliquer code promo
router.post("/promo", cartController.applyPromoCode);

// DELETE /api/v1/cart/promo — retirer code promo
router.delete("/promo", cartController.removePromoCode);

// PUT  /api/v1/cart/:productId — mettre à jour quantité
router.put("/:productId", cartController.updateCartItem);

// DELETE /api/v1/cart/:productId — retirer produit
router.delete("/:productId", cartController.removeFromCart);

// DELETE /api/v1/cart — vider le panier
router.delete("/", cartController.clearCart);

module.exports = router;
