// ===============================================
// 8. controllers/dashboardController.js (Admin)
// ===============================================
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Review = require("../models/Review");
const RMA = require("../models/RMA");

// Statistiques générales du dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    
    // Calculer la date de début selon la période
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
    
    // Commandes
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const completedOrders = await Order.countDocuments({
      status: "delivered",
      createdAt: { $gte: startDate }
    });
    
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "processing"] }
    });
    
    // Chiffre d'affaires
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
          totalRevenue: { $sum: "$totalPrice" },
          averageOrderValue: { $avg: "$totalPrice" }
        }
      }
    ]);
    
    const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0 };
    
    // Utilisateurs
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    // Produits
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ 
      stock: { $gt: 0, $lte: 5 } 
    });
    
    // Avis
    const pendingReviews = await Review.countDocuments({ 
      isApproved: false 
    });
    
    // SAV
    const pendingRMAs = await RMA.countDocuments({
      status: { $in: ["pending", "approved", "in_transit"] }
    });
    
    res.status(200).json({
      success: true,
      stats: {
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          completionRate: totalOrders > 0 
            ? Math.round((completedOrders / totalOrders) * 100) 
            : 0
        },
        revenue: {
          total: Math.round(revenue.totalRevenue),
          average: Math.round(revenue.averageOrderValue)
        },
        users: {
          total: totalUsers,
          new: newUsers
        },
        products: {
          total: totalProducts,
          outOfStock,
          lowStock
        },
        reviews: {
          pending: pendingReviews
        },
        rmas: {
          pending: pendingRMAs
        }
      }
    });
  } catch (error) {
    console.error("Erreur getDashboardStats:", error);
    res.status(500).json({ message: error.message });
  }
};

// Graphique des ventes par jour
exports.getSalesChart = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    
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
    
    res.status(200).json({
      success: true,
      data: salesData.map(item => ({
        date: item._id,
        sales: item.totalSales,
        orders: item.orderCount
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Produits les plus vendus
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topProducts = await Product.find({ salesCount: { $gt: 0 } })
      .sort({ salesCount: -1 })
      .limit(Number(limit))
      .select("name images price salesCount rating");
    
    res.status(200).json({
      success: true,
      products: topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Commandes récentes
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select("orderNumber totalPrice status createdAt");
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Alertes (stock faible, avis à modérer, RMA en attente)
exports.getAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $gt: 0, $lte: 5 }
    })
      .select("name stock")
      .limit(10);
    
    const pendingReviews = await Review.countDocuments({ 
      isApproved: false 
    });
    
    const pendingRMAs = await RMA.countDocuments({
      status: "pending"
    });
    
    res.status(200).json({
      success: true,
      alerts: {
        lowStock: {
          count: lowStockProducts.length,
          products: lowStockProducts
        },
        pendingReviews,
        pendingRMAs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
