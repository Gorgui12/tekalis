import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter,
  FaCheck,
  FaTimes,
  FaClock,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobileAlt,
  FaEye,
  FaDownload,
  FaExclamationTriangle
} from "react-icons/fa";
import api from "@shared/api/api";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  const fetchPayments = async () => {
    try {
      let params = [];
      if (statusFilter !== "all") params.push(`status=${statusFilter}`);
      if (methodFilter !== "all") params.push(`method=${methodFilter}`);
      
      const queryString = params.length > 0 ? `?${params.join("&")}` : "";
      const { data } = await api.get(`/admin/payments${queryString}`);
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Erreur chargement paiements:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "pending").length,
    completed: payments.filter(p => p.status === "completed").length,
    failed: payments.filter(p => p.status === "failed").length,
    totalAmount: payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  };

  // Valider un paiement
  const validatePayment = async (id) => {
    if (!window.confirm("Confirmer que ce paiement a été reçu ?")) return;

    try {
      await api.put(`/admin/payments/${id}/validate`);
      fetchPayments();
      alert("Paiement validé avec succès");
    } catch (error) {
      console.error("Erreur validation:", error);
      alert("Erreur lors de la validation");
    }
  };

  // Rejeter un paiement
  const rejectPayment = async (id, reason) => {
    const inputReason = reason || prompt("Raison du rejet:");
    if (!inputReason) return;

    try {
      await api.put(`/admin/payments/${id}/reject`, { reason: inputReason });
      fetchPayments();
      alert("Paiement rejeté");
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert("Erreur lors du rejet");
    }
  };

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-700", 
        icon: <FaClock />,
        label: "En attente" 
      },
      completed: { 
        bg: "bg-green-100", 
        text: "text-green-700", 
        icon: <FaCheck />,
        label: "Complété" 
      },
      failed: { 
        bg: "bg-red-100", 
        text: "text-red-700", 
        icon: <FaTimes />,
        label: "Échoué" 
      },
      refunded: { 
        bg: "bg-purple-100", 
        text: "text-purple-700", 
        icon: <FaMoneyBillWave />,
        label: "Remboursé" 
      }
    };
    const config = configs[status] || configs.pending;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Badge de méthode
  const MethodBadge = ({ method }) => {
    const configs = {
      cash: { 
        bg: "bg-gray-100", 
        text: "text-gray-700", 
        icon: <FaMoneyBillWave />,
        label: "Cash" 
      },
      wave: { 
        bg: "bg-blue-100", 
        text: "text-blue-700", 
        icon: <FaMobileAlt />,
        label: "Wave" 
      },
      om: { 
        bg: "bg-orange-100", 
        text: "text-orange-700", 
        icon: <FaMobileAlt />,
        label: "Orange Money" 
      },
      card: { 
        bg: "bg-purple-100", 
        text: "text-purple-700", 
        icon: <FaCreditCard />,
        label: "Carte bancaire" 
      }
    };
    const config = configs[method] || configs.cash;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {config.icon} {config.label}
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
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💳 Gestion des paiements
          </h1>
          <p className="text-gray-600">
            {filteredPayments.length} paiement(s) • {stats.totalAmount.toLocaleString()} FCFA reçus
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
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-xs text-gray-600">Complétés</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
            <p className="text-xs text-gray-600">Échoués</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-lg font-bold text-blue-700">
              {(stats.totalAmount / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-600">FCFA reçus</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par transaction, commande, client..."
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
              <option value="completed">Complétés</option>
              <option value="failed">Échoués</option>
              <option value="refunded">Remboursés</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les méthodes</option>
              <option value="cash">Cash</option>
              <option value="wave">Wave</option>
              <option value="om">Orange Money</option>
              <option value="card">Carte bancaire</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Méthode</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <FaMoneyBillWave className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun paiement trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sm text-blue-600">
                          {payment.transactionId}
                        </p>
                        {payment.reference && (
                          <p className="text-xs text-gray-500 font-mono">
                            {payment.reference}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/orders/${payment.orderId?._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {payment.orderId?.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.customer?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.customer?.email}
                        </p>
                        {payment.phoneNumber && (
                          <p className="text-xs text-gray-500">
                            {payment.phoneNumber}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-gray-900">
                          {payment.amount.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <MethodBadge method={payment.method} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Voir détails"
                          >
                            <FaEye />
                          </button>

                          {payment.status === "pending" && (
                            <>
                              <button
                                onClick={() => validatePayment(payment._id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => rejectPayment(payment._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          {payment.status === "completed" && (
                            <button
                              onClick={() => alert("Fonctionnalité à implémenter")}
                              className="text-gray-600 hover:text-gray-700 p-2"
                              title="Télécharger reçu"
                            >
                              <FaDownload />
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
        {showDetailModal && selectedPayment && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails du paiement
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
                  {/* Transaction Info */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Informations transaction</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Transaction ID:</span> <span className="font-mono font-semibold">{selectedPayment.transactionId}</span></p>
                      <p><span className="text-gray-600">Commande:</span> <span className="font-semibold">{selectedPayment.orderId?.orderNumber}</span></p>
                      <p><span className="text-gray-600">Montant:</span> <span className="font-bold text-green-600">{selectedPayment.amount.toLocaleString()} FCFA</span></p>
                      <p><span className="text-gray-600">Méthode:</span> <MethodBadge method={selectedPayment.method} /></p>
                      <p><span className="text-gray-600">Statut:</span> <StatusBadge status={selectedPayment.status} /></p>
                      {selectedPayment.reference && (
                        <p><span className="text-gray-600">Référence:</span> <span className="font-mono text-xs">{selectedPayment.reference}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Informations client</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Nom:</span> <span className="font-semibold">{selectedPayment.customer?.name}</span></p>
                      <p><span className="text-gray-600">Email:</span> {selectedPayment.customer?.email}</p>
                      {selectedPayment.phoneNumber && (
                        <p><span className="text-gray-600">Téléphone:</span> {selectedPayment.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Historique</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Créé le:</span> {new Date(selectedPayment.createdAt).toLocaleString("fr-FR")}</p>
                    {selectedPayment.paidAt && (
                      <p><span className="text-gray-600">Payé le:</span> {new Date(selectedPayment.paidAt).toLocaleString("fr-FR")}</p>
                    )}
                    {selectedPayment.failedAt && (
                      <p><span className="text-gray-600">Échoué le:</span> {new Date(selectedPayment.failedAt).toLocaleString("fr-FR")}</p>
                    )}
                  </div>
                </div>

                {/* Failure Reason */}
                {selectedPayment.failureReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-red-600 mt-1" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">Raison de l'échec</p>
                        <p className="text-sm text-red-700">{selectedPayment.failureReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPayment.notes && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    Fermer
                  </button>
                  {selectedPayment.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          validatePayment(selectedPayment._id);
                          setShowDetailModal(false);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                      >
                        Valider le paiement
                      </button>
                      <button
                        onClick={() => {
                          rejectPayment(selectedPayment._id);
                          setShowDetailModal(false);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                      >
                        Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;