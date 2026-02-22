import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import axios from "axios";

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Vérifier le statut du paiement via votre backend
      const response = await axios.get(`/api/orders/${orderId}`);
      
      if (response.data.paymentStatus === "paid") {
        setStatus("success");
        setOrderDetails(response.data);
      } else {
        // Attendre quelques secondes puis revérifier (webhook peut prendre du temps)
        setTimeout(() => {
          verifyPayment();
        }, 3000);
      }
    } catch (error) {
      console.error("Erreur vérification:", error);
      setStatus("failed");
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter quelques instants
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          
          <p className="text-gray-600 mb-6">
            Votre commande a été confirmée avec succès.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-bold text-gray-900 mb-3">Détails de la commande</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro de commande:</span>
                  <span className="font-semibold">#{orderDetails._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant payé:</span>
                  <span className="font-semibold text-green-600">
                    {orderDetails.totalPrice?.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-semibold text-green-600">Payé</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Voir ma commande
            </button>
            <button
              onClick={() => navigate("/products")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition"
            >
              Continuer mes achats
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            📧 Un email de confirmation vous a été envoyé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">❌</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Erreur de vérification
        </h1>
        
        <p className="text-gray-600 mb-6">
          Impossible de vérifier le statut de votre paiement.
        </p>

        <button
          onClick={() => navigate("/orders")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Voir mes commandes
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;