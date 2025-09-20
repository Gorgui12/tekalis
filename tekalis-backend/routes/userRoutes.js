const express = require("express");
const  verifyToken  = require( "../middlewares/authMiddleware.js");
const User = require( "../models/User.js");

const router = express.Router();

// ✅ Récupérer les infos de l’utilisateur connecté
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;

