import api from "./api";

export const getCaseworkers = (page = 1, limit = 10, search = "", status = "") =>
  api.get(`/api/caseworker`, { params: { page, limit, search, status } });

export const getCaseworkerById = (id) => api.get(`/api/caseworker/${id}`);

export const createCaseworker = (data) => api.post(`/api/caseworker/`, data);

export const updateCaseworker = (id, data) => api.put(`/api/caseworker/${id}`, data);

export const toggleCaseworkerStatus = (id) =>
  api.patch(`/api/caseworker/${id}/toggle-status`);

export const resetCaseworkerPassword = (id, data) =>
  api.patch(`/api/caseworker/${id}/reset-password`, data);

export const deleteCaseworker = (id) => api.delete(`/api/caseworker/${id}`);
