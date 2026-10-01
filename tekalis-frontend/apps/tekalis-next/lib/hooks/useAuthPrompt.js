"use client";

/**
 * lib/hooks/useAuthPrompt.js
 *
 * Logique partagée par la carte inline et la modale d'invitation :
 * envoi de l'ID token Google au backend, message de retour, tracking.
 *
 * Le backend crée le compte s'il n'existe pas déjà (authController
 * googleLogin renvoie `isNewAccount`), donc un seul bouton couvre les
 * deux cas « je crée mon compte » et « je me connecte ».
 */

import { useState } from "react";
import useAuth from "@/lib/hooks/useAuth";
import { useToast } from "@/components/shared/ToastProvider";
import { trackAuthSuccess } from "@/lib/authPrompt";

export default function useAuthPrompt({ reason, source, onSuccess }) {
  const { googleLogin } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handleCredential = async (credential) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await googleLogin(credential);

      if (result.success) {
        const { user, isNewAccount } = result.data;
        trackAuthSuccess({ reason, source, isNewAccount });
        toast.success(
          isNewAccount
            ? `Compte créé. Bienvenue ${user?.name || ""} !`
            : `Bienvenue ${user?.name || "utilisateur"} !`
        );
        onSuccess?.(result.data);
        return { success: true, data: result.data };
      }

      const payload = result.error;
      const message =
        (typeof payload === "object" ? payload?.message : payload) ||
        "Connexion Google impossible pour le moment";
      toast.error(message);
      return { success: false };
    } finally {
      setBusy(false);
    }
  };

  return { handleCredential, busy };
}