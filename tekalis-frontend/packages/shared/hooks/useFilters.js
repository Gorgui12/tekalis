import { useState, useMemo, useCallback } from 'react';

/**
 * Hook pour gérer les filtres de produits de manière centralisée
 * @param {Array} items - Tableau d'items à filtrer
 * @param {Object} initialFilters - Filtres initiaux
 * @returns {Object} Filtres, setters et items filtrés
 */
const useFilters = (items = [], initialFilters = {}) => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: 0,
    maxPrice: Infinity,
    minRating: 0,
    brands: [],
    inStockOnly: false,
    onSaleOnly: false,
    sortBy: 'newest',
    ...initialFilters
  });

  /**
   * Mettre à jour un filtre spécifique
   */
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Mettre à jour plusieurs filtres en même temps
   */
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Réinitialiser tous les filtres
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      minPrice: 0,
      maxPrice: Infinity,
      minRating: 0,
      brands: [],
      inStockOnly: false,
      onSaleOnly: false,
      sortBy: 'newest',
      ...initialFilters
    });
  }, [initialFilters]);

  /**
   * Toggle un filtre boolean
   */
  const toggleFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /**
   * Ajouter/retirer une valeur dans un filtre tableau (ex: brands)
   */
  const toggleArrayFilter = useCallback((key, value) => {
    setFilters(prev => {
      const array = prev[key] || [];
      const newArray = array.includes(value)
        ? array.filter(item => item !== value)
        : [...array, value];
      return { ...prev, [key]: newArray };
    });
  }, []);

  /**
   * Appliquer les filtres aux items
   */
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    let result = [...items];

    // Filtre de recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => {
        const nameMatch = item.name?.toLowerCase().includes(searchLower);
        const descMatch = item.description?.toLowerCase().includes(searchLower);
        const brandMatch = item.brand?.toLowerCase().includes(searchLower);
        return nameMatch || descMatch || brandMatch;
      });
    }

    // Filtre de catégorie
    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => {
        const categories = Array.isArray(item.category) 
          ? item.category 
          : [item.category];
        return categories.includes(filters.category);
      });
    }

    // Filtre de prix
    if (filters.minPrice > 0 || filters.maxPrice < Infinity) {
      result = result.filter(item => {
        const price = item.price || 0;
        return price >= filters.minPrice && price <= filters.maxPrice;
      });
    }

    // Filtre de note
    if (filters.minRating > 0) {
      result = result.filter(item => {
        const rating = item.rating?.average || 0;
        return rating >= filters.minRating;
      });
    }

    // Filtre de marques
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter(item => 
        filters.brands.includes(item.brand)
      );
    }

    // Filtre stock uniquement
    if (filters.inStockOnly) {
      result = result.filter(item => (item.stock || 0) > 0);
    }

    // Filtre promotion uniquement
    if (filters.onSaleOnly) {
      result = result.filter(item => 
        item.comparePrice && item.comparePrice > item.price
      );
    }

    // Tri
    result = sortItems(result, filters.sortBy);

    return result;
  }, [items, filters]);

  /**
   * Fonction de tri
   */
  const sortItems = (itemsToSort, sortBy) => {
    const sorted = [...itemsToSort];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      
      case 'name-asc':
        return sorted.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
      
      case 'name-desc':
        return sorted.sort((a, b) => 
          (b.name || '').localeCompare(a.name || '')
        );
      
      case 'rating':
        return sorted.sort((a, b) => 
          (b.rating?.average || 0) - (a.rating?.average || 0)
        );
      
      case 'popular':
        return sorted.sort((a, b) => 
          (b.sold || 0) - (a.sold || 0)
        );
      
      case 'newest':
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }
  };

  /**
   * Obtenir les valeurs uniques pour un champ
   */
  const getUniqueValues = useCallback((field) => {
    if (!Array.isArray(items)) return [];
    
    const values = new Set();
    items.forEach(item => {
      const value = item[field];
      if (Array.isArray(value)) {
        value.forEach(v => values.add(v));
      } else if (value) {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  }, [items]);

  /**
   * Obtenir les catégories disponibles
   */
  const availableCategories = useMemo(() => 
    getUniqueValues('category'),
    [getUniqueValues]
  );

  /**
   * Obtenir les marques disponibles
   */
  const availableBrands = useMemo(() => 
    getUniqueValues('brand'),
    [getUniqueValues]
  );

  /**
   * Obtenir la fourchette de prix
   */
  const priceRange = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return { min: 0, max: 0 };
    }
    
    const prices = items.map(item => item.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [items]);

  /**
   * Vérifier si des filtres sont actifs
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.category !== 'all' ||
      filters.minPrice > 0 ||
      filters.maxPrice < Infinity ||
      filters.minRating > 0 ||
      (filters.brands && filters.brands.length > 0) ||
      filters.inStockOnly ||
      filters.onSaleOnly
    );
  }, [filters]);

  /**
   * Compter les filtres actifs
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== 'all') count++;
    if (filters.minPrice > 0 || filters.maxPrice < Infinity) count++;
    if (filters.minRating > 0) count++;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    return count;
  }, [filters]);

  return {
    // État
    filters,
    filteredItems,
    
    // Actions
    setFilter,
    setMultipleFilters,
    resetFilters,
    toggleFilter,
    toggleArrayFilter,
    
    // Métadonnées
    availableCategories,
    availableBrands,
    priceRange,
    hasActiveFilters,
    activeFiltersCount,
    
    // Utilitaires
    getUniqueValues
  };
};

export default useFilters;

/**
 * EXEMPLE D'UTILISATION :
 * 
 * const MyProductList = () => {
 *   const { products } = useProducts({ autoFetch: true });
 *   
 *   const {
 *     filters,
 *     filteredItems,
 *     setFilter,
 *     resetFilters,
 *     toggleFilter,
 *     availableCategories,
 *     availableBrands,
 *     priceRange,
 *     hasActiveFilters,
 *     activeFiltersCount
 *   } = useFilters(products);
 * 
 *   return (
 *     <div>
 *       {// Recherche //}
 *       <input 
 *         value={filters.search}
 *         onChange={(e) => setFilter('search', e.target.value)}
 *         placeholder="Rechercher..."
 *       />
 * 
 *       {// Catégories //}
 *       <select 
 *         value={filters.category}
 *         onChange={(e) => setFilter('category', e.target.value)}
 *       >
 *         <option value="all">Toutes</option>
 *         {availableCategories.map(cat => (
 *           <option key={cat} value={cat}>{cat}</option>
 *         ))}
 *       </select>
 * 
 *       {// Prix //}
 *       <input 
 *         type="range"
 *         min={priceRange.min}
 *         max={priceRange.max}
 *         value={filters.maxPrice}
 *         onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
 *       />
 * 
 *       {// Marques //}
 *       {availableBrands.map(brand => (
 *         <label key={brand}>
 *           <input 
 *             type="checkbox"
 *             checked={filters.brands.includes(brand)}
 *             onChange={() => toggleArrayFilter('brands', brand)}
 *           />
 *           {brand}
 *         </label>
 *       ))}
 * 
 *       {// Toggles //}
 *       <label>
 *         <input 
 *           type="checkbox"
 *           checked={filters.inStockOnly}
 *           onChange={() => toggleFilter('inStockOnly')}
 *         />
 *         En stock uniquement
 *       </label>
 * 
 *       {// Tri //}
 *       <select 
 *         value={filters.sortBy}
 *         onChange={(e) => setFilter('sortBy', e.target.value)}
 *       >
 *         <option value="newest">Plus récents</option>
 *         <option value="price-asc">Prix croissant</option>
 *         <option value="price-desc">Prix décroissant</option>
 *         <option value="rating">Meilleures notes</option>
 *       </select>
 * 
 *       {// Reset //}
 *       {hasActiveFilters && (
 *         <button onClick={resetFilters}>
 *           Réinitialiser ({activeFiltersCount} filtres)
 *         </button>
 *       )}
 * 
 *       {// Produits //}
 *       <div>
 *         {filteredItems.map(product => (
 *           <ProductCard key={product._id} product={product} />
 *         ))}
 *       </div>
 *     </div>
 *   );
 * };
 */