import { useState, useEffect, useCallback } from "react";
import api from "../api/api";

/**
 * Hook personnalisé pour gérer les produits
 * @param {Object} options - Options du hook
 * @returns {Object} Produits et fonctions de gestion
 */
const useProducts = (options = {}) => {
  const {
    autoFetch = false,
    category = null,
    limit = null,
    sortBy = "newest"
  } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit || 20,
    total: 0,
    totalPages: 0
  });

  /**
   * Charger tous les produits
   * @param {Object} params - Paramètres de requête
   */
  const loadProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortBy,
        ...params
      };

      if (category) {
        queryParams.category = category;
      }

      const queryString = new URLSearchParams(queryParams).toString();
      const { data } = await api.get(`/api/v1/products?${queryString}`);

      setProducts(data.products || data);
      
      if (data.pagination) {
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des produits");
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, pagination.page, pagination.limit]);

  /**
   * Charger un produit par ID
   * @param {String} productId - ID du produit
   * @returns {Object|null} Produit
   */
  const getById = async (productId) => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      return data;
    } catch (err) {
      console.error("Erreur chargement produit:", err);
      return null;
    }
  };

  /**
   * Charger les produits par catégorie
   * @param {String} categorySlug - Slug de la catégorie
   */
  const getByCategory = async (categorySlug) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/products?category=${categorySlug}`);
      setProducts(data.products || data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rechercher des produits
   * @param {String} query - Terme de recherche
   */
  const search = async (query) => {
    if (!query.trim()) {
      loadProducts();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/products?search=${query}`);
      setProducts(data.products || data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de recherche");
      console.error("Erreur recherche:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrer les produits localement
   * @param {Function} filterFn - Fonction de filtre
   * @returns {Array} Produits filtrés
   */
  const filterProducts = useCallback((filterFn) => {
    return products.filter(filterFn);
  }, [products]);

  /**
   * Trier les produits
   * @param {Array} items - Produits à trier
   * @param {String} sortType - Type de tri
   * @returns {Array} Produits triés
   */
  const sortProducts = useCallback((items, sortType) => {
    const sorted = [...items];

    switch (sortType) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "rating":
        return sorted.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
      case "popular":
        return sorted.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, []);

  /**
   * Filtrer par fourchette de prix
   * @param {Number} min - Prix minimum
   * @param {Number} max - Prix maximum
   * @returns {Array} Produits filtrés
   */
  const filterByPrice = useCallback((min, max) => {
    return products.filter(p => p.price >= min && p.price <= max);
  }, [products]);

  /**
   * Filtrer par note
   * @param {Number} minRating - Note minimum
   * @returns {Array} Produits filtrés
   */
  const filterByRating = useCallback((minRating) => {
    return products.filter(p => (p.rating?.average || 0) >= minRating);
  }, [products]);

  /**
   * Obtenir les produits en stock
   * @returns {Array} Produits en stock
   */
  const getInStock = useCallback(() => {
    return products.filter(p => p.stock > 0);
  }, [products]);

  /**
   * Obtenir les produits en promo
   * @returns {Array} Produits en promotion
   */
  const getOnSale = useCallback(() => {
    return products.filter(p => p.comparePrice && p.comparePrice > p.price);
  }, [products]);

  /**
   * Obtenir les produits par marque
   * @param {String} brand - Nom de la marque
   * @returns {Array} Produits de la marque
   */
  const getByBrand = useCallback((brand) => {
    return products.filter(p => p.brand === brand);
  }, [products]);

  /**
   * Obtenir toutes les marques disponibles
   * @returns {Array} Liste des marques
   */
  const getBrands = useCallback(() => {
    const brands = new Set();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  /**
   * Obtenir toutes les catégories disponibles
   * @returns {Array} Liste des catégories
   */
  const getCategories = useCallback(() => {
    const categories = new Set();
    products.forEach(p => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      cats.forEach(cat => {
        if (cat) categories.add(cat);
      });
    });
    return Array.from(categories).sort();
  }, [products]);

  /**
   * Obtenir les statistiques des produits
   * @returns {Object} Statistiques
   */
  const getStats = useCallback(() => {
    if (products.length === 0) {
      return {
        total: 0,
        inStock: 0,
        outOfStock: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        avgRating: 0
      };
    }

    const prices = products.map(p => p.price);
    const ratings = products.map(p => p.rating?.average || 0);

    return {
      total: products.length,
      inStock: products.filter(p => p.stock > 0).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length
    };
  }, [products]);

  /**
   * Changer de page
   * @param {Number} page - Numéro de page
   */
  const changePage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  /**
   * Rafraîchir les produits
   */
  const refresh = () => {
    loadProducts();
  };

  // Auto-fetch au montage si activé
  useEffect(() => {
    if (autoFetch) {
      loadProducts();
    }
  }, [autoFetch, loadProducts]);

  return {
    // État
    products,
    loading,
    error,
    pagination,

    // Actions
    loadProducts,
    getById,
    getByCategory,
    search,
    refresh,
    changePage,

    // Filtres et tri
    filterProducts,
    sortProducts,
    filterByPrice,
    filterByRating,
    getInStock,
    getOnSale,
    getByBrand,

    // Utilitaires
    getBrands,
    getCategories,
    getStats
  };
};

export default useProducts;