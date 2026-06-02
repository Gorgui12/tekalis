"use client";

import { useState } from "react";
import { FaMoneyBillWave, FaLock, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import Button from "../shared/Button";

/**
 * PaymentMethods — Paiement à la livraison uniquement
 * Props:
 *   onPay: (paymentData) => Promise<void>
 *   totalAmount: number
 *   loading: boolean
 */
const PaymentMethods = ({ onPay, totalAmount = 0, loading = false }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setError("");

    if (!confirmed) {
      setError("Veuillez confirmer que vous serez disponible à la réception.");
      return;
    }

    try {
      await onPay({
        method: "cash",
        reference: null,
        phone: null,
      });
    } catch (err) {
      setError(err.message || "Erreur lors de la validation. Réessayez.");
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Titre ─────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <FaMoneyBillWave className="text-green-600" />
          Mode de paiement
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paiement à la livraison disponible à Dakar et banlieue
        </p>
      </div>

      {/* ── Carte paiement livraison ───────────────────────────────────── */}
      <div className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          {/* Icône */}
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
            💵
          </div>

          {/* Texte */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-gray-900 dark:text-white">
                Paiement à la livraison
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Disponible
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Payez en espèces directement au livreur lors de la réception de votre commande.
            </p>
          </div>

          {/* Radio indicator */}
          <div className="w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Instructions ──────────────────────────────────────────────── */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 space-y-3">
        <p className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <FaInfoCircle className="text-amber-600" />
          Instructions importantes
        </p>
        <ul className="space-y-2">
          {[
            `Préparez exactement ${totalAmount.toLocaleString()} FCFA en espèces`,
            "Notre livreur ne rend pas la monnaie",
            "Vérifiez votre commande avant de payer",
            "Un reçu vous sera remis à la livraison",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300">
              <span className="w-5 h-5 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Montant total ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            Montant à préparer
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalAmount.toLocaleString()} FCFA
          </p>
        </div>
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xl">
          💵
        </div>
      </div>

      {/* ── Confirmation ──────────────────────────────────────────────── */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              setError("");
            }}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              confirmed
                ? "border-green-500 bg-green-500"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-green-400"
            }`}
          >
            {confirmed && <FaCheckCircle className="text-white text-xs" />}
          </div>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
          Je confirme que je serai disponible à l'adresse indiquée pour réceptionner ma commande et effectuer le paiement en espèces.
        </span>
      </label>

      {/* ── Erreur ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          {error}
        </div>
      )}

      {/* ── Bouton valider ────────────────────────────────────────────── */}
      <Button
        onClick={handlePay}
        variant="primary"
        fullWidth
        size="lg"
        isLoading={loading}
        icon={<FaLock />}
      >
        {loading
          ? "Validation en cours..."
          : `Confirmer la commande — ${totalAmount.toLocaleString()} FCFA`}
      </Button>

      {/* Sécurité */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
        <FaLock size={11} />
        Commande sécurisée — Vous ne payez qu'à la réception
      </p>
    </div>
  );
};

export default PaymentMethods;
