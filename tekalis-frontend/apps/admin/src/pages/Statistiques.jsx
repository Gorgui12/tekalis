import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Wrench,
  Shield,
} from 'lucide-react';

// ✅ Fix : import depuis le bon chemin (shared/api/api au lieu de localhost hardcodé)
import api from '../../../../packages/shared/api/api';

// ✅ Fix : import de la Navbar depuis le bon chemin
import AdminHeader from '../components/layout/AdminHeader';

import StatCard     from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import TopProducts  from '../components/dashboard/TopProducts';
import RecentActivity from '../components/dashboard/RecentActivity';
import { formatPrice } from '../../../../packages/shared/outils/formatters';

const Statistiques = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // ✅ Fix : utiliser `api` partagé au lieu de axios.get('http://localhost:5000/...')
        const [statsRes, revenueRes, productsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/stats/revenue'),
          api.get('/admin/stats/top-products'),
        ]);
        setStats(statsRes.data);
        setRevenue(revenueRes.data?.data ?? []);
        setTopProducts(productsRes.data?.products ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
        console.error('Erreur stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de votre activité</p>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={stats ? formatPrice(stats.totalRevenue ?? 0) : '—'}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          trend={stats?.revenueTrend}
          loading={loading}
          className="xl:col-span-2"
        />
        <StatCard
          title="Commandes"
          value={stats?.totalOrders ?? '—'}
          icon={ShoppingCart}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          trend={stats?.ordersTrend}
          loading={loading}
        />
        <StatCard
          title="Produits"
          value={stats?.totalProducts ?? '—'}
          subtitle={stats?.lowStockCount ? `${stats.lowStockCount} en stock faible` : undefined}
          icon={Package}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
          loading={loading}
        />
        <StatCard
          title="Clients"
          value={stats?.totalCustomers ?? '—'}
          icon={Users}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/10"
          trend={stats?.customersTrend}
          loading={loading}
        />
        <StatCard
          title="SAV ouverts"
          value={stats?.openRMA ?? '—'}
          icon={Wrench}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/10"
          loading={loading}
        />
        <StatCard
          title="Garanties actives"
          value={stats?.activeWarranties ?? '—'}
          icon={Shield}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          loading={loading}
        />
      </div>

      {/* Graphiques + activité */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RevenueChart data={revenue} loading={loading} />
        </div>
        <RecentActivity activities={activities} loading={loading} />
      </div>

      {/* Top produits */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <TopProducts products={topProducts} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Statistiques;