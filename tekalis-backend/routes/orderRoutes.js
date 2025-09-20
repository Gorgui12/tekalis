const express = require( "express");
const Order = require( "../models/Order.js");
const  verifyToken  = require( "../middlewares/authMiddleware.js");

const router = express.Router();

// 📌 Créer une commande
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
    console.log("Nouvelle commande :", newOrder); // debug
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Récupérer toutes les commandes (Admin)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });

    const orders = await Order.find().populate("user", "email").populate("products.product", "name price");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Récupérer les commandes d'un utilisateur
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("products.product", "name price");
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
