import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaHandshake,
  FaBan,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaClipboardList,
  FaStar,
  FaEnvelope,
  FaPhoneAlt
} from "react-icons/fa";
import api from "@shared/api/api";
import { useToast } from "@shared/context/ToastContext";
import { formatPrice, formatRating } from "@shared/outils/formatters";

const RESULTS = [
  { key: "active",    label: "Oui" },
  { key: "no",        label: "Non" },
  { key: "conditional", label: "Sous conditions" }
];

const STATUS_CONFIG = {
  active:     { bg: "bg-green-100", text: "text-green-700", label: "Actif",     icon: <FaCheckCircle /> },
  discussion: { bg: "bg-orange-100", text: "text-orange-700", label: "En discussion", icon: <FaHandshake /> },
  suspended:  { bg: "bg-red-100", text: "text-red-700", label: "Suspendu",  icon: <FaBan /> },
  inactive:   { bg: "bg-gray-200", text: "text-gray-700", label: "Inactif",   icon: <FaClock /> }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
      {config.icon} {config.label}
    </span>
  );
};

const EMPTY_FORM = {
  supplierId: "",
  status: "discussion",
  name: "",
  contactName: "",
  phone: "",
  whatsapp: "",
  email: "",
  location: "",
  categories: "",
  brands: "",
  leadTime: "",
  paymentTerms: "",
  discountRate: 0,
  minOrderAmount: 0,
  shippingMode: "",
  returnsAccepted: "no",
  qualityRating: 0,
  lastContact: "",
  notes: ""
};

