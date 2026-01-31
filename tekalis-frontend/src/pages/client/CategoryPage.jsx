import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import ProductCard from "../../components/client/cart/CartItem";
import { FaFilter, FaTimes, FaThLarge, FaList, FaChevronDown } from "react-icons/fa";

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid ou list
  
  // États des filtres
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brands: [],
    processors: [],
    rams: [],
    screenSizes: [],
    rating: "",
    inStock: false,
    sort: "newest"
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Extraire les valeurs uniques pour les filtres
  const filterOptions = useMemo(() => {
    const brands = [...new Set(items.map(p => p.brand))].filter(Boolean);
    const processors = [...new Set(
      items.map(p => p.specs?.processorBrand).filter(Boolean)
    )];
    const rams = [...new Set(
      items.map(p => p.specs?.ram).filter(Boolean)
    )].sort();
    
    return { brands, processors, rams };
  }, [items]);

  // Appliquer les filtres
  const filteredProducts = useMemo(() => {
    let result = items;

    // Filtre par catégorie (si slug fourni)
    if (slug) {
      result = result.filter(p => {
        const categories = Array.isArray(p.category) ? p.category : [p.category];
        return categories.some(cat => 
          cat?.toLowerCase().includes(slug.toLowerCase())
        );
      });
    }

    // Filtre par prix
    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Filtre par marque
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }

    // Filtre par processeur
    if (filters.processors.length > 0) {
      result = result.filter(p => 
        filters.processors.includes(p.specs?.processorBrand)
      );
    }

    // Filtre par RAM
    if (filters.rams.length > 0) {
      result = result.filter(p => filters.rams.includes(p.specs?.ram));
    }

    // Filtre par note
    if (filters.rating) {
      result = result.filter(p => 
        (p.rating?.average || 0) >= Number(filters.rating)
      );
    }

    // Filtre stock disponible
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Tri
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        result.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [items, slug, filters]);

  // Gérer les changements de filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      brands: [],
      processors: [],
      rams: [],
      screenSizes: [],
      rating: "",
      inStock: false,
      sort: "newest"
    });
  };

  // Nombre de filtres actifs
  const activeFiltersCount = 
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    filters.brands.length +
    filters.processors.length +
    filters.rams.length +
    (filters.rating ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {slug ? slug.replace("-", " ") : "Tous les produits"}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filtres - Desktop */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaFilter />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Prix */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Prix (FCFA)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Marques */}
                {filterOptions.brands.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Marque</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filterOptions.brands.map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand)}
                            onChange={() => handleMultiSelectChange("brands", brand)}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processeur */}
                {filterOptions.processors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Processeur</h3>
                    <div className="space-y-2">
                      {filterOptions.processors.map(proc => (
                        <label key={proc} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.processors.includes(proc)}
                            onChange={() => handleMultiSelectChange("processors", proc)}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{proc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* RAM */}
                {filterOptions.rams.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">RAM</h3>
                    <div className="space-y-2">
                      {filterOptions.rams.map(ram => (
                        <label key={ram} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.rams.includes(ram)}
                            onChange={() => handleMultiSelectChange("rams", ram)}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{ram}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note minimum */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Note minimum</h3>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange("rating", e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Toutes les notes</option>
                    <option value="4">★★★★ 4 et plus</option>
                    <option value="3">★★★ 3 et plus</option>
                    <option value="2">★★ 2 et plus</option>
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      En stock uniquement
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Liste des produits */}
          <main className="flex-1">
            {/* Barre d'outils */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Bouton filtres mobile */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FaFilter />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Mode d'affichage */}
                <div className="hidden sm:flex items-center gap-2 border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    title="Grille"
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    title="Liste"
                  >
                    <FaList />
                  </button>
                </div>
              </div>

              {/* Tri */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Trier par:
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="flex-1 sm:flex-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Plus récent</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom (A-Z)</option>
                  <option value="rating">Mieux notés</option>
                </select>
              </div>
            </div>

            {/* Grille/Liste de produits */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos filtres ou réinitialisez-les
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination (à implémenter si nécessaire) */}
            {filteredProducts.length > 20 && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white rounded-lg shadow-md px-6 py-3">
                  <p className="text-gray-600">
                    Affichage de {filteredProducts.length} produits
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;