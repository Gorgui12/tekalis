import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, 
  FaSignOutAlt, FaShieldAlt, FaBell
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import api from "../../api/api";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });

  const navigate = useNavigate();
  const { logout, updateProfile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData(res.data);
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || ""
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de chargement du profil");
      navigate("/login");
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || ""
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success("Profil mis à jour avec succès ! ✅");
      setUserData({ ...userData, ...formData });
      setEditMode(false);
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await api.put("/users/change-password", passwordData);
      toast.success("Mot de passe modifié avec succès ! 🔒");
      setPasswordData({
        currentPassword: "", newPassword: "", confirmPassword: ""
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie ! 👋");
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Informations", icon: <FaUser /> },
    { id: "security", label: "Sécurité", icon: <FaShieldAlt /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                {userData.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                <p className="opacity-90">{userData.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                  {userData.isAdmin ? "👑 Administrateur" : "👤 Client"}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <FaSignOutAlt /> Déconnexion
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {activeTab === "info" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <FaEdit /> Modifier
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditToggle}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <FaTimes /> Annuler
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <FaSave /> Enregistrer
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-gray-400" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 border-2 rounded-xl ${
                      editMode ? "border-gray-200 focus:border-blue-500" : "border-gray-100 bg-gray-50"
                    } focus:outline-none transition`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editMode}
                    className={`w-full px-4 py-3 border-2 rounded-xl ${
                      editMode ? "border-gray-200 focus:border-blue-500" : "border-gray-100 bg-gray-50"
                    } focus:outline-none transition`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-gray-400" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                    placeholder="+221 XX XXX XX XX"
                    className={`w-full px-4 py-3 border-2 rounded-xl ${
                      editMode ? "border-gray-200 focus:border-blue-500" : "border-gray-100 bg-gray-50"
                    } focus:outline-none transition`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                    Adresse
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!editMode}
                    rows={3}
                    placeholder="Votre adresse complète..."
                    className={`w-full px-4 py-3 border-2 rounded-xl ${
                      editMode ? "border-gray-200 focus:border-blue-500" : "border-gray-100 bg-gray-50"
                    } focus:outline-none transition resize-none`}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité du compte</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Changer le mot de passe
                </button>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Préférences de notifications</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevoir les mises à jour par email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900">Offres promotionnelles</p>
                    <p className="text-sm text-gray-600">Recevoir les offres spéciales</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900">Nouveaux produits</p>
                    <p className="text-sm text-gray-600">Être informé des nouveautés</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;