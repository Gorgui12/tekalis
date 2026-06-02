"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import { useToast } from "../../../../packages/shared/context/ToastContext";
import { useRouter } from "next/navigation";

/* ── Règles de validation mot de passe ────────────────────────────────── */
const PASSWORD_RULES = [
  { id: "len",   label: "8 caractères minimum",          test: (p) => p.length >= 8 },
  { id: "upper", label: "Une lettre majuscule",           test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Une lettre minuscule",           test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "Un chiffre",                     test: (p) => /\d/.test(p) },
];

function Register() {
  const toast    = useToast();
  const navigate = const router = useRouter()
router.push();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw,   setShowPw]   = useState(false);
  const [showCpw,  setShowCpw]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name:     formData.name.trim(),
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      toast.success("Compte créé avec succès ! Connectez-vous 🎉");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'inscription. Réessayez.";
      toast.error(msg);
      if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  /* ── Barre de force du mot de passe ──────────────────────────────────── */
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-emerald-500"];
  const strengthLabels = ["", "Faible", "Moyen", "Bon", "Fort"];

  /* ── Field helpers ───────────────────────────────────────────────────── */
  const fieldClass = (field) =>
    `w-full pl-11 pr-11 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
     placeholder:text-gray-400 focus:outline-none transition-all duration-200
     ${errors[field]
       ? "border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
       : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"}`;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* ── Panneau gauche — illustration ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 flex-col items-center justify-center p-12 text-white">
        {/* cercles décoratifs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-8 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-sm">
          <Link to="/" className="text-4xl font-extrabold tracking-tight mb-2 block">
            Tekalis
          </Link>
          <p className="text-blue-200 text-sm mb-10">Boutique High-Tech · Dakar, Sénégal</p>

          <h2 className="text-3xl font-bold leading-snug mb-4">
            Rejoignez la communauté Tekalis
          </h2>
          <p className="text-blue-100 leading-relaxed mb-10">
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
              <span className="text-blue-100 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — formulaire ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link to="/" className="lg:hidden block text-center mb-8">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tekalis
            </span>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">

            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Créer un compte
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Déjà inscrit ?{" "}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
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
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
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
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
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
                            i <= pwStrength ? strengthColors[pwStrength] : "bg-gray-200 dark:bg-gray-700"
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
                      <li key={r.id} className={`flex items-center gap-1.5 text-xs transition-colors ${r.ok ? "text-emerald-600" : "text-gray-400 dark:text-gray-500"}`}>
                        <FaCheckCircle size={10} className={r.ok ? "text-emerald-500" : "text-gray-300"} />
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    tabIndex={-1}
                    aria-label={showCpw ? "Masquer" : "Afficher"}
                  >
                    {showCpw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
              </div>

              {/* CGU */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                En créant un compte, vous acceptez nos{" "}
                <Link to="/politique" className="text-blue-600 dark:text-blue-400 hover:underline">
                  conditions d'utilisation
                </Link>.
              </p>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? (
                  <><FaSpinner className="animate-spin" /> Création en cours...</>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
