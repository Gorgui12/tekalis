import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaTools, 
  FaPlus,
  FaEye,
  FaFilter,
  FaCommentDots
} from "react-icons/fa";
import api from "../../api/api";

const MyRMA = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [rmas, setRmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchRMAs = async () => {
      try {
        const { data } = await api.get("/rma");
        setRmas(data.rmas || []);
      } catch (error) {
        console.error("Erreur chargement RMA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRMAs();
  }, [user, navigate]);

  // Filtrer les RMA
  const filteredRMAs = rmas.filter(rma => {
    if (filter === "all") return true;
    return rma.status === filter;
  });

  // Stats
  const stats = {
    total: rmas.length,
    pending: rmas.filter(r => r.status === "pending").length,
    approved: rmas.filter(r => r.status === "approved").length,
    inProgress: rmas.filter(r => r.status === "in_progress").length,
    completed: rmas.filter(r => r.status === "completed").length,
    rejected: rmas.filter(r => r.status === "rejected").length
  };

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente", icon: "⏳" },
      approved: { bg: "bg-blue-100", text: "text-blue-700", label: "Approuvée", icon: "✓" },
      in_progress: { bg: "bg-purple-100", text: "text-purple-700", label: "En cours", icon: "🔧" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Terminée", icon: "✓" },
      rejected: { bg: "bg-red-100", text: "text-red-700", label: "Refusée", icon: "✗" }
    };

    const config = configs[status] || configs.pending;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Type de demande
  const getRMATypeLabel = (type) => {
    const types = {
      repair: "Réparation",
      replacement: "Remplacement",
      refund: "Remboursement",
      technical_support: "Support technique"
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔧 Mes Demandes SAV
              </h1>
              <p className="text-gray-600">
                Suivez vos demandes de service après-vente
              </p>
            </div>
            <Link
              to="/rma/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <FaPlus />
              Nouvelle demande
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.approved}</p>
            <p className="text-xs text-gray-600">Approuvées</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{stats.inProgress}</p>
            <p className="text-xs text-gray-600">En cours</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-xs text-gray-600">Terminées</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-xs text-gray-600">Refusées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-3">
            <FaFilter className="text-gray-600" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "approved"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Approuvées
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "in_progress"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Terminées
              </button>
            </div>
          </div>
        </div>

        {/* Liste des RMA */}
        {filteredRMAs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTools className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "all" 
                ? "Aucune demande SAV"
                : "Aucune demande avec ce statut"}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "Vous n'avez pas encore créé de demande de service après-vente"
                : "Essayez un autre filtre"}
            </p>
            {filter === "all" && (
              <Link
                to="/rma/create"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Créer une demande
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRMAs.map((rma) => (
              <div
                key={rma._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
              >
                {/* En-tête */}
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">
                        RMA #{rma._id.slice(-8).toUpperCase()}
                      </h3>
                      <StatusBadge status={rma.status} />
                    </div>
                    <p className="text-sm text-gray-600">
                      Créée le {new Date(rma.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                    {getRMATypeLabel(rma.type)}
                  </span>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Produit */}
                  <div className="flex gap-4 mb-4">
                    <img
                      src={rma.product?.image || "/placeholder.png"}
                      alt={rma.product?.name}
                      className="w-20 h-20 object-contain rounded border"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/product/${rma.product?._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                      >
                        {rma.product?.name || "Produit"}
                      </Link>
                      {rma.order && (
                        <p className="text-sm text-gray-600">
                          Commande #{rma.order._id?.slice(-8).toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Motif de la demande :
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {rma.reason}
                    </p>
                  </div>

                  {/* Timeline */}
                  {rma.history && rma.history.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        Historique :
                      </p>
                      <div className="space-y-2">
                        {rma.history.slice(0, 2).map((event, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="text-gray-500">
                              {new Date(event.date).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="text-gray-700">{event.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/rma/${rma._id}`}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <FaEye />
                      Voir détails
                    </Link>

                    {rma.status !== "completed" && rma.status !== "rejected" && (
                      <button
                        onClick={() => navigate(`/rma/${rma._id}#comments`)}
                        className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaCommentDots />
                        Ajouter un message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info SAV */}
        <div className="mt-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">
            ℹ️ Processus SAV
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">1. Demande</p>
              <p className="text-orange-100">
                Créez votre demande en décrivant le problème rencontré.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">2. Analyse</p>
              <p className="text-orange-100">
                Notre équipe examine votre demande sous 48h ouvrées.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">3. Solution</p>
              <p className="text-orange-100">
                Réparation, remplacement ou remboursement selon le cas.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">4. Suivi</p>
              <p className="text-orange-100">
                Restez informé à chaque étape par email et SMS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRMA;