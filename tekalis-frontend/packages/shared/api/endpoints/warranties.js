// ✅ FIX : ce fichier était une copie de rma.js
// Voici les vrais endpoints pour les garanties
import api from "../api";

// ── Garanties utilisateur ─────────────────────────────────────────────────────

export const getUserWarranties = (params = {}) =>
  api.get("/warranties", { params });

export const getWarrantyById = (id) =>
  api.get(`/warranties/${id}`);

export const checkWarrantyBySerial = (serialNumber) =>
  api.post("/warranties/check", { serialNumber });

export const requestWarrantyExtension = (warrantyId, duration) =>
  api.post("/warranties/extend", { warrantyId, duration });

// ── Garanties admin ───────────────────────────────────────────────────────────

export const adminGetWarranties = (params = {}) =>
  api.get("/admin/warranties", { params });

export const adminGetWarrantyById = (id) =>
  api.get(`/admin/warranties/${id}`);

export const adminUpdateWarrantyStatus = (id, status, notes = "") =>
  api.patch(`/admin/warranties/${id}/status`, { status, notes });

export const adminGetWarrantyStats = () =>
  api.get("/admin/warranties/stats");