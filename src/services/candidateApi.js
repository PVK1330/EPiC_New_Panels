import api from "./api";

export const getCandidates = (page = 1, limit = 10, search = "", status = "") =>
  api.get(`/api/candidate`, { params: { page, limit, search, status } });

export const getCandidateById = (id) => api.get(`/api/candidate/${id}`);

export const createCandidate = (data) => api.post(`/api/candidate/`, data);

export const updateCandidate = (id, data) => api.put(`/api/candidate/${id}`, data);

export const toggleCandidateStatus = (id) =>
  api.patch(`/api/candidate/${id}/toggle-status`);

export const resetCandidatePassword = (id, data) =>
  api.patch(`/api/candidate/${id}/reset-password`, data);

export const deleteCandidate = (id) => api.delete(`/api/candidate/${id}`);
