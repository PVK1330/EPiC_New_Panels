import api from "./api";

export const getCandidates = (page = 1, limit = 10, search = "", status = "", visaType = "", paymentStatus = "") =>
  api.get(`/api/admin/candidates`, { params: { page, limit, search, status, visaType, paymentStatus } });

export const getCandidateById = (id) => api.get(`/api/admin/candidates/${id}`);

// Enhanced function to fetch candidate with full application data
export const getCandidateWithApplication = (id) => api.get(`/api/admin/candidates/${id}`);

export const createCandidate = (data) => api.post(`/api/admin/candidates/`, data);

export const updateCandidate = (id, data) => api.put(`/api/admin/candidates/${id}`, data);

export const toggleCandidateStatus = (id) =>
  api.patch(`/api/admin/candidates/${id}/toggle-status`);

export const resetCandidatePassword = (id, data) =>
  api.patch(`/api/admin/candidates/${id}/reset-password`, data);

export const deleteCandidate = (id) => api.delete(`/api/admin/candidates/${id}`);

export const bulkImportCandidates = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/api/admin/candidates/bulk-import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const exportCandidates = (params = {}) =>
  api.get(`/api/admin/candidates/export`, { params, responseType: 'blob' });

// ── Candidate-facing application routes (/api/candidate/application) ────────

/** Fetch the currently logged-in candidate's saved application */
export const getMyApplication = () =>
  api.get('/api/candidate/application');

/** Submit the completed application (creates or overwrites, status → submitted) */
export const submitApplication = (data) =>
  api.post('/api/candidate/application', data);

/** Save progress as a draft without changing submission status */
export const saveApplicationDraft = (data) =>
  api.put('/api/candidate/application', data);

/** Unlock a submitted application (admin / caseworker only) */
export const unlockApplication = (candidateId) =>
  api.patch(`/api/candidate-application/${candidateId}/unlock`);
