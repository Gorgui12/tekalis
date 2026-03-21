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

module.exports = {
  validate,
  authValidation,
  productValidation,
  orderValidation,
  reviewValidation,
  cartValidation
};
