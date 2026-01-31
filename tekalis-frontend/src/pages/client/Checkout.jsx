import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../redux/slices/orderSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import { FaCheckCircle, FaLock, FaTruck } from "react-icons/fa";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.orders);
  const cart = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalAmount);

  // Données de livraison
  const [deliveryData, setDeliveryData] = useState({
    deliveryName: "",
    deliveryPhone: "",
    deliveryAddress: "",
    deliveryCity: "Dakar",
    deliveryRegion: "Dakar"
  });

  // Modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // État de traitement
  const [isProcessing, setIsProcessing] = useState(false);

  // Frais de livraison
  const shippingCost = totalPrice >= 50000 ? 0 : 2500;
  const finalTotal = totalPrice + shippingCost;

  // Validation
  const validateForm = () => {
    const { deliveryName, deliveryPhone, deliveryAddress } = deliveryData;
    
    if (!deliveryName.trim()) {
      alert("Veuillez entrer votre nom complet");
      return false;
    }
    if (!deliveryPhone.trim() || deliveryPhone.length < 9) {
      alert("Veuillez entrer un numéro de téléphone valide");
      return false;
    }
    if (!deliveryAddress.trim()) {
      alert("Veuillez entrer votre adresse de livraison");
      return false;
    }
    return true;
  };

  // Confirmer la commande
  const handleConfirmOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      // Créer la commande
      const orderData = {
        products: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: finalTotal,
        shippingCost: shippingCost,
        paymentMethod: "cash", // Paiement à la livraison uniquement
        ...deliveryData
      };

      const action = await dispatch(createOrder(orderData));
      
      if (!action?.payload?._id) {
        throw new Error("Erreur lors de la création de la commande");
      }

      const orderNumber = action.payload.orderNumber;

      // Vider le panier
      dispatch(clearCart());
      
      // Message de succès
      alert(`✅ Commande ${orderNumber} enregistrée avec succès !\n\nVous paierez à la réception de votre commande.\nNous vous contacterons sous 24h pour confirmer la livraison.`);
      
      // Rediriger vers les commandes
      navigate("/orders");

    } catch (err) {
      console.error("❌ Erreur lors de la commande:", err);
      
      let errorMessage = "Erreur lors de la création de la commande";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert("❌ " + errorMessage);
      
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Votre panier est vide</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser ma commande
          </h1>
          <p className="text-gray-600">
            Paiement sécurisé à la livraison
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire (2 colonnes) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaTruck className="text-blue-600 text-2xl" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations de livraison
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={deliveryData.deliveryName}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryName: e.target.value })}
                    placeholder="Ex: Ousmane Diallo"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={deliveryData.deliveryPhone}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryPhone: e.target.value })}
                    placeholder="Ex: 77 123 45 67"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <select
                      value={deliveryData.deliveryCity}
                      onChange={(e) => setDeliveryData({ ...deliveryData, deliveryCity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Dakar">Dakar</option>
                      <option value="Pikine">Pikine</option>
                      <option value="Guédiawaye">Guédiawaye</option>
                      <option value="Rufisque">Rufisque</option>
                      <option value="Thiès">Thiès</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Région *
                    </label>
                    <select
                      value={deliveryData.deliveryRegion}
                      onChange={(e) => setDeliveryData({ ...deliveryData, deliveryRegion: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Dakar">Dakar</option>
                      <option value="Thiès">Thiès</option>
                      <option value="Saint-Louis">Saint-Louis</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <textarea
                    value={deliveryData.deliveryAddress}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryAddress: e.target.value })}
                    placeholder="Ex: Cité Keur Gorgui, Villa n°123, près de la pharmacie"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
              </div>

              {/* Mode de paiement fixe */}
              <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    💵
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Paiement à la livraison
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vous paierez en espèces lors de la réception de votre commande
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton de confirmation */}
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={loading || isProcessing}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(loading || isProcessing) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Confirmer ma commande</span>
                  </>
                )}
              </button>

              {error && (
                <p className="text-center text-red-500 mt-4">
                  ❌ Erreur : {error}
                </p>
              )}

              {/* Note paiement en ligne */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  💳 <strong>Paiements en ligne bientôt disponibles</strong> : Wave, Orange Money, Free Money
                </p>
              </div>
            </div>
          </div>

          {/* Récapitulatif (1 colonne) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📋 Récapitulatif
              </h3>

              {/* Produits */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-3 text-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-gray-600">Qté: {item.quantity}</p>
                      <p className="font-semibold text-blue-600">
                        {(item.price * item.quantity).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span className="font-semibold">
                    {totalPrice.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span className={`font-semibold ${shippingCost === 0 ? "text-green-600" : ""}`}>
                    {shippingCost === 0 ? "GRATUIT" : `${shippingCost.toLocaleString()} FCFA`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t">
                  <span>Total</span>
                  <span>{finalTotal.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Badges de confiance */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaLock className="text-green-600" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTruck className="text-blue-600" />
                  <span>Livraison rapide sous 2-3 jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <span>Garantie satisfait ou remboursé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmation */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Confirmer la commande</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode de paiement:</span>
                  <span className="font-semibold text-green-600">
                    Paiement à la livraison 💵
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total à payer:</span>
                  <span className="font-bold text-blue-600 text-xl">
                    {finalTotal.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important :</strong> Préparez le montant exact pour faciliter la livraison.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {(loading || isProcessing) ? "..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;