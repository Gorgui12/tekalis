import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaUser,
  FaShieldAlt,
  FaBan,
  FaCheckCircle,
  FaTimes,
  FaEye
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const AdminUsers = () => {
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
      setUsers(data.users || getDemoUsers());
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      setUsers(getDemoUsers());
    } finally {
      setLoading(false);
    }
  };

  const getDemoUsers = () => [
    {
      _id: "USER001",
      name: "Mamadou Diop",
      email: "mamadou@email.com",
      role: "customer",
      isActive: true,
      totalOrders: 12,
      totalSpent: 8450000,
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      _id: "USER002",
      name: "Fatou Sall",
      email: "fatou@email.com",
      role: "customer",
      isActive: true,
      totalOrders: 8,
      totalSpent: 5200000,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "ADMIN001",
      name: "Ousmane Dia",
      email: "ousmane@tekalis.sn",
      role: "admin",
      isActive: true,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      _id: "USER003",
      name: "Cheikh Fall",
      email: "cheikh@email.com",
      role: "customer",
      isActive: false,
      totalOrders: 2,
      totalSpent: 650000,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ];

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === "customer").length,
    admins: users.filter(u => u.role === "admin").length,
    active: users.filter(u => u.isActive).length,
    newThisMonth: users.filter(u => 
      new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  };

  // Changer le rôle
  const changeRole = async (userId, newRole) => {
    if (!window.confirm(`Changer le rôle vers "${newRole}" ?`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      alert("Rôle mis à jour avec succès");
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    }
  };

  // Bannir/Débannir
  const toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "désactiver" : "activer";
    if (!window.confirm(`Voulez-vous ${action} cet utilisateur ?`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      fetchUsers();
      alert(`Utilisateur ${action === "désactiver" ? "désactivé" : "activé"} avec succès`);
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  // Badge de rôle
  const RoleBadge = ({ role, userId, onChange }) => {
    const configs = {
      admin: { bg: "bg-red-100", text: "text-red-700", label: "Admin" },
      customer: { bg: "bg-blue-100", text: "text-blue-700", label: "Client" }
    };
    const config = configs[role] || configs.customer;

    return (
      <select
        value={role}
        onChange={(e) => onChange && onChange(userId, e.target.value)}
        className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-none outline-none`}
      >
        <option value="customer">Client</option>
        <option value="admin">Admin</option>
      </select>
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
            to="/admin"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Gestion des utilisateurs
          </h1>
          <p className="text-gray-600">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.customers}</p>
            <p className="text-xs text-gray-600">Clients</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.admins}</p>
            <p className="text-xs text-gray-600">Admins</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-gray-600">Actifs</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">{stats.newThisMonth}</p>
            <p className="text-xs text-gray-600">Nouveaux (30j)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
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

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="customer">Clients</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Utilisateur</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rôle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commandes</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total dépensé</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Inscrit le</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <p className="text-gray-500">Aucun utilisateur trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <FaUser className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user._id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <RoleBadge 
                          role={user.role} 
                          userId={user._id}
                          onChange={changeRole}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.totalOrders}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-blue-600">
                          {user.totalSpent.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => alert("Voir détails - À implémenter")}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Voir détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            className={`p-2 ${
                              user.isActive
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            title={user.isActive ? "Désactiver" : "Activer"}
                          >
                            {user.isActive ? <FaBan /> : <FaCheckCircle />}
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
    </div>
  );
};

export default AdminUsers;