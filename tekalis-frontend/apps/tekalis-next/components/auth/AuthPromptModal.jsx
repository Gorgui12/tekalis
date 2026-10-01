"use client";

/**
 * components/auth/AuthPromptModal.jsx
 *
 * Modale d'invitation à créer un compte, déclenchée automatiquement par
 * AuthPromptHost (intention de sortie de page, engagement). Elle ne
 * s'affiche jamais sur les pages d'auth et respecte le plafond défini
 * dans lib/authPrompt.js.
 *
 * Elle réutilise le bouton Google en premier : sur mobile c'est le
 * parcours le plus rapide (compte déjà créé chez Google), et côté
 * conversion le « Se connecter avec Google » dominate toujours le
 * formulaire email.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import GoogleButton from "@/components/auth/GoogleButton";
import { PROMPT_ICONS } from "@/components/auth/promptIcons";
import useAuthPrompt from "@/lib/hooks/useAuthPrompt";
import { trackPromptFallback, trackPromptViewed } from "@/lib/authPrompt";

export default function AuthPromptModal({
  isOpen,
  icon = "user",
  title,
  subtitle,
  bullets = [],
  reason = "exit",
  source = "auto",
  onClose,
  onOptOut,
}) {
  const router = useRouter();

  // Après une inscription réussie, on ramène le visiteur là où il en
  // était : son panier s'il s'enfuyait avec un panier rempli, ses
  // favoris s'il venait d'en ajouter un.
  const SUCCESS_DESTINATION = {
    exit: "/cart",
    "wishlist-add": "/wishlist",
    engagement: "/products",
  };

  const { handleCredential, busy } = useAuthPrompt({
    reason,
    source,
    onSuccess: () => {
      onClose();
      router.push(SUCCESS_DESTINATION[source] || "/dashboard");
    },
  });

  // La vue est comptée à l'ouverture seulement (pas au rendu) pour ne pas
  // gonfler les métriques avec des rendus inutilisés.
  useEffect(() => {
    if (isOpen) trackPromptViewed({ reason, source });
  }, [isOpen, reason, source]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton
      footer={
        <button
          onClick={onOptOut}
          className="w-full text-center text-xs text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition"
        >
          Ne plus me proposer de créer un compte
        </button>
      }
    >
      <div className="pt-1">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-2xl mb-4">
          {PROMPT_ICONS[icon] || PROMPT_ICONS.user}
        </div>

        <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white leading-snug">
          {title}
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm leading-relaxed">
          {subtitle}
        </p>

        <ul className="mt-4 space-y-2">
          {bullets.map((b) => (
            <li
              key={b.text}
              className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300"
            >
              <span className="flex-shrink-0">{PROMPT_ICONS[b.icon] || PROMPT_ICONS.bolt}</span>
              {b.text}
            </li>
          ))}
        </ul>

        {/* Le SDK Google remplace le conteneur par son iframe. */}
        <div className="mt-6 flex justify-center">
          <GoogleButton
            onCredential={handleCredential}
            text="Continuer avec Google"
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
    </Modal>
  );
}