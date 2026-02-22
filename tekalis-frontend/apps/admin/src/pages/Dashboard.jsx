import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTruck
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0, pending: 0 },
    products: { total: 0, outOfStock: 0 },
    users: { total: 0, newThisMonth: 0 }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const [statsRes, ordersRes, productsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/stats/recent-orders"),
      api.get("/admin/stats/top-products"),
    ]);

    const apiStats = statsRes.data;

    setStats({
      revenue: {
        total: apiStats.totalRevenue || 0,
        change: 0, // à calculer plus tard
      },
      orders: {
        total: apiStats.totalOrders || 0,
        change: 0,
        pending: apiStats.pendingOrders || 0,
      },
      products: {
        total: apiStats.totalProducts || 0,
        outOfStock: apiStats.outOfStock || 0,
      },
      users: {
        total: apiStats.totalUsers || 0,
        newThisMonth: 0,
      },
    });

    setRecentOrders(ordersRes.data.orders || []);
    setTopProducts(productsRes.data.products || []);
    setRecentActivities(getDemoActivities());

  } catch (error) {
    console.error("Erreur chargement dashboard:", error);
    setStats(getDemoStats());
    setRecentOrders(getDemoOrders());
    setTopProducts(getDemoProducts());
    setRecentActivities(getDemoActivities());
  } finally {
    setLoading(false);
  }
};



  // Données de démo
  const getDemoStats = () => ({
    revenue: { total: 45678900, change: 12.5 },
    orders: { total: 1247, change: 8.3, pending: 23 },
    products: { total: 342, outOfStock: 8 },
    users: { total: 5678, newThisMonth: 234 }
  });

  const getDemoOrders = () => [
    {
      _id: "ORD001",
      customer: "Mamadou Diop",
      total: 850000,
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      _id: "ORD002",
      customer: "Fatou Sall",
      total: 1200000,
      status: "processing",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      _id: "ORD003",
      customer: "Ousmane Dia",
      total: 650000,
      status: "shipped",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "ORD004",
      customer: "Aissatou Ndiaye",
      total: 2100000,
      status: "delivered",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  const getDemoProducts = () => [
    { name: "HP Pavilion Gaming 15", sales: 45, revenue: 29250000 },
    { name: "Dell XPS 13", sales: 38, revenue: 55100000 },
    { name: "MacBook Air M2", sales: 32, revenue: 52800000 },
    { name: "Lenovo Legion 5", sales: 28, revenue: 51800000 },
    { name: "Asus Vivobook", sales: 67, revenue: 28475000 }
  ];

  const getDemoActivities = () => [
    { type: "order", message: "Nouvelle commande #ORD001", time: "Il y a 2h" },
    { type: "product", message: "Produit ajouté: Samsung Galaxy S24", time: "Il y a 4h" },
    { type: "review", message: "Nouvel avis 5★ sur HP Pavilion", time: "Il y a 6h" },
    { type: "user", message: "Nouvel utilisateur: cheikh@email.com", time: "Il y a 8h" }
  ];

  // StatCard Component
  const StatCard = ({ title, value, change, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-sm font-semibold ${
            change >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );

  // Status Badge
  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
      processing: { bg: "bg-blue-100", text: "text-blue-700", label: "En traitement" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Expédiée" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Livrée" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulée" }
    };
    const config = configs[status] || configs.pending;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de votre boutique e-commerce
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Revenu total"
            value={`${(stats.revenue.total / 1000000).toFixed(1)}M FCFA`}
            change={stats.revenue.change}
            icon={<FaDollarSign className="text-2xl" />}
            color="#10b981"
            subtitle="Ce mois"
          />
          
          <StatCard
            title="Commandes"
            value={stats.orders.total.toLocaleString()}
            change={stats.orders.change}
            icon={<FaShoppingCart className="text-2xl" />}
            color="#3b82f6"
            subtitle={`${stats.orders.pending} en attente`}
          />
          
          <StatCard
            title="Produits"
            value={stats.products.total}
            icon={<FaBox className="text-2xl" />}
            color="#f59e0b"
            subtitle={`${stats.products.outOfStock} en rupture`}
          />
          
          <StatCard
            title="Utilisateurs"
            value={stats.users.total.toLocaleString()}
            icon={<FaUsers className="text-2xl" />}
            color="#8b5cf6"
            subtitle={`+${stats.users.newThisMonth} ce mois`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                🛒 Commandes récentes
              </h2>
              <Link
                to="/admin/orders"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Voir tout →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Client</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Montant</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm font-medium text-gray-900">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {order.customer}
                      </td>
                      <td className="py-3 px-2 text-sm font-semibold text-gray-900">
                        {order.total.toLocaleString()} FCFA
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FaEye className="inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🔔 Activité récente
            </h2>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const icons = {
                  order: <FaShoppingCart className="text-blue-600" />,
                  product: <FaBox className="text-green-600" />,
                  review: <FaCheckCircle className="text-yellow-600" />,
                  user: <FaUsers className="text-purple-600" />
                };

                return (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {icons[activity.type]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              🏆 Top 5 Produits
            </h2>
            <Link
              to="/admin/products"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Gérer les produits →
            </Link>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {topProducts.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                    {product.sales} ventes
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  {(product.revenue / 1000000).toFixed(1)}M FCFA
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/add-product"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center"
          >
            <FaBox className="text-4xl mx-auto mb-3" />
            <p className="font-bold text-lg">Ajouter un produit</p>
          </Link>

          <Link
            to="/admin/orders?status=pending"
            className="bg-gradient-to-br from-orange-600 to-red-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center"
          >
            <FaClock className="text-4xl mx-auto mb-3" />
            <p className="font-bold text-lg">Commandes en attente</p>
            <p className="text-sm mt-1">{stats.orders.pending} à traiter</p>
          </Link>

          <Link
            to="/admin/products?stock=low"
            className="bg-gradient-to-br from-yellow-600 to-orange-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center"
          >
            <FaTruck className="text-4xl mx-auto mb-3" />
            <p className="font-bold text-lg">Stock faible</p>
            <p className="text-sm mt-1">{stats.products.outOfStock} produits</p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center"
          >
            <FaUsers className="text-4xl mx-auto mb-3" />
            <p className="font-bold text-lg">Utilisateurs</p>
            <p className="text-sm mt-1">{stats.users.total} inscrits</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;