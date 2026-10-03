"use client";

import { useState } from "react";
import Link from "next/link"; import { useRouter, useSearchParams } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaEnvelopeOpenText } from "react-icons/fa";
import api from "@/lib/api";
import useAuth from "@/lib/hooks/useAuth";
import { useToast } from "@/components/shared/ToastProvider";
import GoogleButton from "@/components/auth/GoogleButton";
import { trackAuthSuccess } from "@/lib/authPrompt";

/* ── Règles de validation mot de passe ────────────────────────────────── */
const PASSWORD_RULES = [
  { id: "len",   label: "8 caractères minimum",          test: (p) => p.length >= 8 },
  { id: "upper", label: "Une lettre majuscule",           test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Une lettre minuscule",           test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "Un chiffre",                     test: (p) => /\d/.test(p) },
];

function Register() {
  const toast    = useToast();
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const searchParams = useSearchParams();
  const { googleLogin } = useAuth();

  // Destination d'origine quand le visiteur arrive depuis une route
  // protégée (middleware.js pose ?redirect=) : on le ramène à son
  // panier ou à ses commandes plutôt qu'à un tableau de bord vide.
  const from = searchParams.get("redirect") || "/dashboard";

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw,   setShowPw]   = useState(false);
  const [showCpw,  setShowCpw]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  // Adresse du compte créé en attente de vérification (null = formulaire
  // affiché). Bascule l'écran en « vérifiez votre boîte mail ».
  const [registered, setRegistered] = useState(null);
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  /* ── Renvoi du lien de vérification ──────────────────────────────────── */
  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email: registered });
      setResendSent(true);
    } catch {
      toast.error("Envoi impossible. Réessayez dans quelques minutes.");
    } finally {
      setResendLoading(false);
    }
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const pwRules = PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(formData.password) }));
  const pwStrength = pwRules.filter((r) => r.ok).length; // 0-4

  /* ── Validation ──────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      e.name = "Nom trop court (2 caractères minimum)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Adresse email invalide";
    if (pwStrength < 4)
      e.password = "Le mot de passe ne respecte pas toutes les règles";
    if (formData.password !== formData.confirm)
      e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Soumission ──────────────────────────────────────────────────────── */
  // Le backend n'ouvre PAS de session à l'inscription : le compte est créé
  // mais reste inactif tant que le lien de vérification n'a pas été cliqué.
  // `registered` déclenche l'écran « vérifiez vos emails » avec l'adresse en
  // mémoire, ce qui évite d'obliger à retaper le mot de passe si le client
  // décide de tenter une connexion tout de suite.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name:     formData.name.trim(),
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (data?.requiresEmailVerification) {
        setRegistered(formData.email.trim().toLowerCase());
        return;
      }

      toast.success("Compte créé avec succès ! Connectez-vous 🎉");
      navigate(`/login?redirect=${encodeURIComponent(from)}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'inscription. Réessayez.";
      toast.error(msg);
      if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── Inscription via Google ───────────────────────────────────────────── */
  // Contrairement à /register par mot de passe, l'inscription Google
  // connecter immédiatement : on n'impose donc pas de repasser par /login.
  const handleGoogle = async (credential) => {
    setLoading(true);
    try {
      const result = await googleLogin(credential);
      if (!result.success) {
        const msg =
          (typeof result.error === "object" &&
            (result.error?.message || result.error?.data?.message)) ||
          "Inscription avec Google impossible. Réessayez.";
        toast.error(msg);
        return;
      }
      const { user, isNewAccount } = result.data;
      trackAuthSuccess({ reason: "register", source: "register-page", isNewAccount });
      toast.success(
        isNewAccount ? "Compte créé avec Google 🎉" : `Ravi de vous revoir, ${user?.name || ""} !`
      );
      setTimeout(() => navigate(from), 300);
    } finally {
      setLoading(false);
    }
  };

  /* ── Barre de force du mot de passe ──────────────────────────────────── */
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-emerald-500"];
  const strengthLabels = ["", "Faible", "Moyen", "Bon", "Fort"];

  /* ── Field helpers ───────────────────────────────────────────────────── */
  const fieldClass = (field) =>
    `w-full pl-11 pr-11 py-3 rounded-xl border-2 bg-white dark:bg-surface-800 text-surface-900 dark:text-white
     placeholder:text-surface-400 focus:outline-none transition-all duration-200
     ${errors[field]
       ? "border-rose-400 focus:border-rose-500 bg-rose-50 dark:bg-rose-900/20"
       : "border-surface-200 dark:border-surface-700 focus:border-brand-500 dark:focus:border-brand-400"}`;

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">

      {/* ── Panneau gauche — illustration ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-brand-500 via-amber-600 to-orange-800 flex-col items-center justify-center p-12 text-white">
        {/* cercles décoratifs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-8 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-sm">
          <Link href="/" className="text-4xl font-extrabold font-display tracking-tight mb-2 block">
            Tekalis
          </Link>
          <p className="text-amber-100 text-sm mb-10">Boutique High-Tech · Dakar, Sénégal</p>

          <h2 className="text-3xl font-bold font-display leading-snug mb-4">
            Rejoignez la communauté Tekalis
          </h2>
          <p className="text-amber-50 leading-relaxed mb-10">
            Créez votre compte et accédez à des milliers de produits tech, suivez vos commandes et bénéficiez d'offres exclusives.
          </p>

          {/* Avantages */}
          {[
            "Livraison rapide à Dakar en 24 – 48h",
            "Garantie constructeur sur tous les produits",
            "Paiement Wave, Orange Money ou à la livraison",
            "SAV & retours facilités depuis votre espace",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 mb-3">
              <FaCheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-amber-50 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — formulaire ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link href="/" className="lg:hidden block text-center mb-8">
            <span className="text-3xl font-extrabold font-display text-brand-600 dark:text-brand-400">
              Tekalis
            </span>
          </Link>

          {registered ? (
            /* ── Compte créé — activation en attente ──────────────────────
               Le compte existe mais aucune session n'est ouverte : l'accès
               reste bloqué tant que l'adresse n'a pas été confirmée depuis
               l'email. D'où cet écran plutôt qu'une redirection vers
               /dashboard. */
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-100 dark:border-surface-700 p-8 text-center">
              <div className="flex justify-center mb-5">
                <FaEnvelopeOpenText className="text-brand-500" size={52} />
              </div>

              <h1 className="text-2xl font-bold font-display text-surface-900 dark:text-white mb-3">
                Vérifiez votre boîte mail
              </h1>

              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-2">
                Un lien de confirmation vient d&apos;être envoyé à
              </p>
              <p className="text-sm font-bold text-surface-900 dark:text-white mb-5 break-all">
                {registered}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-6">
                Cliquez sur ce lien pour activer votre compte. Il reste valable
                24 heures. Sans confirmation, la connexion par mot de passe
                restera bloquée.
              </p>

              {resendSent ? (
                <p className="text-sm text-green-600 mb-4">
                  Si un compte non vérifié existe à cette adresse, un nouvel
                  email vient d&apos;être envoyé.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-all duration-200"
                >
                  {resendLoading ? (
                    <><FaSpinner className="animate-spin" /> Envoi en cours...</>
                  ) : (
                    "Renvoyer le lien"
                  )}
                </button>
              )}

              <Link
                href="/login"
                className="block mt-5 text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition"
              >
                Déjà vérifié ? Se connecter
              </Link>
            </div>
          ) : (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card border border-surface-100 dark:border-surface-700 p-8">

            <div className="mb-7">
              <h1 className="text-2xl font-bold font-display text-surface-900 dark:text-white mb-1">
                Créer un compte
              </h1>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Déjà inscrit ?{" "}
                <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>

            <GoogleButton onCredential={handleGoogle} text="S'inscrire avec Google" />

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200 dark:border-surface-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-surface-800 text-xs text-surface-400">
                  ou avec votre email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set("name")}
                    placeholder="Ousmane Diallo"
                    autoComplete="name"
                    className={fieldClass("name")}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={set("email")}
                    placeholder="ousmane@email.com"
                    autoComplete="email"
                    className={fieldClass("email")}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={formData.password}
                    onChange={set("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={fieldClass("password")}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition"
                    tabIndex={-1}
                    aria-label={showPw ? "Masquer" : "Afficher"}
                  >
                    {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                {/* Barre de force */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= pwStrength ? strengthColors[pwStrength] : "bg-surface-200 dark:bg-surface-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${
                      pwStrength <= 1 ? "text-red-500" :
                      pwStrength === 2 ? "text-orange-500" :
                      pwStrength === 3 ? "text-yellow-600" : "text-emerald-600"
                    }`}>
                      {strengthLabels[pwStrength]}
                    </p>
                  </div>
                )}

                {/* Règles */}
                {formData.password && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    {pwRules.map((r) => (
                      <li key={r.id} className={`flex items-center gap-1.5 text-xs transition-colors ${r.ok ? "text-emerald-600" : "text-surface-400 dark:text-surface-500"}`}>
                        <FaCheckCircle size={10} className={r.ok ? "text-emerald-500" : "text-surface-300 dark:text-surface-600"} />
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm" />
                  <input
                    type={showCpw ? "text" : "password"}
                    value={formData.confirm}
                    onChange={set("confirm")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={fieldClass("confirm")}
                    aria-invalid={!!errors.confirm}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition"
                    tabIndex={-1}
                    aria-label={showCpw ? "Masquer" : "Afficher"}
                  >
                    {showCpw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-rose-500">{errors.confirm}</p>}
              </div>

              {/* CGU */}
              <p className="text-xs text-surface-500 dark:text-surface-400">
                En créant un compte, vous acceptez nos{" "}
                <Link href="/politique" className="text-brand-600 dark:text-brand-400 hover:underline">
                  conditions d'utilisation
                </Link>.
              </p>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-glow transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? (
                  <><FaSpinner className="animate-spin" /> Création en cours...</>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;

