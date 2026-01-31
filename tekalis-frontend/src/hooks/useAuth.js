import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, logout } from "../redux/slices/authSlice";


/**
 * Hook personnalisé pour gérer l'authentification
 * @returns {Object} Fonctions et états d'authentification
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  /**
   * Connexion utilisateur
   * @param {Object} credentials - Email et mot de passe
   */
  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap(); // <- ici
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Inscription utilisateur
   * @param {Object} userData - Données d'inscription
   */
  const handleRegister = async (userData) => {
    try {
      const result = await dispatch(register(userData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /**
   * Mise à jour du profil
   * @param {Object} profileData - Nouvelles données du profil
   */
  const handleUpdateProfile = async (profileData) => {
    try {
      const result = await dispatch(updateProfile(profileData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Vérifier si l'utilisateur est admin
   */
  const isAdmin = () => {
    return user?.role === "admin";
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   * @param {String} role - Rôle à vérifier
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Obtenir le token actuel
   */
  const getToken = () => {
    return token || localStorage.getItem("token");
  };

  /**
   * Vérifier si le token est valide
   */
  const isTokenValid = () => {
    const storedToken = getToken();
    if (!storedToken) return false;

    try {
      // Décoder le token JWT pour vérifier l'expiration
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  return {
    // États
    user,
    token,
    isAuthenticated,
    loading,
    error,
    
    // Fonctions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    
    // Utilitaires
    isAdmin,
    hasRole,
    getToken,
    isTokenValid
  };
};

export default useAuth;