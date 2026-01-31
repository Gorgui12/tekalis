// ===============================================
// 9. services/emailService.js
// ===============================================
const nodemailer = require("nodemailer");
const emailTemplates = require("../utils/emailTemplates");

// Configuration du transporteur
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérifier la connexion
transporter.verify((error) => {
  if (error) {
    console.error("❌ Erreur configuration email:", error);
  } else {
    console.log("✅ Serveur email prêt");
  }
});

// Service d'envoi d'email
class EmailService {
  // Envoyer un email générique
  static async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.SITE_NAME || 'Tekalis'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Email envoyé: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Erreur envoi email:", error);
      return { success: false, error: error.message };
    }
  }
  
  // Email de confirmation de commande
  static async sendOrderConfirmation(order, user) {
    const html = emailTemplates.orderConfirmation(order, user);
    return await this.sendEmail(
      user.email,
      `Confirmation de commande ${order.orderNumber || order._id} - Tekalis`,
      html
    );
  }
  
  // Email de mise à jour de statut de commande
  static async sendOrderStatusUpdate(order, user, newStatus) {
    const html = emailTemplates.orderStatusUpdate(order, user, newStatus);
    return await this.sendEmail(
      user.email,
      `Mise à jour de votre commande ${order.orderNumber}`,
      html
    );
  }
  
  // Email de bienvenue
  static async sendWelcomeEmail(user) {
    const html = emailTemplates.welcome(user);
    return await this.sendEmail(
      user.email,
      "Bienvenue chez Tekalis ! 🎉",
      html
    );
  }
  
  // Email de reset password
  static async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = emailTemplates.passwordReset(user, resetUrl);
    return await this.sendEmail(
      user.email,
      "Réinitialisation de votre mot de passe - Tekalis",
      html
    );
  }
  
  // Email de demande d'avis
  static async sendReviewRequest(user, order, product) {
    const html = emailTemplates.reviewRequest(user, order, product);
    return await this.sendEmail(
      user.email,
      "Donnez votre avis sur votre achat - Tekalis",
      html
    );
  }
  
  // Email de notification SAV
  static async sendRMANotification(user, rma, type = "created") {
    const html = emailTemplates.rmaNotification(user, rma, type);
    const subject = type === "created" 
      ? `Demande SAV ${rma.rmaNumber} créée`
      : `Mise à jour de votre demande SAV ${rma.rmaNumber}`;
    
    return await this.sendEmail(
      user.email,
      subject,
      html
    );
  }
  
  // Email d'alerte garantie
  static async sendWarrantyExpiring(user, warranty, product) {
    const html = emailTemplates.warrantyExpiring(user, warranty, product);
    return await this.sendEmail(
      user.email,
      "Votre garantie arrive à expiration - Tekalis",
      html
    );
  }
  
  // Email admin (nouvelle commande)
  static async notifyAdminNewOrder(order, user) {
    const html = emailTemplates.adminOrderNotification(order, user);
    return await this.sendEmail(
      process.env.ADMIN_EMAIL,
      `🛍️ Nouvelle commande ${order.orderNumber} - Tekalis`,
      html
    );
  }
}

module.exports = EmailService;
