"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getConsent,
  grantConsent,
  revokeConsent,
  trackPageView,
  trackPageVisit,
  CONSENT,
  OPEN_CONSENT_EVENT,
} from "@/lib/analytics";

/**
 * Bannière de consentement cookies — bandeau bas d'écran, NON bloquant.
 *
 * Historique : la bannière était un overlay plein écran (`fixed inset-0`
 * + fond noir flouté) qui captait tous les clics tant que l'utilisateur
 * n'avait pas tranché. Un interstitial plein écran au premier écran
 * fait remonter le taux de rebond et masquait l'invite Google : c'est
 * exactement ce qu'on cherche à éviter ici.
 *
 * Elle est désormais ancrée en bas, sans fond de page ni capture des
 * clics en dehors du bandeau. Sa hauteur est exposée en variable CSS
 * (`--consent-banner-h`) pour que l'invite Google mobile se pose
 * juste au-dessus et ne soit jamais recouverte.
 */
const ConsentBanner = () => {
  const [open, setOpen] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (getConsent() === CONSENT.PENDING) setOpen(true);
  }, []);

  // Réouverture demandée depuis un autre composant (lien « Gérer mes cookies »).
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
  }, []);

  // Expose la hauteur réelle du bandeau au reste de l'UI.
  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.style.removeProperty("--consent-banner-h");
      return;
    }
    const el = bannerRef.current;
    const update = () =>
      root.style.setProperty("--consent-banner-h", `${el?.offsetHeight || 0}px`);
    update();
    const ro =
      typeof ResizeObserver !== "undefined" && el
        ? new ResizeObserver(update)
        : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--consent-banner-h");
    };
  }, [open]);

  if (!open) return null;

  const acceptAll = async () => {
    setOpen(false);
    await grantConsent();
    // Première mesure de la page courante (Scripts chargés + sessions).
    trackPageView();
    trackPageVisit();
  };

  const rejectAll = () => {
    revokeConsent();
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div
        ref={bannerRef}
        className="mx-auto max-w-4xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-elevated px-4 py-3 sm:px-6 sm:py-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-surface-900 dark:text-white mb-0.5">
              🍪 Vos données, votre choix
            </p>
            <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
              Nous utilisons des cookies et outils de mesure d&apos;audience
              (Meta Pixel, Google Analytics, Vercel Analytics) pour améliorer
              votre expérience et mesurer nos campagnes. Sans votre accord,
              aucun pixel publicitaire n&apos;est chargé.{" "}
              <Link href="/cookies" className="underline hover:text-brand-600">
                Politique de cookies
              </Link>{" "}
              •{" "}
              <Link
                href="/politique"
                className="underline hover:text-brand-600"
              >
                Confidentialité
              </Link>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={acceptAll}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm whitespace-nowrap"
            >
              Tout accepter
            </button>
            <button
              onClick={rejectAll}
              className="bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap"
            >
              Continuer sans accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
