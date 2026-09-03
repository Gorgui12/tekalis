"use client";

import { useEffect, useCallback, useState } from "react";
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
import useFetchOnce from "@/lib/hooks/useFetchOnce";

const ClientDashboard = () => {
  const router = useRouter();
  // ✅ Sélectionner uniquement les primitives stables (ID, name) au lieu de
  // l'objet user entier pour éviter que l'effet ne se re-déclenche à chaque
  // re-render / rehydration redux-persist.
  const userId = useSelector((state) => state.auth?.user?._id);
  const userName = useSelector((state) => state.auth?.user?.name);
  const [isChecking, setIsChecking] = useState(true);

  // ✅ Fetch #1 : stats dashboard — fonction stable (useCallback), un seul appel
  const fetchDashboardStats = useCallback(async (signal) => {
    const { data } = await api.get("/users/dashboard", { signal });
    const d = data?.dashboard || data || {};
    return {
      stats: {
        orders: d.stats?.totalOrders ?? 0,
        wishlist: d.stats?.wishlistCount ?? 0,
        warranties: d.stats?.activeWarranties ?? 0,
        rma: d.stats?.openRMA ?? 0,
        totalSpent: d.stats?.totalSpent ?? 0,
        loyaltyPoints: d.stats?.loyaltyPoints ?? 0,
      },
      lastOrder: d.lastOrder || null,
    };
  }, []);

  // ✅ Fetch #2 : commandes récentes — fonction stable (useCallback), un seul appel
  const fetchRecentOrders = useCallback(async (signal) => {
    const { data } = await api.get("/orders/my-orders", { signal });
    const orders = Array.isArray(data)
      ? data
      : Array.isArray(data?.orders)
      ? data.orders
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return orders.slice(0, 5);
  }, []);

  // ✅ Deux hooks useFetchOnce indépendants — un seul appel par endpoint au montage
  //    Déduplication intégrée (StrictMode, Fast Refresh, re-renders) + AbortController
  const { data: dashboardData, loading } = useFetchOnce(
    fetchDashboardStats,
    [userId],
    !!userId && !isChecking
  );

  const { data: recentOrders, loading: ordersLoading } = useFetchOnce(
    fetchRecentOrders,
    [userId],
    !!userId && !isChecking
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500"></div>
      </div>
    );
  }

  // ✅ Extraire stats et lastOrder du résultat, avec valeurs par défaut
  const stats = dashboardData?.stats || {
    orders: 0,
    wishlist: 0,
    warranties: 0,
    rma: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  };
  const lastOrder = dashboardData?.lastOrder || null;

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
    blue: "bg-brand-100 text-brand-600 group-hover:bg-brand-200",
    green: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
    red: "bg-rose-100 text-rose-500 group-hover:bg-rose-200",
    purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
    gray: "bg-surface-100 text-surface-600 group-hover:bg-surface-200",
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-surface-900 dark:text-white mb-1">
            Bonjour, {userName} 👋
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Bienvenue dans votre espace personnel Tekalis
          </p>
        </div>

        {/* ── Stats — utilise le composant dédié ── */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Dernière commande */}
        {!loading && lastOrder && (
          <div className="bg-gradient-to-r from-brand-500 to-orange-700 rounded-2xl shadow-elevated p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className="text-2xl" />
                  <h3 className="text-xl font-bold font-display">Dernière commande</h3>
                </div>
                <p className="text-amber-100 mb-2">
                  Commande #{lastOrder._id?.slice(-8).toUpperCase()} &middot;{" "}
                  {new Date(lastOrder.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    lastOrder.status === "delivered" ? "bg-emerald-500" :
                    lastOrder.status === "shipped"   ? "bg-sky-400" :
                    "bg-amber-500"
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
              <Link href={`/dashboard/orders/${lastOrder._id}`}
                className="bg-white text-brand-600 px-6 py-3 rounded-xl font-semibold hover:bg-brand-50 transition"
              >
                Voir les détails →
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Menu d'actions rapides */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-4">
                Actions rapides
              </h3>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.to}
                    href={item.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition group"
                  >
                    <div className={`rounded-full p-2 transition ${colorMap[item.color]}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-surface-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Commandes récentes — utilise le composant dédié */}
          <div className="lg:col-span-2 space-y-6">
            <RecentOrders orders={recentOrders || []} loading={ordersLoading} />

            {/* Programme fidélité */}
            <div className="bg-gradient-to-r from-amber-500 to-brand-600 rounded-2xl shadow-elevated p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold font-display mb-1">Programme fidélité</h3>
                  <p className="text-amber-100 text-sm">Gagnez des points à chaque achat !</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>

              <div className="bg-white/20 rounded-xl p-4 mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">{stats.loyaltyPoints}</span>
                  <span className="text-amber-100">points</span>
                </div>
                <p className="text-sm text-amber-100">
                  = {stats.loyaltyPoints.toLocaleString()} FCFA de réduction disponibles
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/20 rounded-xl p-3">
                  <p className="text-amber-100 mb-1">Total dépensé</p>
                  <p className="font-bold text-lg">
                    {(stats.totalSpent || 0).toLocaleString()} FCFA
                  </p>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                  <p className="text-amber-100 mb-1">Niveau</p>
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

