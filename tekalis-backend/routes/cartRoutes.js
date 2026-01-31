// ===============================================
// 13. ROUTES - routes/cartRoutes.js
// ===============================================
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const {verifyToken} = require("../middlewares/authMiddleware");

router.use(verifyToken); // Toutes les routes nécessitent authentification

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateCartItem);
router.delete("/:productId", cartController.removeFromCart);
router.post("/promo", cartController.applyPromoCode);

module.exports = router;