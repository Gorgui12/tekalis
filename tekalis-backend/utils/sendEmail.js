// ===============================================
// utils/sendEmail.js
// Configuration SMTP LWS (tekalis.com)
// ===============================================

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    console.log("📨 Préparation envoi email vers :", to);

    // ===============================================
    // Transporteur SMTP LWS
    // ===============================================
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // mail.tekalis.com
      port: process.env.EMAIL_PORT, // 465 ou 587
      secure: process.env.EMAIL_PORT == 465, // true si SSL (465)

      auth: {
        user: process.env.EMAIL_USER, // company@tekalis.com
        pass: process.env.EMAIL_PASS, // mot de passe email LWS
      },
    });

    // ===============================================
    // Envoi du mail
    // ===============================================
    const info = await transporter.sendMail({
      from: `"Tekalis Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email envoyé avec succès !");
    console.log("📩 Message ID :", info.messageId);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du mail :");
    console.error("Message :", error.message);
  }
};

module.exports = sendEmail;

