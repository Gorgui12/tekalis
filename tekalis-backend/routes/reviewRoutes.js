// ===============================================
// 14. ROUTES - routes/reviewRoutes.js
// ===============================================
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const { verifyToken } = require("../middlewares/authMiddleware");

// GET /api/v1/reviews/:productId - Récupérer les avis d'un produit
router.get("/:productId", async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    
    const filter = { product: req.params.productId, isApproved: true };
    if (rating) filter.rating = Number(rating);
    
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find(filter)
      .populate("user", "name avatar")
      .sort({ "helpful.count": -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Review.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/reviews - Créer un avis
router.post("/", verifyToken, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    
    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    
    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: "Vous avez déjà laissé un avis pour ce produit" 
      });
    }
    
    // Créer l'avis
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment
    });
    
    // Mettre à jour la note moyenne du produit
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    product.rating = {
      average: Math.round(avgRating * 10) / 10,
      count: allReviews.length
    };
    await product.save();
    
    res.status(201).json({
      success: true,
      message: "Avis ajouté avec succès",
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/v1/reviews/:id/helpful - Marquer un avis comme utile
router.put("/:id/helpful", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }
    
    const hasVoted = review.helpful.users.includes(req.user._id);
    
    if (hasVoted) {
      // Retirer le vote
      review.helpful.users = review.helpful.users.filter(
        id => id.toString() !== req.user._id.toString()
      );
      review.helpful.count -= 1;
    } else {
      // Ajouter le vote
      review.helpful.users.push(req.user._id);
      review.helpful.count += 1;
    }
    
    await review.save();
    
    res.status(200).json({
      success: true,
      message: hasVoted ? "Vote retiré" : "Avis marqué comme utile",
      helpfulCount: review.helpful.count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

