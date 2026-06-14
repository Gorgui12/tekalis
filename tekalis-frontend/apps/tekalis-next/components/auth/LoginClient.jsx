"use client";

import { useState } from "react";
import Link from "next/link"; import { useRouter, usePathname } from "next/navigation";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner,
  FaShieldAlt, FaTruck, FaHeadset
} from "react-icons/fa";
import useAuth from "@/lib/hooks/useAuth";
import { useToast } from "@/components/shared/ToastProvider";
import { useRouter } from "next/navigation";

function Login() {
  const router = useRouter();
// Si vous vouliez juste utiliser router pour naviguer :
const navigate = (path) => router.push(path);
  const pathname = usePathname();
  const toast     = useToast();
  const { login, loading } = useAuth();

  const [formData,    setFormData]    = useState({ email: "", password: "" });
  const [showPw,      setShowPw]      = useState(false);
  const [rememberMe,  setRememberMe]  = useState(false);
  const [errors,      setErrors]      = useState({});

  const from = "/dashboard" || "/";

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const fieldClass = (field) =>
    `w-full pl-11 pr-11 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
     placeholder:text-gray-400 focus:outline-none transition-all duration-200
     ${errors[field]
       ? "border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
       : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"}`;

  /* ── Validation légère ───────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!formData.email.trim())    e.email    = "Email requis";
    if (!formData.password.trim()) e.password = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Soumission ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(formData);

    if (result.success) {
      const { user } = result.data;
      toast.success(`Bienvenue ${user.name} ! 👋`);
      setTimeout(() => {
        navigate(user.isAdmin ? "/admin" : from, { replace: true });
      }, 300);
    } else {
      const msg = result.error || "Identifiants incorrects";
      toast.error(msg);
      setErrors({ password: " " }); // highlight sans texte dupliqué
    }
  };

  /* ── Features liste ──────────────────────────────────────────────────── */
  const features = [
    { icon: <FaTruck />,    text: "Livraison express à Dakar", sub: "sous 24 – 48h" },
    { icon: <FaShieldAlt />, text: "Garantie constructeur",   sub: "sur tous les produits" },
    { icon: <FaHeadset />,  text: "Support client 7j/7",      sub: "par WhatsApp & email" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* ── Panneau gauche — branding ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex-col items-center justify-center p-12 text-white">
        {/* cercles décoratifs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-8 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-sm">
          <Link href="/" className="text-4xl font-extrabold tracking-tight mb-2 block">
            Tekalis
          </Link>
          <p className="text-blue-200 text-sm mb-10">Boutique High-Tech · Dakar, Sénégal</p>

          <h2 className="text-3xl font-bold leading-snug mb-4">
            Bonne journée chez Tekalis !
          </h2>
          <p className="text-blue-100 leading-relaxed mb-10">
            Connectez-vous pour accéder à vos commandes, garanties, wishlist et bénéficier d'offres personnalisées.
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

            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Connexion
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pas encore de compte ?{" "}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  S'inscrire gratuitement
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={set("email")}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    autoFocus
                    className={fieldClass("email")}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && errors.email !== " " && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mot de passe
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={formData.password}
                    onChange={set("password")}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={fieldClass("password")}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    tabIndex={-1}
                    aria-label={showPw ? "Masquer" : "Afficher"}
                  >
                    {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.password && errors.password !== " " && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Se souvenir */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Se souvenir de moi
                </span>
              </label>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? (
                  <><FaSpinner className="animate-spin" /> Connexion en cours...</>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-gray-800 text-xs text-gray-400">
                  ou continuez avec
                </span>
              </div>
            </div>

            {/* WhatsApp rapide */}
            <a
              href="https://wa.me/221786346946"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contacter via WhatsApp
            </a>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/politique" className="hover:underline text-blue-500">conditions d'utilisation</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

