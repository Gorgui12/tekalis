/**
 * Checkout.jsx
 * Délègue entièrement à CheckoutForm qui contient l'architecture complète :
 * DeliveryForm → PaymentMethods → OrderSummary
 * avec gestion des adresses sauvegardées, modes de livraison, etc.
 */
import CheckoutForm from "@/components/checkout/CheckoutForm";
import PageMeta from "@/components/seo/PageMeta";

const Checkout = () => {
  return (
    <>
      <PageMeta
        title="Finaliser ma commande | Tekalis"
        description="Finalisez votre commande Tekalis. Livraison rapide à Dakar, paiement sécurisé Wave, Orange Money ou à la livraison."
        noindex={true}
      />
      <div className="container mx-auto px-4 py-8 mt-24 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Finaliser ma commande
        </h1>
        <CheckoutForm />
      </div>
    </>
  );
};

export default Checkout;







