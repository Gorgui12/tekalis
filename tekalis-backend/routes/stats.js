// ===============================================
// routes/stats.js - Statistiques Admin
// ===============================================
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Review = require("../models/Review");
const RMA = require("../models/RMA");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Middleware: toutes les routes nécessitent admin
router.use(verifyToken);
router.use(isAdmin);

// ===============================================
// 📈 GET /admin/stats/revenue — Série revenu/commandes par jour
// ===============================================
router.get("/revenue", async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const start = new Date();
    if (period === "7d") start.setDate(start.getDate() - 7);
    else if (period === "90d") start.setDate(start.getDate() - 90);
    else if (period === "1y") start.setFullYear(start.getFullYear() - 1);
    else start.setDate(start.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: start }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Remplir les jours manquants avec 0
    const filledData = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      const day = salesData.find(d => d._id === dateStr);
      filledData.push({
        date: dateStr,
        revenue: day ? Math.round(day.revenue) : 0,
        orders: day ? day.orders : 0
      });
      current.setDate(current.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      period,
      data: filledData
    });
  } catch (error) {
    console.error("❌ Erreur revenue:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// 📊 Statistiques globales du dashboard
// ===============================================
router.get("/", async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    
    // Calculer la date de début
    const startDate = new Date();
    if (period === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === "1y") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // 💰 Statistiques de revenu
    const revenueData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          average: { $avg: "$totalPrice" },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { total: 0, average: 0, count: 0 };

    // Revenu période précédente (pour calculer le changement)
    const previousStartDate = new Date(startDate);
    const periodDuration = Date.now() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodDuration);

    const previousRevenueData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { 
            $gte: previousStartDate,
            $lt: startDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);

    const previousRevenue = previousRevenueData[0]?.total || 0;
    const revenueChange = previousRevenue > 0 
      ? ((revenue.total - previousRevenue) / previousRevenue) * 100 
      : 0;

    // 🛒 Statistiques des commandes
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });

    const previousOrders = await Order.countDocuments({
      createdAt: { 
        $gte: previousStartDate,
        $lt: startDate
      }
    });

    const ordersChange = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0;

    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "processing"] }
    });

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 📦 Statistiques des produits
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ 
      stock: { $gt: 0, $lte: 5 } 
    });

    // 👥 Statistiques des utilisateurs
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    const previousNewUsers = await User.countDocuments({
      createdAt: { 
        $gte: previousStartDate,
        $lt: startDate
      }
    });

    const usersChange = previousNewUsers > 0 
      ? ((newUsers - previousNewUsers) / previousNewUsers) * 100 
      : 0;

    // ⭐ Statistiques des avis
    const pendingReviews = await Review.countDocuments({ 
      isApproved: false 
    });

    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    // 🔧 Statistiques RMA/SAV
    const pendingRMAs = await RMA.countDocuments({
      status: { $in: ["pending", "approved", "in_transit"] }
    });

    const totalRMAs = await RMA.countDocuments();

    res.status(200).json({
      success: true,
      period,
      stats: {
        revenue: {
          total: Math.round(revenue.total),
          average: Math.round(revenue.average),
          change: Math.round(revenueChange * 10) / 10,
          ordersCount: revenue.count
        },
        orders: {
          total: totalOrders,
          change: Math.round(ordersChange * 10) / 10,
          pending: pendingOrders,
          byStatus: ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        products: {
          total: totalProducts,
          outOfStock,
          lowStock,
          available: totalProducts - outOfStock
        },
        users: {
          total: totalUsers,
          new: newUsers,
          change: Math.round(usersChange * 10) / 10
        },
        reviews: {
          pending: pendingReviews,
          total: totalReviews,
          averageRating: averageRating[0]?.avgRating || 0
        },
        rmas: {
          pending: pendingRMAs,
          total: totalRMAs
        }
      }
    });
  } catch (error) {
    console.error("❌ Erreur stats:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// 📈 Graphique des ventes (données par jour)
// ===============================================
router.get("/sales-chart", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Remplir les jours manquants avec 0
    const filledData = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = salesData.find(d => d._id === dateStr);
      
      filledData.push({
        date: dateStr,
        sales: dayData?.totalSales || 0,
        orders: dayData?.orderCount || 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: filledData
    });
  } catch (error) {
    console.error("❌ Erreur sales-chart:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// 🏆 Top produits
// ===============================================
router.get("/top-products", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Product.find({ 
      salesCount: { $gt: 0 } 
    })
      .sort({ salesCount: -1 })
      .limit(Number(limit))
      .select("name images price salesCount rating stock")
      .lean();

    // Calculer le revenu pour chaque produit
    const productsWithRevenue = topProducts.map(product => ({
      ...product,
      revenue: product.price * product.salesCount
    }));

    res.status(200).json({
      success: true,
      products: productsWithRevenue
    });
  } catch (error) {
    console.error("❌ Erreur top-products:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// 📋 Commandes récentes
// ===============================================
router.get("/recent-orders", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select("orderNumber totalPrice status createdAt deliveryName")
      .lean();

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: order.deliveryName || order.user?.name || "Client",
      email: order.user?.email,
      total: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("❌ Erreur recent-orders:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// 🔔 Alertes et notifications
// ===============================================
router.get("/alerts", async (req, res) => {
  try {
    // Produits en stock faible
    const lowStockProducts = await Product.find({
      stock: { $gt: 0, $lte: 5 }
    })
      .select("name stock")
      .limit(10)
      .lean();

    // Produits en rupture
    const outOfStockProducts = await Product.find({ stock: 0 })
      .select("name")
      .limit(5)
      .lean();

    // Avis en attente de modération
    const pendingReviews = await Review.countDocuments({ 
      isApproved: false 
    });

    // RMA en attente
    const pendingRMAs = await RMA.countDocuments({
      status: "pending"
    });

    // Commandes en attente depuis plus de 24h
    const oldPendingOrders = await Order.countDocuments({
      status: "pending",
      createdAt: { 
        $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) 
      }
    });

    res.status(200).json({
      success: true,
      alerts: {
        lowStock: {
          count: lowStockProducts.length,
          products: lowStockProducts
        },
        outOfStock: {
          count: outOfStockProducts.length,
          products: outOfStockProducts
        },
        pendingReviews,
        pendingRMAs,
        oldPendingOrders
      }
    });
  } catch (error) {
    console.error("❌ Erreur alerts:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// 📊 Statistiques de croissance
// ===============================================
router.get("/growth", async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Croissance par mois
    const monthlyGrowth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formattedGrowth = monthlyGrowth.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue,
      orders: item.orders
    }));

    res.status(200).json({
      success: true,
      growth: formattedGrowth
    });
  } catch (error) {
    console.error("❌ Erreur growth:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// 🌍 Statistiques géographiques
// ===============================================
router.get("/geography", async (req, res) => {
  try {
    // Analyse des adresses de livraison
    const locationData = await Order.aggregate([
      {
        $group: {
          _id: "$deliveryAddress",
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { orders: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      locations: locationData.map(loc => ({
        address: loc._id,
        orders: loc.orders,
        revenue: loc.revenue
      }))
    });
  } catch (error) {
    console.error("❌ Erreur geography:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;