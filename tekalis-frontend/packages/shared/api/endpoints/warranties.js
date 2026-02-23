import api from "../api";

// ── RMA (Retours/SAV) ─────────────────────────────────────────────────────────

export const getUserRMAs = (params = {}) =>
  api.get("/rma", { params });

export const getRMAById = (id) =>
  api.get(`/rma/${id}`);

export const createRMA = (rmaData) =>
  api.post("/rma", rmaData);

export const addRMAComment = (id, comment) =>
  api.post(`/rma/${id}/comments`, { comment });

export const cancelRMA = (id) =>
  api.delete(`/rma/${id}`);

// Admin RMA
export const adminGetRMAs = (params = {}) =>
  api.get("/admin/rma", { params });

export const adminGetRMAById = (id) =>
  api.get(`/admin/rma/${id}`);

export const adminUpdateRMAStatus = (id, status, note = "") =>
  api.patch(`/admin/rma/${id}/status`, { status, note });

export const adminGetRMAStats = () =>
  api.get("/admin/rma/stats");