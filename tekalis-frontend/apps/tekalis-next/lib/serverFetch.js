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

// Un 429 signifie « quota déjà épuisé » : réessayer ne fait qu'allonger la
// fenêtre. Insister sur un seau plein le repousse encore plus loin (chaque
// tentative est elle-même comptée), ce qui transformait un pic de trafic
// passager en coupure de tout le site. 5xx et erreurs réseau en revanche
// méritent de l'insistance : ils se résorbent seuls.
const MAX_429_RETRIES = 1;

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

    // Quota épuisé : une seule reprise, courte. Au-delà on aggrave la situation.
    if (res.status === 429) {
      lastErr = new Error(`API 429 (rate-limit): ${path}`);
      if (attempt < Math.min(maxRetries, MAX_429_RETRIES)) {
        await sleep(2000);
        continue;
      }
      throw lastErr;
    }

    // 5xx = surcharge ou cold start : on retente avec backoff
    if (res.status >= 500) {
      lastErr = new Error(`API ${res.status}: ${path}`);
      if (attempt < maxRetries) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      throw lastErr;
    }

    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return res.json();
  }

  throw lastErr;
}
