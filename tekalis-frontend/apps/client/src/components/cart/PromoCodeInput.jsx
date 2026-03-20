import { useState } from "react";
import { FaTag, FaTimes, FaCheckCircle, FaSpinner } from "react-icons/fa";
import api from "../../../../../packages/shared/api/client";

/**
 * PromoCodeInput — Champ saisie et validation d'un code promo
 * Props:
 *   onApplied: ({ code, discount }) => void  — discount en pourcentage
 *   onRemoved: () => void
 *   appliedCode: string
 */
const PromoCodeInput = ({ onApplied, onRemoved, appliedCode = "" }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Entrez un code promo");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/promo/validate", { code: code.trim().toUpperCase() });
      onApplied({ code: data.code, discount: data.discount });
      setCode("");
    } catch (err) {
      const msg = err.response?.data?.message || "Code promo invalide ou expiré";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onRemoved?.();
    setCode("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  // ─── Code promo appliqué ──────────────────────────────────────────────────
  if (appliedCode) {
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
        <FaCheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">
            Code <code className="bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded">{appliedCode}</code> appliqué !
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
            Réduction déduite du total
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="text-green-700 dark:text-green-400 hover:text-red-500 transition"
          aria-label="Retirer le code promo"
        >
          <FaTimes size={14} />
        </button>
      </div>
    );
  }

  // ─── Formulaire saisie ────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="Code promo"
            maxLength={20}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            }`}
          />
        </div>

        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 flex-shrink-0"
        >
          {loading ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            "Appliquer"
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <FaTimes size={10} />
          {error}
        </p>
      )}
    </div>
  );
};

export default PromoCodeInput;