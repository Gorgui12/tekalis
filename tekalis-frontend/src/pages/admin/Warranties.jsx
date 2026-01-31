import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaShieldAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle
} from "react-icons/fa";
import api from "../../api/api";

const AdminWarranties = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchWarranties();
  }, [statusFilter]);

  const fetchWarranties = async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/admin/warranties${params}`);
      setWarranties(data.warranties || getDemoWarranties());
    } catch (error) {
      console.error("Erreur chargement garanties:", error);
      setWarranties(getDemoWarranties());
    } finally {
      setLoading(false);
    }
  };

  const getDemoWarranties = () => [
    {
      _id: "1",
      orderNumber: "CMD-2025-001",
      customer: { name: "Mamadou Diop", email: "mamadou@email.com" },
      product: { name: "HP Pavilion Gaming 15", model: "15-DK2045NF" },
      warrantyType: "manufacturer",
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      status: "active",
      serialNumber: "5CD123ABCD"
    },
    {
      _id: "2",
      orderNumber: "CMD-2024-156",
      customer: { name: "Fatou Sall", email: "fatou@email.com" },
      product: { name: "Dell XPS 13", model: "XPS13-9310" },
      warrantyType: "extended",
      startDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
      status: "expiring_soon",
      serialNumber: "DXPS987654"
    },
    {
      _id: "3",
      orderNumber: "CMD-2023-089",
      customer: { name: "Ousmane Dia", email: "ousmane@email.com" },
      product: { name: "MacBook Pro 14", model: "M1 Pro 2021" },
      warrantyType: "manufacturer",
      startDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      status: "expired",
      serialNumber: "MBP202145678"
    }
  ];

  // Calculer les jours restants
  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Filtrer les garanties
  const filteredWarranties = warranties.filter(warranty => {
    const matchesSearch = 
      warranty.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: warranties.length,
    active: warranties.filter(w => w.status === "active").length,
    expiring_soon: warranties.filter(w => w.status === "expiring_soon").length,
    expired: warranties.filter(w => w.status === "expired").length
  };

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      active: { 
        bg: "bg-green-100", 
        text: "text-green-700", 
        icon: <FaCheck />,
        label: "Active" 
      },
      expiring_soon: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-700", 
        icon: <FaClock />,
        label: "Expire bientôt" 
      },
      expired: { 
        bg: "bg-red-100", 
        text: "text-red-700", 
        icon: <FaTimes />,
        label: "Expirée" 
      }
    };
    const config = configs[status] || configs.active;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Badge type de garantie
  const WarrantyTypeBadge = ({ type }) => {
    const types = {
      manufacturer: { label: "Constructeur", color: "blue" },
      extended: { label: "Extension", color: "purple" }
    };
    const config = types[type] || types.manufacturer;

    return (
      <span className={`bg-${config.color}-100 text-${config.color}-700 px-3 py-1 rounded-full text-xs font-semibold`}>
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
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Gestion des garanties
          </h1>
          <p className="text-gray-600">
            {filteredWarranties.length} garantie(s) trouvée(s)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-gray-600">Actives</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.expiring_soon}</p>
            <p className="text-xs text-gray-600">Expirent bientôt</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
            <p className="text-xs text-gray-600">Expirées</p>
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
                placeholder="Rechercher par commande, client, produit, série..."
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
              <option value="active">Actives</option>
              <option value="expiring_soon">Expirent bientôt</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Série</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Expiration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarranties.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <FaShieldAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune garantie trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredWarranties.map((warranty) => {
                    const daysRemaining = getDaysRemaining(warranty.endDate);

                    return (
                      <tr key={warranty._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-sm text-gray-900">
                            {warranty.orderNumber}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">
                            {warranty.customer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {warranty.customer.email}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">
                            {warranty.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {warranty.product.model}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-xs font-mono text-gray-700">
                            {warranty.serialNumber}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <WarrantyTypeBadge type={warranty.warrantyType} />
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900">
                            {new Date(warranty.endDate).toLocaleDateString("fr-FR")}
                          </p>
                          {daysRemaining > 0 && (
                            <p className={`text-xs ${
                              daysRemaining <= 30 ? "text-red-600 font-semibold" : "text-gray-500"
                            }`}>
                              {daysRemaining} jour(s) restant(s)
                            </p>
                          )}
                          {daysRemaining < 0 && (
                            <p className="text-xs text-red-600 font-semibold">
                              Expirée depuis {Math.abs(daysRemaining)} jour(s)
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={warranty.status} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => alert("Voir détails - À implémenter")}
                              className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold"
                            >
                              Détails
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert expiring soon */}
        {stats.expiring_soon > 0 && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  {stats.expiring_soon} garantie(s) expirent bientôt
                </h3>
                <p className="text-sm text-yellow-800">
                  Contactez les clients pour proposer une extension de garantie.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWarranties;