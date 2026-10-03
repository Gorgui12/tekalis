import VerifyEmailClient from "@/components/auth/VerifyEmailClient";

export const metadata = {
  title: "Vérifier votre adresse email | Tekalis",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
