import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, 
  FaSignOutAlt, FaShieldAlt, FaBell
} from "react-icons/fa";
import useAuth from "../../../../packages/shared/hooks/useAuth";
import useErrorHandler from "../../../../packages/shared/hooks/useErrorHandler"; // ✅ AJOUTÉ
import { useToast } from "../../../../packages/shared/context/ToastContext"; // ✅ CORRIGÉ
import { validateEmail, validatePhone, validatePassword, sanitizeInput } from "../../../../packages/shared/outils/validators"; // ✅ AJOUTÉ
import LoadingSpinner from "../../src/components/shared/LoadingSpinner"; // ✅ AJOUTÉ
import Button from "../../src/components/shared/Button"; // ✅ AJOUTÉ
import api from "../../../../packages/shared/api/api";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: ""
  });
  const [formErrors, setFormErrors] = useState({}); // ✅ AJOUTÉ
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({}); // ✅ AJOUTÉ

  const navigate = useNavigate();
  const { logout, updateProfile } = useAuth();
  const toast = useToast(); // ✅ Nouveau ToastContext
  const { handleError } = useErrorHandler(); // ✅ AJOUTÉ

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
      handleError(error, { // ✅ CORRIGÉ
        customMessage: "Erreur de chargement du profil",
        redirectTo: "/login"
      });
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
      setFormErrors({}); // ✅ AJOUTÉ
    }
    setEditMode(!editMode);
  };

  // ✅ AJOUTÉ - Validation complète
  const validateProfileForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Le nom est requis";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0];
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.errors[0];
      }
    }

    if (formData.address && formData.address.trim().length > 0 && formData.address.trim().length < 5) {
      errors.address = "L'adresse doit contenir au moins 5 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    // ✅ Validation
    if (!validateProfileForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    // ✅ Sanitization
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      address: sanitizeInput(formData.address)
    };

    const result = await updateProfile(sanitizedData);
    
    if (result.success) {
      toast.success("Profil mis à jour avec succès !"); // ✅ Pas d'emoji
      setUserData({ ...userData, ...sanitizedData });
      setEditMode(false);
      setFormErrors({});
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  // ✅ AJOUTÉ - Validation mot de passe
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Le mot de passe actuel est requis";
    }

    const passwordValidation = validatePassword(
      passwordData.newPassword, 
      passwordData.confirmPassword
    );

    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.errors[0];
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!validatePasswordForm()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    try {
      await api.put("/users/change-password", passwordData);
      toast.success("Mot de passe modifié avec succès !"); // ✅ Pas d'emoji
      setPasswordData({
        currentPassword: "", 
        newPassword: "", 
        confirmPassword: ""
      });
      setPasswordErrors({});
    } catch (error) {
      handleError(error, { // ✅ CORRIGÉ
        customMessage: "Erreur lors du changement de mot de passe"
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie !"); // ✅ CORRIGÉ - Garde emoji car pas de message serveur
  };

  // ✅ CORRIGÉ - Utilise LoadingSpinner
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement du profil..." />
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Informations", icon: <FaUser /> },
    { id: "security", label: "Sécurité", icon: <FaShieldAlt /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> }
  ];

  // ✅ AJOUTÉ - Classes dynamiques pour inputs
  const inputClasses = (field) => `
    w-full px-4 py-3 border-2 rounded-xl transition
    ${formErrors[field] 
      ? 'border-red-500 bg-red-50 focus:border-red-500' 
      : editMode 
        ? 'border-gray-200 focus:border-blue-500' 
        : 'border-gray-100 bg-gray-50'
    }
    ${!editMode && 'cursor-not-allowed'}
    focus:outline-none
  `;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                {userData.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                <p className="opacity-90">{userData.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                  {userData.role === 'admin' ? "👑 Administrateur" : "👤 Client"}
                </span>
              </div>
            </div>
            
            {/* ✅ CORRIGÉ - Utilise Button component */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              icon={<FaSignOutAlt />}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              Déconnexion
            </Button>
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
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.icon} <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {activeTab === "info" && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations personnelles
                </h2>
                {!editMode ? (
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="primary"
                    icon={<FaEdit />}
                  >
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleEditToggle}
                      variant="secondary"
                      icon={<FaTimes />}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      variant="success"
                      icon={<FaSave />}
                    >
                      Enregistrer
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-gray-400" />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                    className={inputClasses('name')}
                    aria-invalid={!!formErrors.name}
                  />
                  {/* ✅ AJOUTÉ */}
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-gray-400" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editMode}
                    className={inputClasses('email')}
                    aria-invalid={!!formErrors.email}
                  />
                  {/* ✅ AJOUTÉ */}
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.email}
                    </p>
                  )}
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
                    className={inputClasses('phone')}
                    aria-invalid={!!formErrors.phone}
                  />
                  {/* ✅ AJOUTÉ */}
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.phone}
                    </p>
                  )}
                  {!formErrors.phone && (
                    <p className="mt-1 text-xs text-gray-500">
                      Format: XX XXX XX XX (9 chiffres)
                    </p>
                  )}
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
                    className={`${inputClasses('address')} resize-none`}
                    aria-invalid={!!formErrors.address}
                  />
                  {/* ✅ AJOUTÉ */}
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sécurité du compte
              </h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe actuel *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                      passwordErrors.currentPassword 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {/* ✅ AJOUTÉ */}
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                      passwordErrors.newPassword 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {/* ✅ AJOUTÉ */}
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 8 caractères, avec majuscule, minuscule et chiffre
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* ✅ CORRIGÉ - Utilise Button component */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                >
                  Changer le mot de passe
                </Button>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Préférences de notifications
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div>
                    <p className="font-semibold text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevoir les mises à jour par email</p>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div>
                    <p className="font-semibold text-gray-900">Offres promotionnelles</p>
                    <p className="text-sm text-gray-600">Recevoir les offres spéciales</p>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div>
                    <p className="font-semibold text-gray-900">Nouveaux produits</p>
                    <p className="text-sm text-gray-600">Être informé des nouveautés</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                  />
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
