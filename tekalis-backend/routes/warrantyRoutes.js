// ===============================================
// 15. ROUTES - routes/warrantyRoutes.js
// ===============================================
const express = require("express");
const router = express.Router();
const Warranty = require("../models/Warranty");
const { verifyToken } = require("../middlewares/authMiddleware");

// GET /api/v1/user/warranties - Mes garanties
router.get("/", verifyToken, async (req, res) => {
  try {
    const warranties = await Warranty.find({ user: req.user._id })
      .populate("product", "name images brand")
      .populate("order", "orderNumber")
      .sort({ endDate: 1 });
    
    res.status(200).json({ success: true, warranties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/user/warranties/:id - Détails d'une garantie
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const warranty = await Warranty.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate("product", "name images brand specs")
      .populate("order", "orderNumber createdAt");
    
    if (!warranty) {
      return res.status(404).json({ message: "Garantie introuvable" });
    }
    
    res.status(200).json({ success: true, warranty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;