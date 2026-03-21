const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// GET /api/v1/reviews/:productId
router.get("/:productId", reviewController.getProductReviews);

// POST /api/v1/reviews
router.post("/", verifyToken, reviewController.createReview);

// PUT /api/v1/reviews/:id/helpful
router.put("/:id/helpful", verifyToken, reviewController.markHelpful);

// DELETE /api/v1/reviews/:id
router.delete("/:id", verifyToken, reviewController.deleteReview);

// ── Routes admin ──────────────────────────────────────────────────────────────

// GET /api/v1/reviews (tous)
router.get("/", verifyToken, isAdmin, reviewController.getAllReviews);

// PATCH /api/v1/reviews/:id/approve
router.patch("/:id/approve", verifyToken, isAdmin, reviewController.toggleApprove);

module.exports = router;
