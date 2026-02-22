import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCopy,
  FaSearch,
  FaTimes,
  FaTag,
  FaCheck,
  FaClock
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    expiryDate: "",
    isActive: true
  });

  useEffect(() => {
    fetchPromoCodes();
  }, [statusFilter]);

  const fetchPromoCodes = async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/admin/promo-codes${params}`);
      setPromoCodes(data.promoCodes || getDemoPromoCodes());
    } catch (error) {
      console.error("Erreur chargement codes promo:", error);
      setPromoCodes(getDemoPromoCodes());
    } finally {
      setLoading(false);
    }
  };

  const getDemoPromoCodes = () => [
    {
      _id: "1",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minPurchase: 50000,
      maxDiscount: 20000,
      usageLimit: 100,
      usedCount: 23,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "2",
      code: "GAMING50K",
      type: "fixed",
      value: 50000,
      minPurchase: 500000,
      maxDiscount: 50000,
      usageLimit: 50,
      usedCount: 12,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "3",
      code: "SUMMER2024",
      type: "percentage",
      value: 15,
      minPurchase: 100000,
      maxDiscount: 50000,
      usageLimit: 200,
      usedCount: 156,
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isActive: false,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await api.put(`/admin/promo-codes/${formData._id}`, formData);
        alert("Code promo mis à jour");
      } else {
        await api.post("/admin/promo-codes", formData);
        alert("Code promo créé");
      }
      
      fetchPromoCodes();
      resetForm();
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (promoCode) => {
    setFormData({
      ...promoCode,
      expiryDate: new Date(promoCode.expiryDate).toISOString().split("T")[0]
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) return;
    
    try {
      await api.delete(`/admin/promo-codes/${id}`);
      alert("Code promo supprimé");
      fetchPromoCodes();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Code "${code}" copié !`);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      minPurchase: 0,
      maxDiscount: 0,
      usageLimit: 0,
      expiryDate: "",
      isActive: true
    });
    setEditMode(false);
    setShowModal(false);
  };

  // Générer un code aléatoire
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  // Filtrer les codes
  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.isActive).length,
    expired: promoCodes.filter(p => new Date(p.expiryDate) < new Date()).length,
    totalUsed: promoCodes.reduce((sum, p) => sum + p.usedCount, 0)
  };

  // Badge de statut
  const StatusBadge = ({ promoCode }) => {
    const now = new Date();
    const expiry = new Date(promoCode.expiryDate);
    const isExpired = expiry < now;
    const usage = (promoCode.usedCount / promoCode.usageLimit) * 100;

    if (isExpired) {
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Expiré</span>;
    }
    if (usage >= 100) {
      return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Épuisé</span>;
    }
    if (!promoCode.isActive) {
      return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Inactif</span>;
    }
    return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Actif</span>;
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
                🎫 Codes promo
              </h1>
              <p className="text-gray-600">
                {filteredPromoCodes.length} code(s) • {stats.totalUsed} utilisations
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md"
            >
              <FaPlus /> Créer un code promo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-gray-600">Actifs</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
            <p className="text-xs text-gray-600">Expirés</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.totalUsed}</p>
            <p className="text-xs text-gray-600">Utilisations</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un code..."
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
              <option value="expired">Expirés</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Promo Codes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromoCodes.map((promoCode) => {
            const usagePercent = (promoCode.usedCount / promoCode.usageLimit) * 100;
            const daysLeft = Math.ceil((new Date(promoCode.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={promoCode._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FaTag />
                        <h3 className="text-2xl font-bold">{promoCode.code}</h3>
                      </div>
                      <p className="text-sm opacity-90">
                        {promoCode.type === "percentage" 
                          ? `${promoCode.value}% de réduction`
                          : `${promoCode.value.toLocaleString()} FCFA de réduction`
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(promoCode.code)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <StatusBadge promoCode={promoCode} />
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Achat minimum</span>
                      <span className="font-semibold text-gray-900">
                        {promoCode.minPurchase.toLocaleString()} FCFA
                      </span>
                    </div>
                    {promoCode.maxDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Réduction max</span>
                        <span className="font-semibold text-gray-900">
                          {promoCode.maxDiscount.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiration</span>
                      <span className={`font-semibold ${daysLeft <= 7 ? "text-red-600" : "text-gray-900"}`}>
                        {daysLeft > 0 ? `${daysLeft} jours` : "Expiré"}
                      </span>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Utilisations</span>
                      <span>{promoCode.usedCount} / {promoCode.usageLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent >= 100 ? "bg-red-500" : usagePercent >= 75 ? "bg-orange-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(promoCode)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <FaEdit /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(promoCode._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPromoCodes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucun code promo trouvé</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Créer le premier code
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? "Modifier le code promo" : "Nouveau code promo"}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code promo *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="flex-1 border rounded-lg px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: WELCOME10"
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Générer
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de réduction *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (FCFA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valeur *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Achat minimum (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Réduction max (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Limite d'utilisation *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date d'expiration *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Code actif
                  </label>
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
                    {editMode ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromoCodes;