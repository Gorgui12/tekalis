import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../../../packages/shared/redux/slices/orderSlice";
import { clearCart } from "../../../../packages/shared/redux/slices/cartSlice";
import { FaCheckCircle, FaLock, FaTruck } from "react-icons/fa";
import { useToast } from '../../../../packages/shared/context/ToastContext'; // ✅ CORRECT
import useErrorHandler from '../../../../packages/shared/hooks/useAuth'; // ✅ AJOUTÉ
import Button from '../../src/components/shared/Button'; // ✅ AJOUTÉ
import LoadingSpinner from '../../../../packages/shared/hooks/useErrorHandler'; // ✅ AJOUTÉ
import EmptyState from '../../src/components/shared/EmptyState'; // ✅ AJOUTÉ
import { validatePhone } from '../../../../packages/shared/outils/validators'; // ✅ AJOUTÉ

const Checkout = () => {
  const toast = useToast();
  const { handleError } = useErrorHandler(); // ✅ AJOUTÉ
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.orders);
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

  const [errors, setErrors] = useState({}); // ✅ AJOUTÉ
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingCost = totalPrice >= 50000 ? 0 : 2500;
  const finalTotal = totalPrice + shippingCost;

  // ✅ AMÉLIORÉ - Validation complète
  const validateForm = () => {
    const newErrors = {};
    const { deliveryName, deliveryPhone, deliveryAddress } = deliveryData;
    
    if (!deliveryName.trim()) {
      newErrors.deliveryName = "Veuillez entrer votre nom complet";
    } else if (deliveryName.trim().length < 2) {
      newErrors.deliveryName = "Le nom doit contenir au moins 2 caractères";
    }

    const phoneValidation = validatePhone(deliveryPhone);
    if (!phoneValidation.isValid) {
      newErrors.deliveryPhone = phoneValidation.errors[0];
    }
    
    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Veuillez entrer votre adresse de livraison";
    } else if (deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress = "L'adresse doit contenir au moins 10 caractères";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.warning("Veuillez corriger les erreurs dans le formulaire");
      return false;
    }

    return true;
  };

  // Confirmer la commande
  const handleConfirmOrder = async () => {
    if (!validateForm()) {
      setShowConfirmModal(false); // ✅ AJOUTÉ
      return;
    }

    setShowConfirmModal(false);
    setIsProcessing(true);

    try {
      const orderData = {
        products: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: finalTotal,
        shippingCost: shippingCost,
        paymentMethod: "cash",
        ...deliveryData
      };

      const action = await dispatch(createOrder(orderData));
      
      if (!action?.payload?._id) {
        throw new Error("Erreur lors de la création de la commande");
      }

      const orderNumber = action.payload.orderNumber;

      dispatch(clearCart());
      
      // ✅ CORRIGÉ - Toast plus clair
      toast.success(`Commande ${orderNumber} enregistrée avec succès !`, 5000, {
        title: "Commande créée",
        action: {
          label: "Voir mes commandes",
          onClick: () => navigate("/orders")
        }
      });
      
      navigate("/orders");

    } catch (err) {
      handleError(err, { // ✅ CORRIGÉ
        customMessage: "Erreur lors de la création de la commande"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ CORRIGÉ - Utilise EmptyState
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 mt-20">
        <EmptyState
          icon="🛒"
          title="Votre panier est vide"
          description="Ajoutez des produits pour passer commande"
          actionText="Découvrir nos produits"
          actionLink="/products"
        />
      </div>
    );
  }

  // ✅ AJOUTÉ - Classes pour inputs avec erreurs
  const inputClasses = (field) => `
    w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition
    ${errors[field]
      ? 'border-red-500 focus:ring-red-500 bg-red-50'
      : 'border-gray-300 focus:ring-blue-500'
    }
  `;

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
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaTruck className="text-blue-600 text-2xl" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations de livraison
                </h2>
              </div>

              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={deliveryData.deliveryName}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryName: e.target.value })}
                    placeholder="Ex: Ousmane Diallo"
                    className={inputClasses('deliveryName')}
                  />
                  {/* ✅ AJOUTÉ */}
                  {errors.deliveryName && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryName}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={deliveryData.deliveryPhone}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryPhone: e.target.value })}
                    placeholder="Ex: 77 123 45 67"
                    className={inputClasses('deliveryPhone')}
                  />
                  {/* ✅ AJOUTÉ */}
                  {errors.deliveryPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryPhone}</p>
                  )}
                </div>

                {/* Ville et Région */}
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

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <textarea
                    value={deliveryData.deliveryAddress}
                    onChange={(e) => setDeliveryData({ ...deliveryData, deliveryAddress: e.target.value })}
                    placeholder="Ex: Cité Keur Gorgui, Villa n°123, près de la pharmacie"
                    rows={3}
                    className={inputClasses('deliveryAddress')}
                  ></textarea>
                  {/* ✅ AJOUTÉ */}
                  {errors.deliveryAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
                  )}
                </div>
              </div>

              {/* Mode de paiement */}
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
                      Vous paierez en espèces lors de la réception
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ CORRIGÉ - Utilise Button component */}
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={loading || isProcessing}
                isLoading={loading || isProcessing}
                variant="primary"
                size="lg"
                fullWidth
                icon={<FaCheckCircle />}
                className="mt-6"
              >
                Confirmer ma commande
              </Button>

              {/* Note paiement en ligne */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  💳 <strong>Paiements en ligne bientôt disponibles</strong> : Wave, Orange Money, Free Money
                </p>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
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
                {/* ✅ CORRIGÉ - Utilise Button component */}
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  variant="secondary"
                  fullWidth
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  disabled={loading || isProcessing}
                  isLoading={loading || isProcessing}
                  variant="success"
                  fullWidth
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;