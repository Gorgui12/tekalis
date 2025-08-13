const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const AdminAuth = require("../middlewares/auth");

const router = express.Router();

// 📊 Récupérer les statistiques
router.get("/", AdminAuth, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]);
    const totalProducts = await Product.countDocuments();

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports =  router;  // ✅ Ajoute cet export
