import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";
import { buildPrivateMetadata } from '@/lib/seo/metadata';

// Flux de récupération de mot de passe : noindex, nofollow.
export const metadata = buildPrivateMetadata(
  '/forgot-password',
  'Mot de passe oublié',
  "Mot de passe oublié ? Recevez un lien de réinitialisation par email pour retrouver l'accès à votre compte Tekalis."
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
