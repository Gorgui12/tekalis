"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import api from "@/lib/api";
import { useToast } from "@/components/shared/ToastProvider";

const PASSWORD_RULES = [
  { id: "len", label: "8 caractères minimum", test: (p) => p.length >= 8 },
  { id: "upper", label: "Une lettre majuscule", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Une lettre minuscule", test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "Un chiffre", test: (p) => /\d/.test(p) },
];

function ResetPassword({ token }) {
  const router = useRouter();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const pwRules = PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) }));
  const pwStrength = pwRules.filter((r) => r.ok).length;

  const fieldClass = (field) =>
    `w-full pl-11 pr-11 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
     placeholder:text-gray-400 focus:outline-none transition-all duration-200
     ${errors[field]
       ? "border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
       : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (pwStrength < 4) errs.password = "Le mot de passe ne respecte pas toutes les règles";
    if (password !== confirm) errs.confirm = "Les mots de passe ne correspondent pas";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "Lien invalide ou expiré.";
      toast.error(msg);
      setErrors({ password: " " });
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-emerald-500"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tekalis
          </span>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">

          {success ? (
            <div className="text-center py-6">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-5" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Mot de passe mis à jour
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link
                href="/login"
                className="inline-block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Nouveau mot de passe
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choisissez un mot de passe robuste pour sécuriser votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Mot de passe */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      id="new-password"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
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

                {/* Règles */}
                {password.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2">
                    <div className="flex gap-1.5 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${i < pwStrength ? strengthColors[pwStrength] : "bg-gray-200 dark:bg-gray-700"}`}
                        />
                      ))}
                    </div>
                    {pwRules.map((r) => (
                      <p
                        key={r.id}
                        className={`text-xs flex items-center gap-1.5 ${r.ok ? "text-green-600" : "text-gray-500"}`}
                      >
                        {r.ok ? <FaCheckCircle size={10} /> : <span className="w-2.5 h-2.5 rounded-full border border-gray-400 inline-block" />}
                        {r.label}
                      </p>
                    ))}
                  </div>
                )}

                {/* Confirmation */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showPw ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={fieldClass("confirm")}
                      aria-invalid={!!errors.confirm}
                    />
                  </div>
                  {errors.confirm && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Réinitialisation…
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
