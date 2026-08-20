"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, updateProfile, logout } from "@/store/slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigate = (path) => router.push(path);

  const { user, loading, error } = useSelector((state) => state.auth);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthenticated = !!(user && token);

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  };

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

  const getToken = () => localStorage.getItem("token");

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
    isAuthenticated,
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
