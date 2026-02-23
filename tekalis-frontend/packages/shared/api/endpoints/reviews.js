import api from "../api";

export const getProductReviews = (productId, params = {}) =>
  api.get(`/reviews/product/${productId}`, { params });

export const addReview = (reviewData) =>
  api.post("/reviews", reviewData);

export const updateReview = (id, reviewData) =>
  api.put(`/reviews/${id}`, reviewData);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`);

export const likeReview = (id) =>
  api.post(`/reviews/${id}/like`);

// Admin
export const adminGetReviews = (params = {}) =>
  api.get("/admin/reviews", { params });

export const adminDeleteReview = (id) =>
  api.delete(`/admin/reviews/${id}`);

export const adminApproveReview = (id) =>
  api.patch(`/admin/reviews/${id}/approve`);

export const adminGetReviewStats = () =>
  api.get("/admin/reviews/stats");