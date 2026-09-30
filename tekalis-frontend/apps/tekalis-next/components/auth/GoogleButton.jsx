"use client";

/**
 * components/auth/GoogleButton.jsx
 *
 * Bouton « Continuer avec Google » rendu par Google Identity Services.
 *
 * Le SDK remplace le <div> conteneur par son propre iframe : on ne peut donc
 * pas le styler ni le mettre dans un <button>. On lui fournit un conteneur
 * vide et on le rend seulement une fois le SDK prêt, le composant se
 * responsable de l'état de chargement / erreur le temps du chargement.
 *
 * @param {(credential: string) => void} onCredential  callback avec l'ID token
 * @param {string} text                                libellé du bouton
 */
import { useEffect, useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { initGoogleIdentity, isGoogleConfigured } from "@/lib/googleIdentity";
import { useTheme } from "@/components/shared/ThemeProvider";

export default function GoogleButton({ onCredential, text = "Continuer avec Google" }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | disabled
  const { isDark } = useTheme();

  const configured = isGoogleConfigured();

  useEffect(() => {
    if (!configured) {
      setStatus("disabled");
      return;
    }
    // StrictMode monte deux fois en dev : on annule le rendu d'un composant
    // qui aurait déjà été démonté, sinon on empile deux boutons.
    let cancelled = false;
    let rendered = false;

    initGoogleIdentity()
      .then(({ clientId, id }) => {
        if (cancelled || !containerRef.current) return;
        id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onCredential(response.credential);
          },
          // La popup est le seul moyen de récupérer le credential sans
          //Navigate with a Redirect URI côté serveur.
          ux_mode: "popup",
          // On ne demande que le strict nécessaire : moins d'écrans de
          // consentement, meilleure conversion.
          scope: "email profile",
        });
        containerRef.current.innerHTML = "";
        // Google n'accepte que des largeurs en pixels dans une plage
        // bornée (environ 120-520). Sur mobile on mesure le conteneur
        // pour éviter un débordement horizontal, sinon le bouton iframe
        // déborde de l'écran et devient inutilisable.
        const dispo = containerRef.current.clientWidth || containerRef.current.offsetWidth || 360;
        const largeur = Math.max(120, Math.min(400, Math.floor(dispo) || 360));
        id.renderButton(containerRef.current, {
          type: "standard",
          theme: isDark ? "filled_black" : "outline",
          size: "large",
          text: text === "S'inscrire avec Google" ? "signup_with" : "signin_with",
          shape: "rectangular",
          width: largeur,
          // Évite d'afficher un second sélecteur de compte si un seul l'est déjà.
          one_tap: false,
          locale: "fr",
        });
        rendered = true;
        if (!cancelled) setStatus("ready");
      })
      .catch((err) => {
        console.error("❌ Google Identity Services:", err.message);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (rendered && containerRef.current) containerRef.current.innerHTML = "";
    };
    // `isDark` et `text` ne sont pas re-déclenchés volontairement : le SDK
    // gère le re-rendu via sa propre config, et le libellé est fixe à l'appel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  if (status === "disabled") return null;

  if (status === "error") {
    return (
      <p className="text-center text-xs text-surface-400 dark:text-surface-500 py-3">
        Connexion Google momentanément indisponible. Utilisez votre email.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        style={{ minHeight: status === "loading" ? 44 : 0 }}
        className="flex justify-center"
      />
      {status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-surface-400 py-3">
          <FaSpinner className="animate-spin" /> Chargement…
        </div>
      )}
    </div>
  );
}
