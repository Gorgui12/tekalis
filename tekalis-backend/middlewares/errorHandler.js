// ===============================================
// 12. middleware/errorHandler.js
// ===============================================

// Classe d'erreur personnalisée
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  
  // Log de l'erreur
  console.error("❌ ERROR:", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  });
  
  // Erreurs de développement (détaillées)
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  
  // Erreurs de production (simplifiées)
  if (err.isOperational) {
    // Erreur opérationnelle (attendue)
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Erreurs spécifiques MongoDB
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Ressource introuvable"
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Ce ${field} existe déjà`
    });
  }
  
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Données invalides",
      errors
    });
  }
  
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token invalide"
    });
  }
  
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expiré"
    });
  }
  
  // Erreur inconnue
  res.status(500).json({
    success: false,
    message: "Une erreur est survenue"
  });
};

// Middleware pour gérer les routes non trouvées
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} introuvable`, 404);
  next(error);
};

// Wrapper async pour éviter try/catch
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};