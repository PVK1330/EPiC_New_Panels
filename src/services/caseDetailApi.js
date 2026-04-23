import api from "./api";

export const getCaseDetails = (id) => api.get(`/api/case-details/${id}`);

export const updateCaseStatus = (id, data) => api.patch(`/api/case-details/${id}/status`, data);
