import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";

export const metadata = {
  title: "Mot de passe oublié | Tekalis",
  description:
    "Mot de passe oublié ? Recevez un lien de réinitialisation par email pour retrouver l'accès à votre compte Tekalis.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
