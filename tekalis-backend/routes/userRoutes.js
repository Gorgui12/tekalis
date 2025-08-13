const express = require("express");
const  verifyToken  = require( "../middlewares/authMiddleware.js");
const User = require( "../models/User.js");

const router = express.Router();

// ✅ Récupérer les infos de l’utilisateur connecté
router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json(user);
});

module.exports = router;

