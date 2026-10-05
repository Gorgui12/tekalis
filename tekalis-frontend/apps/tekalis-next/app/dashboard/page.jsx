import DashboardClient from "@/components/account/DashboardClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Espace client : protege par middleware.js, contenu personnel -> noindex.
export const metadata = buildPrivateMetadata(
  '/dashboard',
  'Mon espace client',
  'Suivez vos commandes, vos garanties et vos demandes de retour sur votre espace Tekalis.'
);

export default function DashboardPage() {
  return <DashboardClient />;
}
