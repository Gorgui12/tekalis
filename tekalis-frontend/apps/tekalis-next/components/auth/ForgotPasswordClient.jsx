"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaSpinner,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import api from "@/lib/api";
import { useToast } from "@/components/shared/ToastProvider";

function ForgotPassword() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const fieldClass =
    `w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
     placeholder:text-gray-400 focus:outline-none transition-all duration-200
     ${error
       ? "border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
       : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Adresse email invalide");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'envoi. Réessayez.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <FaTruck />, text: "Livraison express à Dakar", sub: "sous 24 – 48h" },
    { icon: <FaShieldAlt />, text: "Garantie constructeur", sub: "sur tous les produits" },
    { icon: <FaHeadset />, text: "Support client 7j/7", sub: "par WhatsApp & email" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* ── Panneau gauche — branding ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex-col items-center justify-center p-12 text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-8 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-sm">
          <Link href="/" className="text-4xl font-extrabold tracking-tight mb-2 block">
            Tekalis
          </Link>
          <p className="text-blue-200 text-sm mb-10">Boutique High-Tech · Dakar, Sénégal</p>

          <h2 className="text-3xl font-bold leading-snug mb-4">
            Pas de panique, on s'en occupe !
          </h2>
          <p className="text-blue-100 leading-relaxed mb-10">
            Récupérez l'accès à votre compte en quelques secondes et retrouvez vos
            commandes, garanties et wishlist.
          </p>

          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.text}</p>
                  <p className="text-blue-200 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link href="/" className="lg:hidden block text-center mb-8">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tekalis
            </span>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">

            {sent ? (
              /* ── État succès ── */
              <div className="text-center py-6">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-5" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Email envoyé
                </h1>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Si un compte existe avec l'adresse{" "}
                  <strong className="text-gray-900 dark:text-white">{email}</strong>,
                  vous recevrez un lien de réinitialisation dans quelques instants.
                  Pensez à vérifier vos spams.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              /* ── Formulaire ── */
              <>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-6"
                >
                  <FaArrowLeft size={12} /> Retour
                </button>

                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Mot de passe oublié
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Saisissez votre adresse email : nous vous enverrons un lien pour
                    réinitialiser votre mot de passe.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                        autoFocus
                        className={fieldClass}
                        aria-invalid={!!error}
                      />
                    </div>
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Envoi en cours…
                      </>
                    ) : (
                      "Envoyer le lien de réinitialisation"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Mot de passe retrouvé ?{" "}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                    Se connecter
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
