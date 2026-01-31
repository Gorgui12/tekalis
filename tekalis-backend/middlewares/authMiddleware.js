const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================================
// Middleware d'authentification principal
// ===============================================
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur complet depuis la DB
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // ✅ Stocker l'utilisateur complet dans req.user
    req.user = {
      _id: user._id,
      id: user._id, // Pour compatibilité
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };

    console.log("✅ Utilisateur authentifié:", req.user.email);
    next();
  } catch (error) {
    console.error("❌ Erreur d'authentification:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré" });
    }
    
    res.status(401).json({ message: "Authentification échouée" });
  }
};

// ===============================================
// Middleware pour vérifier le rôle admin
// ===============================================
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      message: "Accès refusé. Droits administrateur requis." 
    });
  }
  
  console.log("✅ Admin vérifié:", req.user.email);
  next();
};

// ===============================================
// Middleware optionnel (n'échoue pas si pas de token)
// ===============================================
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (user) {
        req.user = {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        };
      }
    }
  } catch (error) {
    // Ne pas bloquer si token invalide
    console.log("ℹ️ Token optionnel invalide ou absent");
  }
  
  next();
};

// ===============================================
// EXPORTS
// ===============================================
module.exports = {
  verifyToken,
  protect: verifyToken,  // ✅ Alias pour compatibilité
  isAdmin,
  optionalAuth
};