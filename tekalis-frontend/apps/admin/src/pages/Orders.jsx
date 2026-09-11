import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit,
  FaDownload,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import api from "@shared/api/api";

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/admin/orders${params}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  
  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length
  };

  // Changer le statut
  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      alert("Statut mis à jour avec succès");
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  // Badge de statut
  const StatusBadge = ({ status, onChange, orderId }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
      processing: { bg: "bg-blue-100", text: "text-blue-700", label: "En traitement" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Expédiée" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Livrée" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulée" }
    };
    const config = configs[status] || configs.pending;

    return (
      <select
        value={status}
        onChange={(e) => onChange && onChange(orderId, e.target.value)}
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-none outline-none`}
      >
        <option value="pending">En attente</option>
        <option value="processing">En traitement</option>
        <option value="shipped">Expédiée</option>
        <option value="delivered">Livrée</option>
        <option value="cancelled">Annulée</option>
      </select>
    );
  };

  // Sélection multiple
  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
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
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 Gestion des commandes
          </h1>
          <p className="text-gray-600">
            {filteredOrders.length} commande(s) trouvée(s)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
            <p className="text-xs text-gray-600">En traitement</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
            <p className="text-xs text-gray-600">Expédiées</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
            <p className="text-xs text-gray-600">Livrées</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, client, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiées</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">
                {selectedOrders.length} sélectionnée(s)
              </span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Marquer comme traitées
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Exporter
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produits</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <p className="text-gray-500">Aucune commande trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleSelectOrder(order._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sm text-gray-900">
                          {order.orderNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
<p className="text-sm font-medium text-gray-900">
                    {order.user?.name || order.customerInfo?.name || order.deliveryName || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.user?.email || order.customerInfo?.email || order.deliveryPhone}
                  </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">
                          {order.products?.length} article(s)
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-gray-900">
                          {order.totalPrice?.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge 
                          status={order.status} 
                          orderId={order._id}
                          onChange={updateStatus}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Voir détails"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => alert("Fonctionnalité à implémenter")}
                            className="text-green-600 hover:text-green-700 p-2"
                            title="Télécharger facture"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;