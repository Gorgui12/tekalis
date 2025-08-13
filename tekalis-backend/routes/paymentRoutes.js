const express = require( "express");
const Stripe = require( "stripe");
const Order  = require("../models/Order.js");
const dotenv = require( "dotenv");
const verifyToken  = require( "../middlewares/authMiddleware.js");
const sendEmail = require("../utils/sendEmail");


dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 📌 Paiement à la livraison (Cash On Delivery)
router.post("/cash-on-delivery", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    order.paymentMethod = "cash-on-delivery";
    order.isPaid = false;
    await order.save();

    res.status(200).json({ message: "Paiement à la livraison confirmé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// 📌 Créer un paiement avec Stripe
router.post("/stripe", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice * 100, // Stripe prend les montants en centimes
      currency: "usd",
      metadata: { orderId: order._id.toString() },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Vérifier le paiement
router.post("/verify-payment", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

    if (paymentIntent.status === "succeeded") {
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();
      
      res.status(200).json({ message: "Paiement confirmé" });
    } else {
      res.status(400).json({ message: "Paiement non confirmé" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/// 📌 Enregistrer un paiement Mobile Money
router.post("/mobile-money", verifyToken, async (req, res) => {
  try {
    const { orderId, reference, provider } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    // Enregistrement du paiement
    order.mobileMoneyProvider = provider; // Enregistre Wave, Orange, ou Free
    order.mobileMoneyReference = reference;
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

     // 📩 Envoi de l'email de confirmation
     const emailMessage = `Bonjour,\n\nVotre paiement via ${provider} a été reçu avec succès.\n\nRéférence: ${reference}\nMontant: ${order.totalPrice} USD\n\nMerci de votre confiance !`;
     await sendEmail(order.user.email, "Confirmation de paiement", emailMessage);

    res.status(200).json({ message: `Paiement via ${provider} enregistré avec succès` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  

module.exports = router;
