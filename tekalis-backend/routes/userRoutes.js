const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs");

// ─── Middleware pour toutes les routes ────────────────────────────────────────
router.use(verifyToken);

// ===============================================
// GET /api/v1/users/me
// ===============================================
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const [orderCount, totalSpentData] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        { $match: { user: user._id, isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        password: undefined,
        stats: {
          ordersCount: orderCount,
          totalSpent: totalSpentData[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error("❌ Erreur /me:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// PUT /api/v1/users/me
// ===============================================
router.put("/me", async (req, res) => {
  try {
    const { name, phone, avatar, addresses } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (addresses !== undefined) user.addresses = addresses;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profil mis à jour",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error("❌ Erreur update profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// PUT /api/v1/users/me/password
// ===============================================
router.put("/me/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères"
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Mot de passe actuel incorrect" });
    }

    user.password = newPassword; // Le pre-save hook hashera automatiquement
    await user.save();

    res.status(200).json({ success: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("❌ Erreur change password:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// POST /api/v1/users/me/addresses
// ===============================================
router.post("/me/addresses", async (req, res) => {
  try {
    const { label, fullAddress, city, postalCode, country, phone, isDefault } = req.body;

    if (!fullAddress || !city) {
      return res.status(400).json({ success: false, message: "Adresse et ville sont requises" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push({
      label: label || "Maison",
      fullAddress,
      city,
      postalCode,
      country: country || "Sénégal",
      phone,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(200).json({ success: true, message: "Adresse ajoutée", addresses: user.addresses });
  } catch (error) {
    console.error("❌ Erreur add address:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// DELETE /api/v1/users/me/addresses/:addressId
// ===============================================
router.delete("/me/addresses/:addressId", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({ success: true, message: "Adresse supprimée", addresses: user.addresses });
  } catch (error) {
    console.error("❌ Erreur delete address:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// GET /api/v1/users/me/stats
// ===============================================
router.get("/me/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    const [ordersCount, totalSpentData, lastOrder, ordersByStatus] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.aggregate([
        { $match: { user: userId, isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      Order.findOne({ user: userId }).sort({ createdAt: -1 }).select("createdAt totalPrice status").lean(),
      Order.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        ordersCount,
        totalSpent: totalSpentData[0]?.total || 0,
        lastOrder,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error("❌ Erreur user stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Routes Admin ─────────────────────────────────────────────────────────────

// ===============================================
// GET /api/v1/users — Liste tous les utilisateurs (Admin)
// ===============================================
router.get("/", isAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role === "admin") filter.isAdmin = true;
    else if (role === "user") filter.isAdmin = false;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "desc" ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Ajouter le nombre de commandes pour chaque user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await Order.countDocuments({ user: user._id });
        return { ...user, password: undefined, ordersCount };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("❌ Erreur get users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// GET /api/v1/users/analytics/overview (Admin)
// ===============================================
router.get("/analytics/overview", isAdmin, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const startDate = new Date();
    if (period === "7d") startDate.setDate(startDate.getDate() - 7);
    else if (period === "30d") startDate.setDate(startDate.getDate() - 30);
    else if (period === "90d") startDate.setDate(startDate.getDate() - 90);

    const [totalUsers, activeUsers, newUsers, growthData] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      analytics: { totalUsers, activeUsers, newUsers, growth: growthData }
    });
  } catch (error) {
    console.error("❌ Erreur analytics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// GET /api/v1/users/:id (Admin)
// ===============================================
router.get("/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const [ordersCount, orderStats, recentOrders] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: null, totalSpent: { $sum: "$totalPrice" }, averageOrder: { $avg: "$totalPrice" } } }
      ]),
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber totalPrice status createdAt")
        .lean()
    ]);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        password: undefined,
        stats: {
          ordersCount,
          totalSpent: orderStats[0]?.totalSpent || 0,
          averageOrder: orderStats[0]?.averageOrder || 0,
          recentOrders
        }
      }
    });
  } catch (error) {
    console.error("❌ Erreur get user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// PUT /api/v1/users/:id (Admin)
// ===============================================
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { name, email, phone, isAdmin: setAdmin, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (setAdmin !== undefined) user.isAdmin = setAdmin;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("❌ Erreur update user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// DELETE /api/v1/users/:id (Admin)
// ===============================================
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas supprimer votre propre compte"
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    console.error("❌ Erreur delete user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
