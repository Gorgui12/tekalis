import MyWarrantiesClient from "@/components/account/MyWarrantiesClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Sous-page de l'espace client : contenu personnel -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/dashboard/warranties',
  'Mes garanties',
  'Consultez les garanties constructeur de vos produits Tekalis.'
);

export default function WarrantiesPage() {
  return <MyWarrantiesClient />;
}
