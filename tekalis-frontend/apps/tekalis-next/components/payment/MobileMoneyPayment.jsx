"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api";

const MobileMoneyPayment = ({ orderId }) => {
  const [reference, setReference] = useState("");
  const [provider, setProvider] = useState("wave"); // Par défaut : Wave
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post(
        "/payments/mobile-money",
        { orderId, reference, provider }, // Ajout du provider
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors du paiement");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-surface-800 shadow-card rounded-xl">
      <h2 className="text-xl font-bold text-center mb-4 text-surface-900 dark:text-white">Paiement Mobile Money</h2>
      <form onSubmit={handlePayment}>
        {/* Sélection du fournisseur */}
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full p-2 border border-surface-300 dark:border-surface-600 rounded-xl mb-4 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="wave">Wave</option>
          <option value="orange">Orange Money</option>
          <option value="free">Free Money</option>
        </select>

        {/* Entrée de la référence */}
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Entrez la référence Mobile Money"
          className="w-full p-2 border border-surface-300 dark:border-surface-600 rounded-xl mb-4 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />

        {/* Bouton de validation */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-semibold transition shadow-md hover:shadow-glow"
        >
          {loading ? "Paiement en cours..." : "Valider le paiement"}
        </button>
      </form>

      {message && <p className="text-center text-brand-500 mt-2">{message}</p>}
    </div>
  );
};

export default MobileMoneyPayment;
