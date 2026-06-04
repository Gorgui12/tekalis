"use client";

/**
 * CheckoutForm.jsx — Tunnel de commande Tekalis
 *
 * FIX 400 "Aucun produit dans la commande" :
 *   - Le backend attend `products` (tableau), pas `items`
 *   - L'adresse est aplatie (deliveryName, deliveryPhone, etc.)
 *   - Le total s'appelle `totalPrice` côté backend
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "@/store/slices/cartSlice";
import { useToast } from "@/components/shared/ToastProvider";
import api from "../../../../../packages/shared/api/api";

import CheckoutSteps from "./CheckoutSteps";
import DeliveryForm from "./DeliveryForm";
import PaymentMethods from "./PaymentMethods";
import OrderSummary from "./OrderSummary";
import { useRouter } from "next/navigation";

const CheckoutForm = () => {
  const dispatch    = useDispatch();
  const navigate    = const router = useRouter()
router.push();
  const toast       = useToast();

  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user }               = useSelector((state) => state.auth);

  const [step,           setStep]           = useState(2);
  const [deliveryData,   setDeliveryData]   = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ── Étape 2 → 3 ──────────────────────────────────────────────────────────
  const handleDeliveryNext = (data) => {
    setDeliveryData(data);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Soumission finale ─────────────────────────────────────────────────────
  const handlePay = async (_paymentInfo) => {
    setPaymentLoading(true);
    try {
      const deliveryFee      = deliveryData?.deliveryMode?.price ?? 0;
      const totalWithDelivery = totalAmount + deliveryFee;

      // ✅ Champ "products" — ce que le backend Tekalis valide
      const products = items.map((item) => ({
        product:  item._id,
        quantity: item.quantity || 1,
        price:    item.price,
        name:     item.name,
      }));

      // ✅ Payload complet correspondant au schéma Order du backend
      const orderPayload = {
        products,                                              // ← champ validé par le backend

        // Adresse aplatie
        deliveryName:    deliveryData.address.fullName,
        deliveryPhone:   deliveryData.address.phone,
        deliveryAddress: deliveryData.address.address,
        deliveryCity:    deliveryData.address.city    || "Dakar",
        deliveryRegion:  deliveryData.address.region  || "Dakar",

        // Livraison
        deliveryMode: deliveryData.deliveryMode?.id ?? "standard",
        shippingCost: deliveryFee,

        // Totaux — le backend utilise "totalPrice"
        totalPrice: totalWithDelivery,

        // Paiement
        paymentMethod: "cash",
        paymentStatus: "pending",
      };

      // Log dev pour vérifier le payload
      if (import.meta.env.DEV) {
        console.log("📦 Payload commande →", JSON.stringify(orderPayload, null, 2));
      }

      const response = await api.post("/orders", orderPayload);

      dispatch(clearCart());
      toast.success("Commande passée avec succès ! 🎉");

      const orderId =
        response.data?.order?._id ||
        response.data?._id        ||
        response.data?.orderId;

      navigate(
        orderId ? `/dashboard/orders/${orderId}` : "/dashboard/orders",
        { replace: true }
      );
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Erreur lors de la commande. Réessayez.";
      toast.error(msg);
      throw new Error(msg); // affiché inline dans PaymentMethods
    } finally {
      setPaymentLoading(false);
    }
  };

  // ── Guard panier vide ─────────────────────────────────────────────────────
  if (!items || items.length === 0) {
    navigate("/cart");
    return null;
  }

  const deliveryFee       = deliveryData?.deliveryMode?.price ?? 0;
  const totalWithDelivery = totalAmount + deliveryFee;

  return (
    <div className="space-y-8">
      <CheckoutSteps currentStep={step} />

      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Formulaire principal */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

          {/* ── Étape 2 : Livraison ── */}
          {step === 2 && (
            <DeliveryForm
              onNext={handleDeliveryNext}
              savedAddresses={user?.addresses || []}
            />
          )}

          {/* ── Étape 3 : Paiement ── */}
          {step === 3 && (
            <div className="space-y-5">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                ← Modifier la livraison
              </button>

              {/* Récap adresse */}
              {deliveryData?.address && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Livraison à
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {deliveryData.address.fullName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deliveryData.address.phone}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deliveryData.address.address}, {deliveryData.address.city}
                  </p>
                  {deliveryData.deliveryMode && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                      {deliveryData.deliveryMode.label}
                      {deliveryData.deliveryMode.price > 0
                        ? ` — ${deliveryData.deliveryMode.price.toLocaleString()} FCFA`
                        : " — Gratuit"}
                    </p>
                  )}
                </div>
              )}

              <PaymentMethods
                onPay={handlePay}
                totalAmount={totalWithDelivery}
                loading={paymentLoading}
              />
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <OrderSummary deliveryFee={deliveryFee} />
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;



