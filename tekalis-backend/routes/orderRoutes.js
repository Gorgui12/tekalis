const express = require("express");
const Order = require("../models/Order.js");
const { verifyToken } = require("../middlewares/authMiddleware.js");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

// ✅ Configuration du transport d'e-mails
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
      shippingCost,
      paymentMethod,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      deliveryCity,
      deliveryRegion
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Aucun produit dans la commande" });
    }

    const newOrder = new Order({
      user: req.user.id,
      products,
      totalPrice,
      shippingCost: shippingCost || 0,
      paymentMethod,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      deliveryCity,
      deliveryRegion
    });

    await newOrder.save();

    console.log("✅ Nouvelle commande enregistrée :", newOrder);

    // ✅ RÉPONDRE IMMÉDIATEMENT AU CLIENT (avant l'email)
    res.status(201).json(newOrder);

    // ✅ Envoyer l'email EN ARRIÈRE-PLAN (ne bloque pas)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS.length > 10) {
      // 🧾 Génération du contenu du mail
      const productList = newOrder.products
        .map(
          (p) =>
            `<li>${p.name || p.productName || 'Produit'} — ${p.quantity} × ${p.price.toLocaleString()} FCFA</li>`
        )
        .join("");

      const mailOptions = {
        from: `"Tekalis" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL, // Destinataire principal
        subject: `🛍️ Nouvelle commande Tekalis #${newOrder.orderNumber || newOrder._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color:#1E40AF; border-bottom: 3px solid #1E40AF; padding-bottom: 10px;">📦 Nouvelle commande reçue</h2>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">👤 Informations client</h3>
              <p><b>Nom :</b> ${deliveryName}</p>
              <p><b>Téléphone :</b> ${deliveryPhone}</p>
              <p><b>Ville :</b> ${deliveryCity || 'Non spécifié'}</p>
              <p><b>Région :</b> ${deliveryRegion || 'Non spécifié'}</p>
              <p><b>Adresse :</b> ${deliveryAddress}</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">💳 Paiement</h3>
              <p><b>Méthode :</b> ${paymentMethod === 'cash' ? '💵 Paiement à la livraison' : paymentMethod.toUpperCase()}</p>
              <p><b>Total :</b> <strong style="color: #1E40AF; font-size: 1.5em;">${totalPrice.toLocaleString()} FCFA</strong></p>
            </div>

            <div style="margin: 20px 0;">
              <h3>🛒 Détails des produits :</h3>
              <ul style="list-style: none; padding: 0;">
                ${productList}
              </ul>
            </div>
            
            <div style="background: #e5e7eb; padding: 10px; border-radius: 5px; margin-top: 30px;">
              <p style="font-size:14px;color:#555; margin: 5px 0;">🕒 Commande passée le ${new Date().toLocaleString('fr-FR')}</p>
              <p style="font-size:14px;color:#555; margin: 5px 0;">📋 Numéro : ${newOrder.orderNumber || newOrder._id}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
            <p style="font-size:12px;color:#777; text-align: center;">© Tekalis ${new Date().getFullYear()} - Notification automatique</p>
          </div>
        `,
      };

      // 📩 Envoi de l'email en arrière-plan
      transporter.sendMail(mailOptions)
        .then(() => console.log("✅ Email envoyé avec succès !"))
        .catch(emailError => {
          console.error("❌ Email non envoyé (non bloquant):", emailError.message);
        });
    } else {
      console.log("📧 Email non configuré - envoi ignoré");
    }

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
      .populate("user", "name email")
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Récupérer les commandes d'un utilisateur
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });
    
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
    order.paymentStatus = 'paid';
    await order.save();

    res.status(200).json({ message: "Commande marquée comme payée", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;