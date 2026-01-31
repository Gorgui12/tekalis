import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaBox, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaDownload,
  FaRedo,
  FaTimes
} from "react-icons/fa";
import api from "../../api/api";

const MyOrders = () => {
  const navigate = useNavigate();
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

    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data);
      } catch (error) {
        console.error("Erreur chargement commandes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Filtrer les commandes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products?.some(p => 
        p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = 
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length
  };

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente", icon: "⏳" },
      processing: { bg: "bg-blue-100", text: "text-blue-700", label: "En préparation", icon: "📦" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Expédiée", icon: "🚚" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Livrée", icon: "✓" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulée", icon: "✗" }
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Retour au dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 Mes Commandes
          </h1>
          <p className="text-gray-600">
            Suivez et gérez toutes vos commandes
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
            <p className="text-xs text-gray-600">En préparation</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
            <p className="text-xs text-gray-600">Expédiées</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
            <p className="text-xs text-gray-600">Livrées</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
            <p className="text-xs text-gray-600">Annulées</p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de commande ou produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaFilter />
                Filtres
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="hidden sm:block border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Filtres mobile */}
          {showFilters && (
            <div className="sm:hidden mt-4 pt-4 border-t">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          )}
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all" 
                ? "Aucune commande trouvée" 
                : "Vous n'avez pas encore de commande"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Essayez de modifier vos filtres"
                : "Commencez vos achats dès maintenant !"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Réinitialiser les filtres
              </button>
            )}
            {!searchTerm && statusFilter === "all" && (
              <Link
                to="/products"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
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
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                {/* En-tête de commande */}
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">
                        Commande #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600">
                      Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {order.totalPrice?.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm text-gray-600">
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
                          className="w-16 h-16 object-contain rounded border"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {item.product?.name || "Produit"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantité: {item.quantity} × {item.price?.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products?.length > 2 && (
                      <p className="text-sm text-gray-600 italic">
                        + {order.products.length - 2} autre(s) produit(s)
                      </p>
                    )}
                  </div>

                  {/* Infos livraison */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Livraison:</span> {order.deliveryAddress}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Paiement:</span>{" "}
                      {order.paymentMethod === "cash" ? "À la livraison" :
                       order.paymentMethod === "wave" ? "Wave Money" :
                       order.paymentMethod === "om" ? "Orange Money" :
                       order.paymentMethod === "free" ? "Free Money" : "Autre"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center flex items-center justify-center gap-2 transition"
                    >
                      <FaEye />
                      Voir détails
                    </Link>

                    {order.status === "delivered" && (
                      <>
                        <button
                          onClick={() => navigate(`/orders/${order._id}/invoice`)}
                          className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <FaDownload />
                          Facture
                        </button>
                        <button
                          onClick={() => navigate(`/rma/create?orderId=${order._id}`)}
                          className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <FaRedo />
                          Retour/SAV
                        </button>
                      </>
                    )}

                    {order.status === "pending" && (
                      <button
                        onClick={() => {
                          if (window.confirm("Voulez-vous vraiment annuler cette commande ?")) {
                            // Appel API pour annuler
                            api.put(`/orders/${order._id}/cancel`)
                              .then(() => {
                                alert("Commande annulée avec succès");
                                window.location.reload();
                              })
                              .catch(err => {
                                alert("Erreur lors de l'annulation");
                              });
                          }
                        }}
                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
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

        {/* Message info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            💡 Besoin d'aide ?
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Pour toute question concernant vos commandes, contactez notre service client.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="tel:+221338234567"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              📞 +221 33 823 45 67
            </a>
            <a
              href="mailto:support@tekalis.sn"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ✉️ support@tekalis.sn
            </a>
            <a
              href="https://wa.me/221776543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;