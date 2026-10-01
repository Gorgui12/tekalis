"use client";

/**
 * components/auth/AuthPromptHost.jsx
 *
 * Point d'entrée unique des invitations automatiques à créer un compte.
 * Monté une fois dans app/layout.jsx, il :
 *   1. remonte le contexte d'intention du visiteur à lib/authPrompt.js
 *      (panier non vide, nombre de fiches produits vues, visites) ;
 *   2. déclenche au plus une invitation par session (plafonds et
 *      exclusions sont appliqués dans lib/authPrompt.js) ;
 *   3. rend la modale, ou la ferme si le visiteur s'authentifie entre-temps.
 *
 * Déclencheurs automatiques :
 *   - engagement : 45 s sur une fiche produit avec un signal d'intention ;
 *   - intention de sortie : la souris sort par le haut de la fenêtre
 *     (desktop uniquement — sur tactile, le signal n'existe pas et le
 *     déclenchement serait purement aléatoire).
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import {
  ENGAGEMENT_DELAY_MS,
  canPrompt,
  markEngagement,
  notePromptShown,
  openAuthPrompt,
  optOutAuthPrompt,
  subscribeAuthPrompt,
  trackPromptDismissed,
} from "@/lib/authPrompt";

export default function AuthPromptHost() {
  const pathname = usePathname();
  const user      = useSelector((state) => state.auth?.user);
  const items     = useSelector((state) => state.cart?.items);
  const wishlist  = useSelector((state) => state.wishlist?.items);
  const [prompt, setPrompt] = useState(null);

  // ── Contexte d'intention ─────────────────────────────────────
  useEffect(() => {
    markEngagement({
      cartCount: items?.length || 0,
      wishlistCount: wishlist?.length || 0,
      path: pathname,
    });
  }, [items?.length, wishlist?.length, pathname]);

  // ── Abonnement au bus ───────────────────────────────────────
  useEffect(
    () =>
      subscribeAuthPrompt((payload) => {
        if (!canPrompt({ source: payload.source, requireIntent: true })) return;
        notePromptShown(payload.source);
        setPrompt(payload);
      }),
    []
  );

  // ── Intention de sortie (desktop) ────────────────────────────
  useEffect(() => {
    if (user || prompt) return;
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    if (!finePointer?.matches) return;

    const onMouseOut = (event) => {
      // relatedTarget non nul = la souris reste dans la page ; clientY > 0
      // = elle sort par le bas ou sur les côtés, pas par l' haut.
      if (event.relatedTarget || event.clientY > 0) return;
      openAuthPrompt({ reason: "exit", source: "auto" });
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, [user, prompt]);

  // ── Engagement sur une fiche produit ─────────────────────────
  useEffect(() => {
    if (user || prompt) return;
    const timer = setTimeout(() => {
      openAuthPrompt({ reason: "engagement", source: "auto" });
    }, ENGAGEMENT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname, user, prompt]);

  if (!prompt) return null;

  return (
    <AuthPromptModal
      isOpen
      icon={prompt.icon}
      title={prompt.title}
      subtitle={prompt.subtitle}
      bullets={prompt.bullets}
      reason={prompt.reason}
      source={prompt.source}
      onClose={() => {
        trackPromptDismissed({ reason: prompt.reason, source: prompt.source });
        setPrompt(null);
      }}
      onOptOut={() => {
        optOutAuthPrompt();
        trackPromptDismissed({ reason: prompt.reason, source: prompt.source });
        setPrompt(null);
      }}
    />
  );
}