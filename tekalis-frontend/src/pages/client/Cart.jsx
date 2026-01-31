import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity, 
  clearCart 
} from "../../redux/slices/cartSlice";
import { FaTrash, FaMinus, FaPlus, FaTimes } from "react-icons/fa";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  // Codes promo simulés (à remplacer par API)
  const validPromoCodes = {
    "WELCOME10": { discount: 10, type: "percentage", description: "10% de réduction" },
    "TECH2000": { discount: 2000, type: "fixed", description: "2000 FCFA de réduction" }
  };

  // Calculs
  const subtotal = totalAmount;
  const shippingCost = subtotal >= 50000 ? 0 : 2500;
  const discountAmount = appliedPromo 
    ? (appliedPromo.type === "percentage" 
        ? Math.round(subtotal * appliedPromo.discount / 100)
        : appliedPromo.discount)
    : 0;
  const total = subtotal - discountAmount + shippingCost;

  // Appliquer code promo
  const handleApplyPromo = () => {
    const promo = validPromoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({ ...promo, code: promoCode.toUpperCase() });
      setPromoError("");
      setPromoCode("");
    } else {
      setPromoError("Code promo invalide");
      setAppliedPromo(null);
    }
  };

  // Retirer code promo
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 mt-20">
        <div className="text-center">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
          <p className="text-gray-600 mb-6">Découvrez nos produits et ajoutez-en à votre panier</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🛒 Votre Panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Liste des produits */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full sm:w-32 h-32 object-contain rounded"
                />
              </div>

              {/* Détails */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-blue-600 font-bold text-xl">
                    {item.price.toLocaleString()} FCFA
                  </p>
                </div>

                {/* Quantité et actions */}
                <div className="flex items-center justify-between mt-4">
                  {/* Contrôles quantité */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => dispatch(decreaseQuantity(item._id))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition"
                      title="Diminuer"
                    >
                      <FaMinus size={12} />
                    </button>
                    
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => dispatch(increaseQuantity(item._id))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition"
                      title="Augmenter"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 transition"
                  >
                    <FaTrash />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </div>

              {/* Sous-total item */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                <span className="text-sm text-gray-500 sm:mb-2">Sous-total</span>
                <span className="font-bold text-lg text-gray-900">
                  {(item.price * item.quantity).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          ))}

          {/* Bouton vider le panier */}
          <button
            onClick={() => {
              if (window.confirm("Voulez-vous vraiment vider le panier ?")) {
                dispatch(clearCart());
              }
            }}
            className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <FaTrash />
            Vider le panier
          </button>
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Récapitulatif de commande
            </h2>

            {/* Code promo */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code promo
              </label>
              
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && handleApplyPromo()}
                    placeholder="Ex: WELCOME10"
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Appliquer
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-green-700">{appliedPromo.code}</p>
                    <p className="text-sm text-green-600">{appliedPromo.description}</p>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-red-500 hover:text-red-700"
                    title="Retirer"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              
              {promoError && (
                <p className="text-red-500 text-sm mt-2">{promoError}</p>
              )}
            </div>

            {/* Détails du prix */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Sous-total</span>
                <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction ({appliedPromo.code})</span>
                  <span className="font-semibold">-{discountAmount.toLocaleString()} FCFA</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Frais de livraison</span>
                <span className={`font-semibold ${shippingCost === 0 ? "text-green-600" : ""}`}>
                  {shippingCost === 0 ? "GRATUIT" : `${shippingCost.toLocaleString()} FCFA`}
                </span>
              </div>

              {shippingCost > 0 && (
                <p className="text-xs text-gray-500">
                  💡 Livraison gratuite à partir de 50 000 FCFA
                </p>
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total à payer</span>
                <span className="text-2xl font-bold text-blue-600">
                  {total.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Passer la commande
              </button>
              
              <button
                onClick={() => navigate("/products")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition"
              >
                Continuer mes achats
              </button>
            </div>

            {/* Options de livraison */}
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span>Livraison à Dakar en 2-3 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💳</span>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span>Retour sous 14 jours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message de confiance */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔒 Paiement 100% sécurisé
        </h3>
        <p className="text-gray-600">
          Vos informations sont protégées et sécurisées. Nous acceptons les paiements à la livraison, Wave, Orange Money et Free Money.
        </p>
      </div>
    </div>
  );
};

export default Cart;