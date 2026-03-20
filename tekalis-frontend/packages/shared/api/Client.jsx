// packages/shared/api/client.js
// Instance Axios centralisée — remplace tous les appels à localhost:5000
// Usage : import api from '../../../../packages/shared/api/client';

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

// ─── Intercepteur requête : injecter le token automatiquement ─────────────────
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis Redux persist (localStorage)
    try {
      const persisted = localStorage.getItem("persist:root");
      if (persisted) {
        const root = JSON.parse(persisted);
        const auth = root.auth ? JSON.parse(root.auth) : null;
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur réponse : gestion globale des erreurs ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token expiré → rediriger vers login
    if (status === 401) {
      // Optionnel : dispatch logout action
      // store.dispatch(logout());
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;