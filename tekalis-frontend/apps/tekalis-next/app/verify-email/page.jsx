import { Suspense } from 'react';
import VerifyEmailClient from "@/components/auth/VerifyEmailClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Verification d'email : URL jetable, noindex.
export const metadata = buildPrivateMetadata(
  '/verify-email',
  'Vérifier votre adresse email',
  'Confirmez votre adresse email pour activer votre compte Tekalis.'
);

// Suspense requis : VerifyEmailClient utilise useSearchParams() pour lire le
// jeton de confirmation présent dans l'URL.
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailClient />
    </Suspense>
  );
}
