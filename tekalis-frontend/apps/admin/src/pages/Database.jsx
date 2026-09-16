import { useEffect, useState, useCallback } from "react";
import {
  FaDatabase, FaSearch, FaTrash, FaChevronLeft, FaChevronRight,
  FaSyncAlt, FaEye, FaTimes, FaArrowLeft, FaBoxOpen, FaFileAlt, FaTable
} from "react-icons/fa";
import api from "@shared/api/api";

const SUMMARY_LIMIT = 60;

const compactValue = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "object") {
    const s = JSON.stringify(v);
    return s.length > SUMMARY_LIMIT ? s.slice(0, SUMMARY_LIMIT) + "…" : s;
  }
  const s = String(v);
  return s.length > SUMMARY_LIMIT ? s.slice(0, SUMMARY_LIMIT) + "…" : s;
};

const collectionIconFor = (name) => {
  const n = name.toLowerCase();
  if (["orders", "orderitems", "transactions", "payments", "paymentevents"].some((k) => n.includes(k))) return "🛒";
  if (["users", "carts", "cities"].some((k) => n.includes(k))) return "👥";
  if (["products", "categories", "listings", "games"].some((k) => n.includes(k))) return "📦";
  if (["articles", "blogs", "trends", "tides", "notifications"].some((k) => n.includes(k))) return "📄";
  if (["warranties", "rmas", "reviews", "disputes"].some((k) => n.includes(k))) return "🛠️";
  if (["settings", "heroslides", "hero"].some((k) => n.includes(k))) return "⚙️";
  if (["visits", "auditlogs"].some((k) => n.includes(k))) return "📊";
  return "🗄️";
};

const DatabaseExplorer = () => {
  const [collections, setCollections] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loadingCols, setLoadingCols] = useState(true);

  const [collection, setCollection] = useState(null);
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCollections = useCallback(async () => {
    setLoadingCols(true);
    setError("");
    try {
      const { data } = await api.get("/admin/db/collections");
      setCollections(data.collections || []);
      setTotalDocs(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoadingCols(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const fetchDocs = useCallback(async (page = 1, term = "") => {
    if (!collection) return;
    setLoadingDocs(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (term.trim()) params.set("search", term.trim());
      const { data } = await api.get(`/admin/db/${encodeURIComponent(collection)}?${params}`);
      setDocs(data.docs || []);
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setDocs([]);
      setPagination({ page: 1, limit: 25, total: 0, totalPages: 1 });
    } finally {
      setLoadingDocs(false);
    }
  }, [collection]);

  useEffect(() => {
    if (collection) fetchDocs(1, search);
  }, [collection, fetchDocs, search]);

  const openCollection = (name) => {
    setCollection(name);
    setSearch("");
    setSearchInput("");
    setDocs([]);
  };

  const goBack = () => {
    setCollection(null);
    setDocs([]);
    setSearch("");
    setSearchInput("");
    setDetail(null);
    fetchCollections();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchDocs(1, searchInput);
  };

  const goPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchDocs(page, search);
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Supprimer définitivement ce document (${doc._id}) de la collection "${collection}" ?`)) return;
    setDeletingId(doc._id);
    setError("");
    try {
      await api.delete(`/admin/db/${encodeURIComponent(collection)}/${doc._id}`);
      if (docs.length === 1 && pagination.page > 1) {
        await fetchDocs(pagination.page - 1, search);
      } else {
        await fetchDocs(pagination.page, search);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const columns = (() => {
    if (docs.length === 0) return [];
    const seen = new Set(["_id"]);
    const cols = ["_id"];
    for (const doc of docs) {
      for (const key of Object.keys(doc)) {
        if (seen.has(key)) continue;
        cols.push(key);
        seen.add(key);
        if (cols.length >= 7) break;
      }
      if (cols.length >= 7) break;
    }
    return cols;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            🗄️ Base de données
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {collection
              ? `Collection "${collection}" — ${pagination.total} document${pagination.total > 1 ? "s" : ""}`
              : `${collections.length} collections · ${totalDocs} documents au total`}
          </p>
        </div>
        <button
          onClick={fetchCollections}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          <FaSyncAlt size={14} /> Recharger
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!collection ? (
        loadingCols ? (
          <div className="text-center py-16 text-gray-400">Chargement des collections…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {collections.map((c) => (
              <button
                key={c.name}
                onClick={() => openCollection(c.name)}
                className="text-left bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 rounded-2xl p-4 transition group"
              >
                <div className="text-2xl mb-3">{collectionIconFor(c.name)}</div>
                <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {c.count} document{c.count > 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition w-fit"
            >
              <FaArrowLeft size={13} /> Toutes les collections
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher (nom, email, _id…)"
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>

          {loadingDocs ? (
            <div className="text-center py-16 text-gray-400">Chargement des documents…</div>
          ) : docs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FaBoxOpen className="mx-auto mb-3 text-4xl text-gray-600" />
              Aucun document trouvé
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-400 text-xs uppercase tracking-wider">
                      {columns.map((col) => (
                        <th key={col} className="px-4 py-3 max-w-[220px] truncate">{col}</th>
                      ))}
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => (
                      <tr key={doc._id} className="border-b border-white/5 hover:bg-white/5 transition">
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-3 text-gray-300 max-w-[220px] truncate align-top">
                            {col === "_id" ? (
                              <span className="font-mono text-xs text-blue-400">{doc[col]}</span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                {typeof doc[col] === "object" && doc[col] !== null && (
                                  <FaFileAlt size={11} className="text-gray-500 flex-shrink-0" />
                                )}
                                {compactValue(doc[col])}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setDetail(doc)}
                              className="inline-flex items-center gap-1 text-xs bg-white/5 text-gray-200 hover:bg-white/10 px-2.5 py-1.5 rounded-lg font-semibold transition"
                              title="Voir le JSON"
                            >
                              <FaEye size={11} />
                            </button>
                            <button
                              onClick={() => handleDelete(doc)}
                              disabled={deletingId === doc._id}
                              className="inline-flex items-center gap-1 text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                              title="Supprimer"
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                  <span className="text-xs text-gray-400">
                    Page {pagination.page} / {pagination.totalPages} · {pagination.total} doc{pagination.total > 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="inline-flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      <FaChevronLeft size={11} /> Préc.
                    </button>
                    <button
                      onClick={() => goPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="inline-flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      Suiv. <FaChevronRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FaTable size={14} className="text-blue-400" />
                <span className="text-white font-semibold text-sm">Document — {collection}</span>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div className="overflow-auto p-5 flex-1">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(detail, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseExplorer;