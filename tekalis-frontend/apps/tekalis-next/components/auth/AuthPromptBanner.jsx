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
      className="fixed z-[70] left-0 right-0 bottom-[var(--consent-banner-h,0px)] px-3 pb-3 lg:left-auto lg:right-4 lg:top-28 lg:bottom-auto lg:w-[360px] lg:px-0 lg:pb-0 animate-slide-up"
    >
      <div className="relative bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-elevated p-4 sm:p-5">
        <button
          type="button"
          onClick={() => {
            trackPromptDismissed({ reason, source });
            onClose();
          }}
          aria-label="Fermer"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition"
        >
          <FaTimes size={16} />
        </button>

        <p className="pr-8 text-sm sm:text-base font-semibold text-surface-900 dark:text-white leading-snug">
          {title}
          {subtitle && (
            <span className="block font-normal text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              {subtitle}
            </span>
          )}
        </p>

        <div className="mt-3 flex justify-center">
          <div className="w-full min-w-0 max-w-[320px]">
            <GoogleButton
              onCredential={handleCredential}
              text="Continuer avec Google"
            />
          </div>
        </div>

        {busy && (
          <p className="mt-2 text-center text-xs text-surface-400">Connexion en cours…</p>
        )}
      </div>
    </div>
  );
}