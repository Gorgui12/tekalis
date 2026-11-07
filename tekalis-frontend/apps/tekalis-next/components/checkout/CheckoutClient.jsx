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
      <h1 className="text-3xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-2 text-center">
        Finaliser ma commande
      </h1>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-8 text-center">
        Aucun compte requis : renseignez vos coordonnées de livraison et validez.
      </p>
      <CheckoutForm />
    </div>
  );
};

export default Checkout;







