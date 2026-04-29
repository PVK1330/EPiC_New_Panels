import api from "./api";

export const getSponsors = (page = 1, limit = 10, search = "", status = "") =>
  api.get(`/api/sponsors`, { params: { page, limit, search, status } });

export const getSponsorById = (id) => api.get(`/api/sponsors/${id}`);

export const createSponsor = (data) => api.post(`/api/sponsors/`, data);

export const updateSponsor = (id, data) => api.put(`/api/sponsors/${id}`, data);

export const toggleSponsorStatus = (id) =>
  api.patch(`/api/sponsors/${id}/toggle-status`);

export const resetSponsorPassword = (id, data) =>
  api.patch(`/api/sponsors/${id}/reset-password`, data);

export const deleteSponsor = (id) => api.delete(`/api/sponsors/${id}`);

export const exportSponsors = (params = {}) =>
  api.get(`/api/sponsors/export`, { params, responseType: 'blob' });

export const bulkImportSponsors = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/api/sponsors/bulk-import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