const AdminSuppliers = () => {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
  }, [statusFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "200");
      if (statusFilter !== "all") params.append("status", statusFilter);
      const { data } = await api.get(`/admin/suppliers?${params.toString()}`);
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error("Erreur chargement fournisseurs:", error);
      toast.error("Erreur lors du chargement des fournisseurs");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/suppliers/stats");
      setStats(data.stats || null);
    } catch (error) {
      console.error("Erreur chargement statistiques fournisseurs:", error);
      setStats(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/admin/suppliers/${formData._id}`, formData);
        toast.success("Fournisseur mis à jour");
      } else {
        await api.post("/admin/suppliers", formData);
        toast.success("Fournisseur créé");
      }
      resetForm();
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      ...supplier,
      categories: (supplier.categories || []).join(", "),
      brands: (supplier.brands || []).join(", "),
      lastContact: supplier.lastContact ? supplier.lastContact.slice(0, 10) : ""
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
    try {
      await api.delete(`/admin/suppliers/${id}`);
      toast.success("Fournisseur supprimé");
      fetchSuppliers();
      fetchStats();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setShowModal(false);
  };

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.supplierId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contactName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    {
      label: "Fournisseurs actifs",
      value: stats?.activeSuppliers ?? 0,
      icon: <FaCheckCircle />,
      color: "bg-green-50 text-green-700"
    },
    {
      label: "En discussion",
      value: stats?.inDiscussion ?? 0,
      icon: <FaHandshake />,
      color: "bg-orange-50 text-orange-700"
    },
    {
      label: "Suspendus / Inactifs",
      value: (stats?.suspendedSuppliers ?? 0) + (stats?.inactiveSuppliers ?? 0),
      icon: <FaBan />,
      color: "bg-red-50 text-red-700"
    },
    {
      label: "Commandes en cours",
      value: stats?.openOrders ?? 0,
      icon: <FaHourglassHalf />,
      color: "bg-blue-50 text-blue-700"
    },
    {
      label: "Montant engagé",
      value: stats ? formatPrice(stats.engagedAmount) : "0 FCFA",
      icon: <FaMoneyBillWave />,
      color: "bg-purple-50 text-purple-700"
    },
    {
      label: "Reste à payer",
      value: stats ? formatPrice(stats.remainingToPay) : "0 FCFA",
      icon: <FaClipboardList />,
      color: "bg-yellow-50 text-yellow-700"
    }
  ];

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤝 Gestion des fournisseurs
              </h1>
              <p className="text-gray-600">
                {filteredSuppliers.length} fournisseur(s) • Partenaires de stock (dropshipping)
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md"
            >
              <FaPlus /> Ajouter un fournisseur
            </button>
          </div>
        </div>

        {/* Synthèse (feuille Dashboard du classeur Excel) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statsCards.map((card) => (
            <div key={card.label} className={`${card.color} rounded-lg shadow-md p-4 text-center`}>
              <div className="text-2xl mb-2 flex justify-center">{card.icon}</div>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs font-medium mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, ID, contact, ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="discussion">En discussion</option>
              <option value="suspended">Suspendus</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fournisseur</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Localisation</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catégories</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Délai</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Remise</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Note</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-12">
                      <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun fournisseur trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm font-semibold text-blue-600">
                        {supplier.supplierId}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sm text-gray-900">{supplier.name}</p>
                        <p className="text-xs text-gray-500">{supplier.brands?.join(", ")}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{supplier.contactName || "—"}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaPhoneAlt size={10} /> {supplier.phone || "—"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaEnvelope size={10} /> {supplier.email || "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{supplier.location || "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className="block max-w-[180px] truncate">{supplier.categories?.join(", ") || "—"}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{supplier.leadTime || "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {supplier.discountRate ? `${supplier.discountRate}%` : "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {supplier.qualityRating ? (
                          <span className="inline-flex items-center gap-1">
                            <FaStar className="text-amber-400" size={12} />
                            {formatRating(supplier.qualityRating)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={supplier.status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"
                          >
                            <FaEdit size={12} /> Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(supplier._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
                          >
                            <FaTrash size={12} />
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? "Modifier le fournisseur" : "Nouveau fournisseur"}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ID fournisseur (F001…)
                    </label>
                    <input
                      type="text"
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value.toUpperCase() })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto (F001, F002…)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Actif</option>
                      <option value="discussion">En discussion</option>
                      <option value="suspended">Suspendu</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du fournisseur *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Dakar Tech Distribution"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact principal
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Moussa Diallo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Plateau, Dakar"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@fournisseur.sn"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Catégories fournies (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.categories}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Smartphones, Laptops"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marques (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.brands}
                      onChange={(e) => setFormData({ ...formData, brands: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Apple, Samsung, HP"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Délai de livraison
                    </label>
                    <input
                      type="text"
                      value={formData.leadTime}
                      onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 24-48h, 3-5 jours"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Conditions de paiement
                    </label>
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Paiement à la livraison, 30% avance"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Remise négociée (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountRate}
                      onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Commande min. (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Note qualité /5
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.qualityRating}
                      onChange={(e) => setFormData({ ...formData, qualityRating: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Retours acceptés
                    </label>
                    <select
                      value={formData.returnsAccepted}
                      onChange={(e) => setFormData({ ...formData, returnsAccepted: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {RESULTS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mode d'expédition
                    </label>
                    <input
                      type="text"
                      value={formData.shippingMode}
                      onChange={(e) => setFormData({ ...formData, shippingMode: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Livraison Tekalis, Retrait entrepôt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dernier contact
                    </label>
                    <input
                      type="date"
                      value={formData.lastContact}
                      onChange={(e) => setFormData({ ...formData, lastContact: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observations
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes internes sur ce partenaire..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                  >
                    {editMode ? "Mettre à jour" : "Créer le fournisseur"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Synthèse des fournisseurs actifs */}
        {stats && stats.suppliers && stats.suppliers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mt-8 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Synthèse des partenaires</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fournisseur</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catégories</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Délai moyen</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Remise</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Note</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.suppliers.map(s => (
                    <tr key={s.supplierId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-sm text-gray-900">{s.name}</span>
                        <span className="text-xs text-gray-500 font-mono ml-2">({s.supplierId})</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{s.categories?.join(", ") || "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{s.leadTime}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{s.discountRate ? `${s.discountRate}%` : "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {s.qualityRating ? (
                          <span className="inline-flex items-center gap-1">
                            <FaStar className="text-amber-400" size={12} />
                            {formatRating(s.qualityRating)} / 5
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSuppliers;