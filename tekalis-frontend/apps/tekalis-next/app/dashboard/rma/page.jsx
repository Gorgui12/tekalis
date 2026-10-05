import MyRMAClient from "@/components/account/MyRMAClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Sous-page de l'espace client : contenu personnel -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/dashboard/rma',
  'Mes demandes de retour',
  'Suivez vos demandes de retour et de remboursement Tekalis.'
);

export default function RMAPage() {
  return <MyRMAClient />;
}
