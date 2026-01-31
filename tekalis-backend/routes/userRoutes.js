// ===============================================
// routes/userRoutes.js - Routes utilisateurs
// ===============================================
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const bcrypt = require("bcrypt");

// ===============================================
// ROUTES UTILISATEUR (Authentifié)
// ===============================================

// 👤 Récupérer le profil de l'utilisateur connecté
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id)
      .select("-password")
      .lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Récupérer quelques stats
    const orderCount = await Order.countDocuments({ user: user._id });
    const totalSpent = await Order.aggregate([
      {
        $match: { 
          user: user._id,
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        stats: {
          ordersCount: orderCount,
          totalSpent: totalSpent[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error("❌ Erreur /me:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ✏️ Mettre à jour le profil
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { name, phone, avatar, addresses } = req.body;
    
    const user = await User.findById(req.user.id || req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Mise à jour des champs autorisés
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (addresses) user.addresses = addresses;

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
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 🔒 Changer le mot de passe
router.put("/me/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Tous les champs sont requis" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères" 
      });
    }

    const user = await User.findById(req.user.id || req.user._id).select("+password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Mot de passe actuel incorrect" 
      });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Mot de passe modifié avec succès"
    });
  } catch (error) {
    console.error("❌ Erreur change password:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 📍 Ajouter une adresse
router.post("/me/addresses", verifyToken, async (req, res) => {
  try {
    const { label, fullAddress, city, postalCode, country, phone, isDefault } = req.body;

    if (!fullAddress || !city) {
      return res.status(400).json({ 
        success: false,
        message: "Adresse et ville sont requis" 
      });
    }

    const user = await User.findById(req.user.id || req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Si c'est l'adresse par défaut, retirer le flag des autres
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Ajouter la nouvelle adresse
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

    res.status(200).json({
      success: true,
      message: "Adresse ajoutée",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("❌ Erreur add address:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 🗑️ Supprimer une adresse
router.delete("/me/addresses/:addressId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    // Si l'adresse supprimée était par défaut, mettre la première comme défaut
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Adresse supprimée",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("❌ Erreur delete address:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 📊 Statistiques de l'utilisateur
router.get("/me/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Nombre de commandes
    const ordersCount = await Order.countDocuments({ user: userId });

    // Montant total dépensé
    const totalSpentData = await Order.aggregate([
      {
        $match: { 
          user: userId,
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalSpent = totalSpentData[0]?.total || 0;

    // Dernière commande
    const lastOrder = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .select("createdAt totalPrice status")
      .lean();

    // Commandes par statut
    const ordersByStatus = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        ordersCount,
        totalSpent,
        lastOrder,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error("❌ Erreur user stats:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ===============================================
// ROUTES ADMIN
// ===============================================

// 👥 Liste de tous les utilisateurs (Admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
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

    // Recherche
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Filtre par rôle
    if (role === "admin") {
      filter.isAdmin = true;
    } else if (role === "user") {
      filter.isAdmin = false;
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    const users = await User.find(filter)
      .select("-password")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    // Ajouter les stats pour chaque utilisateur
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await Order.countDocuments({ user: user._id });
        const totalSpentData = await Order.aggregate([
          {
            $match: { 
              user: user._id,
              isPaid: true
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalPrice" }
            }
          }
        ]);

        return {
          ...user,
          ordersCount,
          totalSpent: totalSpentData[0]?.total || 0
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Erreur get users:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 🔍 Détails d'un utilisateur (Admin)
router.get("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Stats détaillées
    const ordersCount = await Order.countDocuments({ user: user._id });
    
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$totalPrice" },
          averageOrder: { $avg: "$totalPrice" }
        }
      }
    ]);

    const recentOrders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber totalPrice status createdAt")
      .lean();

    res.status(200).json({
      success: true,
      user: {
        ...user,
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
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 🔧 Mettre à jour un utilisateur (Admin)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, isAdmin, isActive } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    // Mise à jour des champs
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
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
    
    // Erreur d'email dupliqué
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Cet email est déjà utilisé" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 🗑️ Supprimer un utilisateur (Admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    // Ne pas permettre de supprimer son propre compte
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: "Vous ne pouvez pas supprimer votre propre compte" 
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé"
    });
  } catch (error) {
    console.error("❌ Erreur delete user:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// 📊 Statistiques globales des utilisateurs (Admin)
router.get("/analytics/overview", verifyToken, isAdmin, async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const startDate = new Date();
    if (period === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(startDate.getDate() - 90);
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Croissance par jour
    const growthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        newUsers,
        growth: growthData
      }
    });
  } catch (error) {
    console.error("❌ Erreur analytics:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;