"use client";

/**
 * components/auth/AuthPromptBanner.jsx
 *
 * Bandeau bas d'écran invitant à se connecter avec Google, affiché
 * automatiquement quelques secondes après l'arrivée d'un visiteur sur le
 * site (voir AuthPromptHost + LANDING_DELAY_MS dans lib/authPrompt.js).
 *
 * Contrairement à la modale (AuthPromptModal), il est volontairement léger :
 *   - il n'affiche qu'une accroche + le bouton Google ;
 *   - il ne bloque pas la page (pas d'overlay, scroll conservé) ;
 *   - il se referme au clic, sans « Ne plus me proposer » en pied de carte
 *     (ce choix reste disponible dans la modale et la carte inline).
 *
 * Il disparaît si le visiteur est déjà connecté ou si Google n'est pas
 * configuré, comme les autres composants d'invitation.
 */

import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import GoogleButton from "@/components/auth/GoogleButton";
import useAuthPrompt from "@/lib/hooks/useAuthPrompt";
import { trackPromptDismissed, trackPromptViewed } from "@/lib/authPrompt";

export default function AuthPromptBanner({
  isOpen,
  title,
  subtitle,
  reason = "landing",
  source = "landing",
  onClose,
}) {
  const { handleCredential, busy } = useAuthPrompt({
    reason,
    source,
    onSuccess: () => onClose(),
  });

  // Vue comptée à l'ouverture uniquement, comme pour la modale.
  useEffect(() => {
    if (isOpen) trackPromptViewed({ reason, source });
  }, [isOpen, reason, source]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed bottom-0 inset-x-0 z-40 animate-slide-up"
    >
      <div className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 shadow-elevated">
        <div className="max-w-6xl mx-auto pl-4 pr-20 sm:pl-6 sm:pr-28 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <p className="flex-1 min-w-0 text-sm sm:text-base font-semibold text-surface-900 dark:text-white leading-snug">
            {title}
            {subtitle && (
              <span className="block font-normal text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                {subtitle}
              </span>
            )}
          </p>

          <div className="flex items-center justify-center gap-2">
            <div className="min-w-0 max-w-[280px] sm:max-w-[340px]">
              <GoogleButton
                onCredential={handleCredential}
                text="Continuer avec Google"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                trackPromptDismissed({ reason, source });
                onClose();
              }}
              aria-label="Fermer"
              className="flex-shrink-0 p-2 rounded-full text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {busy && (
            <p className="text-center text-xs text-surface-400">Connexion en cours…</p>
          )}
        </div>
      </div>
    </div>
  );
}