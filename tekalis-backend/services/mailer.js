// ===============================================
// services/mailer.js — Transporteur SMTP partagé
//
// Isolé dans son propre module parce que deux consommateurs en ont besoin :
// EmailService (envoi immédiat) et emailQueue (reprise sur échec). Si la file
// importait emailService, on aurait une dépendance circulaire — Node
//.exports n'étant pas résolu à l'import, l'un des deux recevrait un objet vide.
// ===============================================
const nodemailer = require("nodemailer");

const isEmailConfigured = () =>
  !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Port 465 → secure: true (SSL)
// Port 587 → secure: false (STARTTLS)
const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Timeouts pour ne pas bloquer le thread Node si le SMTP ne répond pas.
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000
  });
};

let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    _transporter = createTransporter();
  }
  return _transporter;
};

// Une connexion morte fait échouer tous les envois suivants : on jette le
// transporteur pour forcer une reconnexion au prochain appel.
const resetTransporter = () => {
  _transporter = null;
};

// Une erreur « permanente » ne sera jamais résolue par une nouvelle tentative
// (adresse inexistante, domaine qui ne publie pas de MX). Inutile de la
// rejouer 5 fois : on la marque en échec direct. Tout le reste — et notamment
// une boîte pleine, un timeout, un 4xx temporaire — est repris plus tard.
const isPermanentError = (error = {}) => {
  const permanentCodes = new Set([
    "EENVELOPE",   // adresse refusée par le serveur
    "EENOTFOUND"   // résolution DNS impossible
  ]);
  const permanentReplies = [
    /user unknown/i,
    /no such user/i,
    /does not exist/i,
    /recipient address rejected/i,
    /mailbox (is )?(full|unavailable)/i,
    /unrouteable address/i,
    /domain .* does not exist/i
  ];

  if (permanentCodes.has(error.code)) return true;
  return permanentReplies.some((re) => re.test(error.message || ""));
};

// Vérification au chargement (non bloquant)
if (isEmailConfigured()) {
  getTransporter()
    .verify()
    .then(() => console.log("✅ Serveur email prêt"))
    .catch((err) => {
      console.error("❌ Erreur configuration email:", err.message);
      resetTransporter();
    });
} else {
  console.warn("⚠️  Email non configuré (EMAIL_HOST/USER/PASS manquants) — envois désactivés");
}

module.exports = {
  isEmailConfigured,
  getTransporter,
  resetTransporter,
  isPermanentError
};