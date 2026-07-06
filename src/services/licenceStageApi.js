import api from "./api";

/**
 * Sponsor Licence "stages" panel API — role-aware.
 *
 * The same logical endpoints live under each role's licence router:
 *   - admin:      /api/admin/licence/:id/stages
 *   - caseworker: /api/caseworker/licence/:id/stages
 *   - sponsor:    /api/business/licence/v2/applications/:id/stages
 *
 * Each returns { status, data: { applicationId, status, currentStageKey, stages } }
 * where every stage carries its per-role tasks (status + assignee).
 */
const stagesBase = (role, id) => {
  if (role === "admin") return `/api/admin/licence/${id}`;
  if (role === "caseworker") return `/api/caseworker/licence/${id}`;
  return `/api/business/licence/v2/applications/${id}`; // sponsor (owner)
};

export const getLicenceStages = (role, id) => api.get(`${stagesBase(role, id)}/stages`);

// Completion triggers server-side chain advancement + audit before responding,
// so give it more headroom than the global 10s axios timeout — a slow round-trip
// must not surface as a spurious "couldn't complete" while the task actually saved.
export const completeLicenceStageTask = (role, id, stageKey, taskRole) =>
  api.post(`${stagesBase(role, id)}/stages/${stageKey}/complete`, { role: taskRole }, { timeout: 30000 });

/**
 * Full cross-entity workflow timeline (licence + CoS + sponsored workers) for an
 * application. Returns { applicationId, timeline: [{ id, eventKey, event,
 * actorRole, actorName, timestamp, status, comment }] } — chronological order.
 */
export const getLicenceWorkflowTimeline = (role, id) =>
  api.get(`${stagesBase(role, id)}/workflow-timeline`);
