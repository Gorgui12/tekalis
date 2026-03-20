import { useState } from "react";
import { FaCreditCard, FaMobileAlt, FaMoneyBillWave, FaCheckCircle, FaLock } from "react-icons/fa";
import Button from "../shared/Button";

/**
 * PaymentMethods — Sélection et saisie du mode de paiement
 * Props:
 *   onPay: (paymentData) => Promise<void>
 *   totalAmount: number
 *   loading: boolean
 */

const PAYMENT_METHODS = [
  {
    id: "wave",
    label: "Wave",
    description: "Paiement instantané via Wave",
    icon: "📱",
    color: "from-blue-400 to-blue-600",
    badge: "Recommandé",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  {
    id: "orange_money",
    label: "Orange Money",
    description: "Paiement via Orange Money",
    icon: "📱",
    color: "from-orange-400 to-orange-600",
    badge: null
  },
  {
    id: "free_money",
    label: "Free Money",
    description: "Paiement via Free Money",
    icon: "📱",
    color: "from-purple-400 to-purple-600",
    badge: null
  },
  {
    id: "cash",
    label: "Paiement à la livraison",
    description: "Payez en espèces à la réception",
    icon: "💵",
    color: "from-green-400 to-green-600",
    badge: null
  }
];

const PaymentMethods = ({ onPay, totalAmount = 0, loading = false }) => {
  const [selectedMethod, setSelectedMethod] = useState("wave");
  const [reference, setReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const isMobileMoney = ["wave", "orange_money", "free_money"].includes(selectedMethod);
  const isCash = selectedMethod === "cash";

  // ─── Instructions par méthode ─────────────────────────────────────────────
  const getMobileMoneyInstructions = () => {
    const instructions = {
      wave: [
        "Ouvrez l'application Wave",
        `Envoyez ${totalAmount.toLocaleString()} FCFA au numéro Tekalis`,
        "Entrez la référence de transaction ci-dessous"
      ],
      orange_money: [
        "Composez le #144# sur votre téléphone",
        `Envoyez ${totalAmount.toLocaleString()} FCFA au numéro Tekalis`,
        "Entrez la référence de transaction ci-dessous"
      ],
      free_money: [
        "Composez le #501# sur votre téléphone",
        `Envoyez ${totalAmount.toLocaleString()} FCFA au numéro Tekalis`,
        "Entrez la référence de transaction ci-dessous"
      ]
    };
    return instructions[selectedMethod] || [];
  };

  // ─── Validation et paiement ───────────────────────────────────────────────
  const handlePay = async () => {
    setError("");

    if (isMobileMoney && !reference.trim()) {
      setError("Veuillez entrer votre référence de transaction");
      return;
    }
    if (isMobileMoney && !phoneNumber.trim()) {
      setError("Veuillez entrer votre numéro de téléphone");
      return;
    }

    try {
      await onPay({
        method: selectedMethod,
        reference: isMobileMoney ? reference.trim() : null,
        phone: isMobileMoney ? phoneNumber.trim() : null
      });
    } catch (err) {
      setError(err.message || "Erreur lors du paiement. Réessayez.");
    }
  };

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">

      {/* ─── Sélection de la méthode ─────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaCreditCard className="text-blue-600" />
          Mode de paiement
        </h3>

        <div className="space-y-3">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => { setSelectedMethod(method.id); setError(""); setReference(""); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
              }`}
            >
              {/* Icône */}
              <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
                {method.icon}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {method.label}
                  </p>
                  {method.badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                      {method.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {method.description}
                </p>
              </div>

              {/* Radio indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}>
                {selectedMethod === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Instructions Mobile Money ────────────────────────────────────── */}
      {isMobileMoney && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-4">
          {/* Instructions */}
          <div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-3">
              Instructions de paiement :
            </p>
            <ol className="space-y-2">
              {getMobileMoneyInstructions().map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-300">
                  <span className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
              Votre numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="7X XXX XX XX"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Référence transaction */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
              Référence de transaction <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Ex : TXN-ABCD1234"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Trouvez la référence dans le SMS de confirmation reçu après le paiement.
            </p>
          </div>
        </div>
      )}

      {/* ─── Paiement à la livraison ──────────────────────────────────────── */}
      {isCash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <FaMoneyBillWave className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-200 mb-1">
                Paiement à la livraison
              </p>
              <p className="text-sm text-green-800 dark:text-green-300">
                Préparez exactement <strong>{totalAmount.toLocaleString()} FCFA</strong> en espèces
                lors de la réception de votre colis. Notre livreur ne fait pas de monnaie.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Erreur ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ─── Bouton payer ─────────────────────────────────────────────────── */}
      <Button
        onClick={handlePay}
        variant="primary"
        fullWidth
        size="lg"
        isLoading={loading}
        icon={<FaLock />}
      >
        {loading
          ? "Traitement en cours..."
          : `Payer ${totalAmount.toLocaleString()} FCFA`}
      </Button>

      {/* Sécurité */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
        <FaLock size={11} />
        Paiement sécurisé — vos données sont protégées
      </p>
    </div>
  );
};

export default PaymentMethods;