"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/store/slices/productSlice";
import { addToCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  addToWishlistLocal,
  removeFromWishlistLocal,
} from "@/store/slices/wishlistSlice";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductSpecs from "@/components/product/ProductSpecs";
import ReviewList from "@/components/review/ReviewList";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import PageMeta from "@/components/seo/PageMeta";
import {
  FaShieldAlt,
  FaTruck,
  FaCheckCircle,
  FaMinus,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
} from "react-icons/fa";
import { useToast } from "@/components/shared/ToastProvider";

const ProductDetails = ({ product: initialProduct }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { allProducts: items, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use SSR product
  const product = initialProduct;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-surface-900 dark:text-white mb-4">Produit introuvable</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Ce produit n'existe pas ou a été supprimé.</p>
          <a href="/products" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">Voir tous les produits</a>
        </div>
      </div>
    );
  }

  // Log product structure for debugging
  console.log('ProductDetailClient - Rendering product:', product);

  // ── Images ────────────────────────────────────────────────────────────────
  const productImages = product.images?.length
    ? product.images
    : [{ url: product.image, isPrimary: true }];

  // ── URLs pour le SEO ──────────────────────────────────────────────────────
  const productImageUrls = productImages
    .map((img) => img.url || img)
    .filter(Boolean);

  // ── Images avec alt SEO distinct pour chaque vue ─────────────────────────
  const galleryImages = productImages.map((img, i) => ({
    ...img,
    alt: img.alt || (i === 0 ? product.name : `${product.name} - vue ${i + 1}`),
  }));

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleToggleWishlist = () => {
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

  // ── Panier ────────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("Produit en rupture de stock");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    toast.success(`${quantity} × ${product.name} ajouté${quantity > 1 ? "s" : ""} au panier !`);
  };

  // ── Produits similaires ───────────────────────────────────────────────────
  const getCatName = (cat) => {
    if (!cat) return null;
    if (typeof cat === "string") return cat;
    return cat.name || null;
  };
  const productCats = (
    Array.isArray(product.category) ? product.category : [product.category]
  ).map(getCatName).filter(Boolean);

  const similarProducts = items
    .filter((item) => {
      if (item._id === product._id) return false;
      const itemCats = (
        Array.isArray(item.category) ? item.category : [item.category]
      ).map(getCatName).filter(Boolean);
      return itemCats.some((c) => productCats.includes(c));
    })
    .slice(0, 4);

  const isOutOfStock = product.stock === 0;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 mt-32">

      {/* ── SEO HEAD complet ─────────────────────────────────────────────── */}
      <PageMeta
        title={`${product.name} — Prix ${product.price?.toLocaleString()} FCFA Dakar | Tekalis`}
        description={`Achetez ${product.name} à Dakar au prix de ${product.price?.toLocaleString()} FCFA. ${
          product.description?.slice(0, 100) || ""
        }... Livraison rapide au Sénégal. Garantie constructeur 12 mois.`}
        image={productImageUrls[0]}
        keywords={[
          `${product.name} prix Dakar`,
          `${product.name} Sénégal`,
          `acheter ${product.name} Dakar`,
          product.brand ? `${product.brand} Dakar` : null,
          product.brand ? `${product.brand} Sénégal prix` : null,
        ].filter(Boolean)}
        type="product"
        price={product.price}
        availability={product.stock > 0 ? "InStock" : "OutOfStock"}
        canonical={`https://tekalis.com/products/${product._id}`}
        // ── productData complet pour schema Product + AggregateRating ──
        productData={{
          name: product.name,
          brand: product.brand || "Tekalis",
          sku: product._id,
          images: productImageUrls,
          rating: product.rating,
        }}
        breadcrumbs={[
          { name: "Produits", url: "/products" },
          { name: product.name, url: `/products/${product._id}` },
        ]}
      />

      {/* ── Fil d'Ariane SEO ─────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { name: "Produits", path: "/products" },
          { name: product.name, path: `/products/${product._id}` },
        ]}
      />

      {/* ── Section Principale ───────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8 mb-12 mt-4">

        {/* Galerie — utilise le composant dédié avec lightbox */}
        <ProductGallery images={galleryImages} productName={product.name} />

        {/* Informations produit */}
        <div>
          {/* Marque */}
          {product.brand && (
            <p className="text-sm text-surface-500 dark:text-surface-400 uppercase font-semibold mb-2 tracking-wide">
              {product.brand}
            </p>
          )}

          {/* H1 produit */}
          <h1 className="text-3xl font-bold font-display text-surface-900 dark:text-white mb-4">
            {product.name}
          </h1>

          {/* Note */}
          {product.rating?.average > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(product.rating.average) ? "text-amber-400" : "text-surface-200 dark:text-surface-600"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-surface-600 dark:text-surface-400">
                {product.rating.average.toFixed(1)} ({product.rating.count} avis)
              </span>
            </div>
          )}

          {/* Prix */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold font-display text-brand-600 dark:text-brand-400">
                {(product.price || 0).toLocaleString()} FCFA
              </span>
              {product.comparePrice && discount > 0 && (
                <span className="text-xl text-surface-400 dark:text-surface-500 line-through">
                  {(product.comparePrice || 0).toLocaleString()} FCFA
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-sm text-rose-500 font-semibold mt-1">
                Economisez {((product.comparePrice || 0) - (product.price || 0)).toLocaleString()} FCFA (-{discount}%)
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
              isOutOfStock
                ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
                : product.stock < 5
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
            }`}>
              <FaCheckCircle />
              {isOutOfStock
                ? "Rupture de stock"
                : product.stock < 5
                ? `Stock limité (${product.stock} restants)`
                : `En stock (${product.stock} unités)`}
            </div>
            <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-3 py-2 rounded-xl text-sm font-medium">
              <FaShieldAlt />
              Garantie 12 mois
            </div>
          </div>

          {/* Description courte */}
          {product.description && (
            <p className="text-surface-700 dark:text-surface-300 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantité */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Quantité :</span>
              <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-xl overflow-hidden bg-white dark:bg-surface-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-700 transition text-surface-600 dark:text-surface-300"
                  aria-label="Diminuer"
                >
                  <FaMinus size={12} />
                </button>
                <span className="px-5 py-2 font-semibold border-x border-surface-300 dark:border-surface-600 text-surface-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-700 transition text-surface-600 dark:text-surface-300"
                  aria-label="Augmenter"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition ${
                isOutOfStock
                  ? "bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed"
                  : "bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
              }`}
            >
              <FaShoppingCart />
              {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
            </button>

            <button
              onClick={handleToggleWishlist}
              aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`px-4 py-3 rounded-xl border-2 transition ${
                isInWishlist
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:border-rose-400 hover:text-rose-500"
              }`}
            >
              {isInWishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* Livraison */}
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
            <div className="flex items-start gap-3 text-sm text-surface-700 dark:text-surface-300">
              <FaTruck className="text-brand-600 dark:text-brand-400 text-lg mt-0.5" />
              <div>
                <p className="font-semibold">Livraison gratuite à Dakar</p>
                <p className="text-surface-500 dark:text-surface-400">Estimée sous 2-3 jours ouvrés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Specs + Description + Avis — composants dédiés ──────────────── */}
      <div className="mb-12">
        {/* ProductSpecs gère les onglets Caractéristiques / Description / Avis internes */}
        <ProductSpecs product={product} />
      </div>

      {/* ── Section Avis complète — ReviewList ───────────────────────────── */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Avis clients
        </h2>
        <ReviewList
          productId={product._id}
          rating={product.rating || {}}
          showForm={!!user}
        />
      </div>

      {/* ── Produits similaires ───────────────────────────────────────────── */}
      {similarProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Produits similaires
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;



