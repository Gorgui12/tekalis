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

  const shippingCost = 0; // Livraison gratuite pour l'instant
  const total = totalAmount + shippingCost;

  // ── Panier vide ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 mt-20">
        <div className="text-center">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Votre panier est vide
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Découvrez nos produits et ajoutez-en à votre panier
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🛒 Votre Panier
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Liste des produits ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            // Image : tableau d'objets ou string directe
            const imageUrl =
              item.images?.find((img) => img.isPrimary)?.url ||
              item.images?.[0]?.url ||
              item.image ||
              "/images/no-image.webp";

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-full sm:w-28 h-28 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
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
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">
                        {item.brand}
                      </p>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {item.price.toLocaleString()} FCFA
                    </p>
                  </div>

                  {/* Quantité + Supprimer */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Contrôles quantité */}
                    <div className="flex items-center gap-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item._id))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        aria-label="Diminuer"
                      >
                        <FaMinus size={11} />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(increaseQuantity(item._id))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        aria-label="Augmenter"
                      >
                        <FaPlus size={11} />
                      </button>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1.5 text-sm transition"
                    >
                      <FaTrash size={13} />
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>

                {/* Sous-total item */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:min-w-[100px]">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Sous-total
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {(item.price * (item.quantity || 1)).toLocaleString()} FCFA
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
            className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
          >
            <FaTrash size={13} />
            Vider le panier
          </button>
        </div>

        {/* ── Récapitulatif ────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24 space-y-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Récapitulatif
            </h2>

            {/* Lignes prix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Sous-total ({items.reduce((s, i) => s + (i.quantity || 1), 0)} article
                  {items.length > 1 ? "s" : ""})
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalAmount.toLocaleString()} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <FaTruck size={12} />
                  Livraison
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400 text-xs">
                  Calculée à l'étape suivante
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">
                  Total estimé
                </span>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {total.toLocaleString()} FCFA
                </p>
              </div>
            </div>

            {/* Bouton commander */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition text-base flex items-center justify-center gap-2"
            >
              <FaLock size={14} />
              Passer la commande
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-semibold transition text-sm"
            >
              Continuer mes achats
            </button>

            {/* Badges confiance */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FaLock className="text-green-500 flex-shrink-0" />
                Paiement sécurisé à la livraison
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FaTruck className="text-blue-500 flex-shrink-0" />
                Livraison rapide à Dakar & banlieue
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FaShieldAlt className="text-purple-500 flex-shrink-0" />
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

