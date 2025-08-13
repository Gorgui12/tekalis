import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/client/ProductCard";
import { fetchProducts } from "../../slices/productSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const popularProducts = items.slice(0, 4); // Tu peux améliorer ça plus tard avec une vraie logique

  return (
    <div>
      {/* Bannière */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-12 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Bienvenue sur Tekalis</h1>
        <p className="text-lg md:text-xl">Produits de qualité. Prix imbattables. Livraison rapide.</p>
        <button className="mt-6 px-6 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-200 transition">
          Explorer les produits
        </button>
      </div>

      {/* Slogan / Valeur */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">🛍️ Achetez malin, achetez Tekalis.</h2>
        <p className="text-gray-600">Votre marketplace de confiance pour des produits électroniques et plus encore.</p>
      </div>

      {/* Produits populaires */}
      <div className="container mx-auto px-6 mb-12">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">⭐ Produits populaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* Tous les produits */}
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">🆕 Tous les produits</h2>
        {isLoading ? (
          <p className="text-center">Chargement des produits...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

