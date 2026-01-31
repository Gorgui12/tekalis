import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaBox, 
  FaCheckCircle, 
  FaTruck, 
  FaHome,
  FaDownload,
  FaMapMarkerAlt,
  FaPhone,
  FaCreditCard,
  FaRedo
} from "react-icons/fa";
import api from "../../api/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Erreur chargement commande:", error);
        alert("Commande introuvable");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Commande introuvable</p>
          <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  // Timeline de suivi
  const trackingSteps = [
    { 
      key: "pending", 
      label: "Commande reçue", 
      icon: <FaCheckCircle />,
      active: true 
    },
    { 
      key: "processing", 
      label: "En préparation", 
      icon: <FaBox />,
      active: ["processing", "shipped", "delivered"].includes(order.status)
    },
    { 
      key: "shipped", 
      label: "Expédiée", 
      icon: <FaTruck />,
      active: ["shipped", "delivered"].includes(order.status)
    },
    { 
      key: "delivered", 
      label: "Livrée", 
      icon: <FaHome />,
      active: order.status === "delivered"
    }
  ];

  // Badge de statut
  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
      processing: { bg: "bg-blue-100", text: "text-blue-700", label: "En préparation" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Expédiée" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Livrée" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulée" }
    };
    
    const config = configs[status] || configs.pending;
    
    return (
      <span className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-sm font-semibold`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour aux commandes
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Commande #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Tracking timeline */}
        {order.status !== "cancelled" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📍 Suivi de livraison
            </h2>
            
            <div className="relative">
              {/* Ligne de progression */}
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ 
                    width: `${(trackingSteps.filter(s => s.active).length - 1) / (trackingSteps.length - 1) * 100}%` 
                  }}
                />
              </div>

              {/* Étapes */}
              <div className="relative grid grid-cols-4 gap-4">
                {trackingSteps.map((step, idx) => (
                  <div key={step.key} className="text-center">
                    <div className={`relative mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 transition-all ${
                      step.active 
                        ? "bg-blue-600 text-white shadow-lg scale-110" 
                        : "bg-gray-200 text-gray-400"
                    }`}>
                      {step.icon}
                    </div>
                    <p className={`text-xs font-semibold ${
                      step.active ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {step.label}
                    </p>
                    {step.active && step.key === order.status && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message de statut */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {order.status === "pending" && "Votre commande a été reçue et est en cours de vérification."}
                {order.status === "processing" && "Votre commande est en cours de préparation. Elle sera bientôt expédiée !"}
                {order.status === "shipped" && "Votre commande a été expédiée ! Vous devriez la recevoir sous 2-3 jours."}
                {order.status === "delivered" && "Votre commande a été livrée avec succès ! Merci pour votre confiance. ✨"}
              </p>
            </div>
          </div>
        )}

        {/* Message annulation */}
        {order.status === "cancelled" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-red-800 mb-2">
              ❌ Commande annulée
            </h3>
            <p className="text-red-700">
              Cette commande a été annulée le {new Date(order.updatedAt).toLocaleDateString("fr-FR")}.
              {order.cancelReason && ` Raison: ${order.cancelReason}`}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Produits */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📦 Produits commandés
              </h2>
              
              <div className="space-y-4">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                    <img
                      src={item.product?.image || "/placeholder.png"}
                      alt={item.product?.name}
                      className="w-24 h-24 object-contain rounded border"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.product?._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                      >
                        {item.product?.name || "Produit"}
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product?.brand && `Marque: ${item.product.brand}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Quantité: <span className="font-semibold">{item.quantity}</span>
                        </span>
                        <span className="font-bold text-blue-600">
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span className="font-semibold">
                    {order.products?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Frais de livraison</span>
                  <span className="font-semibold">
                    {order.shippingCost ? `${order.shippingCost.toLocaleString()} FCFA` : "Gratuit"}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span className="font-semibold">
                      -{order.discount.toLocaleString()} FCFA
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t">
                  <span>Total</span>
                  <span>{order.totalPrice?.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => alert("Fonctionnalité de téléchargement de facture à implémenter")}
                className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <FaDownload />
                Télécharger la facture
              </button>
              
              {order.status === "delivered" && (
                <Link
                  to={`/rma/create?orderId=${order._id}`}
                  className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <FaRedo />
                  Demander un retour/SAV
                </Link>
              )}

              {order.status === "pending" && (
                <button
                  onClick={() => {
                    if (window.confirm("Voulez-vous vraiment annuler cette commande ?")) {
                      api.put(`/orders/${order._id}/cancel`)
                        .then(() => {
                          alert("Commande annulée avec succès");
                          window.location.reload();
                        })
                        .catch(() => alert("Erreur lors de l'annulation"));
                    }
                  }}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Annuler la commande
                </button>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Livraison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-900">Livraison</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Destinataire</p>
                  <p className="font-semibold text-gray-900">{order.deliveryName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Téléphone</p>
                  <p className="font-semibold text-gray-900">{order.deliveryPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Adresse</p>
                  <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
                  <p className="text-gray-700">{order.deliveryCity}, {order.deliveryRegion}</p>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-green-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-900">Paiement</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Méthode</p>
                  <p className="font-semibold text-gray-900">
                    {order.paymentMethod === "cash" && "💵 Paiement à la livraison"}
                    {order.paymentMethod === "wave" && "🌊 Wave Money"}
                    {order.paymentMethod === "om" && "🍊 Orange Money"}
                    {order.paymentMethod === "free" && "📱 Free Money"}
                    {!["cash", "wave", "om", "free"].includes(order.paymentMethod) && "Autre"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Statut du paiement</p>
                  <p className={`font-semibold ${
                    order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {order.paymentStatus === "paid" ? "✓ Payé" : "En attente"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Besoin d'aide ?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Notre service client est à votre disposition
              </p>
              <div className="space-y-3 text-sm">
                <a 
                  href="tel:+221338234567"
                  className="flex items-center gap-2 hover:text-blue-200 transition"
                >
                  <FaPhone />
                  +221 33 823 45 67
                </a>
                <a 
                  href="https://wa.me/221776543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-200 transition"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;