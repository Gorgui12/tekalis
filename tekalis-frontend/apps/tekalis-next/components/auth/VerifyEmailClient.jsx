"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaEnvelopeOpenText, FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import api from "@/lib/api";

/* ── États ─────────────────────────────────────────────────────────────────── */
const PENDING = "pending";
const DONE   = "done";
const FAILED = "failed";

function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState(PENDING);
  const [message, setMessage] = useState("");
  const [resent, setResent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  // React 18 en mode strict rejoue les effets : sans ce garde, le jeton est
  // consommé deux fois et le second appel échoue sur un lien déjà utilisé,
  // affichant une erreur alors que tout s'est bien passé.
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;

    if (!token) {
      setStatus(FAILED);
      setMessage("Lien incomplet : le jeton de vérification est absent.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then((res) => {
        setStatus(DONE);
        setMessage(res.data?.message || "Adresse email vérifiée.");
      })
      .catch((err) => {
        setStatus(FAILED);
        setMessage(
          err.response?.data?.message || "Vérification impossible. Réessayez dans quelques instants."
        );
      });
  }, [token]);

  const handleResend = async () => {
    // Le backend accepte un email arbitraire et répond toujours la même chose
    // (protection contre l'énumération). On demande donc explicitement une
    // confirmation à l'utilisateur plutôt que d'inventer un succès.
    const email = window.prompt("Renvoyer le lien de vérification — votre adresse email :");
    if (!email) return;

    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email: email.trim().toLowerCase() });
      setResent(true);
    } catch {
      setMessage("Envoi impossible. Réessayez dans quelques minutes.");
    } finally {
      setResendLoading(false);
    }
  };

  /* ── Rendu ──────────────────────────────────────────────────────────────── */
  const Icon = status === DONE ? FaCheckCircle : status === FAILED ? FaExclamationTriangle : FaEnvelopeOpenText;
  const tone = {
    [DONE]:   "text-green-600",
    [FAILED]: "text-amber-500",
    [PENDING]: "text-brand-600",
  }[status];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-5">
          {status === PENDING ? (
            <FaSpinner className="text-brand-600 animate-spin" size={54} />
          ) : (
            <Icon className={tone} size={54} />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {status === DONE
            ? "Adresse vérifiée"
            : status === FAILED
              ? "Vérification impossible"
              : "Vérification de votre adresse…"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          {message ||
            "Confirmation en cours, merci de patienter."}
        </p>

        {status === DONE && (
          <Link
            href="/login"
            className="inline-block w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Se connecter
          </Link>
        )}

        {status === FAILED && (
          <div className="space-y-3">
            {token && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
              >
                {resendLoading ? "Envoi…" : "Recevoir un nouveau lien"}
              </button>
            )}
            <Link
              href="/login"
              className="block text-sm text-gray-500 hover:text-brand-600 transition"
            >
              Retour à la connexion
            </Link>
          </div>
        )}

        {resent && (
          <p className="mt-4 text-sm text-green-600">
            Si un compte non vérifié existe à cette adresse, un email vient d&apos;être envoyé.
          </p>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailClient;
