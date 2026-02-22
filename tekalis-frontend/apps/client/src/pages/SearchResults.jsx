import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes, FaThLarge, FaList } from "react-icons/fa";
import ProductCard from "../../src/components/ProductCard";
import useProducts from "../../../../packages/hooks/useProducts";
import useFilters from "../../../../packages/hooks/useFilters";
import useDebounce from "../../../../packages/hooks/useDebounce";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const { filters, setFilter, resetFilters, getActiveFiltersCount } = useFilters({
    minPrice: 0,
    maxPrice: 5000000,
    brands: [],
    categories: [],
    inStock: false,
    rating: 0
  });

  const { products, loading, search } = useProducts();

  useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch);
    }
  }, [debouncedSearch]);

  // Filtrer et trier les produits
  const filteredProducts = products.filter(product => {
    // Filtre prix
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }
    
    // Filtre marques
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }
    
    // Filtre catégories
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    
    // Filtre stock
    if (filters.inStock && product.stock <= 0) {
      return false;
    }
    
    // Filtre notation
    if (product.rating < filters.rating) {
      return false;
    }
    
    return true;
  });

  // Trier les produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default: // relevance
        return 0;
    }
  });

  const brands = [...new Set(products.map(p => p.brand))];
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Résultats de recherche
          </h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des produits..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-bold text-gray-900">{sortedProducts.length}</span> résultat(s) 
              {query && <> pour "<span className="font-semibold">{query}</span>"</>}
            </p>
            
            <div className="flex items-center gap-3">
              {/* View Mode */}
              <div className="flex bg-white rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <FaThLarge />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <FaList />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="rating">Meilleures notes</option>
                <option value="newest">Plus récents</option>
              </select>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white hover:bg-gray-100 border px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaFilter />
                Filtres
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
                  {getActiveFiltersCount() > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Prix */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Prix (FCFA)</h4>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="5000000"
                        step="50000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilter("maxPrice", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0</span>
                        <span className="font-semibold">{filters.maxPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Marques */}
                  {brands.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Marques</h4>
                      <div className="space-y-2">
                        {brands.map(brand => (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.brands.includes(brand)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilter("brands", [...filters.brands, brand]);
                                } else {
                                  setFilter("brands", filters.brands.filter(b => b !== brand));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => setFilter("inStock", e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-semibold text-gray-700">En stock uniquement</span>
                    </label>
                  </div>

                  {/* Note minimale */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Note minimale</h4>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilter("rating", parseInt(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Toutes les notes</option>
                      <option value="4">4★ et plus</option>
                      <option value="3">3★ et plus</option>
                      <option value="2">2★ et plus</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier votre recherche ou vos filtres
                </p>
                <Link
                  to="/products"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
                >
                  Voir tous les produits
                </Link>
              </div>
            ) : (
              <div className={`grid ${
                viewMode === "grid" 
                  ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              } gap-6`}>
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;