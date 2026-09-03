"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaTimesCircle } from "react-icons/fa";

const PaymentCancel = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const navigate = (path) => router.push(path);

  useEffect(() => {
    // Optionnel : log ou analytics
    console.log("Paiement annulé pour la commande :", orderId);
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md w-full bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
        {/* Icône */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaTimesCircle className="text-5xl text-red-600" />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
          Paiement annulé
        </h1>

        {/* Message */}
        <p className="text-surface-600 mb-6">
          Le paiement n'a pas été finalisé.  
          Aucun montant n'a été débité.
        </p>

        {/* Infos commande */}
        {orderId && (
          <div className="bg-surface-50 dark:bg-surface-700 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-surface-900 dark:text-white mb-2">
              Détails de la commande
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-surface-600">Commande :</span>
              <span className="font-semibold">#{orderId.slice(-8)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-surface-600">Statut :</span>
              <span className="font-semibold text-red-600">Paiement annulé</span>
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/checkout/${orderId}`)}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-glow"
          >
            Réessayer le paiement
          </button>

          <button
            onClick={() => navigate("/dashboard/orders")}
            className="w-full bg-surface-200 hover:bg-surface-300 text-surface-700 py-3 rounded-xl font-semibold transition"
          >
            Voir mes commandes
          </button>
        </div>

        <p className="text-sm text-surface-500 mt-6">
          💡 Besoin d'aide ? Contactez le support
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
