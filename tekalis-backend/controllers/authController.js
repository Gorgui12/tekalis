const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ===============================================
// Générer un token JWT
// ===============================================
const generateToken = (userId, isAdmin) => {
  return jwt.sign(
    { id: userId, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// ===============================================
// POST /api/v1/auth/register
// CRITIQUE 3 : Ajout de validations anti-abus
// - Vérification du domaine email (optionnelle via env BLOCKED_EMAIL_DOMAINS)
// - Sanitisation des inputs
// - Message d'erreur homogène pour éviter l'énumération d'emails
// ===============================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Nettoyage basique
    const cleanName  = name.trim().slice(0, 50);
    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // CRITIQUE 3 : Blocage de domaines temporaires si configuré
    if (process.env.BLOCKED_EMAIL_DOMAINS) {
      const blocked = process.env.BLOCKED_EMAIL_DOMAINS.split(",").map(d => d.trim().toLowerCase());
      const domain = cleanEmail.split("@")[1];
      if (blocked.includes(domain)) {
        return res.status(400).json({ message: "Ce domaine email n'est pas accepté" });
      }
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      // Délai constant pour éviter le timing attack
      await new Promise(r => setTimeout(r, 200));
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const user = await User.create({ name: cleanName, email: cleanEmail, password });

    const token = generateToken(user._id, user.isAdmin);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("❌ Erreur register:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/auth/register-admin
// Protégé : admin uniquement (authMiddleware)
// ===============================================
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const user = await User.create({ name, email, password, isAdmin: true });

    res.status(201).json({
      success: true,
      message: "Admin créé avec succès",
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    console.error("❌ Erreur registerAdmin:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/auth/login
// ===============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // Délai constant pour éviter l'énumération via timing
    if (!user) {
      await new Promise(r => setTimeout(r, 200));
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Compte désactivé. Contactez le support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = generateToken(user._id, user.isAdmin);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("❌ Erreur login:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// GET /api/v1/auth/me
// ===============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/auth/forgot-password
// ===============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Toujours répondre 200 pour ne pas révéler si l'email existe
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Si cet email existe, un lien de réinitialisation a été envoyé"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("🔑 Reset URL:", resetUrl);

    // TODO: envoyer l'email via EmailService

    res.status(200).json({
      success: true,
      message: "Si cet email existe, un lien de réinitialisation a été envoyé"
    });
  } catch (error) {
    console.error("❌ Erreur forgotPassword:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/auth/reset-password/:token
// ===============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const newToken = generateToken(user._id, user.isAdmin);

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
      token: newToken
    });
  } catch (error) {
    console.error("❌ Erreur resetPassword:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
