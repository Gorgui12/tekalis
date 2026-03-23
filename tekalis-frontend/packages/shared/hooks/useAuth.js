import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// ✅ FIX : import registerUser (et non "register" qui n'existe pas)
import { loginUser, registerUser, updateProfile, logout } from "../redux/slices/authSlice";

/**
 * Hook personnalisé pour gérer l'authentification
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, isAuthenticated, isLoading: loading, error } = useSelector(
    (state) => state.auth
  );

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // ✅ FIX : utilise registerUser au lieu de register
  const handleRegister = async (userData) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const result = await dispatch(updateProfile(profileData)).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const isAdmin = () => user?.isAdmin === true || user?.role === "admin";

  const hasRole = (role) => user?.role === role;

  const getToken = () => token || localStorage.getItem("token");

  const isTokenValid = () => {
    const storedToken = getToken();
    if (!storedToken) return false;
    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!(user && token),
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    isAdmin,
    hasRole,
    getToken,
    isTokenValid
  };
};

export default useAuth;