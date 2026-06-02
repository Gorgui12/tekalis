"use client";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

const PaymentCancel = () => {
  const { orderId } = useParams();
  const navigate = const router = useRouter()
router.push();

  useEffect(() => {
    // Optionnel : log ou analytics
    console.log("Paiement annulé pour la commande :", orderId);
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icône */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaTimesCircle className="text-5xl text-red-600" />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Le paiement n’a pas été finalisé.  
          Aucun montant n’a été débité.
        </p>

        {/* Infos commande */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-gray-900 mb-2">
              Détails de la commande
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Commande :</span>
              <span className="font-semibold">#{orderId.slice(-8)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Statut :</span>
              <span className="font-semibold text-red-600">Paiement annulé</span>
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/checkout/${orderId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Réessayer le paiement
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
          >
            Voir mes commandes
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          💡 Besoin d’aide ? Contactez le support
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;

