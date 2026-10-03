// ===============================================
// services/emailCooldown.js
// Anti-email-bombing : borne le débit d'envoi PAR ADRESSE.
//
// Le rate-limit par IP de express-rate-limit borne le débit total
// (serveur sous concert), mais pas le débit par destinataire : sans ce
// module, une seule IP peut inonder la boîte d'un tiers connu. C'est le
// scénario le plus nuisible ici, car /forgot-password répond toujours 200
// (pour ne pas révéler les comptes existants) et ne peut donc pas s'appuyer
// sur skipSuccessfulRequests.
//
// Stockage en mémoire : suffisant pour un backend mono-instance. En cas de
// scale-out, remplacer la Map par Redis — l'API publique ne change pas.
// ===============================================

const DEFAULT_COOLDOWN_MS = 60 * 1000;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

// clé (email normalisé) → timestamp du dernier envoi
const lastSentAt = new Map();

// Purge les entrées expirées : sans ça la Map grossit indéfiniment, chaque
// adresse tentant une inscription ou un reset y restant pour toujours.
const sweepTimer = setInterval(() => {
  const cutoff = Date.now() - DEFAULT_COOLDOWN_MS;
  for (const [key, ts] of lastSentAt) {
    if (ts < cutoff) lastSentAt.delete(key);
  }
}, SWEEP_INTERVAL_MS);

// unref() : le timer ne doit pas maintenir le process en vie, sinon SIGTERM
// ne termine pas proprement le serveur.
sweepTimer.unref();

/**
 * @returns {boolean} true si un envoi vient d'avoir lieu pour cette clé.
 */
const isBlocked = (key, cooldownMs = DEFAULT_COOLDOWN_MS) => {
  const ts = lastSentAt.get(key);
  return !!ts && Date.now() - ts < cooldownMs;
};

/**
 * Enregistre un envoi. À appeler APRÈS la réussite de l'envoi SMTP uniquement :
 * marquer avant ferait perdre un email légitime si l'envoi échouait.
 */
const markSent = (key) => {
  lastSentAt.set(key, Date.now());
};

// Utilitaire pour les tests : réinitialise l'état du module.
const clear = () => lastSentAt.clear();

module.exports = {
  isBlocked,
  markSent,
  clear,
  DEFAULT_COOLDOWN_MS
};