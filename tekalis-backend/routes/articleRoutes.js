// ===============================================
// ROUTES - routes/articleRoutes.js
// ===============================================
const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Routes publiques
// GET /api/v1/articles - Liste des articles
router.get("/", articleController.getAllArticles);

// GET /api/v1/articles/featured - Articles mis en avant
router.get("/featured", articleController.getFeaturedArticles);

// GET /api/v1/articles/categories - Catégories d'articles
router.get("/categories", articleController.getCategories);

// GET /api/v1/articles/:slug - Détails d'un article
router.get("/:slug", articleController.getArticleBySlug);

// Routes admin (protégées)
// POST /api/v1/admin/articles - Créer un article
router.post("/", verifyToken, isAdmin, articleController.createArticle);

// PUT /api/v1/admin/articles/:id - Modifier un article
router.put("/:id", verifyToken, isAdmin, articleController.updateArticle);

// DELETE /api/v1/admin/articles/:id - Supprimer un article
router.delete("/:id", verifyToken, isAdmin, articleController.deleteArticle);

// PUT /api/v1/admin/articles/:id/publish - Publier/Dépublier
router.put("/:id/publish", verifyToken, isAdmin, articleController.togglePublish);

module.exports = router;