const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Maison" },
  fullAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: String,
  country: { type: String, default: "Sénégal" },
  phone: String,
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom ne doit pas dépasser 50 caractères"]
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"]
    },
    password: {
      type: String,
      // Un compte créé via Google n'a jamais choisi de mot de passe : on
      // lui en generates un aléatoire (voir authController.googleLogin) et
      // on n'exige donc le champ que pour une inscription classique.
      // Le garde `isNew` évite qu'une modification de profil d'un compte
      // Google sans mot de passe ne fasse échouer la validation.
      required: [
        function () { return this.isNew && !this.googleId; },
        "Le mot de passe est requis"
      ],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
      select: false // Ne pas retourner le mot de passe par défaut
    },
    // ── Connexion via un fournisseur externe (Google) ──────────────────────
    // googleId = identifiant opaque "sub" de l'ID token Google. C'est la
    // clé de rattachement fiable : un email seul peut changer chez Google.
    // Pas de `default` : un compte sans Google doit voir le champ ABSENT
    // de son document, sinon l'index unique ci-dessous le ferait entrer en
    // conflit avec tous les autres comptes sans Google (voir sparse).
    googleId: {
      type: String
    },
    // Méthodes de connexion actives sur ce compte : "password" et/ou
    // "google". Permet d'afficher « connecté avec Google » côté profil.
    authProviders: {
      type: [String],
      enum: ["password", "google"],
      default: ["password"]
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: null
    },
    addresses: [addressSchema],
    isAdmin: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Réinitialisation mot de passe
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Date de dernière connexion
    lastLogin: Date
  },
  {
    timestamps: true
  }
);

// Hash le mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour retourner l'objet sans données sensibles
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

// Index pour les recherches
userSchema.index({ isAdmin: 1 });
userSchema.index({ createdAt: -1 });
// Un compte Google ne peut être rattaché qu'une seule fois.
// Index PARTIEL et non `sparse` : `sparse` ne saute que les documents où le
// champ est absent, pas ceux où il vaut null — avec un `default: null` tous
// les comptes par mot de passe se seraient entrechoqué sur { googleId: null }.
// Le filtre sur le type string rend la contrainte explicite et robuste.
userSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: "string" } } }
);

module.exports = mongoose.model("User", userSchema);
