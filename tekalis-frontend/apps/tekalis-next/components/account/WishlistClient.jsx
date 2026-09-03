"use client";

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import {
  removeFromWishlist,
  removeFromWishlistLocal,
} from "@/store/slices/wishlistSlice";
import { addToCart } from "@/store/slices/cartSlice";
import { useToast } from "@/components/shared/ToastProvider";

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
    <div className="min-h-screen bg-surface-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3 font-display">
            <FaHeart className="text-red-500" />
            Mes Favoris
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            {items.length} produit{items.length !== 1 ? "s" : ""} sauvegardé
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-16 text-center">
            <FaHeart className="text-6xl text-surface-200 dark:text-surface-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
              Aucun favori pour l'instant
            </h3>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              Cliquez sur le ❤️ sur un produit pour l'ajouter à vos favoris.
            </p>
            <Link href="/products"
              className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold transition"
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
                  className="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-elevated transition overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <Link href={`/products/${product._id}`}
                    className="relative block aspect-square bg-surface-50 dark:bg-surface-700 overflow-hidden"
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
                      <span className="text-xs text-surface-400 dark:text-surface-500 uppercase font-semibold mb-1">
                        {product.brand}
                      </span>
                    )}
                    <Link href={`/products/${product._id}`}
                      className="font-semibold text-surface-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 line-clamp-2 mb-2 transition"
                    >
                      {product.name}
                    </Link>

                    {/* Prix */}
                    <div className="mb-4 mt-auto">
                      <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                        {product.price?.toLocaleString()} FCFA
                      </span>
                      {product.comparePrice > product.price && (
                        <span className="ml-2 text-sm text-surface-400 dark:text-surface-500 line-through">
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
                        className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-surface-300 dark:disabled:bg-surface-600 text-white py-2 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart size={14} />
                        {product.stock > 0 ? "Ajouter" : "Indisponible"}
                      </button>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition flex items-center justify-center flex-shrink-0"
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
            <Link href="/products"
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
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
