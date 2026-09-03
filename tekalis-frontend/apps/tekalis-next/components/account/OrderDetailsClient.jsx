"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import StatusBadge from "@/components/shared/StatusBadge";

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
import api from "@/lib/api";
import { useToast } from '@/components/shared/ToastProvider';
const OrderDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  
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
        toast.error("Commande introuvable");
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <p className="text-xl text-surface-600 dark:text-surface-400 mb-4">Commande introuvable</p>
          <Link href="/orders" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold">
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

    return (
    <div className="min-h-screen mt-20 px-4">

      {/* Badge de statut */}
      <StatusBadge status={order.status} />

      {/* Tracking timeline */}

        {order.status !== "cancelled" && (
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">
              📍 Suivi de livraison
            </h2>
            
            <div className="relative">
              {/* Ligne de progression */}
              <div className="absolute top-6 left-0 w-full h-1 bg-surface-200 dark:bg-surface-700">
                <div 
                  className="h-full bg-brand-500 transition-all duration-500"
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
                        ? "bg-brand-500 text-white shadow-lg scale-110" 
                        : "bg-surface-200 dark:bg-surface-700 text-surface-400"
                    }`}>
                      {step.icon}
                    </div>
                    <p className={`text-xs font-semibold ${
                      step.active ? "text-brand-600 dark:text-brand-400" : "text-surface-500 dark:text-surface-400"
                    }`}>
                      {step.label}
                    </p>
                    {step.active && step.key === order.status && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                        {new Date(order.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message de statut */}
            <div className="mt-6 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4">
              <p className="text-sm text-brand-800 dark:text-brand-200">
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
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
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                📦 Produits commandés
              </h2>
              
              <div className="space-y-4">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-surface-200 dark:border-surface-700 last:border-0">
                    <img
                      src={item.product?.image || "/placeholder.png"}
                      alt={item.product?.name}
                      className="w-24 h-24 object-contain rounded border border-surface-200 dark:border-surface-700"
                    />
                    <div className="flex-1">
                      <Link href={`/products/${item.product?._id}`}
                        className="font-semibold text-surface-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block mb-1"
                      >
                        {item.product?.name || "Produit"}
                      </Link>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                        {item.product?.brand && `Marque: ${item.product.brand}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-700 dark:text-surface-300">
                          Quantité: <span className="font-semibold">{item.quantity}</span>
                        </span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700 space-y-2">
                <div className="flex justify-between text-surface-700 dark:text-surface-300">
                  <span>Sous-total</span>
                  <span className="font-semibold">
                    {(order.products?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-surface-700 dark:text-surface-300">
                  <span>Frais de livraison</span>
                  <span className="font-semibold">
                    {order.shippingCost ? `${order.shippingCost.toLocaleString()} FCFA` : "Gratuit"}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span className="font-semibold">
                      -{(order.discount || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-brand-600 dark:text-brand-400 pt-2 border-t border-surface-200 dark:border-surface-700">
                  <span>Total</span>
                  <span>{order.totalPrice?.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toast.error("Fonctionnalité de téléchargement de facture à implémenter")}
                className="flex-1 sm:flex-none bg-surface-600 hover:bg-surface-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <FaDownload />
                Télécharger la facture
              </button>
              
              {order.status === "delivered" && (
                <Link href={`/dashboard/rma/create?orderId=${order._id}`}
                  className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
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
                          toast.success("Commande annulée avec succès");
                          window.location.reload();
                        })
                        .catch(() => toast.error("Erreur lors de l'annulation"));
                    }
                  }}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Annuler la commande
                </button>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Livraison */}
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-brand-500 text-xl" />
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Livraison</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-surface-600 dark:text-surface-400">Destinataire</p>
                  <p className="font-semibold text-surface-900 dark:text-white">{order.deliveryName}</p>
                </div>
                <div>
                  <p className="text-surface-600 dark:text-surface-400">Téléphone</p>
                  <p className="font-semibold text-surface-900 dark:text-white">{order.deliveryPhone}</p>
                </div>
                <div>
                  <p className="text-surface-600 dark:text-surface-400">Adresse</p>
                  <p className="font-semibold text-surface-900 dark:text-white">{order.deliveryAddress}</p>
                  <p className="text-surface-700 dark:text-surface-300">{order.deliveryCity}, {order.deliveryRegion}</p>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-green-600 text-xl" />
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Paiement</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-surface-600 dark:text-surface-400">Méthode</p>
                  <p className="font-semibold text-surface-900 dark:text-white">
                    {order.paymentMethod === "cash" && "💵 Paiement à la livraison"}
                    {order.paymentMethod === "wave" && "🌊 Wave Money"}
                    {order.paymentMethod === "om" && "🍊 Orange Money"}
                    {order.paymentMethod === "free" && "📱 Free Money"}
                    {!["cash", "wave", "om", "free"].includes(order.paymentMethod) && "Autre"}
                  </p>
                </div>
                <div>
                  <p className="text-surface-600 dark:text-surface-400">Statut du paiement</p>
                  <p className={`font-semibold ${
                    order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {order.paymentStatus === "paid" ? "✓ Payé" : "En attente"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-brand-500 via-amber-600 to-orange-800 rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Besoin d'aide ?</h3>
              <p className="text-sm text-amber-100 mb-4">
                Notre service client est à votre disposition
              </p>
              <div className="space-y-3 text-sm">
                <a 
                  href="tel:+221338234567"
                  className="flex items-center gap-2 hover:text-amber-200 transition"
                >
                  <FaPhone />
                  +221 33 823 45 67
                </a>
                <a 
                  href="https://wa.me/221776543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-amber-200 transition"
                >
                  💬 WhatsApp
                </a>
              </div>
             </div> {/* Contact */}
          </div> {/* Informations */}
        </div> {/* grid principal */}

      </div> 
     
  );
};


export default OrderDetails;
