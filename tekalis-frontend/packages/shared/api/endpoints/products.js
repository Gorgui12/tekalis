import api from "../api";

// ── Produits publics ──────────────────────────────────────────────────────────

export const getProducts = (params = {}) =>
  api.get("/products", { params });

export const getProductById = (id) =>
  api.get(`/products/${id}`);

export const searchProducts = (query, params = {}) =>
  api.get("/products/search", { params: { q: query, ...params } });

export const getProductsByCategory = (categorySlug, params = {}) =>
  api.get("/products", { params: { category: categorySlug, ...params } });

export const getRelatedProducts = (productId) =>
  api.get(`/products/${productId}/related`);

export const getFeaturedProducts = () =>
  api.get("/products/featured");

export const getNewArrivals = (limit = 8) =>
  api.get("/products/new-arrivals", { params: { limit } });

export const getBestSellers = (limit = 8) =>
  api.get("/products/best-sellers", { params: { limit } });

// ── Produits admin ────────────────────────────────────────────────────────────

export const adminGetProducts = (params = {}) =>
  api.get("/admin/products", { params });

export const adminGetProductById = (id) =>
  api.get(`/admin/products/${id}`);

export const adminCreateProduct = (productData) => {
  const isFormData = productData instanceof FormData;
  return api.post("/admin/products", productData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

export const adminUpdateProduct = (id, productData) => {
  const isFormData = productData instanceof FormData;
  return api.put(`/admin/products/${id}`, productData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
};

export const adminDeleteProduct = (id) =>
  api.delete(`/admin/products/${id}`);

export const adminUpdateStock = (id, stock) =>
  api.patch(`/admin/products/${id}/stock`, { stock });

export const adminToggleProductStatus = (id) =>
  api.patch(`/admin/products/${id}/toggle-status`);

export const adminGetLowStockProducts = (threshold = 5) =>
  api.get("/admin/products/low-stock", { params: { threshold } });

export const adminBulkDeleteProducts = (ids) =>
  api.delete("/admin/products/bulk", { data: { ids } });

export const adminExportProducts = () =>
  api.get("/admin/products/export", { responseType: "blob" });