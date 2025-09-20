import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "../../slices/productSlice";
import ProductCard from "../../components/client/ProductCard";

const Products = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.products);
  const location = useLocation();

  // 🔄 Paramètre de recherche depuis l'URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // 🔄 Extraire dynamiquement toutes les catégories uniques
  const allCategories = useMemo(() => {
    const acc = [];
    items.forEach((item) => {
      const categories = Array.isArray(item.category)
        ? item.category
        : item.category
        ? [item.category]
        : [];

      categories.forEach((cat) => {
        if (!acc.includes(cat)) acc.push(cat);
      });
    });
    return acc;
  }, [items]);

  // 🔄 Filtrage des produits selon la recherche
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchQuery);
      const descMatch = item.description.toLowerCase().includes(searchQuery);
      return nameMatch || descMatch;
    });
  }, [items, searchQuery]);

  if (isLoading) return <p className="text-center">Chargement des produits...</p>;
  if (error) return <p className="text-red-500 text-center">Erreur : {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        🛍️ Tous les Produits
      </h1>

      {allCategories.map((category) => {
        const filteredByCategory = filteredItems.filter((item) => {
          const categories = Array.isArray(item.category)
            ? item.category
            : item.category
            ? [item.category]
            : [];
          return categories.includes(category);
        });

        // Si aucun produit dans cette catégorie après recherche, on ne l'affiche pas
        if (filteredByCategory.length === 0) return null;

        return (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">
              {category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredByCategory.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Products;
