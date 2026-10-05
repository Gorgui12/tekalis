import ProfileClient from "@/components/account/ProfileClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Profil : donnees personnelles -> noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/profile',
  'Mon profil',
  'Gérez vos informations personnelles et vos adresses de livraison sur Tekalis.'
);

export default function ProfilePage() {
  return <ProfileClient />;
}
