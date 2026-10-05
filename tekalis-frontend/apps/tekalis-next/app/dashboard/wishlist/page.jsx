import WishlistClient from "@/components/account/WishlistClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Sous-page de l'espace client : contenu personnel -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/dashboard/wishlist',
  'Mes favoris',
  'Retrouvez vos produits enregistrés sur votre compte Tekalis.'
);

export default function DashboardWishlistPage() {
  return <WishlistClient />;
}
