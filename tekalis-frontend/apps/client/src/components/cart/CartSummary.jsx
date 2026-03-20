import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaTag, FaArrowRight, FaLock, FaTruck, FaShieldAlt } from "react-icons/fa";
import Button from "../shared/Button";
import PromoCodeInput from "./PromoCodeInput";

/**
 * CartSummary — Récapitulatif et total du panier
 * Props:
 *   onCheckout: () => void
 */
const CartSummary = ({ onCheckout }) => {
  const { items, totalAmount } = useSelector(state => state.cart);

  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const discountAmount = promoDiscount > 0 ? Math.round(subtotal * (promoDiscount / 100)) : 0;
  const total = subtotal - discountAmount;

  const handlePromoApplied = ({ code, discount }) => {
    setPromoCode(code);
    setPromoDiscount(discount);
  };

  const handlePromoRemoved = () => {
    setPromoCode("");
    setPromoDiscount(0);
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24 space-y-5">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Récapitulatif
      </h3>

      {/* Lignes de prix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Sous-total ({items.reduce((s, i) => s + (i.quantity || 1), 0)} article{items.length > 1 ? "s" : ""})
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {subtotal.toLocaleString()} FCFA
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <FaTag size={11} />
              Code <code className="bg-green-100 dark:bg-green-900/30 px-1.5 rounded text-xs">{promoCode}</code>
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              −{discountAmount.toLocaleString()} FCFA
            </span>
          </div>
        )}

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
          <span className="font-bold text-gray-900 dark:text-white">Total estimé</span>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {total.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Code promo */}
      <PromoCodeInput
        onApplied={handlePromoApplied}
        onRemoved={handlePromoRemoved}
        appliedCode={promoCode}
      />

      {/* Bouton commander */}
      {onCheckout ? (
        <Button
          onClick={onCheckout}
          variant="primary"
          fullWidth
          size="lg"
          icon={<FaLock />}
        >
          Commander maintenant
        </Button>
      ) : (
        <Link to="/checkout">
          <Button variant="primary" fullWidth size="lg" icon={<FaArrowRight />}>
            Passer la commande
          </Button>
        </Link>
      )}

      {/* Badges de confiance */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <FaLock className="text-green-500" />
          Paiement 100% sécurisé
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <FaTruck className="text-blue-500" />
          Livraison rapide à Dakar & banlieue
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <FaShieldAlt className="text-purple-500" />
          Garantie constructeur incluse
        </div>
      </div>
    </div>
  );
};

export default CartSummary;