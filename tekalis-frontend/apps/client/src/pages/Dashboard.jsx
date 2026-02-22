import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaBox, 
  FaShieldAlt, 
  FaTools, 
  FaHeart, 
  FaMapMarkerAlt, 
  FaUser,
  FaChartLine,
  FaClock,
  FaTruck,
  FaCheckCircle
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      activeWarranties: 0,
      loyaltyPoints: 0
    },
    lastOrder: null,
    recentOrders: [],
    warranties: []
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Récupérer les données du dashboard
        const [statsRes, ordersRes, warrantiesRes] = await Promise.all([
          api.get("/users/dashboard"),
          api.get("/orders/my-orders"),
          api.get("/warranties")
        ]);

        setDashboardData({
          stats: statsRes.data.dashboard.stats,
          lastOrder: statsRes.data.dashboard.lastOrder,
          recentOrders: ordersRes.data.slice(0, 3),
          warranties: warrantiesRes.data.warranties?.slice(0, 3) || []
        });
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  const { stats, lastOrder, recentOrders, warranties } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre espace personnel Tekalis
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total commandes */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 rounded-full p-3">
                <FaBox className="text-blue-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalOrders}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Commandes totales</p>
          </div>

          {/* Commandes en cours */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-yellow-100 rounded-full p-3">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.pendingOrders}
              </span>
            </div>
            <p className="text-gray-600 font-medium">En cours</p>
          </div>

          {/* Garanties actives */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 rounded-full p-3">
                <FaShieldAlt className="text-green-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.activeWarranties}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Garanties actives</p>
          </div>

          {/* Points fidélité */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 rounded-full p-3">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.loyaltyPoints}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Points fidélité</p>
          </div>
        </div>

        {/* Dernière commande */}
        {lastOrder && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className="text-2xl" />
                  <h3 className="text-xl font-bold">Dernière commande</h3>
                </div>
                <p className="text-blue-100 mb-2">
                  Commande #{lastOrder._id.slice(-6)} • {new Date(lastOrder.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    lastOrder.status === "delivered" ? "bg-green-500" :
                    lastOrder.status === "shipped" ? "bg-blue-500" :
                    "bg-yellow-500"
                  }`}>
                    {lastOrder.status === "delivered" ? "✓ Livrée" :
                     lastOrder.status === "shipped" ? "En transit" :
                     "En préparation"}
                  </span>
                  <span className="text-2xl font-bold">
                    {lastOrder.totalPrice?.toLocaleString()} FCFA
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
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Actions rapides
              </h3>
              
              <div className="space-y-2">
                <Link
                  to="/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition group"
                >
                  <div className="bg-blue-100 rounded-full p-2 group-hover:bg-blue-200">
                    <FaBox className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Mes commandes</p>
                    <p className="text-sm text-gray-500">Historique & suivi</p>
                  </div>
                </Link>

                <Link
                  to="/warranties"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition group"
                >
                  <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-200">
                    <FaShieldAlt className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Garanties</p>
                    <p className="text-sm text-gray-500">Gérer mes garanties</p>
                  </div>
                </Link>

                <Link
                  to="/rma"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition group"
                >
                  <div className="bg-orange-100 rounded-full p-2 group-hover:bg-orange-200">
                    <FaTools className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">SAV & Retours</p>
                    <p className="text-sm text-gray-500">Demandes SAV</p>
                  </div>
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition group"
                >
                  <div className="bg-red-100 rounded-full p-2 group-hover:bg-red-200">
                    <FaHeart className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Wishlist</p>
                    <p className="text-sm text-gray-500">Produits favoris</p>
                  </div>
                </Link>

                <Link
                  to="/addresses"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition group"
                >
                  <div className="bg-purple-100 rounded-full p-2 group-hover:bg-purple-200">
                    <FaMapMarkerAlt className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Adresses</p>
                    <p className="text-sm text-gray-500">Gérer mes adresses</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="bg-gray-100 rounded-full p-2 group-hover:bg-gray-200">
                    <FaUser className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Mon profil</p>
                    <p className="text-sm text-gray-500">Infos personnelles</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Commandes récentes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  📦 Commandes récentes
                </h3>
                <Link
                  to="/orders"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  Voir tout →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aucune commande pour le moment</p>
                  <Link
                    to="/products"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Découvrir nos produits →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      to={`/orders/${order._id}`}
                      className="block border rounded-lg p-4 hover:border-blue-600 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          #{order._id.slice(-6)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status === "delivered" ? "Livrée" :
                           order.status === "shipped" ? "Expédiée" :
                           "En cours"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-blue-600">
                          {order.totalPrice?.toLocaleString()} FCFA
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Garanties actives */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  🛡️ Garanties actives
                </h3>
                <Link
                  to="/warranties"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  Voir tout →
                </Link>
              </div>

              {warranties.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Aucune garantie active
                </p>
              ) : (
                <div className="space-y-3">
                  {warranties.map((warranty) => {
                    const daysRemaining = Math.ceil(
                      (new Date(warranty.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <div
                        key={warranty._id}
                        className="border rounded-lg p-4 hover:border-green-600 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">
                              {warranty.product?.name || "Produit"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Expire le {new Date(warranty.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            daysRemaining > 90 ? "bg-green-100 text-green-700" :
                            daysRemaining > 30 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {daysRemaining} jours restants
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaCheckCircle className="text-green-600" />
                          <span className="text-gray-600">
                            Garantie {warranty.warrantyType} - {warranty.duration} mois
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Programme fidélité */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Programme fidélité</h3>
                  <p className="text-purple-100">Gagnez des points à chaque achat !</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <FaChartLine className="text-3xl" />
                </div>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">{stats.loyaltyPoints}</span>
                  <span className="text-purple-100">points</span>
                </div>
                <p className="text-sm text-purple-100">
                  = {stats.loyaltyPoints} FCFA de réduction disponibles
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-purple-100 mb-1">Total dépensé</p>
                  <p className="font-bold text-lg">
                    {stats.totalSpent?.toLocaleString() || 0} FCFA
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-purple-100 mb-1">Niveau</p>
                  <p className="font-bold text-lg">
                    {stats.totalSpent >= 100000 ? "Gold 🥇" : 
                     stats.totalSpent >= 50000 ? "Silver 🥈" : "Bronze 🥉"}
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