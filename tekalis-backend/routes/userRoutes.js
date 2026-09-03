// ===============================================
// routes/userRoutes.js
// ✅ FIX : toutes les routes nommées déclarées AVANT /:id
//    (me, me/stats, me/password, me/addresses, analytics/overview)
// ✅ FIX : N+1 query corrigé sur GET / (liste admin)
// ===============================================
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { verifyToken } = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs");

// Toutes les routes nécessitent une authentification
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

    user.password = newPassword; // pre-save hook hash automatiquement
    await user.save();

    res.status(200).json({ success: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("❌ Erreur change password:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================================
// GET /api/v1/users/me/stats
// ✅ AVANT /:id
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

// NOTE : les routes d'administration des utilisateurs (liste, détail,
// modification, suppression, analytics) ont été retirées de ce fichier
// le jour de l'audit du 2026-09-03. Elles faisaient doublon exact avec
// /api/v1/admin/users/* (routes/adminRoutes.js), qui est la version
// réellement appelée par l'app admin (voir apps/admin/src/pages/Users.jsx).
// Garder les deux jeux de routes vivants en parallèle est ce qui a permis
// à cette duplication de dériver silencieusement. Le jeu canonique est
// désormais uniquement /api/v1/admin/users/*.

module.exports = router;