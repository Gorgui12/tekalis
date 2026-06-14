/**
 * lib/serverFetch.js - Fetch natif pour Server Components.
 * Pas de directive "use client".
 */

const BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "https://tekalis.onrender.com") + "/api/v1";

export async function serverFetch(path, options = {}) {
  const { revalidate = 3600, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    ...rest,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}