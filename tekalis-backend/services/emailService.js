// ===============================================
// services/emailService.js — VERSION CORRIGÉE
// MAJEUR 5 : Fichier unique consolidé
//   → emailSeervice.js (typo) doit être supprimé
//   → Ce fichier est la seule source de vérité
//
// Le transporteur SMTP vit désormais dans services/mailer.js : il est partagé
// avec services/emailQueue.js (reprise sur échec). L'import se fait par
// propriété, `mailer.xxx()`, et non par destructuration — ainsi le module
// reste substituable, ce qui permet de tester ce que reçoit réellement le SMTP
// sans envoyer de message.
// ===============================================
const mailer = require("./mailer");
const emailQueue = require("./emailQueue");
const emailTemplates = require("../utils/emailTemplates");

// ── Classe EmailService ───────────────────────────────────────────────────────
class EmailService {

  // Durée de validité d'un lien de réinitialisation. Source unique de vérité :
  // le contrôleur la met dans resetPasswordExpires, le template l'affiche.
  // Avant, "10 minutes" était écrit en dur des deux côtés.
  static RESET_TOKEN_TTL_MINUTES = 10;
  static RESET_TOKEN_TTL_MS = EmailService.RESET_TOKEN_TTL_MINUTES * 60 * 1000;

  // Durée de validité du lien de vérification d'email. Volontairement plus
  // longue que celle du reset : un client qui ne voit pas l'email tout de suite
  // doit pouvoir en demander un nouveau sans être bloqué.
  static EMAIL_VERIFICATION_TTL_HOURS = 24;
  static EMAIL_VERIFICATION_TTL_MS = EmailService.EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000;

  // ── Envoi générique ─────────────────────────────────────────────────────────
  // options : { attachments, headers, text }
  //
  // `headers` sert notamment à poser List-Unsubscribe sur les emails marketing
  // (obligatoire pour la délivrabilité Gmail/Yahoo des campagnes).
  //
  // Deux garanties ajoutées ici :
  //  1. une partie text/plain dérivée du HTML — sans elle, Gmail classe le
  //     message en spam et les clients texte seul affichent le HTML brut ;
  //  2. un repli en file d'attente si l'envoi immédiat échoue, pour qu'une
  //     coupure SMTP ne coûte pas une confirmation de commande.
  static async sendEmail(to, subject, html, options = {}) {
    if (!mailer.isEmailConfigured()) {
      console.log(`📧 Email ignoré (non configuré) → ${to} : ${subject}`);
      return { success: false, error: "Email non configuré" };
    }

    const { attachments = [], headers = {} } = options;

    const mail = {
      from: `"${process.env.SITE_NAME || "Tekalis"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: options.text || emailTemplates.htmlToText(html),
      // Sans Reply-To explicite, une réponse du client part vers la boîte
      // technique du site et disparaît. On expose une adresse de support.
      replyTo: process.env.EMAIL_REPLY_TO || process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      attachments,
      headers
    };

    try {
      const info = await mailer.getTransporter().sendMail(mail);

      console.log(`📧 Email envoyé: ${info.messageId} → ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Erreur envoi email → ${to}:`, error.message);

      if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
        mailer.resetTransporter();
      }

      // Repli : on conserve le message en base et le balayeur le rejouera.
      // Les erreurs permanentes ne sont pas empilées — le client devra
      // déclencher un nouvel envoi.
      if (!mailer.isPermanentError(error)) {
        const queued = await emailQueue.enqueue(mail);
        return { success: false, queued: queued.success, error: error.message };
      }

      return { success: false, queued: false, error: error.message };
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
    // .replace sur la barre oblique finale : sans cela, une URL configurée avec
    // un slash terminal produirait un lien "//reset-password/...".
    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const html = emailTemplates.passwordReset(
      user,
      resetUrl,
      EmailService.RESET_TOKEN_TTL_MINUTES
    );
    return this.sendEmail(
      user.email,
      "🔑 Réinitialisation de votre mot de passe — Tekalis",
      html
    );
  }

  // ── Vérification de l'adresse email ────────────────────────────────────────
  // Le lien pointe vers le front (/verify-email?token=…), pas vers l'API : le
  // client vient de s'inscrire et doit ensuite pouvoir se connecter depuis une
  // vraie page du site.
  static async sendEmailVerification(user, token) {
    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
    const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const html = emailTemplates.emailVerification(
      user,
      verifyUrl,
      EmailService.EMAIL_VERIFICATION_TTL_HOURS
    );

    return this.sendEmail(
      user.email,
      "✅ Vérifiez votre adresse email — Tekalis",
      html
    );
  }

  // ── Newsletter : confirmation d'inscription (double opt-in) ─────────────────
  static async sendNewsletterConfirmation(subscriber, confirmUrl, unsubscribeUrl) {
    const html = emailTemplates.newsletterConfirmation(confirmUrl, unsubscribeUrl);
    return this.sendEmail(
      subscriber.email,
      `📬 Confirmez votre inscription à la newsletter ${process.env.SITE_NAME || "Tekalis"}`,
      html,
      { headers: EmailService.buildUnsubscribeHeaders(unsubscribeUrl) }
    );
  }

  // ── En-têtes List-Unsubscribe (One-Click) ───────────────────────────────────
  // Requis par Gmail et Yahoo pour les emails marketing : sans eux, les
  // campagnes partent en spam. Doit pointer vers une URL qui traite le
  // désabonnement sans session ni clic supplémentaire.
  static buildUnsubscribeHeaders(unsubscribeUrl) {
    return {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
    };
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
