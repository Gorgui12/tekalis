import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaArrowUp, 
  FaArrowDown,
  FaCalendarAlt,
  FaDownload,
  FaFilter
} from "react-icons/fa";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import api from "../../../../packages/shared/api/api";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days"); // 7days, 30days, 90days, year
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    orders: [],
    products: [],
    customers: [],
    categories: [],
    stats: {}
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/admin/analytics?period=${period}`);
      setAnalyticsData(data || getDemoAnalytics());
    } catch (error) {
      console.error("Erreur chargement analytics:", error);
      setAnalyticsData(getDemoAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getDemoAnalytics = () => ({
    stats: {
      totalRevenue: 45678900,
      revenueChange: 12.5,
      totalOrders: 1247,
      ordersChange: 8.3,
      avgOrderValue: 366400,
      avgOrderChange: 4.2,
      newCustomers: 234,
      customersChange: 15.7,
      conversionRate: 2.8,
      conversionChange: 0.5
    },
    revenue: [
      { date: "01 Jan", revenue: 2500000, orders: 85 },
      { date: "05 Jan", revenue: 3200000, orders: 92 },
      { date: "10 Jan", revenue: 2800000, orders: 78 },
      { date: "15 Jan", revenue: 4100000, orders: 105 },
      { date: "20 Jan", revenue: 3800000, orders: 98 },
      { date: "25 Jan", revenue: 4500000, orders: 112 },
      { date: "30 Jan", revenue: 5200000, orders: 128 }
    ],
    categories: [
      { name: "Laptops", value: 45, revenue: 20500000 },
      { name: "PC Bureau", value: 25, revenue: 11400000 },
      { name: "Composants", value: 15, revenue: 6800000 },
      { name: "Périphériques", value: 10, revenue: 4500000 },
      { name: "Accessoires", value: 5, revenue: 2200000 }
    ],
    topProducts: [
      { name: "HP Pavilion", sales: 45, revenue: 29250000 },
      { name: "Dell XPS 13", sales: 38, revenue: 55100000 },
      { name: "MacBook Air", sales: 32, revenue: 52800000 },
      { name: "Lenovo Legion", sales: 28, revenue: 51800000 }
    ],
    customers: [
      { date: "Semaine 1", new: 45, returning: 120 },
      { date: "Semaine 2", new: 52, returning: 135 },
      { date: "Semaine 3", new: 38, returning: 142 },
      { date: "Semaine 4", new: 61, returning: 158 }
    ]
  });

  // Colors for charts
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // StatCard Component
  const StatCard = ({ title, value, change, icon, color, subtitle }) => {
    const isPositive = change >= 0;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }} className="text-2xl">{icon}</div>
          </div>
          <span className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}>
            {isPositive ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()} {entry.name.includes("Revenue") ? "FCFA" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📊 Analytics & Rapports
              </h1>
              <p className="text-gray-600">
                Analyse détaillée des performances de votre boutique
              </p>
            </div>

            <div className="flex gap-3">
              {/* Period Filter */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="year">Cette année</option>
              </select>

              {/* Export Button */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <FaDownload /> Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Revenu total"
            value={`${(analyticsData.stats.totalRevenue / 1000000).toFixed(1)}M`}
            change={analyticsData.stats.revenueChange}
            icon="💰"
            color="#10b981"
            subtitle="FCFA"
          />
          
          <StatCard
            title="Commandes"
            value={analyticsData.stats.totalOrders.toLocaleString()}
            change={analyticsData.stats.ordersChange}
            icon="🛒"
            color="#3b82f6"
            subtitle={`${period === "7days" ? "7" : period === "30days" ? "30" : "90"} jours`}
          />
          
          <StatCard
            title="Panier moyen"
            value={`${Math.round(analyticsData.stats.avgOrderValue / 1000)}K`}
            change={analyticsData.stats.avgOrderChange}
            icon="📈"
            color="#f59e0b"
            subtitle="FCFA"
          />
          
          <StatCard
            title="Nouveaux clients"
            value={analyticsData.stats.newCustomers}
            change={analyticsData.stats.customersChange}
            icon="👥"
            color="#8b5cf6"
          />
          
          <StatCard
            title="Taux conversion"
            value={`${analyticsData.stats.conversionRate}%`}
            change={analyticsData.stats.conversionChange}
            icon="✨"
            color="#ef4444"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📈 Évolution du chiffre d'affaires
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenu (FCFA)"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                name="Commandes"
                stroke="#10b981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🏆 Top Produits
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenu (FCFA)" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Categories Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📊 Répartition par catégorie
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {analyticsData.categories.map((cat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(cat.revenue / 1000000).toFixed(1)}M FCFA
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Acquisition */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            👥 Acquisition de clients
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.customers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="new" name="Nouveaux" fill="#10b981" />
              <Bar dataKey="returning" name="Récurrents" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📌 Métriques clés
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="text-sm text-gray-600 mb-1">Taux de rebond</p>
              <p className="text-2xl font-bold text-gray-900">42.3%</p>
              <p className="text-xs text-gray-500 mt-1">↓ 5.2% vs mois dernier</p>
            </div>
            
            <div className="border-l-4 border-green-600 pl-4">
              <p className="text-sm text-gray-600 mb-1">Durée session moyenne</p>
              <p className="text-2xl font-bold text-gray-900">4m 32s</p>
              <p className="text-xs text-gray-500 mt-1">↑ 0m 18s vs mois dernier</p>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-600 mb-1">Pages par session</p>
              <p className="text-2xl font-bold text-gray-900">5.8</p>
              <p className="text-xs text-gray-500 mt-1">↑ 0.3 vs mois dernier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;