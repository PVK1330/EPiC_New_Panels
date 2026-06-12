import api from "./api";

/**
 * CoS request review API (admin + caseworker).
 * Backed by the dedicated cos_requests entity.
 *
 * CosRequest shape: { id, sponsorId, organisationId, visaType, requestedAmount,
 *   approvedAmount, reason, status, assignedCaseworkerIds, reviewNotes,
 *   reviewedBy, reviewedAt, created_at, updated_at, sponsor, reviewer }
 */

// ── Admin ────────────────────────────────────────────────────────────────────
export const getAdminCosRequests = (params = {}) =>
  api.get("/api/admin/licence/cos-requests", { params });

export const assignCosRequestCaseworker = (id, data) =>
  api.post(`/api/admin/licence/cos-requests/${id}/assign-caseworker`, data);

export const approveCosRequestAdmin = (id, data) =>
  api.patch(`/api/admin/licence/cos-requests/${id}/approve`, data);

export const rejectCosRequestAdmin = (id, data) =>
  api.patch(`/api/admin/licence/cos-requests/${id}/reject`, data);

// ── Caseworker ───────────────────────────────────────────────────────────────
export const getCaseworkerCosRequests = (params = {}) =>
  api.get("/api/caseworker/cos/assigned", { params });

export const approveCosRequestCaseworker = (id, data) =>
  api.patch(`/api/caseworker/cos/${id}/approve`, data);

export const rejectCosRequestCaseworker = (id, data) =>
  api.patch(`/api/caseworker/cos/${id}/reject`, data);

export const requestInfoCosRequestCaseworker = (id, data) =>
  api.patch(`/api/caseworker/cos/${id}/request-info`, data);

export const requestInfoCosRequestAdmin = (id, data) =>
  api.patch(`/api/admin/licence/cos-requests/${id}/request-info`, data);
