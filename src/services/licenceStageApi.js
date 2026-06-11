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

export const completeLicenceStageTask = (role, id, stageKey, taskRole) =>
  api.post(`${stagesBase(role, id)}/stages/${stageKey}/complete`, { role: taskRole });
