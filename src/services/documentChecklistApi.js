import api from './api';

// Caseworker endpoints (read-only)
export const getCaseChecklist = (caseId) => api.get(`/api/caseworker/documents/checklist/case/${caseId}`);
export const getChecklistByVisaType = (visaTypeId) => api.get(`/api/caseworker/documents/checklist/visa/${visaTypeId}`);

// Admin endpoints (management)
export const getAllChecklists = (params = {}) => api.get('/api/admin/document-checklists', { params });
export const createChecklistItem = (data) => api.post('/api/admin/document-checklists', data);
export const updateChecklistItem = (id, data) => api.put(`/api/admin/document-checklists/${id}`, data);
export const deleteChecklistItem = (id) => api.delete(`/api/admin/document-checklists/${id}`);
