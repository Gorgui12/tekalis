import { Suspense } from "react";
import LoginClient from "@/components/auth/LoginClient";

export const metadata = { title: "Connexion | Tekalis" };

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
