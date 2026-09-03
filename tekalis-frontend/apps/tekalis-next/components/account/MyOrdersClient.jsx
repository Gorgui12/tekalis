"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  FaBox,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaRedo,
  FaTimes,
} from "react-icons/fa";
import api from "@/lib/api";
import { useToast } from "@/components/shared/ToastProvider";

const MyOrders = () => {
  const toast = useToast();
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/my-orders");
      // ✅ FIX : normalise le format de réponse API
      const ordersArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setOrders(ordersArray);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les commandes — orders est toujours un tableau maintenant
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products?.some((p) =>
        p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente", icon: "⏳" },
      processing: { bg: "bg-brand-100", text: "text-brand-700", label: "En préparation", icon: "📦" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Expédiée", icon: "🚚" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Livrée", icon: "✓" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulée", icon: "✗" },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500 mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold">
              ← Retour au dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2 font-display">📦 Mes Commandes</h1>
          <p className="text-surface-600 dark:text-surface-400">Suivez et gérez toutes vos commandes</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "bg-white dark:bg-surface-800" },
            { label: "En attente", value: stats.pending, color: "bg-yellow-50 dark:bg-yellow-900/20" },
            { label: "En préparation", value: stats.processing, color: "bg-brand-50 dark:bg-brand-900/20" },
            { label: "Expédiées", value: stats.shipped, color: "bg-purple-50 dark:bg-purple-900/20" },
            { label: "Livrées", value: stats.delivered, color: "bg-green-50 dark:bg-green-900/20" },
            { label: "Annulées", value: stats.cancelled, color: "bg-red-50 dark:bg-red-900/20" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl shadow-card p-4 text-center`}>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-surface-600 dark:text-surface-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-700 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-surface-300 dark:border-surface-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-700 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En préparation</option>
              <option value="shipped">Expédiées</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== "all"
                ? "Aucune commande trouvée"
                : "Vous n'avez pas encore de commande"}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Essayez de modifier vos filtres"
                : "Commencez vos achats dès maintenant !"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link href="/products"
                className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Découvrir nos produits
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-elevated transition overflow-hidden"
              >
                {/* En-tête de commande */}
                <div className="bg-surface-50 dark:bg-surface-700 px-6 py-4 border-b border-surface-200 dark:border-surface-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-surface-900 dark:text-white">
                        Commande #{order._id?.slice(-8).toUpperCase()}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      Passée le{" "}
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      {order.totalPrice?.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {order.products?.length || 0} article(s)
                    </p>
                  </div>
                </div>

                {/* Produits */}
                <div className="px-6 py-4">
                  <div className="space-y-3 mb-4">
                    {order.products?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <img
                          src={item.product?.image || "/placeholder.png"}
                          alt={item.product?.name}
                          className="w-16 h-16 object-contain rounded border border-surface-200 dark:border-surface-700"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-surface-900 dark:text-white line-clamp-1">
                            {item.product?.name || "Produit"}
                          </p>
                          <p className="text-sm text-surface-600 dark:text-surface-400">
                            Quantité: {item.quantity} × {item.price?.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products?.length > 2 && (
                      <p className="text-sm text-surface-500 dark:text-surface-400 italic">
                        + {order.products.length - 2} autre(s) produit(s)
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/orders/${order._id}`}
                      className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold text-center flex items-center justify-center gap-2 transition"
                    >
                      <FaEye />
                      Voir détails
                    </Link>

                    {order.status === "delivered" && (
                      <button
                        onClick={() => navigate(`/dashboard/rma/create?orderId=${order._id}`)}
                        className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaRedo />
                        Retour/SAV
                      </button>
                    )}

                    {order.status === "pending" && (
                      <button
                        onClick={() => {
                          if (window.confirm("Voulez-vous vraiment annuler cette commande ?")) {
                            api
                              .put(`/orders/${order._id}/cancel`)
                              .then(() => {
                                toast.success("Commande annulée");
                                fetchOrders();
                              })
                              .catch(() => toast.error("Erreur lors de l'annulation"));
                          }
                        }}
                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaTimes />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support */}
        <div className="mt-8 bg-brand-50 dark:bg-brand-900/20 rounded-xl p-6">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-2">💡 Besoin d'aide ?</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:+221786346946" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
              📞 +221 78 634 69 46
            </a>
            <a href="https://wa.me/221786346946" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
