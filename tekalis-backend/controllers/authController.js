const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailService = require("../services/emailService");
const emailCooldown = require("../services/emailCooldown");
const GoogleAuthService = require("../services/googleAuthService");

// Réponse unique de /forgot-password : elle ne doit jamais varier selon que
// l'adresse existe, est en cooldown, ou provoke une erreur SMTP.
const GENERIC_RESET_MESSAGE =
  "Si cet email existe, un lien de réinitialisation a été envoyé";

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
  authProviders: user.authProviders,
  emailVerified: !!user.emailVerified
});

// Réponse unique de /resend-verification : elle ne doit jamais révéler si
// l'adresse existe, comme pour /forgot-password.
const GENERIC_VERIFICATION_MESSAGE =
  "Si un compte non vérifié existe pour cette adresse, un email vient d'être envoyé";

// ── Vérification de l'adresse email ───────────────────────────────────────────
// Génère un jeton, n'en stocke que l'empreinte SHA-256 et renvoie le jeton en
// clair. Stocker le jeton en clair allowrait à quiconque ayant accès à la base
// (ou à un log) de vérifier une adresse au lieu du titulaire. Même schéma que
// la réinitialisation de mot de passe, appliqué au même endroit.
const issueVerificationToken = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.emailVerificationExpires = new Date(Date.now() + EmailService.EMAIL_VERIFICATION_TTL_MS);
  await user.save({ validateBeforeSave: false });
  return token;
};

