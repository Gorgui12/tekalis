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
  FaExclamationTriangle,
  FaPaperPlane,
  FaClipboardCheck,
  FaMoneyBillWave
} from "react-icons/fa";
import api from "@shared/api/api";
import { useToast } from "@shared/context/ToastContext";
import { formatPrice, formatDate } from "@shared/outils/formatters";

const STATUS_CONFIG = {
  pending:   { bg: "bg-gray-100", text: "text-gray-700", label: "En attente", icon: <FaClock /> },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmée", icon: <FaClipboardCheck /> },
  in_transit:{ bg: "bg-orange-100", text: "text-orange-700", label: "En cours de livraison", icon: <FaPaperPlane /> },
  received:  { bg: "bg-green-100", text: "text-green-700", label: "Livrée", icon: <FaCheckCircle /> },
  disputed:  { bg: "bg-red-100", text: "text-red-700", label: "Litige", icon: <FaExclamationTriangle /> }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
      {config.icon} {config.label}
    </span>
  );
};

const EMPTY_FORM = {
  orderNumber: "",
  date: "",
  supplier: "",
  productsOrdered: "",
  quantity: 0,
  totalAmount: 0,
  depositPaid: 0,
  paymentMethod: "",
  expectedDelivery: "",
  actualDelivery: "",
  status: "pending",
  notes: ""
};

const AdminSupplierOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, [statusFilter, supplierFilter]);

  const buildParams = () => {
    const params = new URLSearchParams();
    params.append("limit", "200");
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (supplierFilter !== "all") params.append("supplier", supplierFilter);
    return params.toString();
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/supplier-orders?${buildParams()}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Erreur chargement commandes fournisseurs:", error);
      toast.error("Erreur lors du chargement des commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get("/admin/suppliers?limit=200");
      setSuppliers(data.suppliers || []);
    } catch {
      setSuppliers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/admin/supplier-orders/${formData._id}`, formData);
        toast.success("Commande fournisseur mise à jour");
      } else {
        await api.post("/admin/supplier-orders", formData);
        toast.success("Commande fournisseur créée");
      }
      resetForm();
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (order) => {
    setFormData({
      ...order,
      supplier: order.supplier?._id || order.supplier || "",
      date: order.date ? order.date.slice(0, 10) : "",
      expectedDelivery: order.expectedDelivery ? order.expectedDelivery.slice(0, 10) : "",
      actualDelivery: order.actualDelivery ? order.actualDelivery.slice(0, 10) : ""
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette commande fournisseur ?")) return;
    try {
      await api.delete(`/admin/supplier-orders/${id}`);
      toast.success("Commande fournisseur supprimée");
      fetchOrders();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/supplier-orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success("Statut mis à jour");
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setShowModal(false);
  };

  const filteredOrders = orders.filter(o =>
    (o.orderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.supplierName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.productsOrdered || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summary = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    inTransit: orders.filter(o => o.status === "in_transit").length,
    received: orders.filter(o => o.status === "received").length,
    disputed: orders.filter(o => o.status === "disputed").length,
    totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    remaining: orders.reduce((sum, o) => sum + (o.remaining || 0), 0)
  };

  const summaryCards = [
    { label: "Total commandes", value: summary.total, icon: <FaClipboardCheck />, color: "bg-blue-50 text-blue-700" },
    { label: "En attente", value: summary.pending, icon: <FaClock />, color: "bg-gray-100 text-gray-700" },
    { label: "En cours de livraison", value: summary.inTransit, icon: <FaPaperPlane />, color: "bg-orange-50 text-orange-700" },
    { label: "Livrées", value: summary.received, icon: <FaCheckCircle />, color: "bg-green-50 text-green-700" },
    { label: "Litiges", value: summary.disputed, icon: <FaExclamationTriangle />, color: "bg-red-50 text-red-700" },
    { label: "Montant total engagé", value: formatPrice(summary.totalAmount), icon: <FaMoneyBillWave />, color: "bg-purple-50 text-purple-700" },
    { label: "Reste à payer", value: formatPrice(summary.remaining), icon: <FaTruck />, color: "bg-yellow-50 text-yellow-700" }
  ];

  if (loading && orders.length === 0) {
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
                📦 Suivi des commandes fournisseurs
              </h1>
              <p className="text-gray-600">
                {filteredOrders.length} commande(s) • Suivi des achats auprès de vos partenaires
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md"
            >
              <FaPlus /> Nouvelle commande
            </button>
          </div>
        </div>

        {/* Synthèse */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div key={card.label} className={`${card.color} rounded-lg shadow-md p-4 text-center`}>
              <div className="text-2xl mb-2 flex justify-center">{card.icon}</div>
              <p className="text-lg font-bold truncate">{card.value}</p>
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
                placeholder="Rechercher par n° commande, fournisseur, produit..."
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
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="in_transit">En cours de livraison</option>
              <option value="received">Livrée</option>
              <option value="disputed">Litige</option>
            </select>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les fournisseurs</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>
                  {s.supplierId} — {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fournisseur</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produits</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Qté</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reste à payer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Livraison prévue</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-12">
                      <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune commande fournisseur trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm font-semibold text-blue-600">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(order.date)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold text-gray-900">{order.supplierName || "—"}</p>
                        {order.supplierId && (
                          <p className="text-xs text-gray-500 font-mono">{order.supplierId}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 max-w-[220px] truncate" title={order.productsOrdered}>
                          {order.productsOrdered || "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.quantity || 0}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                        <p className="text-xs text-gray-500">Acompte : {formatPrice(order.depositPaid)}</p>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-red-600">
                        {formatPrice(order.remaining)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(order.expectedDelivery) || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_CONFIG[order.status]?.bg || "bg-gray-100"}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(order)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
                          >
                            <FaTrash />
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
                  {editMode ? "Modifier la commande" : "Nouvelle commande fournisseur"}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fournisseur
                    </label>
                    <select
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— Sélectionner un fournisseur —</option>
                      {suppliers.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.supplierId} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      N° commande
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto (CMD-2026-001…)"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date de commande
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Produits commandés *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productsOrdered}
                    onChange={(e) => setFormData({ ...formData, productsOrdered: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: iPhone 15 x2, Samsung Galaxy S24 Ultra x1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mode de paiement
                    </label>
                    <input
                      type="text"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Wave, Orange Money, Virement, À la livraison"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Montant total (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Acompte versé (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.depositPaid}
                      onChange={(e) => setFormData({ ...formData, depositPaid: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {formData.totalAmount > 0 && (
                  <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm font-semibold">
                    Reste à payer : {formatPrice(Math.max(0, formData.totalAmount - formData.depositPaid))}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Livraison prévue
                    </label>
                    <input
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Livraison réelle
                    </label>
                    <input
                      type="date"
                      value={formData.actualDelivery}
                      onChange={(e) => setFormData({ ...formData, actualDelivery: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes de suivi..."
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
                    {editMode ? "Mettre à jour" : "Créer la commande"}
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

export default AdminSupplierOrders;