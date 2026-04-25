import api from "./api";

export const getCaseDetails = (id) => api.get(`/api/case-details/${id}`);

export const updateCaseStatus = (id, data) => api.patch(`/api/case-details/${id}/status`, data);

export const exportCaseCSV = (id) => api.get(`/api/case-details/${id}/export/csv`, { responseType: 'blob' });
export const exportCasePDF = (id) => api.get(`/api/case-details/${id}/export/pdf`, { responseType: 'blob' });
