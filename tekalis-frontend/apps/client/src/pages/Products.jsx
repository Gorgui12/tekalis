import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaList,
  FaSearch,
  FaSearchPlus,
  FaTh,
  FaThLarge,
  FaTimes,
} from "react-icons/fa";

import ProductCard from "../../src/components/product/ProductCard";
import useProducts from "../../../../packages/shared/hooks/useProducts";
import useDebounce from "../../../../packages/shared/hooks/useDebounce";
import usePagination from "../../../../packages/shared/hooks/usePagination";
import Pagination from "../../src/components/shared/Pagination";

// ─── Helper : normalise une catégorie (objet OU string) en string ─────────────
const getCatName = (cat) => {
  if (!cat) return null;
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") return cat.name || cat._id?.toString() || null;
  return String(cat);
};

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "popular", label: "Popularité" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "discount", label: "Meilleures promos" },
];

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { products: rawProducts, loading, sortProducts } = useProducts({
    autoFetch: true,
    limit: 200,
  });

  // ✅ Garantir que products est toujours un tableau
  const products = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts?.data
    ? rawProducts.data
    : rawProducts?.products
    ? rawProducts.products
    : [];

  // Mettre à jour l'URL quand recherche change
  useEffect(() => {
    if (debouncedSearch) {
      navigate(`/products?search=${debouncedSearch}`, { replace: true });
    } else {
      navigate("/products", { replace: true });
    }
  }, [debouncedSearch, navigate]);

  // ─── Extraire catégories uniques en STRINGS ───────────────────────────────
  const allCategories = useMemo(() => {
    const categoriesSet = new Set();

    products.forEach((item) => {
      const categories = Array.isArray(item.category)
        ? item.category
        : item.category
        ? [item.category]
        : [];

      categories.forEach((cat) => {
        const name = getCatName(cat);      // ✅ toujours une string
        if (name) categoriesSet.add(name);
      });
    });

    return ["all", ...Array.from(categoriesSet)];
  }, [products]);

  // ─── Filtrer produits ─────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Recherche
    if (debouncedSearch) {
      filtered = filtered.filter((item) => {
        const query = debouncedSearch.toLowerCase();
        return (
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query)
        );
      });
    }

    // Catégorie — compare des strings des deux côtés
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        const categories = Array.isArray(item.category)
          ? item.category
          : item.category
          ? [item.category]
          : [];

        return categories.some(
          (cat) => getCatName(cat) === selectedCategory  // ✅ comparaison string
        );
      });
    }

    const sorted = sortProducts(filtered, sortBy);

    if (sortBy === "discount") {
      return [...sorted].sort((a, b) => {
        const discountA = a.comparePrice
          ? (a.comparePrice - a.price) / a.comparePrice
          : 0;
        const discountB = b.comparePrice
          ? (b.comparePrice - b.price) / b.comparePrice
          : 0;
        return discountB - discountA;
      });
    }

    return sorted;
  }, [products, debouncedSearch, selectedCategory, sortBy, sortProducts]);

  const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(
    filteredProducts,
    12
  );

  // ─── Grouper par catégorie (strings uniquement) ───────────────────────────
  const productsByCategory = useMemo(() => {
    const grouped = {};

    filteredProducts.forEach((product) => {
      const categories = Array.isArray(product.category)
        ? product.category
        : product.category
        ? [product.category]
        : [];

      // ✅ On prend le nom de la première catégorie (string)
      const catName = getCatName(categories[0]) || "Autres";

      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(product);
    });

    return grouped;
  }, [filteredProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="h-9 w-56 bg-gray-200 animate-pulse rounded-xl mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 md:p-4 space-y-2">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2 mt-3" />
                  <div className="h-8 bg-gray-200 animate-pulse rounded-lg mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-6">
          🛍️ Tous les Produits
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl shadow-soft focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Catégorie
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "Toutes les catégories" : cat}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Trier
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* View mode */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Affichage
              </label>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1.5">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Vue grille"
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition ${
                    viewMode === "grid"
                      ? "bg-brand-600 text-white shadow-soft"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaThLarge />
                  <span className="hidden sm:inline">Grille</span>
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  aria-label="Vue compacte"
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition ${
                    viewMode === "compact"
                      ? "bg-brand-600 text-white shadow-soft"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaTh />
                  <span className="hidden sm:inline">Compact</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="Vue liste"
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition ${
                    viewMode === "list"
                      ? "bg-brand-600 text-white shadow-soft"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaList />
                  <span className="hidden sm:inline">Liste</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 py-16 px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FaSearchPlus size={28} />
            </div>
            <h3 className="text-lg font-display font-bold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Aucun produit ne correspond à votre recherche ou à vos filtres.
              Réinitialisez pour découvrir toute la boutique.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortBy("newest");
              }}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition active:scale-95"
            >
              <FaTimes />
              Réinitialiser les filtres
            </button>
          </div>
        ) : selectedCategory === "all" ? (
          Object.entries(productsByCategory).map(
            ([category, categoryProducts]) => (
              <div key={category} className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-display font-bold mb-3 md:mb-4 px-1">
                  {category}
                </h2>
                <div
                  className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${
                    viewMode === "list"
                      ? "grid-cols-1"
                      : viewMode === "compact"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  }`}
                >
                  {categoryProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )
          )
        ) : (
          <>
            <div
              className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${
                viewMode === "list"
                  ? "grid-cols-1"
                  : viewMode === "compact"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {paginatedItems.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 md:mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;