import api from "./api";

export const getCases = (page = 1, limit = 10, search = "", status = "", priority = "", visaType = "") =>
  api.get(`/api/cases`, { params: { page, limit, search, status, priority, visaType } });

// Fetch ALL cases for dropdowns (no pagination limit)
export const getAllCasesForDropdown = () =>
  api.get(`/api/cases`, { params: { page: 1, limit: 9999 } });

export const getCaseById = (id) => api.get(`/api/cases/${id}`);

export const createCase = (data) => api.post(`/api/cases`, data);

export const updateCase = (id, data) => api.put(`/api/cases/${id}`, data);

export const deleteCase = (id) => api.delete(`/api/cases/${id}`);

export const getPipelineCases = () => api.get(`/api/cases/pipeline`);

export const updatePipelineStage = (id, status) => api.patch(`/api/cases/${id}/stage`, { status });

export const assignCase = (id, data) => api.patch(`/api/cases/${id}/assign`, data);

export const getVisaTypes = () => api.get(`/api/settings/visa-types`);

export const getPetitionTypes = () => api.get(`/api/settings/petition-types`);

export const getCandidates = (params = {}) => api.get(`/api/candidate`, { params });

export const getSponsors = (params = {}) => api.get(`/api/sponsors`, { params });

export const getCaseworkers = (params = {}) => api.get(`/api/caseworker`, { params });

export const updateCaseStatus = (id, status) => api.put(`/api/cases/${id}`, { status });

export const exportCases = (params = {}) => api.get(`/api/cases/export`, { params, responseType: 'blob' });

export const getCaseworkerCases = (params = {}) => api.get(`/api/caseworker/cases`, { params });

export const getTeamCapacity = () => api.get(`/api/cases/capacity`);
