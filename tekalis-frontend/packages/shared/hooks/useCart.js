import { useDispatch, useSelector } from "react-redux";
import { 
  addToCart, 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity, 
  clearCart 
} from "../redux/slices/cartSlice";

/**
 * Hook personnalisé pour gérer le panier
 * @returns {Object} Fonctions et états du panier
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);

  /**
   * Ajouter un produit au panier
   * @param {Object} product - Produit à ajouter
   * @param {Number} quantity - Quantité (défaut: 1)
   */
  const addItem = (product, quantity = 1) => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
  };

  /**
   * Retirer un produit du panier
   * @param {String} productId - ID du produit
   */
  const removeItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  /**
   * Augmenter la quantité d'un produit
   * @param {String} productId - ID du produit
   */
  const increase = (productId) => {
    dispatch(increaseQuantity(productId));
  };

  /**
   * Diminuer la quantité d'un produit
   * @param {String} productId - ID du produit
   */
  const decrease = (productId) => {
    dispatch(decreaseQuantity(productId));
  };

  /**
   * Vider tout le panier
   */
  const clear = () => {
    dispatch(clearCart());
  };

  /**
   * Obtenir un produit spécifique du panier
   * @param {String} productId - ID du produit
   * @returns {Object|null} Produit trouvé
   */
  const getItem = (productId) => {
    return items.find((item) => item._id === productId) || null;
  };

  /**
   * Vérifier si un produit est dans le panier
   * @param {String} productId - ID du produit
   * @returns {Boolean}
   */
  const isInCart = (productId) => {
    return items.some((item) => item._id === productId);
  };

  /**
   * Obtenir la quantité d'un produit dans le panier
   * @param {String} productId - ID du produit
   * @returns {Number} Quantité
   */
  const getQuantity = (productId) => {
    const item = getItem(productId);
    return item ? item.quantity : 0;
  };

  /**
   * Compter le nombre total d'articles
   * @returns {Number} Nombre total d'articles
   */
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Calculer le prix total
   * @returns {Number} Prix total
   */
  const getTotal = () => {
    return totalAmount;
  };

  /**
   * Calculer le prix total avec promotion
   * @param {Number} discount - Montant de réduction
   * @returns {Number} Prix final
   */
  const getTotalWithDiscount = (discount = 0) => {
    return Math.max(0, totalAmount - discount);
  };

  /**
   * Vérifier si le panier est vide
   * @returns {Boolean}
   */
  const isEmpty = () => {
    return items.length === 0;
  };

  /**
   * Mettre à jour la quantité d'un produit
   * @param {String} productId - ID du produit
   * @param {Number} newQuantity - Nouvelle quantité
   */
  const updateQuantity = (productId, newQuantity) => {
    const currentQuantity = getQuantity(productId);
    const diff = newQuantity - currentQuantity;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        increase(productId);
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        decrease(productId);
      }
    }
  };

  /**
   * Obtenir les produits groupés par catégorie
   * @returns {Object} Produits groupés
   */
  const getItemsByCategory = () => {
    return items.reduce((acc, item) => {
      const category = item.category || "Autre";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  /**
   * Calculer les frais de livraison
   * @param {Number} freeShippingThreshold - Seuil de livraison gratuite
   * @param {Number} shippingCost - Coût de livraison
   * @returns {Number} Frais de livraison
   */
  const getShippingCost = (freeShippingThreshold = 50000, shippingCost = 2500) => {
    return totalAmount >= freeShippingThreshold ? 0 : shippingCost;
  };

  /**
   * Obtenir le résumé du panier pour la commande
   * @returns {Object} Résumé complet
   */
  const getCheckoutSummary = (options = {}) => {
    const {
      discount = 0,
      freeShippingThreshold = 50000,
      shippingCost = 2500
    } = options;

    const subtotal = totalAmount;
    const shipping = getShippingCost(freeShippingThreshold, shippingCost);
    const total = subtotal - discount + shipping;

    return {
      items: items,
      itemsCount: getTotalItems(),
      subtotal,
      discount,
      shipping,
      total
    };
  };

  return {
    // État
    items,
    totalAmount,
    
    // Actions de base
    addItem,
    removeItem,
    increase,
    decrease,
    clear,
    updateQuantity,
    
    // Requêtes
    getItem,
    isInCart,
    getQuantity,
    getTotalItems,
    getTotal,
    getTotalWithDiscount,
    isEmpty,
    getItemsByCategory,
    getShippingCost,
    getCheckoutSummary
  };
};

export default useCart;