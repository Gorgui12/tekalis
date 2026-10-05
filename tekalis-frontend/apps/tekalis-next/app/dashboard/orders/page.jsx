import MyOrdersClient from "@/components/account/MyOrdersClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Sous-page de l'espace client : contenu personnel -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/dashboard/orders',
  'Mes commandes',
  'Suivez l\'état de vos commandes Tekalis, du paiement à la livraison.'
);

export default function OrdersPage() {
  return <MyOrdersClient />;
}
