const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ===============================================
// Recalculer la note moyenne d'un produit
// ===============================================
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      "rating.average": Math.round(stats[0].averageRating * 10) / 10,
      "rating.count": stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      "rating.average": 0,
      "rating.count": 0
    });
  }
};

// ===============================================
// GET /api/v1/reviews/:productId
// ===============================================
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const filter = { product: req.params.productId, isApproved: true };
    if (rating) filter.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar")
        .sort({ "helpful.count": -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ]);

    // Statistiques de notation
    const ratingStats = await Review.aggregate([
      { $match: { product: require("mongoose").Types.ObjectId.createFromHexString(req.params.productId), isApproved: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach(s => { distribution[s._id] = s.count; });

    res.status(200).json({
      success: true,
      reviews,
      pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) },
      stats: { distribution }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// POST /api/v1/reviews
// ===============================================
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "productId, rating et comment sont requis" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour ce produit" });
    }

    // Vérifier si l'utilisateur a acheté le produit (avis vérifié)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "products.product": productId,
      status: "delivered"
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerified: !!hasPurchased
    });

    await updateProductRating(product._id);

    await review.populate("user", "name avatar");

    res.status(201).json({
      success: true,
      message: "Avis ajouté avec succès",
      review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour ce produit" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// PUT /api/v1/reviews/:id/helpful
// ===============================================
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    const userId = req.user._id;
    const hasVoted = review.helpful.users.some(
      id => id.toString() === userId.toString()
    );

    if (hasVoted) {
      review.helpful.users = review.helpful.users.filter(
        id => id.toString() !== userId.toString()
      );
      review.helpful.count = Math.max(0, review.helpful.count - 1);
    } else {
      review.helpful.users.push(userId);
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
};

// ===============================================
// DELETE /api/v1/reviews/:id — Auteur ou Admin
// ===============================================
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    // Seul l'auteur ou un admin peut supprimer
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.status(200).json({ success: true, message: "Avis supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// GET /api/v1/reviews — Admin: tous les avis
// ===============================================
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, isApproved } = req.query;
    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      reviews,
      pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// PATCH /api/v1/reviews/:id/approve — Admin
// ===============================================
exports.toggleApprove = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    review.isApproved = !review.isApproved;
    await review.save();
    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: `Avis ${review.isApproved ? "approuvé" : "désapprouvé"}`,
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
