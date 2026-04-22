import api from "./api";

export const getCaseworkers = (page = 1, limit = 10, search = "", status = "") =>
  api.get(`/api/caseworker`, { params: { page, limit, search, status } });

export const getDepartments = () => api.get(`/api/caseworker/departments`);

export const createDepartment = (data) => api.post(`/api/caseworker/departments/create`, data);

export const updateDepartment = (data) => api.put(`/api/caseworker/departments/update`, data);

export const deleteDepartment = (data) => api.post(`/api/caseworker/departments/delete`, data);

export const getCaseworkerById = (id) => api.get(`/api/caseworker/${id}`);

export const createCaseworker = (data) => api.post(`/api/caseworker/`, data);

export const updateCaseworker = (id, data) => api.put(`/api/caseworker/${id}`, data);

export const toggleCaseworkerStatus = (id) =>
  api.patch(`/api/caseworker/${id}/toggle-status`);

export const resetCaseworkerPassword = (id, data) =>
  api.patch(`/api/caseworker/${id}/reset-password`, data);

export const deleteCaseworker = (id) => api.delete(`/api/caseworker/${id}`);

export const exportCaseworkers = (params = {}) =>
  api.get(`/api/caseworker/export`, { params, responseType: 'blob' });

export const bulkImportCaseworkers = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/api/caseworker/bulk-import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
