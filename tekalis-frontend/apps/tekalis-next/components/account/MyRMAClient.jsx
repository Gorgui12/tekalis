"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { 
  FaTools, 
  FaPlus,
  FaEye,
  FaFilter,
  FaCommentDots
} from "react-icons/fa";
import api from "@/lib/api";

const MyRMA = () => {
  const router = useRouter();
  const navigate = (path) => router.push(path);
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
      approved: { bg: "bg-brand-100", text: "text-brand-700", label: "Approuvée", icon: "✓" },
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link href="/dashboard"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2 font-display">
                🔧 Mes Demandes SAV
              </h1>
              <p className="text-surface-600 dark:text-surface-400">
                Suivez vos demandes de service après-vente
              </p>
            </div>
            <Link href="/dashboard/rma/create"
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-md hover:shadow-glow"
            >
              <FaPlus />
              Nouvelle demande
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Total</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">En attente</p>
          </div>
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-brand-700">{stats.approved}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Approuvées</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{stats.inProgress}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">En cours</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Terminées</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Refusées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <FaFilter className="text-surface-600 dark:text-surface-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "all"
                    ? "bg-brand-500 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "approved"
                    ? "bg-brand-500 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Approuvées
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "in_progress"
                    ? "bg-purple-600 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Terminées
              </button>
            </div>
          </div>
        </div>

        {/* Liste des RMA */}
        {filteredRMAs.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-12 text-center">
            <FaTools className="text-6xl text-surface-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
              {filter === "all" 
                ? "Aucune demande SAV"
                : "Aucune demande avec ce statut"}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              {filter === "all"
                ? "Vous n'avez pas encore créé de demande de service après-vente"
                : "Essayez un autre filtre"}
            </p>
            {filter === "all" && (
              <Link href="/dashboard/rma/create"
                className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold"
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
                className="bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-elevated transition"
              >
                {/* En-tête */}
                <div className="bg-surface-50 dark:bg-surface-700 px-6 py-4 border-b border-surface-200 dark:border-surface-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-surface-900 dark:text-white">
                        RMA #{rma._id.slice(-8).toUpperCase()}
                      </h3>
                      <StatusBadge status={rma.status} />
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      Créée le {new Date(rma.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-xl text-sm font-semibold">
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
                      className="w-20 h-20 object-contain rounded border border-surface-200 dark:border-surface-700"
                    />
                    <div className="flex-1">
                      <Link href={`/products/${rma.product?._id}`}
                        className="font-semibold text-surface-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block mb-1"
                      >
                        {rma.product?.name || "Produit"}
                      </Link>
                      {rma.order && (
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          Commande #{rma.order._id?.slice(-8).toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white mb-2">
                      Motif de la demande :
                    </p>
                    <p className="text-sm text-surface-700 dark:text-surface-300 line-clamp-2">
                      {rma.reason}
                    </p>
                  </div>

                  {/* Timeline */}
                  {rma.history && rma.history.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white mb-2">
                        Historique :
                      </p>
                      <div className="space-y-2">
                        {rma.history.slice(0, 2).map((event, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="text-surface-500 dark:text-surface-400">
                              {new Date(event.date).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="text-surface-700 dark:text-surface-300">{event.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/rma/${rma._id}`}
                      className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <FaEye />
                      Voir détails
                    </Link>

                    {rma.status !== "completed" && rma.status !== "rejected" && (
                      <button
                        onClick={() => navigate(`/dashboard/rma/${rma._id}#comments`)}
                        className="flex-1 sm:flex-none bg-surface-600 hover:bg-surface-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
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
        <div className="mt-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white">
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
