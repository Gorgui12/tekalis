"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, grantConsent, revokeConsent, CONSENT } from "@/lib/analytics";

/**
 * Bannière de consentement cookies (Modal style) — affichée tant que
 * l'utilisateur n'a pas fait de choix. Le choix est mémorisé en localStorage.
 * Rien (Pixel/GA4) n'est chargé avant une acceptation explicite.
 */
const ConsentBanner = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() === CONSENT.PENDING) setOpen(true);
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    grantConsent();
    setOpen(false);
  };

  const rejectAll = () => {
    revokeConsent();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
          🍪 Vos données, votre choix
        </h2>

        <p className="text-sm text-surface-600 dark:text-surface-300 mb-5 leading-relaxed">
          Nous utilisons des cookies et outils de mesure d&apos;audience
          (Meta Pixel, Google Analytics) pour améliorer votre expérience et
          mesurer nos campagnes. Vous pouvez accepter ou refuser ces traceurs.
          Sans votre accord, aucun pixel publicitaire n&apos;est chargé.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={acceptAll}
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold transition shadow-sm"
          >
            Tout accepter
          </button>
          <button
            onClick={rejectAll}
            className="flex-1 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 py-3 rounded-xl font-semibold transition"
          >
            Continuer sans accepter
          </button>
        </div>

        <p className="text-xs text-surface-500 dark:text-surface-400 text-center">
          <Link href="/cookies" className="underline hover:text-brand-600">
            Politique de cookies
          </Link>{" "}
          •{" "}
          <Link href="/politique" className="underline hover:text-brand-600">
            Confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ConsentBanner;