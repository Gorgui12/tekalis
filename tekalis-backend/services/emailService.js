const nodemailer = require("nodemailer");
const emailTemplates = require("../utils/emailTemplates");

// ── Configuration du transporteur ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Vérifier la connexion au démarrage (non bloquant)
transporter.verify()
  .then(() => console.log("✅ Serveur email prêt"))
  .catch((err) => console.error("❌ Erreur configuration email:", err.message));

class EmailService {
  // ── Envoi générique ─────────────────────────────────────────────────────────
  static async sendEmail(to, subject, html, attachments = []) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("📧 Email non configuré — envoi ignoré");
        return { success: false, error: "Email non configuré" };
      }

      const info = await transporter.sendMail({
        from: `"${process.env.SITE_NAME || "Tekalis"}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      });

      console.log(`📧 Email envoyé: ${info.messageId} → ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Erreur envoi email:", error.message);
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
  static async notifyAdminNewOrder(order, user) {
    if (!process.env.ADMIN_EMAIL) return { success: false, error: "ADMIN_EMAIL non configuré" };
    const html = emailTemplates.adminOrderNotification(order, user);
    return this.sendEmail(
      process.env.ADMIN_EMAIL,
      `🛍️ Nouvelle commande #${order.orderNumber}`,
      html
    );
  }
}

module.exports = EmailService;
