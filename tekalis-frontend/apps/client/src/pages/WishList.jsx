import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import {
  removeFromWishlist,
  removeFromWishlistLocal,
} from "../../../../packages/shared/redux/slices/wishListSlice";
import { addToCart } from "../../../../packages/shared/redux/slices/cartSlice";
import { useToast } from "../../../../packages/shared/context/ToastContext";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items } = useSelector((state) => state.wishlist);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlistLocal(productId));
    dispatch(removeFromWishlist(productId));
    toast.info("Retiré des favoris");
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} ajouté au panier !`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaHeart className="text-red-500" />
            Mes Favoris
          </h1>
          <p className="text-gray-500 mt-1">
            {items.length} produit{items.length !== 1 ? "s" : ""} sauvegardé
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <FaHeart className="text-6xl text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun favori pour l'instant
            </h3>
            <p className="text-gray-500 mb-6">
              Cliquez sur le ❤️ sur un produit pour l'ajouter à vos favoris.
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => {
              const image =
                product.images?.find((i) => i.isPrimary)?.url ||
                product.images?.[0]?.url ||
                product.image ||
                "/images/no-image.webp";

              const discount =
                product.comparePrice && product.comparePrice > product.price
                  ? Math.round(
                      ((product.comparePrice - product.price) /
                        product.comparePrice) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="relative block aspect-square bg-gray-50 overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    )}
                  </Link>

                  {/* Infos */}
                  <div className="p-4 flex flex-col flex-grow">
                    {product.brand && (
                      <span className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        {product.brand}
                      </span>
                    )}
                    <Link
                      to={`/products/${product._id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2 transition"
                    >
                      {product.name}
                    </Link>

                    {/* Prix */}
                    <div className="mb-4 mt-auto">
                      <span className="text-xl font-bold text-blue-600">
                        {product.price?.toLocaleString()} FCFA
                      </span>
                      {product.comparePrice > product.price && (
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          {product.comparePrice?.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <p
                      className={`text-xs font-semibold mb-3 ${
                        product.stock > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.stock > 0
                        ? `✓ En stock (${product.stock})`
                        : "✗ Rupture de stock"}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart size={14} />
                        {product.stock > 0 ? "Ajouter" : "Indisponible"}
                      </button>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition flex items-center justify-center flex-shrink-0"
                        aria-label="Retirer des favoris"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="text-blue-600 hover:underline font-semibold"
            >
              ← Continuer mes achats
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;