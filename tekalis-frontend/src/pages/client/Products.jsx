import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaThLarge, 
  FaList,
  FaTimes,
  FaTh
} from "react-icons/fa";
import ProductCard from "../../components/client/product/ProductCard";
import useProducts from "../../hooks/useProducts";
import useDebounce from "../../hooks/useDebounce";

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const { 
    products, 
    loading, 
    loadProducts,
    getByCategory,
    sortProducts 
  } = useProducts({ autoFetch: true });

  // Mettre à jour l'URL quand la recherche change
  useEffect(() => {
    if (debouncedSearch) {
      navigate(`/products?search=${debouncedSearch}`, { replace: true });
    } else {
      navigate("/products", { replace: true });
    }
  }, [debouncedSearch, navigate]);

  // Extraire les catégories uniques
  const allCategories = useMemo(() => {
    const categoriesSet = new Set();
    products.forEach((item) => {
      const categories = Array.isArray(item.category)
        ? item.category
        : item.category
        ? [item.category]
        : [];
      categories.forEach(cat => categoriesSet.add(cat));
    });
    return ["all", ...Array.from(categoriesSet)];
  }, [products]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtre de recherche
    if (debouncedSearch) {
      filtered = filtered.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const descMatch = item.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const brandMatch = item.brand?.toLowerCase().includes(debouncedSearch.toLowerCase());
        return nameMatch || descMatch || brandMatch;
      });
    }

    // Filtre de catégorie
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        const categories = Array.isArray(item.category)
          ? item.category
          : item.category
          ? [item.category]
          : [];
        return categories.includes(selectedCategory);
      });
    }

    // Tri
    return sortProducts(filtered, sortBy);
  }, [products, debouncedSearch, selectedCategory, sortBy, sortProducts]);

  // Grouper par catégorie pour l'affichage
  const productsByCategory = useMemo(() => {
    const grouped = {};
    
    allCategories.forEach(category => {
      if (category === "all") return;
      
      grouped[category] = filteredProducts.filter(item => {
        const categories = Array.isArray(item.category)
          ? item.category
          : item.category
          ? [item.category]
          : [];
        return categories.includes(category);
      });
    });

    return grouped;
  }, [filteredProducts, allCategories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ Tous les Produits
          </h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des produits..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-white"
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

          {/* Filters & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes les catégories</option>
                {allCategories.filter(c => c !== "all").map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="rating">Meilleures notes</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">
                <span className="font-bold text-gray-900">{filteredProducts.length}</span> produit(s)
              </span>
              
              <div className="flex bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  title="Vue grille"
                >
                  <FaThLarge />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-2 ${viewMode === "compact" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  title="Vue compacte"
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  title="Vue liste"
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `Aucun résultat pour "${searchTerm}"`
                : "Aucun produit disponible dans cette catégorie"
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : selectedCategory === "all" ? (
          // Affichage par catégorie
          Object.entries(productsByCategory).map(([category, categoryProducts]) => {
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b-4 border-blue-600 pb-2">
                    {category}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {categoryProducts.length} produit(s)
                  </span>
                </div>
                
                <div className={`grid gap-6 ${
                  viewMode === "list" 
                    ? "grid-cols-1" 
                    : viewMode === "compact"
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}>
                  {categoryProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Affichage filtré par catégorie sélectionnée
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory}
              </h2>
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
              >
                <FaTimes /> Voir toutes les catégories
              </button>
            </div>
            
            <div className={`grid gap-6 ${
              viewMode === "list" 
                ? "grid-cols-1" 
                : viewMode === "compact"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;