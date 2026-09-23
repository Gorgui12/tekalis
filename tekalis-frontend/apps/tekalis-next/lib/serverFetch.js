/**
 * lib/serverFetch.js - Fetch natif pour Server Components.
 * Pas de directive "use client".
 */

// NEXT_PUBLIC_API_BASE peut contenir "/api/v1" (env local) ou pas (Vercel).
// Normalisation : la base d'API termine TOUJOURS par "/api/v1".
const rawBase = process.env.NEXT_PUBLIC_API_BASE || "https://tekalis.onrender.com/api/v1";
const BASE = rawBase.replace(/\/+$/, "").replace(/\/api\/v1$/, "") + "/api/v1";

/**
 * Fetch côté serveur avec timeout + retries.
 * Le backend hébergé sur Render peut être en cold start (inactif sur le
 * plan gratuit) : la première requête peut dépasser le timeout de build
 * de Vercel. Les réponses 429 (rate-limit) et 5xx (surcharge/cold start)
 * sont retentées avec backoff avant d'abandonner.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function serverFetch(path, options = {}) {
  const { revalidate = 3600, timeout = 15000, maxRetries = 3, ...rest } = options;

  const doFetch = (signal) =>
    fetch(`${BASE}${path}`, {
      next: { revalidate },
      signal,
      ...rest,
    });

  let lastErr;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout * (attempt === 0 ? 1 : 2));
    let res;

    try {
      res = await doFetch(controller.signal);
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      // Échec réseau (cold start) → nouvelle tentative
      if (attempt < maxRetries) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      throw err;
    }
    clearTimeout(t);

    // 429 = rate-limit, 5xx = surcharge : on retente avec backoff
    if (res.status === 429 || res.status >= 500) {
      lastErr = new Error(`API ${res.status}: ${path}`);
      if (attempt < maxRetries) {
        await sleep((res.status === 429 ? 1500 : 800) * (attempt + 1));
        continue;
      }
      throw lastErr;
    }

    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return res.json();
  }

  throw lastErr;
}
