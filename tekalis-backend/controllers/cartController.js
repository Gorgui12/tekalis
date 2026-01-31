const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ===============================================
// Récupérer le panier de l'utilisateur
// ===============================================
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        select: "name price images stock status"
      });
    
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
// Ajouter un produit au panier
// ===============================================
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validation de la quantité
    if (quantity < 1) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }
    
    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    
    // Vérifier le statut du produit
    if (product.status === "discontinued") {
      return res.status(400).json({ message: "Ce produit n'est plus disponible" });
    }
    
    // Vérifier le stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Stock insuffisant. Seulement ${product.stock} unité(s) disponible(s)` 
      });
    }
    
    // Récupérer ou créer le panier
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Vérifier si le produit existe déjà dans le panier
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );
    
    if (existingItem) {
      // Vérifier que la nouvelle quantité ne dépasse pas le stock
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `Stock insuffisant. Maximum ${product.stock} unité(s)` 
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Ajouter un nouvel article
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    await cart.save();
    await cart.populate("items.product", "name price images stock status");
    
    res.status(200).json({
      success: true,
      message: "Produit ajouté au panier",
      cart
    });
  } catch (error) {
    console.error("❌ Erreur addToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Mettre à jour la quantité d'un produit
// ===============================================
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: "La quantité doit être supérieure à 0" });
    }
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Panier introuvable" });
    }
    
    const item = cart.items.find(
      i => i.product.toString() === productId
    );
    
    if (!item) {
      return res.status(404).json({ message: "Produit non trouvé dans le panier" });
    }
    
    // Vérifier le stock disponible
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Stock insuffisant. Seulement ${product.stock} unité(s) disponible(s)` 
      });
    }
    
    item.quantity = quantity;
    item.price = product.price; // Mettre à jour le prix au cas où il aurait changé
    
    await cart.save();
    await cart.populate("items.product", "name price images stock status");
    
    res.status(200).json({ 
      success: true, 
      message: "Quantité mise à jour",
      cart 
    });
  } catch (error) {
    console.error("❌ Erreur updateCartItem:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Supprimer un produit du panier
// ===============================================
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Panier introuvable" });
    }
    
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Produit non trouvé dans le panier" });
    }
    
    await cart.save();
    await cart.populate("items.product", "name price images stock status");
    
    res.status(200).json({
      success: true,
      message: "Produit retiré du panier",
      cart
    });
  } catch (error) {
    console.error("❌ Erreur removeFromCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Vider complètement le panier
// ===============================================
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: "Panier introuvable" });
    }
    
    cart.items = [];
    cart.promoCode = undefined;
    cart.discount = 0;
    cart.subtotal = 0;
    cart.total = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: "Panier vidé",
      cart
    });
  } catch (error) {
    console.error("❌ Erreur clearCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Appliquer un code promo
// ===============================================
exports.applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "Code promo requis" });
    }
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Panier vide" });
    }
    
    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Votre panier est vide" });
    }
    
    // TODO: Implémenter la logique de vérification du code promo depuis la DB
    // Pour l'instant, codes factices pour démo
    const validCodes = {
      "WELCOME10": { 
        discount: 10, 
        type: "percentage",
        minAmount: 0,
        description: "10% de réduction pour les nouveaux clients"
      },
      "TECH2000": { 
        discount: 2000, 
        type: "fixed",
        minAmount: 10000,
        description: "2000 FCFA de réduction"
      },
      "SUMMER20": { 
        discount: 20, 
        type: "percentage",
        minAmount: 50000,
        description: "20% de réduction sur les achats de plus de 50 000 FCFA"
      }
    };
    
    const promoCode = validCodes[code.toUpperCase()];
    
    if (!promoCode) {
      return res.status(400).json({ message: "Code promo invalide ou expiré" });
    }
    
    // Vérifier le montant minimum
    await cart.populate("items.product", "price");
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    if (subtotal < promoCode.minAmount) {
      return res.status(400).json({ 
        message: `Ce code nécessite un achat minimum de ${promoCode.minAmount.toLocaleString()} FCFA` 
      });
    }
    
    // Appliquer le code promo
    cart.promoCode = {
      code: code.toUpperCase(),
      discount: promoCode.discount,
      type: promoCode.type
    };
    
    await cart.save();
    await cart.populate("items.product", "name price images stock");
    
    res.status(200).json({
      success: true,
      message: `Code promo "${code.toUpperCase()}" appliqué avec succès !`,
      description: promoCode.description,
      cart
    });
  } catch (error) {
    console.error("❌ Erreur applyPromoCode:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Retirer le code promo
// ===============================================
exports.removePromoCode = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: "Panier introuvable" });
    }
    
    if (!cart.promoCode) {
      return res.status(400).json({ message: "Aucun code promo appliqué" });
    }
    
    cart.promoCode = undefined;
    cart.discount = 0;
    
    await cart.save();
    await cart.populate("items.product", "name price images stock");
    
    res.status(200).json({
      success: true,
      message: "Code promo retiré",
      cart
    });
  } catch (error) {
    console.error("❌ Erreur removePromoCode:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Synchroniser le panier (vérifier stocks et prix)
// ===============================================
exports.syncCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");
    
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "Panier vide",
        cart: cart || { items: [] }
      });
    }
    
    let hasChanges = false;
    const changes = [];
    
    // Vérifier chaque produit
    for (let i = cart.items.length - 1; i >= 0; i--) {
      const item = cart.items[i];
      
      if (!item.product) {
        // Produit supprimé
        cart.items.splice(i, 1);
        hasChanges = true;
        changes.push({ 
          type: "removed", 
          message: "Un produit a été retiré car il n'est plus disponible" 
        });
        continue;
      }
      
      const product = item.product;
      
      // Vérifier le statut
      if (product.status === "discontinued") {
        cart.items.splice(i, 1);
        hasChanges = true;
        changes.push({ 
          type: "removed", 
          product: product.name,
          message: `${product.name} a été retiré car il n'est plus disponible` 
        });
        continue;
      }
      
      // Vérifier le stock
      if (product.stock === 0) {
        cart.items.splice(i, 1);
        hasChanges = true;
        changes.push({ 
          type: "removed", 
          product: product.name,
          message: `${product.name} est en rupture de stock` 
        });
        continue;
      }
      
      // Ajuster la quantité si nécessaire
      if (item.quantity > product.stock) {
        item.quantity = product.stock;
        hasChanges = true;
        changes.push({ 
          type: "quantity_adjusted", 
          product: product.name,
          message: `Quantité de ${product.name} ajustée à ${product.stock}` 
        });
      }
      
      // Vérifier le prix
      if (item.price !== product.price) {
        const oldPrice = item.price;
        item.price = product.price;
        hasChanges = true;
        changes.push({ 
          type: "price_updated", 
          product: product.name,
          oldPrice,
          newPrice: product.price,
          message: `Prix de ${product.name} mis à jour` 
        });
      }
    }
    
    if (hasChanges) {
      await cart.save();
    }
    
    await cart.populate("items.product", "name price images stock status");
    
    res.status(200).json({
      success: true,
      hasChanges,
      changes,
      cart
    });
  } catch (error) {
    console.error("❌ Erreur syncCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Obtenir le nombre d'articles dans le panier
// ===============================================
exports.getCartItemsCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(200).json({ 
        success: true, 
        count: 0 
      });
    }
    
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.status(200).json({ 
      success: true, 
      count 
    });
  } catch (error) {
    console.error("❌ Erreur getCartItemsCount:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// Exporter le panier (pour la commande)
// ===============================================
exports.exportCartForCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price images stock status warranty");
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        message: "Votre panier est vide" 
      });
    }
    
    // Vérifier la disponibilité de tous les produits
    const unavailableItems = [];
    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        unavailableItems.push(item.product?.name || "Produit inconnu");
      }
    }
    
    if (unavailableItems.length > 0) {
      return res.status(400).json({ 
        message: "Certains produits ne sont plus disponibles",
        unavailableItems
      });
    }
    
    // Formater pour le checkout
    const checkoutData = {
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images[0]?.url,
        warranty: item.product.warranty
      })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      promoCode: cart.promoCode,
      shippingCost: cart.shippingCost,
      total: cart.total
    };
    
    res.status(200).json({
      success: true,
      checkout: checkoutData
    });
  } catch (error) {
    console.error("❌ Erreur exportCartForCheckout:", error);
    res.status(500).json({ message: error.message });
  }
};
