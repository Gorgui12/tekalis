"use client";

/**
 * lib/api.js
 * Instance Axios centralisée — fonctionne côté serveur ET client.
 * Côté serveur : appelle directement l'API backend.
 * Côté client  : passe par le proxy /api/v1 (next.config.js rewrites).
 */
import axios from 'axios';

const API_BASE =
  typeof window === 'undefined'
    ? // Serveur → appel direct au backend
      (process.env.NEXT_PUBLIC_API_BASE || 'https://tekalis.onrender.com') + '/api/v1'
    : // Client → proxy local Next.js
      '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur client uniquement (token dans localStorage)
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return Promise.reject(err);
    }
  );
}

export default api;

/**
 * Fetch serveur simple (sans axios) pour les Server Components.
 * Utilise le cache Next.js natif.
 */
export async function serverFetch(path, options = {}) {
  const BASE =
    (process.env.NEXT_PUBLIC_API_BASE || 'https://tekalis.onrender.com') +
    '/api/v1';

  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: options.revalidate ?? 3600 }, // 1h par défaut
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${path}`);
  }

  return res.json();
}
