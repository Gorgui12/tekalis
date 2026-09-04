/**
 * lib/serverFetch.js - Fetch natif pour Server Components.
 * Pas de directive "use client".
 */

// NEXT_PUBLIC_API_BASE peut contenir "/api/v1" (env local) ou pas (Vercel).
// Normalisation : la base d'API termine TOUJOURS par "/api/v1".
const rawBase = process.env.NEXT_PUBLIC_API_BASE || "https://tekalis.onrender.com/api/v1";
const BASE = rawBase.replace(/\/+$/, "").replace(/\/api\/v1$/, "") + "/api/v1";

/**
 * Fetch côté serveur avec timeout + 1 nouvelle tentative.
 * Le backend hébergé sur Render peut être en cold start (inactif sur le
 * plan gratuit) : la première requête peut dépasser le timeout de build
 * de Vercel. On retente donc une fois avant d'abandonner.
 */
export async function serverFetch(path, options = {}) {
  const { revalidate = 3600, timeout = 15000, ...rest } = options;

  const doFetch = (signal) =>
    fetch(`${BASE}${path}`, {
      next: { revalidate },
      signal,
      ...rest,
    });

  let controller;
  let res;

  try {
    // 1ère tentative
    controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);
    try {
      res = await doFetch(controller.signal);
    } finally {
      clearTimeout(t);
    }
  } catch (err) {
    // Cold start ou timeout réseau → nouvelle tentative
    controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout * 2);
    try {
      res = await doFetch(controller.signal);
    } finally {
      clearTimeout(t);
    }
  }

  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}
