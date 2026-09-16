import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch, FaSyncAlt, FaFire, FaCheckCircle, FaExclamationTriangle,
  FaPlus, FaExternalLinkAlt, FaGlobe
} from "react-icons/fa";
import api from "@shared/api/api";

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const AdminTrends = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, recent: 0, covered: 0, uncovered: 0, coverageRate: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState("all"); // all | new | uncovered
  const [search, setSearch] = useState("");
  const [seedInput, setSeedInput] = useState("");
  const [seedMsg, setSeedMsg] = useState("");
  const [refreshMsg, setRefreshMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, suggRes] = await Promise.all([
        api.get("/trends/stats"),
        api.get("/trends/suggestions?limit=200"),
      ]);
      setStats(statsRes.data?.stats || {});
      setSuggestions(suggRes.data?.suggestions || []);
    } catch (err) {
      console.error("Erreur chargement tendances:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const { data } = await api.get("/trends/refresh"); // peut prendre 30-60s
      const msg = `Refresh terminé : ${data.summary?.total} suggestions, ${data.summary?.created} nouvelles, ${data.summary?.covered} couvertes.`;
      setRefreshMsg(msg);
      await fetchData();
    } catch (err) {
      setRefreshMsg(`Erreur : ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddSeed = async (e) => {
    e.preventDefault();
    if (!seedInput.trim()) return;
    try {
      const { data } = await api.post("/trends/seed", { query: seedInput.trim() });
      setSeedMsg(data.message || "Seed ajoutée");
      setSeedInput("");
      setTimeout(() => setSeedMsg(""), 3000);
    } catch (err) {
      setSeedMsg(`Erreur : ${err.message}`);
    }
  };

  const filtered = suggestions
    .filter((s) => {
      if (filter === "new" && !s.isNew) return false;
      if (filter === "uncovered" && s.hasCover) return false;
      if (filter === "covered" && !s.hasCover) return false;
      if (search && !s.query.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const kpis = [
    { label: "Suggestions", value: stats.total || 0, icon: <FaSearch size={16} />, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Nouvelles (7j)", value: stats.recent || 0, icon: <FaFire size={16} />, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Couvertes", value: stats.covered || 0, icon: <FaCheckCircle size={16} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "À couvrir", value: stats.uncovered || 0, icon: <FaExclamationTriangle size={16} />, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Couverture", value: `${stats.coverageRate || 0}%`, icon: <FaGlobe size={16} />, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* ── En-tête ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            🔥 Tendances Google
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Recherches au Sénégal détectées via Google Autocomplete, sur toute la boutique
            (téléphones, PC, gaming, TV, électroménager, climatisation, audio…). Créez des guides de
            prix pour les requêtes non couvertes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            <FaSyncAlt size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Rafraîchissement…" : "Rafraîchir depuis Google"}
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            Recharger
          </button>
        </div>
      </div>

      {refreshMsg && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200">
          {refreshMsg}
        </div>
      )}

      {/* ── KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                {kpi.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── Répartition par groupe ──────────────────────────────── */}
      {stats.byGroup?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Répartition par catégorie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stats.byGroup.map((g) => {
              const pct = stats.total > 0 ? Math.round((g.count / stats.total) * 100) : 0;
              return (
                <div key={g._id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-gray-300 truncate">{g._id}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.max(pct * 2, 2)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs text-gray-400">
                    {g.count} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filtres + recherche ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { key: "all", label: `Toutes (${suggestions.length})` },
            { key: "new", label: "Nouvelles" },
            { key: "uncovered", label: "Non couvertes" },
            { key: "covered", label: "Couvertes" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par mot-clé…"
            className="w-full md:w-64 pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ── Tableau ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement des tendances…</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Requête</th>
                  <th className="px-4 py-3">Groupe</th>
                  <th className="px-4 py-3">Détectée le</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      Aucune suggestion trouvée avec ces filtres.
                    </td>
                  </tr>
                )}
                {filtered.slice(0, 100).map((s) => (
                  <tr key={s.query} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-semibold text-white max-w-xs truncate">
                      {s.query}
                      {s.isNew && (
                        <span className="ml-2 bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{s.group || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(s.firstSeen)}</td>
                    <td className="px-4 py-3">
                      {s.hasGuide ? (
                        <span className="text-emerald-400 text-xs font-semibold">✓ Guide</span>
                      ) : s.hasProduct ? (
                        <span className="text-blue-400 text-xs font-semibold">✓ Produit</span>
                      ) : (
                        <span className="text-rose-400 text-xs font-semibold">À couvrir</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {s.hasGuide && s.guideSlug && (
                          <a
                            href={`https://tekalis.com/prix/${s.guideSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2 py-1 rounded-lg font-semibold transition"
                          >
                            <FaExternalLinkAlt size={10} /> Guide
                          </a>
                        )}
                        {s.hasProduct && s.productSlug && (
                          <a
                            href={`https://tekalis.com/products/${s.productSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded-lg font-semibold transition"
                          >
                            <FaExternalLinkAlt size={10} /> Produit
                          </a>
                        )}
                        {!s.hasGuide && (
                          <Link
                            to={`/articles/add?topic=${encodeURIComponent(s.query)}`}
                            className="inline-flex items-center gap-1 text-xs bg-white/5 text-gray-200 hover:bg-white/10 px-2 py-1 rounded-lg font-semibold transition"
                          >
                            <FaPlus size={10} /> Créer
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Ajouter une seed ────────────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Ajouter une seed de recherche</h3>
        <form onSubmit={handleAddSeed} className="flex flex-col md:flex-row gap-2">
          <input
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="ex: prix samsung a15"
            className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            <FaPlus size={12} /> Ajouter
          </button>
        </form>
        {seedMsg && <p className="mt-2 text-xs text-emerald-400">{seedMsg}</p>}
        <p className="mt-2 text-xs text-gray-500">
          Les seeds définissent les termes de départ interrogés sur Google Autocomplete pour
          découvrir les recherches populaires. Lancez un refresh après avoir ajouté une seed.
        </p>
      </div>
    </div>
  );
};

export default AdminTrends;