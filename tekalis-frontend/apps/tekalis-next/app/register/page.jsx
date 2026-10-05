import { Suspense } from 'react';
import RegisterClient from "@/components/auth/RegisterClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Page privee : noindex, nofollow porte par le HTML (et non par robots.txt,
// qui doit rester lisible par Google pour que le noindex soit applique).
export const metadata = buildPrivateMetadata(
  '/register',
  'Créer un compte Tekalis',
  'Créez votre compte Tekalis : suivez vos commandes, vos garanties et vos factures.'
);

// Suspense requis : RegisterClient utilise useSearchParams() (pour lire le
// ?redirect=... posé par middleware.js). Sans cette frontière, Next.js abandonne
// le rendu serveur de toute la page.
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
