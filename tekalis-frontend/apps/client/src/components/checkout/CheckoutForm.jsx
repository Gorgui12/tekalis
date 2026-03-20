// CheckoutForm.jsx
// Ce composant orchestre les étapes du checkout.
// Il remplace l'ancienne version qui appelait localhost:5000 directement.
//
// Usage dans Checkout.jsx :
//   <CheckoutForm />

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../../../../packages/shared/redux/slices/cartSlice";
import { useToast } from "../../../../../packages/shared/context/ToastContext";
import api from "../../../../../packages/shared/api/client"; // ← instance axios centralisée

import CheckoutSteps from "./CheckoutSteps";
import DeliveryForm from "./DeliveryForm";
import PaymentMethods from "./PaymentMethods";
import OrderSummary from "./OrderSummary";

const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { items, totalAmount } = useSelector(state => state.cart);
  const { token, user } = useSelector(state => state.auth);

  const [step, setStep] = useState(2); // 1=cart (géré ailleurs), 2=livraison, 3=paiement
  const [deliveryData, setDeliveryData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ─── Étape 2 → 3 ─────────────────────────────────────────────────────────
  const handleDeliveryNext = (data) => {
    setDeliveryData(data);
    setStep(3);
  };

  // ─── Paiement final ───────────────────────────────────────────────────────
  const handlePay = async (paymentInfo) => {
    setPaymentLoading(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity || 1,
          price: item.price
        })),
        shippingAddress: deliveryData.address,
        deliveryMode: deliveryData.deliveryMode.id,
        deliveryFee: deliveryData.deliveryMode.price,
        totalAmount: totalAmount + deliveryData.deliveryMode.price,
        payment: {
          method: paymentInfo.method,
          reference: paymentInfo.reference,
          phone: paymentInfo.phone
        }
      };

      const response = await api.post("/orders", orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(clearCart());
      toast.success("Commande passée avec succès ! 🎉");
      navigate(`/dashboard/orders/${response.data.order._id}`, { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors du paiement. Réessayez.";
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  // ─── Guard : panier vide ──────────────────────────────────────────────────
  if (!items || items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Barre de progression */}
      <CheckoutSteps currentStep={step} />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {step === 2 && (
            <DeliveryForm
              onNext={handleDeliveryNext}
              savedAddresses={user?.addresses || []}
            />
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Retour livraison */}
              <button
                onClick={() => setStep(2)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                ← Modifier la livraison
              </button>

              <PaymentMethods
                onPay={handlePay}
                totalAmount={totalAmount + (deliveryData?.deliveryMode?.price || 0)}
                loading={paymentLoading}
              />
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <OrderSummary
            deliveryFee={deliveryData?.deliveryMode?.price || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;