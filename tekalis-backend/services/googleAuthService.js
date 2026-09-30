// ===============================================
// Vérification des ID tokens Google (Google Identity Services)
//
// Le bouton GIS du frontend renvoie un "credential" : un JWT signé par
// Google. On ne fait JAMAIS confiance à son contenu sans en vérifier la
// signature. On récupère les clés publiques de Google (JWKS) et on
// revalide localement avec jsonwebtoken — c'est ce qui garantit qu'un
// attaquant ne peut pas forger un jeton avec un email arbitraire.
//
// Aucune dépendance supplémentaire : Node 22 sait convertir une JWK en
// clé publique via crypto.createPublicKey({ key, format: "jwk" }).
// ===============================================
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const JWKS_TTL_MS = 60 * 60 * 1000; // Google ne tourne ses clés que rarement
const FETCH_TIMEOUT_MS = 8000;

// kid -> KeyObject. Partagé entre les logins concurrents.
let keyCache = new Map();
let keysFetchedAt = 0;
let inFlightFetch = null;

// ===============================================
// Récupération des clés publiques Google
// ===============================================
async function fetchJwks() {
  const res = await fetch(JWKS_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });

  if (!res.ok) {
    throw new Error(`Google JWKS indisponible (HTTP ${res.status})`);
  }

  const { keys } = await res.json();
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error("Google JWKS vide");
  }

  const next = new Map();
  for (const jwk of keys) {
    if (jwk.kty !== "RSA" || !jwk.kid || !jwk.n) continue;
    next.set(jwk.kid, crypto.createPublicKey({ key: jwk, format: "jwk" }));
  }

  if (next.size === 0) {
    throw new Error("Google JWKS ne contient aucune clé RSA exploitable");
  }

  keyCache = next;
  keysFetchedAt = Date.now();
  return next;
}

// Dédoublonne les appels concurrents : si 3 logins Google arrivent en
// même temps, on ne télécharge le JWKS qu'une seule fois.
function getKeys({ force = false } = {}) {
  const isStale = Date.now() - keysFetchedAt > JWKS_TTL_MS;
  if (!force && keyCache.size > 0 && !isStale) return Promise.resolve(keyCache);

  if (!inFlightFetch) {
    inFlightFetch = fetchJwks().finally(() => {
      inFlightFetch = null;
    });
  }
  return inFlightFetch;
}

// ===============================================
// Vérification d'un ID token
// ===============================================
// Retourne { sub, email, name, picture, emailVerified } ou lève une Error.
async function verifyIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const err = new Error("GOOGLE_CLIENT_ID non configuré sur le serveur");
    err.code = "GOOGLE_NOT_CONFIGURED";
    throw err;
  }

  // 1) Décoder l'en-tête pour trouver la clé (kid) — sans faire confiance
  //    au contenu, c'est seulement pour sélectionner la clé de vérification.
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    const err = new Error("Jeton Google illisible");
    err.code = "INVALID_TOKEN";
    throw err;
  }

  // 2) Clé correspondante (rafraîchit le cache une fois si le kid est inconnu,
  //    cas d'une rotation de clé que l'on n'a pas encore vue).
  let keys = await getKeys();
  if (!keys.has(decoded.header.kid)) {
    keys = await getKeys({ force: true });
  }
  const publicKey = keys.get(decoded.header.kid);
  if (!publicKey) {
    const err = new Error("Clé de signature Google inconnue");
    err.code = "INVALID_TOKEN";
    throw err;
  }

  // 3) Vérification cryptographique + audience + émetteur + expiration.
  let payload;
  try {
    payload = jwt.verify(idToken, publicKey, {
      algorithms: ["RS256"],
      audience: clientId,
      issuer: ISSUERS
    });
  } catch (err) {
    const e = new Error(
      err.name === "TokenExpiredError"
        ? "Session Google expirée, réessayez"
        : "Jeton Google invalide"
    );
    e.code = "INVALID_TOKEN";
    throw e;
  }

  if (!payload.sub || !payload.email) {
    const err = new Error("Jeton Google incomplet");
    err.code = "INVALID_TOKEN";
    throw err;
  }

  return {
    sub: payload.sub,
    email: String(payload.email).toLowerCase().trim(),
    // Google renvoie email_verified en booléen sur les ID tokens, mais
    // certains endpoints le sérialisent en chaîne : on normalise les deux.
    emailVerified: payload.email_verified === true || payload.email_verified === "true",
    name: payload.name || "",
    picture: payload.picture || null
  };
}

function isConfigured() {
  return !!process.env.GOOGLE_CLIENT_ID;
}

module.exports = { verifyIdToken, isConfigured };
