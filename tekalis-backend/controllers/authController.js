const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailService = require("../services/emailService");
const GoogleAuthService = require("../services/googleAuthService");

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
// Cookie httpOnly — ajouté le 2026-09-03
// En plus du token renvoyé dans le corps JSON (pour compatibilité avec
// le code client existant qui le stocke en localStorage), on dépose le
// même JWT dans un cookie httpOnly. C'est ce cookie que le middleware
// Next.js (tekalis-next/middleware.js) lit pour protéger réellement les
// routes /dashboard, /checkout, /wishlist côté serveur — un token en
// localStorage seul n'est pas lisible par un middleware Next.js.
// ===============================================
const COOKIE_NAME = "tekalis_token";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours, aligné sur JWT_EXPIRE par défaut

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/"
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
};

// ===============================================
// Helpers partagés
// ===============================================

// Domaines email jetables/bloqués (optionnel, via env BLOCKED_EMAIL_DOMAINS).
// Centralisé pour que l'inscription par mot de passe et l'inscription via
// Google appliquent exactement la même règle.
const isBlockedEmailDomain = (email) => {
  if (!process.env.BLOCKED_EMAIL_DOMAINS) return false;
  const domain = String(email).toLowerCase().split("@")[1];
  if (!domain) return false;
  const blocked = process.env.BLOCKED_EMAIL_DOMAINS.split(",").map(d => d.trim().toLowerCase());
  return blocked.includes(domain);
};

// Charge utile commune à register / login / googleLogin : le front et le
// middleware Next.js s'appuient tous les deux sur cette forme.
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  phone: user.phone,
  avatar: user.avatar,
  authProviders: user.authProviders
});

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
    if (isBlockedEmailDomain(cleanEmail)) {
      return res.status(400).json({ message: "Ce domaine email n'est pas accepté" });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      // Délai constant pour éviter le timing attack
      await new Promise(r => setTimeout(r, 200));
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      authProviders: ["password"]
    });

    const token = generateToken(user._id, user.isAdmin);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setAuthCookie(res, token);

    // Email de bienvenue (non bloquant)
    EmailService.sendWelcomeEmail(user)
      .catch(err => console.error("⚠️ Email de bienvenue non envoyé:", err.message));

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("❌ Erreur register:", error);
    if (error.code === 11000) {
      const dupField = error.keyPattern ? Object.keys(error.keyPattern)[0] : "email";
      if (dupField === "email") {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
      return res.status(500).json({ message: `Conflit de données sur le champ "${dupField}"` });
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
    if (error.code === 11000) {
      const dupField = error.keyPattern ? Object.keys(error.keyPattern)[0] : "email";
      if (dupField === "email") {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
      return res.status(500).json({ message: `Conflit de données sur le champ "${dupField}"` });
    }
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

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("❌ Erreur login:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/auth/google
// Connexion / inscription via Google Identity Services.
//
// Le client envoie l'ID token renvoyé par le popup Google. On en vérifie la
// signature (services/googleAuthService.js) AVANT de lire quoi que ce soit
// dedans : c'est ce qui empêche un attaquant de se créer un compte avec
// l'email de quelqu'un d'autre.
//
// Trois cas :
//   1. googleId inconnu          → création du compte
//   2. email déjà connu          → rattachement (l'email est vérifié par
//                                  Google, la personne en est donc la
//                                  titulaire légitime)
//   3. déjà connecté             → simple connexion
// ===============================================
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Jeton Google manquant" });
    }

    // 1) Vérifier cryptographiquement le jeton
    let profile;
    try {
      profile = await GoogleAuthService.verifyIdToken(idToken);
    } catch (err) {
      if (err.code === "GOOGLE_NOT_CONFIGURED") {
        console.error("❌ Google Login non configuré :", err.message);
        return res.status(503).json({
          message: "La connexion avec Google n'est pas encore disponible."
        });
      }
      console.warn("⚠️ Jeton Google rejeté:", err.message);
      return res.status(401).json({ message: err.message || "Connexion Google invalide" });
    }

    // 2) Sans email vérifié, on ne peut pas juger que c'est bien cette
    //    personne → refus (et non création de compte).
    if (!profile.emailVerified) {
      return res.status(400).json({
        message: "Votre adresse Google n'est pas vérifiée. Vérifiez-la avant de continuer."
      });
    }

    if (isBlockedEmailDomain(profile.email)) {
      return res.status(400).json({ message: "Ce domaine email n'est pas accepté" });
    }

    const existing = await User.findOne({
      $or: [{ googleId: profile.sub }, { email: profile.email }]
    });

    let user;
    let isNewAccount = false;
    let isLinked = false;

    if (existing) {
      user = existing;

      if (!user.isActive) {
        return res.status(403).json({ message: "Compte désactivé. Contactez le support." });
      }

      // Compte existant trouvé par email mais jamais connecté via Google :
      // on le rattache. Sûr, car Google a confirmé la possession de la
      // boîte et l'email est la clé unique du compte.
      if (!user.googleId) {
        user.googleId = profile.sub;
        isLinked = true;
        console.log(`🔗 Compte ${user.email} rattaché à Google (${profile.sub})`);
      }

      if (!user.authProviders.includes("google")) {
        user.authProviders.push("google");
      }

      // Enrichissement opportuniste, uniquement sur les champs vides.
      if (!user.avatar && profile.picture) user.avatar = profile.picture;
      if (profile.name && (!user.name || user.name.length < 2)) {
        user.name = profile.name.trim().slice(0, 50);
      }
    } else {
      isNewAccount = true;
      // Mot de passe aléatoire : le compte n'a pas de secret connu, donc
      // personne ne peut se connecter par mot de passe à sa place. Il reste
      // modifiable plus tard via « mot de passe oublié », qui exige de
      // prouver la possession de l'email.
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const name = (profile.name || profile.email.split("@")[0]).trim().slice(0, 50);

      try {
        user = await User.create({
          name,
          email: profile.email,
          password: randomPassword,
          googleId: profile.sub,
          authProviders: ["google"],
          avatar: profile.picture || null
        });
      } catch (createErr) {
        if (createErr.code === 11000) {
          // Course entre deux inscriptions simultanées avec le même Google
          // : on récupère le compte Rather que de renvoyer une erreur.
          user = await User.findOne({
            $or: [{ googleId: profile.sub }, { email: profile.email }]
          });
          if (!user) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
          }
          isNewAccount = false;
        } else {
          throw createErr;
        }
      }
    }

    // 3) Session
    const token = generateToken(user._id, user.isAdmin);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setAuthCookie(res, token);

    if (isNewAccount) {
      EmailService.sendWelcomeEmail(user)
        .catch(err => console.error("⚠️ Email de bienvenue non envoyé:", err.message));
    }

    const message = isNewAccount
      ? "Compte créé avec Google"
      : isLinked
        ? "Google rattaché à votre compte"
        : "Connexion réussie";

    res.status(isNewAccount ? 201 : 200).json({
      success: true,
      message,
      isNewAccount,
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("❌ Erreur googleLogin:", error);
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

    // Envoyer l'email de réinitialisation (via le service consolidé)
    await EmailService.sendPasswordReset(user, resetToken);

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
    setAuthCookie(res, newToken);

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

// ===============================================
// POST /api/v1/auth/logout
// Ajouté le 2026-09-03 avec le cookie httpOnly ci-dessus : le logout
// côté client (suppression du localStorage) ne suffit plus à lui seul
// à effacer la session, puisqu'un cookie httpOnly n'est pas accessible
// en JS. Cette route l'efface côté serveur.
// ===============================================
exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
};

module.exports = exports;
