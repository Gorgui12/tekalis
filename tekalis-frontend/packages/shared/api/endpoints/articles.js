import api from "../api";

// ── Articles publics ──────────────────────────────────────────────────────────

export const getArticles = (params = {}) =>
  api.get("/articles", { params });

export const getArticleById = (id) =>
  api.get(`/articles/${id}`);

export const getArticleBySlug = (slug) =>
  api.get(`/articles/slug/${slug}`);

export const getFeaturedArticles = (limit = 3) =>
  api.get("/articles/featured", { params: { limit } });

export const getRelatedArticles = (articleId, limit = 3) =>
  api.get(`/articles/${articleId}/related`, { params: { limit } });

export const incrementArticleViews = (id) =>
  api.post(`/articles/${id}/view`);

// ── Articles admin ────────────────────────────────────────────────────────────

export const adminGetArticles = (params = {}) =>
  api.get("/admin/articles", { params });

export const adminGetArticleById = (id) =>
  api.get(`/admin/articles/${id}`);

export const adminCreateArticle = (articleData) => {
  const isFormData = articleData instanceof FormData;
  return api.post("/admin/articles", articleData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

export const adminUpdateArticle = (id, articleData) => {
  const isFormData = articleData instanceof FormData;
  return api.put(`/admin/articles/${id}`, articleData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

export const adminDeleteArticle = (id) =>
  api.delete(`/admin/articles/${id}`);

export const adminTogglePublish = (id) =>
  api.patch(`/admin/articles/${id}/toggle-publish`);

export const adminGetArticleStats = () =>
  api.get("/admin/articles/stats");