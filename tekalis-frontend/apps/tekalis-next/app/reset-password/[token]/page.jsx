import ResetPasswordClient from "@/components/auth/ResetPasswordClient";

export const metadata = {
  title: "Réinitialiser le mot de passe | Tekalis",
  robots: { index: false },
};

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  return <ResetPasswordClient token={token} />;
}
