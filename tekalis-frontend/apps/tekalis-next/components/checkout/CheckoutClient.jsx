/**
 * Checkout.jsx
 * Délègue entièrement à CheckoutForm qui contient l'architecture complète :
 * DeliveryForm → PaymentMethods → OrderSummary
 * avec gestion des adresses sauvegardées, modes de livraison, etc.
 */
"use client";

import CheckoutForm from "@/components/checkout/CheckoutForm";

const Checkout = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-24 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Finaliser ma commande
      </h1>
      <CheckoutForm />
    </div>
  );
};

export default Checkout;







