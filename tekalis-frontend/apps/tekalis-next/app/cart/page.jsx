import CartClient from "@/components/cart/CartClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Panier : URL personnelle et sans valeur de recherche -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/cart',
  'Mon panier',
  'Retrouvez les produits que vous avez sélectionnés avant de finaliser votre commande.'
);

export default function CartPage() {
  return (
    <>
      {/* Page sans <h1> : la hierarchie de titres est incomplete, meme en noindex. */}
      <h1 className="sr-only">Mon panier</h1>
      <CartClient />
    </>
  );
}
