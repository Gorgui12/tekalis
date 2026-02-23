import api from "../api";

// ── Commandes utilisateur ─────────────────────────────────────────────────────

export const createOrder = (orderData) =>
  api.post("/orders", orderData);

export const getUserOrders = (params = {}) =>
  api.get("/orders/my-orders", { params });

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);

export const trackOrder = (id) =>
  api.get(`/orders/${id}/tracking`);

// ── Commandes admin ───────────────────────────────────────────────────────────

export const adminGetOrders = (params = {}) =>
  api.get("/admin/orders", { params });

export const adminGetOrderById = (id) =>
  api.get(`/admin/orders/${id}`);

export const adminUpdateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });

export const adminAddOrderNote = (id, note) =>
  api.post(`/admin/orders/${id}/notes`, { note });

export const adminGetOrderStats = (params = {}) =>
  api.get("/admin/orders/stats", { params });

export const adminExportOrders = (params = {}) =>
  api.get("/admin/orders/export", { params, responseType: "blob" });

export const adminBulkUpdateStatus = (ids, status) =>
  api.patch("/admin/orders/bulk-status", { ids, status });

export const adminGetRevenueByPeriod = (period = "monthly") =>
  api.get("/admin/orders/revenue", { params: { period } });