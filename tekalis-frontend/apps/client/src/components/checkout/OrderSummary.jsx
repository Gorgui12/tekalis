import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaEdit, FaTag } from "react-icons/fa";

/**
 * OrderSummary — Récapitulatif de commande pour le checkout
 * Props:
 *   deliveryFee: number (0 = gratuit)
 *   promoDiscount: number
 *   promoCode: string
 */
const OrderSummary = ({ deliveryFee = 0, promoDiscount = 0, promoCode = "" }) => {
  const { items, totalAmount } = useSelector(state => state.cart);

  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const discountAmount = promoDiscount > 0 ? Math.round(subtotal * (promoDiscount / 100)) : 0;
  const total = subtotal - discountAmount + deliveryFee;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaShoppingCart className="text-blue-600" />
          Récapitulatif
        </h3>
        <Link
          to="/cart"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <FaEdit size={11} />
          Modifier
        </Link>
      </div>

      {/* Articles */}
      <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-3">
            {/* Image */}
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
              <img
                src={item.image || "/images/no-image.webp"}
                alt={item.name}
                className="w-full h-full object-contain p-1"
              />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Qté : {item.quantity || 1}
              </p>
            </div>

            {/* Prix */}
            <p className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">
              {(item.price * (item.quantity || 1)).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Séparateur */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
        {/* Sous-total */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Sous-total ({items.length} article{items.length > 1 ? "s" : ""})
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {subtotal.toLocaleString()} FCFA
          </span>
        </div>

        {/* Réduction promo */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <FaTag size={11} />
              Promo {promoCode && <code className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs">{promoCode}</code>}
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              −{discountAmount.toLocaleString()} FCFA
            </span>
          </div>
        )}

        {/* Livraison */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Livraison</span>
          <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
            {deliveryFee === 0 ? "Gratuit" : `${deliveryFee.toLocaleString()} FCFA`}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white">Total</span>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {total.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note sécurité */}
      <div className="mt-5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
        <span className="text-green-500">🔒</span>
        Paiement 100% sécurisé — SSL
      </div>
    </div>
  );
};

export default OrderSummary;