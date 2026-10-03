const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const { authValidation } = require("../middlewares/validation");

// POST /api/v1/auth/register
router.post("/register", authValidation.register, authController.register);

// POST /api/v1/auth/login
router.post("/login", authValidation.login, authController.login);

// POST /api/v1/auth/google — connexion / inscription via Google
router.post("/google", authValidation.googleLogin, authController.googleLogin);

// POST /api/v1/auth/admin/register — protégé: admin uniquement
router.post("/admin/register", verifyToken, isAdmin, authController.registerAdmin);

// GET /api/v1/auth/me — profil courant
router.get("/me", verifyToken, authController.getMe);

// POST /api/v1/auth/forgot-password
// Le rate-limit est monté dans server.js sur cette route précise.
router.post(
  "/forgot-password",
  authValidation.forgotPassword,
  authController.forgotPassword
);

// POST /api/v1/auth/reset-password/:token
router.post(
  "/reset-password/:token",
  authValidation.resetPassword,
  authController.resetPassword
);

// POST /api/v1/auth/verify-email
// Consomme le jeton du lien reçu par email (page front /verify-email).
router.post(
  "/verify-email",
  authValidation.verifyEmail,
  authController.verifyEmail
);

// POST /api/v1/auth/resend-verification
// Le rate-limit est monté dans server.js sur cette route précise.
router.post(
  "/resend-verification",
  authValidation.forgotPassword,
  authController.resendVerification
);

// POST /api/v1/auth/logout — efface le cookie httpOnly côté serveur
router.post("/logout", authController.logout);

module.exports = router;
