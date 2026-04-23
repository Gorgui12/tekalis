// ===============================================
// PromoCodes.jsx — Admin
// ✅ FIX : mapping expiryDate → endDate, value → discount, minPurchase → minAmount
//    aligné avec le modèle PromoCode et le server.js corrigé
// ✅ FIX : description requise par le modèle — ajout du champ dans le formulaire
// ✅ FIX : usageLimit null autorisé (illimité) — validation assouplie
// ===============================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus, FaEdit, FaTrash, FaCopy,
  FaSearch, FaTimes, FaTag
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import { useToast } from "../../../../packages/shared/context/ToastContext";

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "percentage",
  value: 0,        // → sera envoyé comme "discount" au backend
  minPurchase: 0,  // → sera envoyé comme "minAmount"
  maxDiscount: 0,
  usageLimit: "",  // "" = illimité
  expiryDate: "",  // → sera envoyé comme "endDate"
  isActive: true
};

const AdminPromoCodes = () => {
  const toast = useToast();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ ...EMPTY_FORM, _id: null });

  useEffect(() => { fetchPromoCodes(); }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data } = await api.get("/admin/promo-codes");
      const list = Array.isArray(data) ? data : (data.promoCodes || []);
      setPromoCodes(list);
    } catch (error) {
      console.error("Erreur chargement codes promo:", error);
      toast.error("Impossible de charger les codes promo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Le code est requis");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("La description est requise");
      return;
    }
    if (!formData.expiryDate) {
      toast.error("La date d'expiration est requise");
      return;
    }

    // Payload aligné sur le modèle PromoCode du backend
    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      type: formData.type,
      discount: Number(formData.value) || 0,     // modèle: discount
      minAmount: Number(formData.minPurchase) || 0, // modèle: minAmount
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit !== "" ? Number(formData.usageLimit) : null,
      endDate: formData.expiryDate,              // modèle: endDate
      isActive: formData.isActive
    };

    try {
      if (editMode && formData._id) {
        await api.put(`/admin/promo-codes/${formData._id}`, payload);
        toast.success("Code promo mis à jour !");
      } else {
        await api.post("/admin/promo-codes", payload);
        toast.success("Code promo créé !");
      }
      fetchPromoCodes();
      resetForm();
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(msg);
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      _id: promo._id,
      code: promo.code || "",
      description: promo.description || "",
      type: promo.type || "percentage",
      value: promo.discount ?? 0,           // modèle stocke "discount"
      minPurchase: promo.minAmount ?? 0,    // modèle stocke "minAmount"
      maxDiscount: promo.maxDiscount ?? 0,
      usageLimit: promo.usageLimit ?? "",
      expiryDate: promo.endDate             // modèle stocke "endDate"
        ? new Date(promo.endDate).toISOString().split("T")[0]
        : "",
      isActive: promo.isActive !== false
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce code promo ?")) return;
    try {
      await api.delete(`/admin/promo-codes/${id}`);
      toast.success("Code promo supprimé");
      fetchPromoCodes();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copié !`);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setFormData(f => ({ ...f, code }));
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, _id: null });
    setEditMode(false);
    setShowModal(false);
  };

  // Helpers de calcul
  const getDaysLeft = (endDate) => {
    if (!endDate) return -999;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getUsagePct = (promo) => {
    if (!promo.usageLimit) return 0;
    return Math.min(100, ((promo.usageCount || 0) / promo.usageLimit) * 100);
  };

  const filteredPromoCodes = promoCodes.filter(p =>
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.isActive && getDaysLeft(p.endDate) > 0).length,
    expired: promoCodes.filter(p => getDaysLeft(p.endDate) <= 0).length,
    totalUsed: promoCodes.reduce((s, p) => s + (p.usageCount || 0), 0)
  };

  const StatusChip = ({ promo }) => {
    const days = getDaysLeft(promo.endDate);
    if (days <= 0) return <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Expiré</span>;
    if (!promo.isActive) return <span className="bg-gray-500/10 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Inactif</span>;
    if (promo.usageLimit && (promo.usageCount || 0) >= promo.usageLimit)
      return <span className="bg-gray-500/10 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold">Épuisé</span>;
    return <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Actif</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎫 Codes promo</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filteredPromoCodes.length} code(s) • {stats.totalUsed} utilisations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition"
        >
          <FaPlus size={12} /> Créer un code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: stats.total,     cls: "text-white" },
          { label: "Actifs",      value: stats.active,    cls: "text-emerald-400" },
          { label: "Expirés",     value: stats.expired,   cls: "text-red-400" },
          { label: "Utilisations",value: stats.totalUsed, cls: "text-blue-400" }
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-white/5 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Rechercher un code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <FaTimes size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {filteredPromoCodes.length === 0 ? (
        <div className="bg-gray-900 border border-white/5 rounded-xl p-12 text-center">
          <FaTag className="text-5xl text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucun code promo</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition">
            Créer le premier code
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromoCodes.map(promo => {
            const days = getDaysLeft(promo.endDate);
            const pct  = getUsagePct(promo);
            return (
              <div key={promo._id} className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition">
                {/* Bandeau coloré */}
                <div className="bg-gradient-to-r from-blue-700 to-purple-700 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaTag className="text-white/70" size={12} />
                        <h3 className="text-xl font-black text-white tracking-widest">{promo.code}</h3>
                      </div>
                      <p className="text-white/80 text-xs">
                        {promo.type === "percentage"
                          ? `${promo.discount ?? 0}% de réduction`
                          : `${(promo.discount ?? 0).toLocaleString("fr-FR")} FCFA`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusChip promo={promo} />
                      <button onClick={() => copyToClipboard(promo.code)} className="ml-1 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition">
                        <FaCopy className="text-white" size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {promo.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{promo.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Achat minimum</p>
                      <p className="text-white font-semibold">{(promo.minAmount ?? 0).toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expiration</p>
                      <p className={`font-semibold ${days <= 7 ? "text-red-400" : "text-white"}`}>
                        {days > 0 ? `${days}j restants` : "Expiré"}
                      </p>
                    </div>
                  </div>

                  {/* Barre d'utilisation */}
                  {promo.usageLimit && (
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                        <span>Utilisations</span>
                        <span>{promo.usageCount ?? 0} / {promo.usageLimit}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-500" : "bg-blue-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {!promo.usageLimit && (
                    <p className="text-[10px] text-gray-600">Utilisations illimitées • {promo.usageCount ?? 0} utilisées</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-semibold rounded-lg transition"
                    >
                      <FaEdit size={10} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {editMode ? "Modifier le code promo" : "Nouveau code promo"}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Code promo *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="EX: WELCOME10"
                    className="flex-1 h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white uppercase placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition"
                  />
                  <button type="button" onClick={generateCode} className="px-3 h-9 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 transition">
                    Générer
                  </button>
                </div>
              </div>

              {/* Description — REQUIS par le modèle */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: 10% de réduction sur la 1ère commande"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition"
                />
              </div>

              {/* Type + Valeur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full h-9 px-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (FCFA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Valeur * {formData.type === "percentage" ? "(%)" : "(FCFA)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.value}
                    onChange={e => setFormData(f => ({ ...f, value: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition"
                  />
                </div>
              </div>

              {/* Achat min + Réduction max */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Achat minimum (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={e => setFormData(f => ({ ...f, minPurchase: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Réduction max (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={e => setFormData(f => ({ ...f, maxDiscount: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition"
                  />
                </div>
              </div>

              {/* Limite + Date d'expiration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Limite (vide = illimitée)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={e => setFormData(f => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="Illimitée"
                    className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Date d'expiration *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData(f => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition"
                  />
                </div>
              </div>

              {/* Actif */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Code actif</label>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button type="button" onClick={resetForm} className="flex-1 h-10 text-sm rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition">
                  Annuler
                </button>
                <button type="submit" className="flex-1 h-10 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition">
                  {editMode ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;