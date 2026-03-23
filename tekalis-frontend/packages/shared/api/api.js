import axios from "axios";

// 🔗 URL de base depuis .env (ex: http://localhost:5000)
// ✅ FIX : on retire /api/v1 de la baseURL pour éviter le doublon si
//          VITE_API_URL contient déjà /api/v1
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Supprimer le /api/v1 trailing s'il est déjà inclus dans la variable d'env
const API_BASE = rawUrl.replace(/\/api\/v1\/?$/, "");

// 🧱 Instance Axios principale
const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 🔐 Ajoute automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    // Fallback : Redux Persist stocke sous persist:auth -> JSON.user.token
    if (!token) {
      try {
        const persistedAuth = localStorage.getItem("persist:auth");
        if (persistedAuth) {
          const parsed = JSON.parse(persistedAuth);
          const user = parsed.user ? JSON.parse(parsed.user) : null;
          token = user?.token || null;
        }
      } catch (_) { /* silencieux */ }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log("📡 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Erreur avant envoi requête:", error);
    return Promise.reject(error);
  }
);

// 📥 Intercepteur de réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      if (status === 401) {
        console.warn("🔐 Token invalide ou expiré, déconnexion...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (status === 404) {
        console.warn("📛 Route API introuvable:", config.url);
      }
    } else {
      console.error("🌐 Erreur réseau ou serveur injoignable:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;