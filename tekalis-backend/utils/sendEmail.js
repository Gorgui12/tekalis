const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Remplace si tu utilises un autre service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("📩 Email envoyé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
  }
};

module.exports = sendEmail;
