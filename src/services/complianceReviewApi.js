import api from "./api";

/**
 * Unified Compliance Review API across the four modules.
 *
 * Three entities (right-to-work, worker-events, change-requests) share the
 * generic /api/compliance-review/:entityType engine (status = `reviewStatus`,
 * title-case). Compliance Documents use the separate /api/compliance-documents
 * engine (status = `status`, lowercase). This module normalizes both so the UI
 * is uniform.
 */

const STATUS_MAP = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  information_requested: "Information Requested",
};

/** Normalize a status from either engine to a display label. */
export const normalizeStatus = (s) => (!s ? "—" : STATUS_MAP[s] || s);

export const ENTITY_CONFIG = {
  "right-to-work": {
    label: "Right to Work",
    reviewerBase: "/api/compliance-review/right-to-work",
    isDocument: false,
    statusField: "reviewStatus",
    sponsorList: "/api/business/right-to-work",
    title: (r) => `RTW Check #${r.id}`,
    subtitle: (r) => {
      const worker = r.worker;
      const name = worker ? `${worker.first_name} ${worker.last_name}`.trim() : null;
      const ref = r.referenceNumber || "—";
      return name ? `${name} · Ref: ${ref}` : `Ref: ${ref}`;
    },
  },
  "worker-events": {
    label: "Worker Events",
    reviewerBase: "/api/compliance-review/worker-events",
    isDocument: false,
    statusField: "reviewStatus",
    sponsorList: "/api/business/worker-events",
    title: (r) => r.eventType || "Worker Event",
    subtitle: (r) => r.description || `Event #${r.id}`,
  },
  "change-requests": {
    label: "Change Requests",
    reviewerBase: "/api/compliance-review/change-requests",
    isDocument: false,
    statusField: "reviewStatus",
    sponsorList: "/api/business/change-requests",
    title: (r) => (r.changeType || "Change Request").replace(/_/g, " "),
    subtitle: (r) => r.description || `Request #${r.id}`,
  },
  "compliance-documents": {
    label: "Compliance Documents",
    reviewerBase: "/api/compliance-documents",
    isDocument: true,
    statusField: "status",
    sponsorList: "/api/business/compliance-documents",
    title: (r) => r.documentType || "Document",
    subtitle: (r) => `Document #${r.id}`,
  },
};

export const REVIEWER_ENTITIES = Object.keys(ENTITY_CONFIG);
export const SPONSOR_ENTITIES = REVIEWER_ENTITIES.filter((k) => ENTITY_CONFIG[k].sponsorList);

/** Read the normalized status off a record for a given entity type. */
export const recordStatus = (entityType, record) =>
  normalizeStatus(record?.[ENTITY_CONFIG[entityType].statusField]);

// ── Reviewer (admin / caseworker) ─────────────────────────────────────────────

export const listReview = (entityType, params = {}) =>
  api.get(ENTITY_CONFIG[entityType].reviewerBase, { params });

/** Returns a normalized { record, history } for either engine. */
export const getReviewDetail = async (entityType, id) => {
  const cfg = ENTITY_CONFIG[entityType];
  const res = await api.get(`${cfg.reviewerBase}/${id}`);
  const data = res?.data?.data;
  if (cfg.isDocument) return { record: data, history: data?.auditTrail || [] };
  return { record: data?.record, history: data?.history || [] };
};

/** action: 'review' | 'approve' | 'reject' | 'request-info' */
export const reviewAction = (entityType, id, action, body = {}) =>
  api.patch(`${ENTITY_CONFIG[entityType].reviewerBase}/${id}/${action}`, body);

// ── Sponsor ───────────────────────────────────────────────────────────────────

export const getSponsorItems = (entityType) =>
  api.get(ENTITY_CONFIG[entityType].sponsorList);

/**
 * Sponsor responds to a review (optionally attaching evidence). Generic entities
 * use the dedicated /respond endpoint; compliance documents re-submit via the
 * document update endpoint (file field name differs).
 */
export const sponsorRespond = (entityType, id, { notes, evidence } = {}) => {
  const cfg = ENTITY_CONFIG[entityType];
  const fd = new FormData();
  if (notes) fd.append("notes", notes);
  const headers = { "Content-Type": "multipart/form-data" };

  if (cfg.isDocument) {
    if (evidence) fd.append("file", evidence);
    return api.put(`/api/business/compliance-documents/${id}`, fd, { headers });
  }
  if (evidence) fd.append("evidence", evidence);
  return api.post(`/api/business/compliance-review/${entityType}/${id}/respond`, fd, { headers });
};
