import CheckoutClient from "@/components/checkout/CheckoutClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Checkout : URL de transaction, jamais indexee.
export const metadata = buildPrivateMetadata(
  '/checkout',
  'Finaliser la commande',
  'Finalisez votre commande Tekalis : renseignez votre adresse de livraison et choisissez votre moyen de paiement.'
);

export default function CheckoutPage() {
  return <CheckoutClient />;
}
