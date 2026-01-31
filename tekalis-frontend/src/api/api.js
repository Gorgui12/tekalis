import axios from "axios";

// 🔗 URL de base depuis .env (ex: http://localhost:5000)
const API_URL = import.meta.env.VITE_API_URL;

// 🧱 Instance Axios principale
const api = axios.create({
  baseURL: API_URL + "/api/v1", // 👉 ajoute automatiquement /api/v1
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s pour éviter les requêtes bloquées
});

// 🔐 Ajoute automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🪵 Log debug (désactive en prod si besoin)
    console.log("📡 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      data: config.data || null,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("❌ Erreur avant envoi requête:", error);
    return Promise.reject(error);
  }
);

// 📥 Intercepteur de réponses (gestion globale erreurs)
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;

      console.error("🚨 API Error:", {
        url: config.url,
        status,
        data,
      });

      // 🔒 Token expiré ou invalide
      if (status === 401) {
        console.warn("🔐 Token invalide ou expiré, déconnexion...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // window.location.href = "/login"; // optionnel
      }

      // 🚫 Route introuvable
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




