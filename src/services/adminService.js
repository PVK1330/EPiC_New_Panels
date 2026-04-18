import api from "./api";

export const getAdmins = (page = 1, limit = 10, search = "", status = "") =>
  api.get(`/api/admin`, { params: { page, limit, search, status } });

export const getAdminById = (id) => api.get(`/api/admin/${id}`);

export const createAdmin = (data) => api.post(`/api/admin/`, data);

export const updateAdmin = (id, data) => api.put(`/api/admin/${id}`, data);

export const toggleAdminStatus = (id) =>
  api.patch(`/api/admin/toggle-status/${id}`);

export const resetAdminPassword = (id, data) =>
  api.patch(`/api/admin/reset-password/${id}`, data);

export const deleteAdmin = (id) => api.delete(`/api/admin/${id}`);
