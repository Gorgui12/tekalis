import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaEye, FaFileAlt, FaSearch } from "react-icons/fa";
import api from "@shared/api/api";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "sent", label: "Envoyés" },
  { value: "accepted", label: "Acceptés" },
  { value: "rejected", label: "Rejetés" },
  { value: "converted", label: "Convertis" },
  { value: "cancelled", label: "Annulés" }
];

const STATUS_CONFIG = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
  sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Envoyé" },
  accepted: { bg: "bg-green-100", text: "text-green-700", label: "Accepté" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejeté" },
  converted: { bg: "bg-purple-100", text: "text-purple-700", label: "Converti" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "Annulé" }
};

const formatAmount = (value) => Number(value || 0).toLocaleString("fr-FR");
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "—");

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-block`}>
      {config.label}
    </span>
  );
};

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchQuotes = async () => {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit: 20 };
        if (status !== "all") params.status = status;
        if (search) params.search = search;

        const { data } = await api.get("/quotes/admin", { params });
        if (!active) return;

        setQuotes(data.quotes || []);
        setPagination(data.pagination || { page, limit: 20, total: 0, pages: 0 });
      } catch (error) {
        if (!active) return;
        console.error("Erreur chargement devis:", error);
        setQuotes([]);
        setError("Impossible de charger les devis.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchQuotes();
    return () => {
      active = false;
    };
  }, [page, status, search, reloadKey]);

  const stats = {
    total: pagination.total,
    pending: quotes.filter((quote) => quote.status === "pending").length,
    sent: quotes.filter((quote) => quote.status === "sent").length,
    accepted: quotes.filter((quote) => quote.status === "accepted").length
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (event) => {
    setPage(1);
    setStatus(event.target.value);
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
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des devis</h1>
          <p className="text-gray-600">
            {pagination.total} devis trouvé(s)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.sent}</p>
            <p className="text-xs text-gray-600">Envoyés</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
            <p className="text-xs text-gray-600">Acceptés</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
              <FaSearch className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, société, contact..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full pl-10 pr-28 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold"
              >
                Rechercher
              </button>
            </form>

            <select
              value={status}
              onChange={handleStatusChange}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-center justify-between gap-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setReloadKey((key) => key + 1)}
              className="text-red-700 hover:text-red-800 font-semibold text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Référence</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Société / contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Lignes</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun devis trouvé</p>
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id || quote._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-sm text-gray-900">{quote.quoteNumber || "—"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{quote.company || "—"}</p>
                        <p className="text-xs text-gray-500">{quote.name || quote.email || "—"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">{quote.items?.length || 0} ligne(s)</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-gray-900">{formatAmount(quote.total)} FCFA</p>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{formatDate(quote.createdAt)}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/quotes/${quote.id || quote._id}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          <FaEye /> Voir
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft /> Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page || page} / {pagination.pages || 1}
          </span>
          <button
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= (pagination.pages || 1)}
            className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuotes;
