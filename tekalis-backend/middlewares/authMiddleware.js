const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================================
// Middleware d'authentification principal
// ===============================================
const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Token manquant ou malformé."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Token manquant."
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la DB (vérifie qu'il existe encore et est actif)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable. Token invalide."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé. Contactez le support."
      });
    }

    // Stocker l'utilisateur complet dans req.user
    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide."
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré. Veuillez vous reconnecter."
      });
    }
    console.error("❌ Erreur authMiddleware:", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur d'authentification."
    });
  }
};

// ===============================================
// Middleware admin
// ===============================================
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Utilisateur non authentifié."
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Accès refusé. Droits administrateur requis."
    });
  }

  next();
};

// ===============================================
// Middleware optionnel (ne bloque pas si pas de token)
// ===============================================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user && user.isActive) {
          req.user = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          };
        }
      }
    }
  } catch {
    // Ne pas bloquer si token invalide en mode optionnel
  }

  next();
};

module.exports = {
  verifyToken,
  protect: verifyToken, // alias pour compatibilité
  isAdmin,
  optionalAuth
};
