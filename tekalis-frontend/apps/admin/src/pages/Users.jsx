// ===============================================
// Users.jsx — Admin
// ✅ FIX : api.get('/admin/users') → route désormais exposée dans server.js
// ✅ FIX : user.role mappé depuis isAdmin (backend renvoie role: "admin"|"customer")
// ✅ FIX : PUT /admin/users/:id/role et /admin/users/:id/status
// ===============================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaShieldAlt,
  FaBan,
  FaCheckCircle,
  FaTimes,
  FaEye
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import { useToast } from "../../../../packages/shared/context/ToastContext";

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      // Normalisation défensive : accepter data.users ou tableau direct
      const list = Array.isArray(data) ? data : (data.users || []);
      setUsers(list);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      user.role === filterRole ||
      (filterRole === "admin" && user.isAdmin) ||
      (filterRole === "customer" && !user.isAdmin);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive !== false) ||
      (filterStatus === "inactive" && user.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    customers: users.filter(u => !u.isAdmin && u.role !== "admin").length,
    admins: users.filter(u => u.isAdmin || u.role === "admin").length,
    active: users.filter(u => u.isActive !== false).length,
    newThisMonth: users.filter(u =>
      new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  };

  const changeRole = async (userId, newRole) => {
    if (!window.confirm(`Changer le rôle vers "${newRole}" ?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("Rôle mis à jour");
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus !== false ? "désactiver" : "activer";
    if (!window.confirm(`Voulez-vous ${action} cet utilisateur ?`)) return;
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: currentStatus === false });
      toast.success(`Utilisateur ${action === "désactiver" ? "désactivé" : "activé"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const RoleBadge = ({ user, onChange }) => {
    const isAdminUser = user.isAdmin || user.role === "admin";
    const role = isAdminUser ? "admin" : "customer";
    const configs = {
      admin:    { bg: "bg-red-100",  text: "text-red-700",  label: "Admin" },
      customer: { bg: "bg-blue-100", text: "text-blue-700", label: "Client" }
    };
    const config = configs[role];

    return (
      <select
        value={role}
        onChange={e => onChange && onChange(user._id, e.target.value)}
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-none outline-none`}
      >
        <option value="customer">Client</option>
        <option value="admin">Admin</option>
      </select>
    );
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Utilisateurs</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total",          value: stats.total,        cls: "" },
          { label: "Clients",        value: stats.customers,    cls: "text-blue-400" },
          { label: "Admins",         value: stats.admins,       cls: "text-red-400" },
          { label: "Actifs",         value: stats.active,       cls: "text-emerald-400" },
          { label: "Nouveaux (30j)", value: stats.newThisMonth, cls: "text-purple-400" }
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-white/5 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls || "text-white"}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <FaTimes size={12} />
              </button>
            )}
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="border border-white/10 rounded-lg px-3 py-2 bg-white/5 text-sm text-white focus:outline-none"
          >
            <option value="all">Tous les rôles</option>
            <option value="customer">Clients</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-white/10 rounded-lg px-3 py-2 bg-white/5 text-sm text-white focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commandes</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dépenses</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-blue-400" size={12} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-600">#{String(user._id).slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <RoleBadge user={user} onChange={changeRole} />
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {user.totalOrders ?? 0}
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-semibold">
                      {(user.totalSpent ?? 0).toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        user.isActive !== false
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {user.isActive !== false ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`p-1.5 rounded-lg transition ${
                            user.isActive !== false
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                          title={user.isActive !== false ? "Désactiver" : "Activer"}
                        >
                          {user.isActive !== false ? <FaBan size={13} /> : <FaCheckCircle size={13} />}
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
    </div>
  );
};

export default AdminUsers;