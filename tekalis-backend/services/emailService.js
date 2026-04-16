// ===============================================
// services/emailService.js — VERSION CORRIGÉE
// MAJEUR 5 : Fichier unique consolidé
//   → emailSeervice.js (typo) doit être supprimé
//   → Ce fichier est la seule source de vérité
// ===============================================
const nodemailer = require("nodemailer");
const emailTemplates = require("../utils/emailTemplates");

// ── Vérification de la configuration ─────────────────────────────────────────
const isEmailConfigured = () =>
  !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

// ── Configuration du transporteur ────────────────────────────────────────────
// Port 465 → secure: true (SSL)
// Port 587 → secure: false (STARTTLS)
// Le .env de Tekalis utilise le port 465 avec mail.tekalis.com
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
    // Timeout pour éviter de bloquer le thread Node en prod
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000
  });
};

// Singleton transporter (créé une seule fois au démarrage)
let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    _transporter = createTransporter();
  }
  return _transporter;
};

// Vérification au démarrage (non bloquant)
if (isEmailConfigured()) {
  getTransporter().verify()
    .then(() => console.log("✅ Serveur email prêt"))
    .catch((err) => {
      console.error("❌ Erreur configuration email:", err.message);
      _transporter = null; // Reset pour retry au prochain envoi
    });
} else {
  console.warn("⚠️  Email non configuré (EMAIL_HOST/USER/PASS manquants) — envois désactivés");
}

// ── Classe EmailService ───────────────────────────────────────────────────────
class EmailService {

  // ── Envoi générique ─────────────────────────────────────────────────────────
  static async sendEmail(to, subject, html, attachments = []) {
    if (!isEmailConfigured()) {
      console.log(`📧 Email ignoré (non configuré) → ${to} : ${subject}`);
      return { success: false, error: "Email non configuré" };
    }

    try {
      const info = await getTransporter().sendMail({
        from: `"${process.env.SITE_NAME || "Tekalis"}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      });

      console.log(`📧 Email envoyé: ${info.messageId} → ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Erreur envoi email → ${to}:`, error.message);
      // Reset transporter en cas d'erreur de connexion pour forcer reconnexion
      if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
        _transporter = null;
      }
      return { success: false, error: error.message };
    }
  }

  // ── Confirmation de commande ────────────────────────────────────────────────
  static async sendOrderConfirmation(order, user) {
    const html = emailTemplates.orderConfirmation(order, user);
    return this.sendEmail(
      user.email,
      `✅ Confirmation commande #${order.orderNumber} — Tekalis`,
      html
    );
  }

  // ── Mise à jour statut commande ────────────────────────────────────────────
  static async sendOrderStatusUpdate(order, user, newStatus) {
    const html = emailTemplates.orderStatusUpdate(order, user, newStatus);
    return this.sendEmail(
      user.email,
      `📦 Mise à jour commande #${order.orderNumber}`,
      html
    );
  }

  // ── Bienvenue ──────────────────────────────────────────────────────────────
  static async sendWelcomeEmail(user) {
    const html = emailTemplates.welcome(user);
    return this.sendEmail(user.email, `🎉 Bienvenue chez Tekalis !`, html);
  }

  // ── Reset password ─────────────────────────────────────────────────────────
  static async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = emailTemplates.passwordReset(user, resetUrl);
    return this.sendEmail(
      user.email,
      "🔑 Réinitialisation de votre mot de passe — Tekalis",
      html
    );
  }

  // ── Demande d'avis ─────────────────────────────────────────────────────────
  static async sendReviewRequest(user, order, product) {
    const html = emailTemplates.reviewRequest(user, order, product);
    return this.sendEmail(user.email, "⭐ Donnez votre avis — Tekalis", html);
  }

  // ── Notification SAV ───────────────────────────────────────────────────────
  static async sendRMANotification(user, rma, type = "created") {
    const html = emailTemplates.rmaNotification(user, rma, type);
    const subject = type === "created"
      ? `🔧 Demande SAV ${rma.rmaNumber} créée`
      : `🔧 Mise à jour demande SAV ${rma.rmaNumber}`;
    return this.sendEmail(user.email, subject, html);
  }

  // ── Alerte expiration garantie ─────────────────────────────────────────────
  static async sendWarrantyExpiring(user, warranty, product) {
    const html = emailTemplates.warrantyExpiring(user, warranty, product);
    return this.sendEmail(user.email, "⚠️ Votre garantie arrive à expiration — Tekalis", html);
  }

  // ── Notification admin : nouvelle commande ─────────────────────────────────
  // MAJEUR 8 : Vérification explicite de ADMIN_EMAIL avant tentative d'envoi
  static async notifyAdminNewOrder(order, user) {
    if (!process.env.ADMIN_EMAIL) {
      console.warn("⚠️  ADMIN_EMAIL non défini — notification admin ignorée pour la commande", order.orderNumber);
      return { success: false, error: "ADMIN_EMAIL non configuré" };
    }
    const html = emailTemplates.adminOrderNotification(order, user);
    return this.sendEmail(
      process.env.ADMIN_EMAIL,
      `🛍️ Nouvelle commande #${order.orderNumber}`,
      html
    );
  }
}

module.exports = EmailService;
