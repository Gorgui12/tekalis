"use client";

/**
 * components/auth/AuthPromptCard.jsx
 *
 * Carte d'invitation à créer un compte, affichée EN DANS le parcours :
 * panier, favoris, confirmation de commande, CTA de l'accueil.
 *
 * Pourquoi une carte et pas une modale : le compte est obligatoire pour
 * commander sur Tekalis (le middleware protège /checkout), donc le
 * visiteur va forcément être invité à s'authentifier. Autant le faire
 * au moment où son panier contient des articles, avec le bouton Google
 * en premier — il est alors le chemin le plus court vers la commande.
 *
 * La carte disparaît complètement si le visiteur est déjà connecté ou si
 * Google n'est pas configuré : aucun module vide ne doit subsister.
 *
 * @param {string}  reason      clé de PROMPT_REASONS (lib/authPrompt.js)
 * @param {string}  source      origine du déclenchement, pour le tracking
 * @param {string}  className   classes supplémentaires du conteneur
 * @param {Function} onSuccess  appelé après une connexion réussie
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import GoogleButton from "@/components/auth/GoogleButton";
import { PROMPT_ICONS } from "@/components/auth/promptIcons";
import useAuthPrompt from "@/lib/hooks/useAuthPrompt";
import { isGoogleConfigured } from "@/lib/googleIdentity";
import {
  PROMPT_REASONS,
  canPrompt,
  isAuthenticated,
  trackPromptFallback,
  trackPromptViewed,
} from "@/lib/authPrompt";

export default function AuthPromptCard({
  reason = "home",
  source = reason,
  className = "",
  onSuccess,
}) {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  const config = PROMPT_REASONS[reason] || PROMPT_REASONS.home;

  const { handleCredential, busy } = useAuthPrompt({
    reason,
    source,
    onSuccess: (data) => {
      setDone(true);
      onSuccess?.(data);
    },
  });

  // L'éligibilité dépend du localStorage et de l'URL : elle ne peut être
  // décidée qu'après le montage, sinon le serveur et le client
  // s'afficheraient différemment (hydratation).
  useEffect(() => {
    if (!isGoogleConfigured() || isAuthenticated()) return;
    if (!canPrompt({ source: "card" })) return;
    setVisible(true);
    trackPromptViewed({ reason, source });
  }, [reason, source]);

  if (!visible) return null;

  // ── Confirmation : le compte existe, on propose la suite ──
  if (done) {
    return (
      <div
        className={`bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 ${className}`}
      >
        <p className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
          <FaCheckCircle /> Votre compte est prêt
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={reason === "order" ? "/dashboard/orders" : "/dashboard"}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
          >
            {reason === "order" ? "Suivre ma commande" : "Mon espace"}
          </Link>
          <Link
            href={reason === "cart" ? "/checkout" : "/products"}
            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 px-4 py-2 rounded-xl font-semibold text-sm transition"
          >
            {reason === "cart" ? "Finaliser ma commande" : "Continuer mes achats"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-surface-800 rounded-2xl border border-brand-100 dark:border-surface-700 shadow-card p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xl">
          {PROMPT_ICONS[config.icon] || PROMPT_ICONS.user}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold font-display text-surface-900 dark:text-white text-lg leading-snug">
            {config.title}
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {config.subtitle}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {config.bullets.map((b) => (
          <li
            key={b.text}
            className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300"
          >
            <span className="flex-shrink-0">{PROMPT_ICONS[b.icon] || PROMPT_ICONS.bolt}</span>
            {b.text}
          </li>
        ))}
      </ul>

      {/* Le SDK Google remplace ce conteneur par son iframe : largeur bornée. */}
      <div className="mt-5 flex justify-center">
        <GoogleButton
          onCredential={handleCredential}
          text={reason === "order" ? "Créer mon compte avec Google" : "S'inscrire avec Google"}
        />
      </div>

      <div className="mt-3 text-center">
        <Link
          href="/register"
          onClick={() => trackPromptFallback({ reason, source })}
          className="text-xs text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition"
        >
          Préférer mon email&nbsp;? Créer un compte
        </Link>
      </div>

      {busy && (
        <p className="mt-2 text-center text-xs text-surface-400">Connexion en cours…</p>
      )}
    </div>
  );
}