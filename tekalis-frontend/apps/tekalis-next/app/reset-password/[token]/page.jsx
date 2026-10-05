import ResetPasswordClient from "@/components/auth/ResetPasswordClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// URL avec token : jamais indexee, et le token ne doit pas fuiter dans une URL
// de resultat. Canonical sur la page nue, sans le token.
export const metadata = buildPrivateMetadata(
  '/reset-password',
  'Réinitialiser le mot de passe',
  'Choisissez un nouveau mot de passe pour votre compte Tekalis.'
);

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  return <ResetPasswordClient token={token} />;
}
