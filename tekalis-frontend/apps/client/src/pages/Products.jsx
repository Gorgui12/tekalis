import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaList,
  FaTimes,
  FaThLarge,
  FaTh,
} from "react-icons/fa";

import ProductCard from "../../src/components/product/ProductCard";
import useProducts from "../../../../packages/shared/hooks/useProducts";
import useDebounce from "../../../../packages/shared/hooks/useDebounce";
import usePagination from '../../../../packages/shared/hooks/usePagination';
import Pagination from '../../src/components/shared/Pagination';



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
  });

  // ✅ Garantir que products est toujours un tableau
  const products = Array.isArray(rawProducts) ? rawProducts
    : rawProducts?.data ? rawProducts.data
    : rawProducts?.products ? rawProducts.products
    : [];

  // Mettre à jour l'URL quand recherche change
  useEffect(() => {
    if (debouncedSearch) {
      navigate(`/products?search=${debouncedSearch}`, { replace: true });
    } else {
      navigate("/products", { replace: true });
    }
  }, [debouncedSearch, navigate]);

  // Extraire catégories uniques
  const allCategories = useMemo(() => {
    const categoriesSet = new Set();

    products.forEach((item) => {
      const categories = Array.isArray(item.category)
        ? item.category
        : item.category
        ? [item.category]
        : [];

      categories.forEach((cat) => categoriesSet.add(cat));
    });

    return ["all", ...Array.from(categoriesSet)];
  }, [products]);

  // Filtrer produits
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

    // Catégorie
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

  const {
  paginatedItems,
  currentPage,
  totalPages,
  goToPage
} = usePagination(filteredProducts, 12);


  // ✅ Grouper par catégorie
  const productsByCategory = useMemo(() => {
    const grouped = {};

    filteredProducts.forEach((product) => {
      const category = product.category || "Autres";
      const catName = Array.isArray(category) ? category[0] : category;

      if (!grouped[catName]) {
        grouped[catName] = [];
      }

      grouped[catName].push(product);
    });

    return grouped;
  }, [filteredProducts]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">
          Chargement des produits...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          🛍️ Tous les Produits
        </h1>

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-12 py-4 border-2 rounded-xl"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between gap-4 mb-8">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-2 rounded-lg px-4 py-2"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Toutes les catégories" : cat}
              </option>
            ))}
          </select>

          {/* View mode */}
          <div className="flex gap-2">
            <button onClick={() => setViewMode("grid")}>
              <FaThLarge />
            </button>
            <button onClick={() => setViewMode("compact")}>
              <FaTh />
            </button>
            <button onClick={() => setViewMode("list")}>
              <FaList />
            </button>
          </div>
        </div>

        {/* Display */}
       {filteredProducts.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-600 dark:text-gray-400">
      Aucun produit trouvé.
    </p>
  </div>
) : selectedCategory === "all" ? (
  Object.entries(productsByCategory).map(
    ([category, categoryProducts]) => (
      <div key={category} className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 px-1">
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
      {paginatedItems.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>

    {/* Pagination HORS de la grid */}
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
  )};  

export default Products;