// Nettoie le jeton après usage : un lien de vérification est à usage unique.
const clearVerificationToken = (user) => {
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
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
      authProviders: ["password"],
      // Compte créé mais non vérifié : aucune session n'est ouverte tant que
      // le lien n'a pas été cliqué.
      emailVerified: false
    });

    // Email de vérification AVANT toute ouverture de session : c'est la seule
    // preuve que l'adresse appartient au demandeur.
    const verificationToken = await issueVerificationToken(user);
    EmailService.sendEmailVerification(user, verificationToken)
      .catch(err => console.error("⚠️ Email de vérification non envoyé:", err.message));

    // Note : ni token JWT ni cookie ici, contrairement aux autres réponses
    // d'authentification de ce contrôleur. Le front doit d'abord afficher
    // « vérifiez votre boîte mail » au lieu de rediriger vers /dashboard.
    res.status(201).json({
      success: true,
      requiresEmailVerification: true,
      message: `Compte créé. Vérifiez votre boîte mail à ${cleanEmail} pour activer la connexion.`,
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

    // Mot de passe correct mais adresse non vérifiée : on refuse d'ouvrir une
    // session. Le mot de passe ayant été communiqué, révéler ici que le compte
    // existe n'apporte rien à l'attaquant ; on en profite pour proposer un
    // renvoi du lien.
    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Votre adresse email n'est pas vérifiée. Consultez votre boîte mail et cliquez sur le lien de confirmation pour vous connecter.",
        requiresEmailVerification: true
      });
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

      // Google a authentifié la boîte (profile.emailVerified a été exigé plus
      // haut) : il n'y a donc rien à redemander. Cette étape est aussi ce qui
      // débloque un compte mot de passe resté non vérifié, puisqu'il vient de
      // prouver la possession de la même adresse.
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        clearVerificationToken(user);
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
          avatar: profile.picture || null,
          // Google a déjà vérifié la boîte : le compte est utilisable
          // immédiatement, sans email de confirmation à renvoyer.
          emailVerified: true,
          emailVerifiedAt: new Date()
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
// ───────────────────────────────────────────────
// Trois protections, car cet endpoint envoie un email à une adresse fournie
// par l'appelant :
//   1. rate-limit par IP        → server.js (passwordResetLimiter)
//   2. cooldown par adresse    → services/emailCooldown.js
//   3. validation de l'email    → middlewares/validation.js
// Les trois sont nécessaires : le rate-limit seul peut être contourné par
// distribution d'IP, et le cooldown seul est trivial à contourner.
// ===============================================
exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase();

    // Refroidissement : on répond 200 sans rien envoyer. Le message reste
    // identique dans tous les cas pour ne pas révéler si l'email existe.
    if (emailCooldown.isBlocked(email)) {
      return res.status(200).json({
        success: true,
        message: GENERIC_RESET_MESSAGE
      });
    }

    const user = await User.findOne({ email });

    // Toujours répondre 200 pour ne pas révéler si l'email existe
    if (!user) {
      return res.status(200).json({
        success: true,
        message: GENERIC_RESET_MESSAGE
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + EmailService.RESET_TOKEN_TTL_MS;
    await user.save({ validateBeforeSave: false });

    // Envoyer l'email de réinitialisation (via le service consolidé).
    // markSent() seulement en cas de succès : sinon une panne SMTP ferait
    // perdre une demande légitime pendant une minute entière.
    const result = await EmailService.sendPasswordReset(user, resetToken);
    if (result.success) {
      emailCooldown.markSent(email);
    }

    res.status(200).json({
      success: true,
      message: GENERIC_RESET_MESSAGE
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
// POST /api/v1/auth/verify-email
// ───────────────────────────────────────────────
// Consomme le jeton émis à l'inscription.
//
// Le jeton est comparé via sa forme hachée : une collision sur SHA-256 est
// hors de portée, et le champ est `select: false` dans le modèle, il faut donc
// le demander explicitement.
//
// Consumé = invalidé. Un lien ne sert qu'une fois : s'il fuite après usage
// (historique de navigateur, proxy), il ne permet plus de revalider le compte.
// ===============================================
exports.verifyEmail = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    if (!token) {
      return res.status(400).json({ success: false, message: "Jeton manquant" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }
    }).select("+emailVerificationToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Ce lien est invalide ou a expiré. Demandez-en un nouveau.",
        invalidToken: true
      });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    clearVerificationToken(user);
    await user.save({ validateBeforeSave: false });

    // Bienvenue envoyée ici plutôt qu'à l'inscription : on ne veut pas
    // congratuler quelqu'un dont l'adresse n'est pas encore prouvée.
    EmailService.sendWelcomeEmail(user)
      .catch(err => console.error("⚠️ Email de bienvenue non envoyé:", err.message));

    res.status(200).json({
      success: true,
      message: "Adresse email vérifiée. Vous pouvez vous connecter.",
      user: publicUser(user)
    });
  } catch (error) {
    console.error("❌ Erreur verifyEmail:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================================
// POST /api/v1/auth/resend-verification
// ───────────────────────────────────────────────
// Renvoie le lien de vérification.
//
// Mêmes trois protections que /forgot-password, car l'endpoint envoie un email
// à une adresse fournie par l'appelant :
//   1. rate-limit par IP        → server.js (passwordResetLimiter)
//   2. cooldown par adresse    → services/emailCooldown.js
//   3. validation de l'email    → middlewares/validation.js
//
// La réponse est volontairement identique que le compte existe ou non, sinon
// cet endpoint devient un oracle d'existence d'adresse.
// ===============================================
exports.resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase();

    if (emailCooldown.isBlocked(email)) {
      return res.status(200).json({ success: true, message: GENERIC_VERIFICATION_MESSAGE });
    }

    const user = await User.findOne({ email });

    // Rien à faire si le compte n'existe pas, est déjà vérifié ou inactif.
    if (!user || user.emailVerified || !user.isActive) {
      return res.status(200).json({ success: true, message: GENERIC_VERIFICATION_MESSAGE });
    }

    const token = await issueVerificationToken(user);
    const result = await EmailService.sendEmailVerification(user, token);
    if (result.success || result.queued) {
      emailCooldown.markSent(email);
    }

    res.status(200).json({ success: true, message: GENERIC_VERIFICATION_MESSAGE });
  } catch (error) {
    console.error("❌ Erreur resendVerification:", error);
    res.status(500).json({ success: false, message: error.message });
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
