const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// POST /api/v1/auth/register
router.post("/register", authController.register);

// POST /api/v1/auth/login
router.post("/login", authController.login);

// POST /api/v1/auth/admin/register — protégé: admin uniquement
router.post("/admin/register", verifyToken, isAdmin, authController.registerAdmin);

// GET /api/v1/auth/me — profil courant
router.get("/me", verifyToken, authController.getMe);

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// POST /api/v1/auth/reset-password/:token
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
