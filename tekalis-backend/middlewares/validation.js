const { body, param, query, validationResult } = require("express-validator");

// ===============================================
// Middleware pour vérifier les erreurs de validation
// ===============================================
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Données invalides",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ===============================================
// Validations pour l'authentification
// ===============================================
const authValidation = {
  register: [
    body("name")
      .trim()
      .notEmpty().withMessage("Le nom est requis")
      .isLength({ min: 2 }).withMessage("Le nom doit faire au moins 2 caractères"),
    body("email")
      .trim()
      .notEmpty().withMessage("L'email est requis")
      .isEmail().withMessage("Email invalide")
      .normalizeEmail(),
    body("password")
      .notEmpty().withMessage("Le mot de passe est requis")
      .isLength({ min: 6 }).withMessage("Le mot de passe doit faire au moins 6 caractères"),
    validate
  ],
  login: [
    body("email")
      .trim()
      .notEmpty().withMessage("L'email est requis")
      .isEmail().withMessage("Email invalide"),
    body("password")
      .notEmpty().withMessage("Le mot de passe est requis"),
    validate
  ],
  forgotPassword: [
    body("email")
      .trim()
      .notEmpty().withMessage("L'email est requis")
      .isEmail().withMessage("Email invalide")
      .normalizeEmail(),
    validate
  ],
  // Jeton de vérification d'email : hex de 64 caractères
  // (crypto.randomBytes(32)). Même bornage que pour le reset de mot de passe.
  verifyEmail: [
    body("token")
      .notEmpty().withMessage("Le jeton est requis")
      .isLength({ min: 32, max: 128 }).withMessage("Jeton invalide"),
    validate
  ],
  resetPassword: [
    // Le jeton est un hex de 64 caractères (crypto.randomBytes(32)).
    // On borne la longueur pour ne pas interroger la base avec n'importe
    // quoi, tout en gardant la porte ouverte si la taille change un jour.
    param("token")
      .isLength({ min: 32, max: 128 }).withMessage("Jeton invalide"),
    body("password")
      .notEmpty().withMessage("Le mot de passe est requis")
      .isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    validate
  ],
  googleLogin: [
    // Validateur unique volontairement : sur un champ opaque, une seule
    // erreur claire vaut mieux que trois messages qui se répètent. (.bail()
    // ne court-circuite qu'entre chaînes, pas au sein d'une même chaîne.)
    body("idToken").custom((value) => {
      if (typeof value !== "string") {
        throw new Error("Jeton Google manquant ou invalide");
      }
      if (value.length < 20 || value.length > 4096) {
        throw new Error("Jeton Google manquant ou invalide");
      }
      return true;
    }),
    validate
  ]
};

// ===============================================
// Validations pour les produits
// ===============================================
const productValidation = {
  create: [
    body("name").trim().notEmpty().withMessage("Le nom est requis"),
    body("price").isFloat({ min: 0 }).withMessage("Prix invalide"),
    body("stock").isInt({ min: 0 }).withMessage("Stock invalide"),
    body("category").notEmpty().withMessage("La catégorie est requise"),
    validate
  ],
  update: [
    param("id").isMongoId().withMessage("ID invalide"),
    validate
  ]
};

// ===============================================
// Validations pour les commandes
// ===============================================
const orderValidation = {
  create: [
    body("products")
      .isArray({ min: 1 }).withMessage("Au moins un produit est requis"),
    body("products.*.product")
      .isMongoId().withMessage("ID produit invalide"),
    body("products.*.quantity")
      .isInt({ min: 1 }).withMessage("Quantité invalide"),
    body("deliveryName")
      .trim().notEmpty().withMessage("Nom de livraison requis"),
    body("deliveryPhone")
      .trim().notEmpty().withMessage("Téléphone requis"),
    body("deliveryAddress")
      .trim().notEmpty().withMessage("Adresse de livraison requise"),
    body("paymentMethod")
      .isIn(["cash", "wave", "om", "free", "online", "card"]).withMessage("Mode de paiement invalide"),
    validate
  ]
};

// ===============================================
// Validations pour les avis
// ===============================================
const reviewValidation = {
  create: [
    body("productId").isMongoId().withMessage("ID produit invalide"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Note entre 1 et 5 requise"),
    body("title").optional().trim().isLength({ max: 100 }).withMessage("Titre trop long"),
    body("comment")
      .trim().notEmpty().withMessage("Commentaire requis")
      .isLength({ max: 1000 }).withMessage("Commentaire trop long"),
    validate
  ]
};

// ===============================================
// Validations pour le panier
// ===============================================
const cartValidation = {
  addItem: [
    body("productId").isMongoId().withMessage("ID produit invalide"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantité invalide"),
    validate
  ],
  updateItem: [
    param("productId").isMongoId().withMessage("ID produit invalide"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantité invalide"),
    validate
  ]
};

// ===============================================
// Validations pour la newsletter
// ===============================================
const newsletterValidation = {
  subscribe: [
    body("email")
      .trim()
      .notEmpty().withMessage("L'email est requis")
      .isEmail().withMessage("Email invalide")
      .normalizeEmail(),
    body("source")
      .optional()
      .isIn(["footer", "blog", "cta", "api"]).withMessage("Source invalide"),
    validate
  ]
};

module.exports = {
  validate,
  authValidation,
  productValidation,
  orderValidation,
  reviewValidation,
  cartValidation,
  newsletterValidation
};
