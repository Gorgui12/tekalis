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

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { allProducts: items, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!items || items.length === 0) {
      dispatch(fetchProducts());
    }
    window.scrollTo(0, 0);
  }, [dispatch, items?.length]);

  const product = items?.find((item) => item._id === id);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-gray-500 uppercase font-semibold mb-2">
              {product.brand}
            </p>
          )}

          {/* H1 produit */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {product.name}
          </h1>

          {/* Note */}
          {product.rating?.average > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.floor(product.rating.average) ? "text-yellow-400" : "text-gray-300"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.average.toFixed(1)} ({product.rating.count} avis)
              </span>
            </div>
          )}

          {/* Prix */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-600">
                {product.price.toLocaleString()} FCFA
              </span>
              {product.comparePrice && discount > 0 && (
                <span className="text-xl text-gray-400 line-through">
                  {product.comparePrice.toLocaleString()} FCFA
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-sm text-red-500 font-semibold mt-1">
                Économisez {(product.comparePrice - product.price).toLocaleString()} FCFA (-{discount}%)
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              isOutOfStock
                ? "bg-red-50 text-red-700"
                : product.stock < 5
                ? "bg-orange-50 text-orange-700"
                : "bg-green-50 text-green-700"
            }`}>
              <FaCheckCircle />
              {isOutOfStock
                ? "Rupture de stock"
                : product.stock < 5
                ? `Stock limité (${product.stock} restants)`
                : `En stock (${product.stock} unités)`}
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
              <FaShieldAlt />
              Garantie 12 mois
            </div>
          </div>

          {/* Description courte */}
          {product.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantité */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-gray-700">Quantité :</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition"
                  aria-label="Diminuer"
                >
                  <FaMinus size={12} />
                </button>
                <span className="px-5 py-2 font-semibold border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition"
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <FaShoppingCart />
              {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
            </button>

            <button
              onClick={handleToggleWishlist}
              aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`px-4 py-3 rounded-lg border-2 transition ${
                isInWishlist
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500"
              }`}
            >
              {isInWishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* Livraison */}
          <div className="border-t pt-4">
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <FaTruck className="text-blue-600 text-lg mt-0.5" />
              <div>
                <p className="font-semibold">Livraison gratuite à Dakar</p>
                <p className="text-gray-500">Estimée sous 2-3 jours ouvrés</p>
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



