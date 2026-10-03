"use client";

import { useState } from "react";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import api from "@/lib/api";
import { useToast } from "@/components/shared/ToastProvider";
import { validateEmail } from "@/lib/utils/validators";

// ===============================================
// Formulaire d'inscription à la newsletter.
//
// Double opt-in : l'API répond toujours la même chose (pour ne pas révéler
// si une adresse est déjà abonnée) et envoie un email de confirmation. Le
// success est donc toujours affiché, mais la VRAIE inscription n'a lieu
// qu'après le clic sur le lien reçu par email. Sans ce clic, l'abonné reste
// en statut « pending » et ne recevra jamais rien.
//
// Ce composant est partagé par le footer, le blog et les CTA : une seule
// implémentation à maintenir, donc une seule chance de réintroduire le
// setTimeout() factice qui faisait semblant de s'abonner.
// ===============================================

const lightInputClass =
  `w-full px-4 py-3 rounded-xl text-surface-900 bg-white border-2 border-surface-200
   placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500
   transition`;

const darkInputClass =
  `w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/15
   placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500
   focus:border-brand-500 transition`;

export default function NewsletterForm({
  source = "footer",
  className = "",
  buttonClassName = "",
  buttonLabel = "S'inscrire",
  successLabel = "Vérifiez votre boîte mail pour confirmer.",
  dark = false,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateEmail(email);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      await api.post("/newsletter/subscribe", {
        email: email.trim().toLowerCase(),
        source,
      });
      setSent(true);
      setEmail("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Erreur lors de l'inscription. Réessayez plus tard.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className={`flex items-start gap-3 rounded-xl bg-brand-500/10 border border-brand-500/30 p-4 text-sm ${className}`}
        role="status"
      >
        <FaCheckCircle className="text-brand-500 mt-0.5 shrink-0" />
        <span className={dark ? "text-white" : "text-surface-700"}>{successLabel}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          aria-label="Adresse email pour la newsletter"
          autoComplete="email"
          required
          disabled={loading}
          className={dark ? darkInputClass : lightInputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className={
            buttonClassName ||
            `flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition
             bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed`
          }
        >
          {loading ? (
            "Envoi…"
          ) : (
            <>
              {!dark && <FaEnvelope />}
              {buttonLabel}
            </>
          )}
        </button>
      </div>
      <p className={`text-xs mt-3 ${dark ? "text-surface-500" : "text-surface-500"}`}>
        Un email de confirmation vous sera envoyé. Désinscription en un clic.
      </p>
    </form>
  );
}