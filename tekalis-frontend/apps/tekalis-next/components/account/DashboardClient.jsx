"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { 
  FaMapMarkerAlt, 
  FaUser,
  FaChartLine,
  FaTruck,
  FaShieldAlt,
  FaTools,
  FaHeart,
  FaBox
} from "react-icons/fa";
import api from "@/lib/api";
import DashboardStats from "@/components/account/DashboardStats";
import RecentOrders from "@/components/account/RecentOrders";

const ClientDashboard = () => {
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    warranties: 0,
    rma: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    // Charger les stats dashboard
    try {
      const { data } = await api.get("/users/dashboard");
      const d = data?.dashboard || data || {};
      setStats({
        orders: d.stats?.totalOrders ?? 0,
        wishlist: d.stats?.wishlistCount ?? 0,
        warranties: d.stats?.activeWarranties ?? 0,
        rma: d.stats?.openRMA ?? 0,
        totalSpent: d.stats?.totalSpent ?? 0,
        loyaltyPoints: d.stats?.loyaltyPoints ?? 0
      });
      setLastOrder(d.lastOrder || null);
    } catch (err) {
      console.error("Dashboard stats:", err);
    } finally {
      setLoading(false);
    }

    // Charger les commandes récentes séparément
    try {
      const { data } = await api.get("/orders/my-orders");
      const orders = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
        ? data.orders
        : [];
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error("Recent orders:", err);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const menuItems = [
    {
      to: "/dashboard/orders",
      icon: <FaBox />,
      label: "Mes commandes",
      description: "Historique & suivi",
      color: "blue"
    },
    {
      to: "/dashboard/warranties",
      icon: <FaShieldAlt />,
      label: "Garanties",
      description: "Gérer mes garanties",
      color: "green"
    },
    {
      to: "/dashboard/rma",
      icon: <FaTools />,
      label: "SAV & Retours",
      description: "Demandes SAV",
      color: "orange"
    },
    {
      to: "/dashboard/wishlist",
      icon: <FaHeart />,
      label: "Wishlist",
      description: "Produits favoris",
      color: "red"
    },
    {
      to: "/dashboard/addresses",
      icon: <FaMapMarkerAlt />,
      label: "Adresses",
      description: "Gérer mes adresses",
      color: "purple"
    },
    {
      to: "/profile",
      icon: <FaUser />,
      label: "Mon profil",
      description: "Infos personnelles",
      color: "gray"
    },
  ];

  const colorMap = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
    green: "bg-green-100 text-green-600 group-hover:bg-green-200",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
    red: "bg-red-100 text-red-500 group-hover:bg-red-200",
    purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
    gray: "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre espace personnel Tekalis
          </p>
        </div>

        {/* ── Stats — utilise le composant dédié ── */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Dernière commande */}
        {!loading && lastOrder && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className="text-2xl" />
                  <h3 className="text-xl font-bold">Dernière commande</h3>
                </div>
                <p className="text-blue-100 mb-2">
                  Commande #{lastOrder._id?.slice(-8).toUpperCase()} &middot;{" "}
                  {new Date(lastOrder.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    lastOrder.status === "delivered" ? "bg-green-500" :
                    lastOrder.status === "shipped"   ? "bg-blue-400" :
                    "bg-yellow-500"
                  }`}>
                    {lastOrder.status === "delivered" ? "✓ Livrée" :
                     lastOrder.status === "shipped"   ? "En transit" :
                     "En préparation"}
                  </span>
                  <span className="text-2xl font-bold">
                    {(lastOrder.totalPrice || lastOrder.totalAmount || 0).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
              <Link
                to={`/orders/${lastOrder._id}`}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Voir les détails →
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Menu d'actions rapides */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className={`rounded-full p-2 transition ${colorMap[item.color]}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Commandes récentes — utilise le composant dédié */}
          <div className="lg:col-span-2 space-y-6">
            <RecentOrders orders={recentOrders} loading={ordersLoading} />

            {/* Programme fidélité */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Programme fidélité</h3>
                  <p className="text-purple-100 text-sm">Gagnez des points à chaque achat !</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>

              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">{stats.loyaltyPoints}</span>
                  <span className="text-purple-100">points</span>
                </div>
                <p className="text-sm text-purple-100">
                  = {stats.loyaltyPoints.toLocaleString()} FCFA de réduction disponibles
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-purple-100 mb-1">Total dépensé</p>
                  <p className="font-bold text-lg">
                    {(stats.totalSpent || 0).toLocaleString()} FCFA
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-purple-100 mb-1">Niveau</p>
                  <p className="font-bold text-lg">
                    {(stats.totalSpent || 0) >= 100000 ? "Gold 🥇" : 
                     (stats.totalSpent || 0) >= 50000  ? "Silver 🥈" : "Bronze 🥉"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
