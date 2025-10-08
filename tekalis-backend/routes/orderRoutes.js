const express = require("express");
const Order = require("../models/Order.js");
const verifyToken = require("../middlewares/authMiddleware.js");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// ✅ Configuration du transport d’e-mails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📌 Créer une commande + envoyer un email
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("📦 Reçu POST /orders avec : ", req.body);
    const {
      products,
      totalPrice,
      paymentMethod,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Aucun produit dans la commande" });
    }

    const newOrder = new Order({
      user: req.user.id,
      products,
      totalPrice,
      paymentMethod,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
    });

    await newOrder.save();

    console.log("✅ Nouvelle commande enregistrée :", newOrder);

    // 🧾 Génération du contenu du mail
    const productList = newOrder.products
      .map(
        (p) =>
          `<li>${p.name || p.productName} — ${p.quantity} × ${p.price} CFA</li>`
      )
      .join("");

    const mailOptions = {
      from: `"Tekalis" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Destinataire principal (toi)
      subject: `🛍️ Nouvelle commande Tekalis (${newOrder._id})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#1E40AF;">📦 Nouvelle commande reçue</h2>
          <p><b>Nom du client :</b> ${deliveryName}</p>
          <p><b>Téléphone :</b> ${deliveryPhone}</p>
          <p><b>Adresse de livraison :</b> ${deliveryAddress}</p>
          <p><b>Méthode de paiement :</b> ${paymentMethod}</p>
          <p><b>Total :</b> <strong>${totalPrice} CFA</strong></p>
          <h3>Détails des produits :</h3>
          <ul>${productList}</ul>
          <br/>
          <p style="font-size:14px;color:#555;">🕒 Commande passée le ${new Date().toLocaleString()}</p>
          <hr/>
          <p style="font-size:12px;color:#777;">© Tekalis 2025 - Notification automatique</p>
        </div>
      `,
    };

    // 📩 Envoi de l’email automatique
    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Email envoyé avec succès à Tekalis !");
    } catch (emailError) {
      console.error("❌ Erreur lors de l’envoi du mail :", emailError);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Erreur lors de la création de la commande :", error);
    res.status(500).json({ message: error.message });
  }
});

// 📌 Récupérer toutes les commandes (Admin)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const orders = await Order.find()
      .populate("user", "email")
      .populate("products.product", "name price");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Récupérer les commandes d'un utilisateur
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "products.product",
      "name price"
    );
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Modifier le statut d'une commande (Admin)
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Commande introuvable" });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Supprimer une commande (Admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Commande introuvable" });

    res.status(200).json({ message: "Commande supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Marquer une commande comme payée manuellement (Admin)
router.put("/:id/pay", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    res.status(200).json({ message: "Commande marquée comme payée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
