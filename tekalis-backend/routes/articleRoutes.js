// ===============================================
// routes/articleRoutes.js
// ✅ FIX : PUT /:id/publish déclaré AVANT PUT /:id
//    (sinon Express capture "publish" comme id)
// ===============================================
const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// ── Routes publiques ──────────────────────────────────────────────────────────

// GET /api/v1/articles
router.get("/", articleController.getAllArticles);

// GET /api/v1/articles/featured (AVANT /:slug)
router.get("/featured", articleController.getFeaturedArticles);

// GET /api/v1/articles/categories (AVANT /:slug)
router.get("/categories", articleController.getCategories);

// GET /api/v1/articles/:slug
router.get("/:slug", articleController.getArticleBySlug);

// ── Routes admin (protégées) ──────────────────────────────────────────────────

// POST /api/v1/articles
router.post("/", verifyToken, isAdmin, articleController.createArticle);

// ✅ PUT /:id/publish AVANT PUT /:id
// Sinon Express interprète "publish" comme un id et appelle updateArticle
router.put("/:id/publish", verifyToken, isAdmin, articleController.togglePublish);

// PUT /api/v1/articles/:id
router.put("/:id", verifyToken, isAdmin, articleController.updateArticle);

// DELETE /api/v1/articles/:id
router.delete("/:id", verifyToken, isAdmin, articleController.deleteArticle);

module.exports = router;