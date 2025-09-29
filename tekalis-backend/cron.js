const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Order = require("./models/Order");
const moment = require("moment-timezone");

// 🚀 Config transport mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true si port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🕗 Log démarrage
console.log("🕗 Cron job actif : rapport quotidien des commandes à 08:00 (Africa/Dakar)");

// 🕗 Tâche planifiée chaque jour à 08:00 heure locale Dakar
cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("📩 Envoi du rapport quotidien des commandes...");

    try {
      // Récupérer les commandes des dernières 24h
      const yesterday = moment().tz("Africa/Dakar").subtract(24, "hours").toDate();

      const orders = await Order.find({ createdAt: { $gte: yesterday } })
        .populate("user", "name email")
        .populate("products.product", "name price");

      if (orders.length === 0) {
        console.log("❌ Aucune commande dans les dernières 24h");
        return;
      }

      // Construire le contenu de l'email
      let emailContent = `<h2>📦 Rapport des commandes des dernières 24h</h2>`;
      emailContent += `<p>Total: <b>${orders.length}</b> commandes</p>`;
      emailContent += `<ul>`;
      orders.forEach(order => {
        emailContent += `<li>
          <b>Client:</b> ${order.user?.name || "N/A"} (${order.user?.email || "N/A"}) <br/>
          <b>Montant:</b> ${order.totalPrice} FCFA <br/>
          <b>Date:</b> ${moment(order.createdAt).tz("Africa/Dakar").format("DD/MM/YYYY HH:mm")} <br/>
        </li><br/>`;
      });
      emailContent += `</ul>`;

      // Envoyer le mail
      await transporter.sendMail({
        from: `"Tekalis" <${process.env.EMAIL_USER}>`,
        to: "tonemaildestinataire@gmail.com", // <- mets ton email
        subject: "Rapport quotidien des commandes Tekalis",
        html: emailContent,
      });

      console.log("✅ Rapport envoyé avec succès !");
    } catch (err) {
      console.error("❌ Erreur envoi rapport:", err);
    }
  },
  {
    timezone: "Africa/Dakar", // Assure que le cron suit le fuseau horaire Dakar
  }
);
