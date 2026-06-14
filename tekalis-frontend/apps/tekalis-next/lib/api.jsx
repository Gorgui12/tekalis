"use client";

/**
 * lib/api.jsx - Instance Axios cote CLIENT uniquement.
 */
import axios from "axios";

const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE || "https://tekalis.onrender.com") + "/api/v1"
    : "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return Promise.reject(err);
    }
  );
}

export default api;