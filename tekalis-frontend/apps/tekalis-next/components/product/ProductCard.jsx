"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  addToWishlistLocal,
  removeFromWishlistLocal,
} from "@/store/slices/wishlistSlice";
import { useToast } from "@/components/shared/ToastProvider";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaTag,
  FaEye,
} from "react-icons/fa";

const ProductCard = ({ product, showSpecs = false }) => {
  const toast = useToast();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  const primaryImage = product.images?.find((img) => img.isPrimary);
  const imageUrl =
    primaryImage?.url || product.image || "/images/no-image.webp";

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

  const categoryNames = Array.isArray(product.category)
    ? product.category.map((c) => (typeof c === "object" ? c.name : c))
    : product.category
    ? [typeof product.category === "object" ? product.category.name : product.category]
    : [];

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
      dispatch(removeFromWishlistLocal(product._id));
      dispatch(removeFromWishlist(product._id));
      toast.info("Retiré des favoris");
    } else {
      dispatch(addToWishlistLocal(product));
      dispatch(addToWishlist(product._id));
      toast.success("Ajouté aux favoris ❤️");
    }
  };

  return (
    <Link href={`/products/${product.slug || product._id}`}
      className="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full border border-surface-100 dark:border-surface-700 hover:-translate-y-1"
    >
      {/* ─── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-surface-50 dark:bg-surface-900 aspect-square">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-surface-200 dark:bg-surface-700 animate-pulse" />
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
            <div className="bg-rose-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold shadow-md flex items-center gap-0.5">
              <FaTag size={8} />
              -{discount}%
            </div>
          )}
          {isLowStock && (
            <div className="bg-amber-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold shadow-md">
              Stock limité
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-surface-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold shadow-md">
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
              ? "bg-rose-500 text-white"
              : "bg-white/90 dark:bg-surface-800/90 text-surface-700 dark:text-surface-300 hover:bg-rose-50 hover:text-rose-500 border border-surface-100 dark:border-surface-700"
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
            className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-full transition disabled:bg-surface-400 disabled:cursor-not-allowed shadow-lg hover:scale-110"
          >
            <FaShoppingCart size={18} />
          </button>
          <span
            className="bg-white hover:bg-surface-100 text-surface-800 p-3 rounded-full transition shadow-lg hover:scale-110"
            title="Voir détails"
          >
            <FaEye size={18} />
          </span>
        </div>
      </div>

      {/* ─── Infos ─────────────────────────────────────────────────────────── */}
      <div className="p-2.5 md:p-4 flex flex-col flex-grow">
        {product.brand && (
          <span className="text-[10px] md:text-xs text-surface-500 dark:text-surface-400 uppercase font-semibold mb-1 tracking-wide">
            {product.brand}
          </span>
        )}

        <h3 className="text-xs md:text-sm font-semibold text-surface-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition min-h-[2rem] md:min-h-[2.5rem]">
          {product.name}
        </h3>

        {categoryNames.length > 0 && (
          <span className="text-[10px] md:text-xs text-surface-400 dark:text-surface-500 mb-1">
            {categoryNames.join(", ")}
          </span>
        )}

        {avgRating > 0 && reviewCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(avgRating)
                      ? "text-amber-400"
                      : "text-surface-200 dark:text-surface-600"
                  }
                />
              ))}
            </div>
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-surface-500 dark:text-surface-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {showSpecs && product.specs && (
          <div className="hidden md:block text-xs text-surface-600 dark:text-surface-400 mb-2 space-y-0.5">
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
            <span className="text-base md:text-lg font-bold text-brand-600 dark:text-brand-400">
              {(product.price || 0).toLocaleString()}
            </span>
            <span className="text-[10px] md:text-xs text-surface-600 dark:text-surface-400">
              FCFA
            </span>
          </div>
          {product.comparePrice && discount > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="text-[10px] md:text-xs text-surface-400 dark:text-surface-500 line-through">
                {(product.comparePrice || 0).toLocaleString()} FCFA
              </span>
              <span className="text-[10px] md:text-xs text-rose-500 dark:text-rose-400 font-semibold">
                Economisez{" "}
                {((product.comparePrice || 0) - (product.price || 0)).toLocaleString()} FCFA
              </span>
            </div>
          )}
        </div>

        {/* Bouton Ajouter au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2 md:py-2.5 px-2 rounded-xl font-semibold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
            isOutOfStock
              ? "bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed"
              : "bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-md"
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
