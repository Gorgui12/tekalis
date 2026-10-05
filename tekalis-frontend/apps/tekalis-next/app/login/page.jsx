import { Suspense } from "react";
import LoginClient from "@/components/auth/LoginClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Page privee : indexable par robots.txt (pour que Google puisse LIRE le noindex)
// mais noindex, nofollow dans le HTML.
export const metadata = buildPrivateMetadata(
  '/login',
  'Connexion',
  'Connectez-vous a votre compte Tekalis pour suivre vos commandes et vos garanties.'
);

// Suspense requis : LoginClient utilise useSearchParams() (pour lire le
// ?redirect=... posé par middleware.js), et Next.js exige un fallback
// de suspense autour de tout composant client qui l'utilise, sous peine
// d'échec du build statique.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
