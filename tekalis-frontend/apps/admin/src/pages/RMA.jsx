import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaTools,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationCircle,
  FaCommentDots
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const AdminRMA = () => {
  const [rmas, setRmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRMA, setSelectedRMA] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRMAs();
  }, [statusFilter]);

  const fetchRMAs = async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/admin/rma${params}`);
      setRmas(data.rmas || getDemoRMAs());
    } catch (error) {
      console.error("Erreur chargement RMA:", error);
      setRmas(getDemoRMAs());
    } finally {
      setLoading(false);
    }
  };

  const getDemoRMAs = () => [
    {
      _id: "1",
      rmaNumber: "RMA-2025-001",
      orderNumber: "CMD-2025-001",
      customer: { name: "Mamadou Diop", email: "mamadou@email.com", phone: "+221 77 123 45 67" },
      product: { name: "HP Pavilion Gaming 15", serialNumber: "5CD123ABCD" },
      reason: "defect",
      description: "L'écran affiche des lignes verticales",
      status: "open",
      priority: "high",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      images: []
    },
    {
      _id: "2",
      rmaNumber: "RMA-2025-002",
      orderNumber: "CMD-2024-156",
      customer: { name: "Fatou Sall", email: "fatou@email.com", phone: "+221 78 234 56 78" },
      product: { name: "Dell XPS 13", serialNumber: "DXPS987654" },
      reason: "malfunction",
      description: "Le clavier ne répond plus",
      status: "in_progress",
      priority: "medium",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      images: []
    },
    {
      _id: "3",
      rmaNumber: "RMA-2024-234",
      orderNumber: "CMD-2024-089",
      customer: { name: "Ousmane Dia", email: "ousmane@email.com", phone: "+221 76 345 67 89" },
      product: { name: "Asus Vivobook", serialNumber: "ASUS456789" },
      reason: "damage",
      description: "Boîtier endommagé à la livraison",
      status: "resolved",
      priority: "low",
      resolution: "Remplacement effectué",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      images: []
    }
  ];

  // Filtrer les RMA
  const filteredRMAs = rmas.filter(rma => {
    const matchesSearch = 
      rma.rmaNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rma.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rma.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rma.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: rmas.length,
    open: rmas.filter(r => r.status === "open").length,
    in_progress: rmas.filter(r => r.status === "in_progress").length,
    resolved: rmas.filter(r => r.status === "resolved").length,
    closed: rmas.filter(r => r.status === "closed").length
  };

  // Mettre à jour le statut
  const updateStatus = async (id, newStatus) => {
    if (!window.confirm(`Changer le statut en "${newStatus}" ?`)) return;
    
    try {
      await api.put(`/admin/rma/${id}/status`, { status: newStatus });
      fetchRMAs();
      alert("Statut mis à jour");
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      open: { 
        bg: "bg-blue-100", 
        text: "text-blue-700", 
        icon: <FaExclamationCircle />,
        label: "Ouverte" 
      },
      in_progress: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-700", 
        icon: <FaClock />,
        label: "En cours" 
      },
      resolved: { 
        bg: "bg-green-100", 
        text: "text-green-700", 
        icon: <FaCheck />,
        label: "Résolue" 
      },
      closed: { 
        bg: "bg-gray-100", 
        text: "text-gray-700", 
        icon: <FaTimes />,
        label: "Fermée" 
      }
    };
    const config = configs[status] || configs.open;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Badge de priorité
  const PriorityBadge = ({ priority }) => {
    const configs = {
      low: { bg: "bg-gray-100", text: "text-gray-700", label: "Basse" },
      medium: { bg: "bg-blue-100", text: "text-blue-700", label: "Moyenne" },
      high: { bg: "bg-orange-100", text: "text-orange-700", label: "Haute" },
      urgent: { bg: "bg-red-100", text: "text-red-700", label: "Urgente" }
    };
    const config = configs[priority] || configs.medium;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  // Badge de raison
  const ReasonBadge = ({ reason }) => {
    const reasons = {
      defect: "Défaut",
      malfunction: "Dysfonctionnement",
      damage: "Dommage",
      return: "Retour",
      exchange: "Échange"
    };

    return (
      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
        {reasons[reason] || reason}
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
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Gestion SAV / RMA
          </h1>
          <p className="text-gray-600">
            {filteredRMAs.length} demande(s) trouvée(s)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
            <p className="text-xs text-gray-600">Ouvertes</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.in_progress}</p>
            <p className="text-xs text-gray-600">En cours</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
            <p className="text-xs text-gray-600">Résolues</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{stats.closed}</p>
            <p className="text-xs text-gray-600">Fermées</p>
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
                placeholder="Rechercher par n° RMA, commande, client, produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="open">Ouvertes</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolues</option>
              <option value="closed">Fermées</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° RMA</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Raison</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priorité</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRMAs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <FaTools className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune demande RMA trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredRMAs.map((rma) => (
                    <tr key={rma._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sm text-blue-600">
                          {rma.rmaNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">
                          {rma.orderNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {rma.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rma.customer.email}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {rma.product.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          SN: {rma.product.serialNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <ReasonBadge reason={rma.reason} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={rma.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={rma.status} />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(rma.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRMA(rma);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold"
                          >
                            Détails
                          </button>
                          {rma.status === "open" && (
                            <button
                              onClick={() => updateStatus(rma._id, "in_progress")}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                            >
                              Traiter
                            </button>
                          )}
                          {rma.status === "in_progress" && (
                            <button
                              onClick={() => updateStatus(rma._id, "resolved")}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                            >
                              Résoudre
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Détails */}
        {showDetailModal && selectedRMA && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRMA.rmaNumber}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Informations client</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Nom:</span> <span className="font-semibold">{selectedRMA.customer.name}</span></p>
                      <p><span className="text-gray-600">Email:</span> {selectedRMA.customer.email}</p>
                      <p><span className="text-gray-600">Téléphone:</span> {selectedRMA.customer.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Informations produit</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Produit:</span> <span className="font-semibold">{selectedRMA.product.name}</span></p>
                      <p><span className="text-gray-600">N° Série:</span> <span className="font-mono">{selectedRMA.product.serialNumber}</span></p>
                      <p><span className="text-gray-600">Commande:</span> {selectedRMA.orderNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Description du problème</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedRMA.description}
                  </p>
                </div>

                {selectedRMA.resolution && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Résolution</h3>
                    <p className="text-gray-700 bg-green-50 p-4 rounded-lg">
                      {selectedRMA.resolution}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    Fermer
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                    Contacter le client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRMA;