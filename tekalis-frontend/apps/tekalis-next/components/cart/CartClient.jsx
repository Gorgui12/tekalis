"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from "@/store/slices/cartSlice";
import { FaTrash, FaMinus, FaPlus, FaShieldAlt, FaTruck, FaLock } from "react-icons/fa";

const Cart = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const shippingCost = 0;
  const total = (totalAmount || 0) + shippingCost;

  // ── Panier vide ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 mt-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-100 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400 text-6xl mb-6">
            <FaShoppingCart size={56} />
          </div>
          <h2 className="text-2xl font-bold font-display text-surface-900 dark:text-white mb-2">
            Votre panier est vide
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            Découvrez nos produits et ajoutez-en à votre panier
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-sm hover:shadow-md"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <h1 className="text-3xl font-bold font-display text-surface-900 dark:text-white mb-8">
        Votre Panier
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Liste des produits ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.price || 0;
            const imageUrl =
              item.images?.find((img) => img.isPrimary)?.url ||
              item.images?.[0]?.url ||
              item.image ||
              "/images/no-image.webp";

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-100 dark:border-surface-700 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-card-hover transition"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-full sm:w-28 h-28 bg-surface-50 dark:bg-surface-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.src = "/images/no-image.webp";
                    }}
                  />
                </div>

                {/* Détails */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {item.brand && (
                      <p className="text-xs text-surface-400 dark:text-surface-400 uppercase font-semibold mb-0.5 tracking-wide">
                        {item.brand}
                      </p>
                    )}
                    <h3 className="font-semibold font-display text-surface-900 dark:text-white mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-brand-600 dark:text-brand-400 font-bold text-xl">
                      {price.toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Quantité + Supprimer */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Contrôles quantité */}
                    <div className="flex items-center gap-0 bg-surface-100 dark:bg-surface-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item._id))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-600 transition text-surface-600 dark:text-surface-300"
                        aria-label="Diminuer"
                      >
                        <FaMinus size={11} />
                      </button>
                      <span className="w-10 text-center font-bold text-surface-900 dark:text-white text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(increaseQuantity(item._id))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-600 transition text-surface-600 dark:text-surface-300"
                        aria-label="Augmenter"
                      >
                        <FaPlus size={11} />
                      </button>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1.5 text-sm transition"
                    >
                      <FaTrash size={13} />
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>

                {/* Sous-total item */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:min-w-[100px]">
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    Sous-total
                  </span>
                  <span className="font-bold text-lg text-surface-900 dark:text-white">
                    {(price * (item.quantity || 1)).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            );
          })}

          {/* Vider le panier */}
          <button
            onClick={() => {
              if (window.confirm("Voulez-vous vraiment vider le panier ?")) {
                dispatch(clearCart());
              }
            }}
            className="w-full sm:w-auto bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-5 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
          >
            <FaTrash size={13} />
            Vider le panier
          </button>
        </div>

        {/* ── Récapitulatif ────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-100 dark:border-surface-700 p-6 sticky top-24 space-y-5">
            <h2 className="text-xl font-bold font-display text-surface-900 dark:text-white">
              Récapitulatif
            </h2>

            {/* Lignes prix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400">
                  Sous-total ({items.reduce((s, i) => s + (i.quantity || 1), 0)} article
                  {items.length > 1 ? "s" : ""})
                </span>
                <span className="font-semibold text-surface-900 dark:text-white">
                  {(totalAmount || 0).toLocaleString()} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500 dark:text-surface-400 flex items-center gap-1">
                  <FaTruck size={12} />
                  Livraison
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                  Calculée à l'étape suivante
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-surface-900 dark:text-white">
                  Total estimé
                </span>
                <p className="text-2xl font-bold font-display text-brand-600 dark:text-brand-400">
                  {total.toLocaleString()} FCFA
                </p>
              </div>
            </div>

            {/* Bouton commander */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3.5 rounded-xl font-bold transition text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <FaLock size={14} />
              Passer la commande
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 py-2.5 rounded-xl font-semibold transition text-sm"
            >
              Continuer mes achats
            </button>

            {/* Badges confiance */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                <FaLock className="text-emerald-500 flex-shrink-0" />
                Paiement sécurisé à la livraison
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                <FaTruck className="text-brand-500 flex-shrink-0" />
                Livraison rapide à Dakar & banlieue
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                <FaShieldAlt className="text-amber-500 flex-shrink-0" />
                Garantie constructeur incluse
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

