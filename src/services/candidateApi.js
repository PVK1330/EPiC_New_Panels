import api from "./api";

export const getCandidates = (page = 1, limit = 10, search = "", status = "", visaType = "", paymentStatus = "") =>
  api.get(`/api/candidate`, { params: { page, limit, search, status, visaType, paymentStatus } });

export const getCandidateById = (id) => api.get(`/api/candidate/${id}`);

// Enhanced function to fetch candidate with full application data
export const getCandidateWithApplication = (id) => api.get(`/api/candidate/${id}`);

export const createCandidate = (data) => api.post(`/api/candidate/`, data);

export const updateCandidate = (id, data) => api.put(`/api/candidate/${id}`, data);

export const toggleCandidateStatus = (id) =>
  api.patch(`/api/candidate/${id}/toggle-status`);

export const resetCandidatePassword = (id, data) =>
  api.patch(`/api/candidate/${id}/reset-password`, data);

export const deleteCandidate = (id) => api.delete(`/api/candidate/${id}`);

export const bulkImportCandidates = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/api/candidate/bulk-import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const exportCandidates = (params = {}) =>
  api.get(`/api/candidate/export`, { params, responseType: 'blob' });

// ── Candidate-facing application routes (/api/candidate-application) ────────

/** Fetch the currently logged-in candidate's saved application */
export const getMyApplication = () =>
  api.get('/api/candidate-application');

/** Submit the completed application (creates or overwrites, status → submitted) */
export const submitApplication = (data) =>
  api.post('/api/candidate-application', data);

/** Save progress as a draft without changing submission status */
export const saveApplicationDraft = (data) =>
  api.put('/api/candidate-application', data);
