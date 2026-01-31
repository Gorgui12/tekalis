// ===============================================
// 13. middleware/validation.js
// ===============================================
const { body, param, query, validationResult } = require("express-validator");

// Middleware pour vérifier les erreurs de validation
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

// Validations pour l'authentification
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

// Validations pour les produits
const productValidation = {
  create: [
    body("name")
      .trim()
      .notEmpty().withMessage("Le nom est requis"),
    
    body("price")
      .isFloat({ min: 0 }).withMessage("Prix invalide"),
    
    body("stock")
      .isInt({ min: 0 }).withMessage("Stock invalide"),
    
    body("category")
      .notEmpty().withMessage("La catégorie est requise"),
    
    validate
  ],
  
  update: [
    param("id")
      .isMongoId().withMessage("ID invalide"),
    
    validate
  ]
};

// Validations pour les commandes
const orderValidation = {
  create: [
    body("products")
      .isArray({ min: 1 }).withMessage("Au moins un produit est requis"),
    
    body("products.*.product")
      .isMongoId().withMessage("ID produit invalide"),
    
    body("products.*.quantity")
      .isInt({ min: 1 }).withMessage("Quantité invalide"),
    
    body("deliveryName")
      .trim()
      .notEmpty().withMessage("Nom de livraison requis"),
    
    body("deliveryPhone")
      .trim()
      .notEmpty().withMessage("Téléphone requis")
      .matches(/^(\+221|0)?[0-9]{9}$/).withMessage("Numéro sénégalais invalide"),
    
    body("deliveryAddress")
      .trim()
      .notEmpty().withMessage("Adresse de livraison requise"),
    
    body("paymentMethod")
      .isIn(["cash", "wave", "om", "free"]).withMessage("Mode de paiement invalide"),
    
    validate
  ]
};

// Validations pour les avis
const reviewValidation = {
  create: [
    body("productId")
      .isMongoId().withMessage("ID produit invalide"),
    
    body("rating")
      .isInt({ min: 1, max: 5 }).withMessage("Note entre 1 et 5 requise"),
    
    body("title")
      .trim()
      .notEmpty().withMessage("Titre requis")
      .isLength({ max: 100 }).withMessage("Titre trop long"),
    
    body("comment")
      .trim()
      .notEmpty().withMessage("Commentaire requis")
      .isLength({ max: 1000 }).withMessage("Commentaire trop long"),
    
    validate
  ]
};

// Validations pour le panier
const cartValidation = {
  addItem: [
    body("productId")
      .isMongoId().withMessage("ID produit invalide"),
    
    body("quantity")
      .optional()
      .isInt({ min: 1 }).withMessage("Quantité invalide"),
    
    validate
  ],
  
  updateItem: [
    param("productId")
      .isMongoId().withMessage("ID produit invalide"),
    
    body("quantity")
      .isInt({ min: 1 }).withMessage("Quantité invalide"),
    
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
};: true,
      articles,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un article par slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug,
      status: "published"
    })
      .populate("author", "name avatar")
      .populate("relatedProducts", "name images price rating");
    
    if (!article) {
      return res.status(404).json({ message: "Article introuvable" });
    }
    
    article.viewCount += 1;
    await article.save();
    
    // Articles similaires
    const relatedArticles = await Article.find({
      category: article.category,
      _id: { $ne: article._id },
      status: "published"
    })
      .limit(3)
      .select("title slug coverImage excerpt category");
    
    res.status(200).json({ 
      success: true, 
      article,
      relatedArticles 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un article (Admin)
exports.createArticle = async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      author: req.user._id
    };
    
    // Calculer le temps de lecture (250 mots/minute)
    if (articleData.content) {
      const wordCount = articleData.content.split(/\s+/).length;
      articleData.readTime = Math.ceil(wordCount / 250);
    }
    
    const article = await Article.create(articleData);
    
    res.status(201).json({
      success: true,
      message: "Article créé avec succès",
      article
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Modifier un article (Admin)
exports.updateArticle = async (req, res) => {
  try {
    // Recalculer le temps de lecture si le contenu change
    if (req.body.content) {
      const wordCount = req.body.content.split(/\s+/).length;
      req.body.readTime = Math.ceil(wordCount / 250);
    }
    
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ message: "Article introuvable" });
    }
    
    res.status(200).json({
      success: true,
      message: "Article mis à jour",
      article
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un article (Admin)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: "Article introuvable" });
    }
    
    res.status(200).json({
      success: true,
      message: "Article supprimé"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publier/Dépublier un article (Admin)
exports.togglePublish = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: "Article introuvable" });
    }
    
    if (article.status === "published") {
      article.status = "draft";
      article.publishedAt = null;
    } else {
      article.status = "published";
      article.publishedAt = new Date();
    }
    
    await article.save();
    
    res.status(200).json({
      success: true,
      message: `Article ${article.status === "published" ? "publié" : "dépublié"}`,
      article
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les articles mis en avant
exports.getFeaturedArticles = async (req, res) => {
  try {
    const articles = await Article.find({ 
      isFeatured: true,
      status: "published"
    })
      .populate("author", "name avatar")
      .sort({ publishedAt: -1 })
      .limit(5)
      .select("-content");
    
    res.status(200).json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les catégories d'articles
exports.getCategories = async (req, res) => {
  try {
    const categories = await Article.distinct("category");
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;