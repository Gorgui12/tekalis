const Cart = require("../models/Cart");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");

// ===============================================
// GET /api/v1/cart
// ===============================================
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({ path: "items.product", select: "name price images stock status" });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("❌ Erreur getCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/cart
// ===============================================
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    if (product.status === "discontinued") {
      return res.status(400).json({ message: "Ce produit n'est plus disponible" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Stock insuffisant. Seulement ${product.stock} unité(s) disponible(s)`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Stock insuffisant. Maximum ${product.stock} unité(s)`
        });
      }
      existingItem.quantity = newQuantity;
      existingItem.price = product.price; // Mise à jour prix
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock status");

    res.status(200).json({ success: true, message: "Produit ajouté au panier", cart });
  } catch (error) {
    console.error("❌ Erreur addToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// PUT /api/v1/cart/:productId
// ===============================================
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Produit non trouvé dans le panier" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Stock insuffisant. Seulement ${product.stock} unité(s) disponible(s)`
      });
    }

    item.quantity = quantity;
    item.price = product.price;

    await cart.save();
    await cart.populate("items.product", "name price images stock status");

    res.status(200).json({ success: true, message: "Quantité mise à jour", cart });
  } catch (error) {
    console.error("❌ Erreur updateCartItem:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// DELETE /api/v1/cart/:productId
// ===============================================
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Produit non trouvé dans le panier" });
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock status");

    res.status(200).json({ success: true, message: "Produit retiré du panier", cart });
  } catch (error) {
    console.error("❌ Erreur removeFromCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// DELETE /api/v1/cart (vider le panier)
// ===============================================
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });

    cart.items = [];
    cart.promoCode = undefined;
    cart.discount = 0;
    cart.subtotal = 0;
    cart.total = 0;

    await cart.save();
    res.status(200).json({ success: true, message: "Panier vidé", cart });
  } catch (error) {
    console.error("❌ Erreur clearCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/cart/promo — Appliquer un code promo (depuis la DB)
// ===============================================
exports.applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "Code promo requis" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Votre panier est vide" });
    }

    // ─── Récupérer le code promo depuis la DB ──────────────────────────────────
    const promo = await PromoCode.findOne({
      code: code.trim().toUpperCase(),
      isActive: true
    });

    if (!promo) {
      return res.status(400).json({ message: "Code promo invalide ou expiré" });
    }

    // ─── Vérifier la validité ──────────────────────────────────────────────────
    const validity = promo.isValid();
    if (!validity.valid) {
      return res.status(400).json({ message: validity.reason });
    }

    // ─── Vérifier l'usage par l'utilisateur ───────────────────────────────────
    const userUsageCount = promo.usedBy.filter(
      u => u.user.toString() === req.user._id.toString()
    ).length;

    if (userUsageCount >= (promo.usageLimitPerUser || 1)) {
      return res.status(400).json({ message: "Vous avez déjà utilisé ce code" });
    }

    // ─── Calculer le sous-total ────────────────────────────────────────────────
    await cart.populate("items.product", "price");
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // ─── Calculer la réduction ─────────────────────────────────────────────────
    const discountResult = promo.calculateDiscount(subtotal);
    if (discountResult.error) {
      return res.status(400).json({ message: discountResult.error });
    }

    cart.promoCode = {
      code: promo.code,
      discount: promo.discount,
      type: promo.type
    };

    await cart.save();
    await cart.populate("items.product", "name price images stock");

    res.status(200).json({
      success: true,
      message: `Code promo "${promo.code}" appliqué avec succès !`,
      description: promo.description,
      discountAmount: discountResult.discount,
      cart
    });
  } catch (error) {
    console.error("❌ Erreur applyPromoCode:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// DELETE /api/v1/cart/promo
// ===============================================
exports.removePromoCode = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Panier introuvable" });
    if (!cart.promoCode) return res.status(400).json({ message: "Aucun code promo appliqué" });

    cart.promoCode = undefined;
    cart.discount = 0;

    await cart.save();
    await cart.populate("items.product", "name price images stock");

    res.status(200).json({ success: true, message: "Code promo retiré", cart });
  } catch (error) {
    console.error("❌ Erreur removePromoCode:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// GET /api/v1/cart/count
// ===============================================
exports.getCartItemsCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
