import AddressesClient from "@/components/account/AddressesClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Sous-page de l'espace client : contenu personnel -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/dashboard/addresses',
  'Mes adresses',
  'Gérez vos adresses de livraison sur Tekalis.'
);

export default function AddressesPage() {
  return <AddressesClient />;
}
