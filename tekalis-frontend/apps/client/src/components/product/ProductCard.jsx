import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../../../packages/shared/redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  addToWishlistLocal,
  removeFromWishlistLocal,
} from "../../../../../packages/shared/redux/slices/wishListSlice";
import { useToast } from "../../../../../packages/shared/context/ToastContext";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaTag,
  FaEye,
} from "react-icons/fa";

/**
 * ProductCard — Carte produit unifiée
 *
 * Props:
 *   product   : Object
 *   showSpecs : boolean — affiche RAM/Stockage si disponibles (défaut: false)
 */
const ProductCard = ({ product, showSpecs = false }) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  // ─── Image ────────────────────────────────────────────────────────────────
  const primaryImage = product.images?.find((img) => img.isPrimary);
  const imageUrl =
    primaryImage?.url || product.image || "/images/no-image.webp";

  // ─── Calculs ──────────────────────────────────────────────────────────────
  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const avgRating = product.rating?.average || 0;
  const reviewCount = product.rating?.count || 0;

  // ─── Helpers category ─────────────────────────────────────────────────────
  // Normalise category en tableau de strings (même si ce sont des objets)
  const categoryNames = Array.isArray(product.category)
    ? product.category.map((c) => (typeof c === "object" ? c.name : c))
    : product.category
    ? [typeof product.category === "object" ? product.category.name : product.category]
    : [];

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Produit en rupture de stock");
      return;
    }
    dispatch(addToCart(product));
    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      // Optimistic local update
      dispatch(removeFromWishlistLocal(product._id));
      dispatch(removeFromWishlist(product._id));
      toast.info("Retiré des favoris");
    } else {
      // Optimistic local update (stocke produit sanitisé)
      dispatch(addToWishlistLocal(product));
      // Appel API avec juste l'ID
      dispatch(addToWishlist(product._id));
      toast.success("Ajouté aux favoris ❤️");
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* ─── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 aspect-square">
        {/* Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}

        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain p-2 md:p-4 group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Badges gauche */}
        <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <div className="bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold shadow-md flex items-center gap-0.5">
              <FaTag size={8} />
              -{discount}%
            </div>
          )}
          {isLowStock && (
            <div className="bg-orange-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold shadow-md">
              Stock limité
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-gray-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold shadow-md">
              Rupture
            </div>
          )}
        </div>

        {/* Wishlist — bouton haut droite */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${
            isInWishlist
              ? "bg-red-500 text-white"
              : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          {isInWishlist ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
        </button>

        {/* Overlay hover desktop */}
        <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Ajouter au panier"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            <FaShoppingCart size={18} />
          </button>
          <span
            className="bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full transition shadow-lg"
            title="Voir détails"
          >
            <FaEye size={18} />
          </span>
        </div>
      </div>

      {/* ─── Infos ─────────────────────────────────────────────────────────── */}
      <div className="p-2.5 md:p-4 flex flex-col flex-grow">
        {/* Marque */}
        {product.brand && (
          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
            {product.brand}
          </span>
        )}

        {/* Nom */}
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition min-h-[2rem] md:min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Catégories — ✅ affiché en string, plus de crash */}
        {categoryNames.length > 0 && (
          <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mb-1">
            {categoryNames.join(", ")}
          </span>
        )}

        {/* Note */}
        {avgRating > 0 && reviewCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(avgRating)
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Specs rapides (optionnel) */}
        {showSpecs && product.specs && (
          <div className="hidden md:block text-xs text-gray-600 dark:text-gray-400 mb-2 space-y-0.5">
            {product.specs.ram && (
              <div className="flex gap-1">
                <span className="font-medium">RAM:</span>
                <span>{product.specs.ram}</span>
              </div>
            )}
            {product.specs.storage && (
              <div className="flex gap-1">
                <span className="font-medium">Stockage:</span>
                <span>{product.specs.storage}</span>
              </div>
            )}
          </div>
        )}

        {/* Prix */}
        <div className="mt-auto mb-2 md:mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
              {product.price.toLocaleString()}
            </span>
            <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
              FCFA
            </span>
          </div>
          {product.comparePrice && discount > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 line-through">
                {product.comparePrice.toLocaleString()} FCFA
              </span>
              <span className="text-[10px] md:text-xs text-red-500 dark:text-red-400 font-semibold">
                Économisez{" "}
                {(product.comparePrice - product.price).toLocaleString()} FCFA
              </span>
            </div>
          )}
        </div>

        {/* Bouton Ajouter au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2 md:py-2.5 px-2 rounded-lg font-semibold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            isOutOfStock
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <FaShoppingCart size={12} className="md:w-[14px] md:h-[14px]" />
          {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;