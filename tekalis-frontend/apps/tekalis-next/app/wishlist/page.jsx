import WishlistClient from "@/components/account/WishlistClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Favoris : contenu personnel, lie au compte -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/wishlist',
  'Mes favoris',
  'Retrouvez vos produits enregistrés sur votre compte Tekalis.'
);

export default function WishlistPage() {
  return <WishlistClient />;
}
