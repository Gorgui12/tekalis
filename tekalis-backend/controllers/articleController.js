// ===============================================
// 4. controllers/articleController.js
// ===============================================
const Article = require("../models/Article");
const Product = require("../models/Product");

// Récupérer tous les articles
exports.getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, featured, search } = req.query;
    
    const filter = { status: "published" };
    
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (featured === "true") filter.isFeatured = true;
    if (search) filter.$text = { $search: search };
    
    const skip = (page - 1) * limit;
    
    const articles = await Article.find(filter)
      .populate("author", "name avatar")
      .populate("relatedProducts", "name images price")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-content");
    
    const total = await Article.countDocuments(filter);
    
    res.status(200).json({
      success: true,
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
