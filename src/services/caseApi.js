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

export const getVisaTypes = () => api.get(`/api/settings/visa-types/dropdown`);

export const getPetitionTypes = () => api.get(`/api/settings/petition-types/dropdown`);

export const getAllUsers = (params = {}) => api.get(`/api/user/all`, { params });

export const getCandidates = (params = {}) => getAllUsers(params);

export const getSponsors = (params = {}) => getAllUsers(params);

export const getCaseworkers = (params = {}) => getAllUsers(params);

export const updateCaseStatus = (id, status) => api.put(`/api/cases/${id}`, { status });

export const exportCases = (params = {}) => api.get(`/api/caseworker/cases/export`, { params, responseType: 'blob' });

export const getCaseworkerCases = (params = {}) => api.get(`/api/caseworker/cases`, { params });

export const getCaseworkerPipelineCases = () => api.get(`/api/caseworker/cases/pipeline`);

export const getTeamCapacity = () => api.get(`/api/cases/capacity`);

// Caseworker-specific case operations
export const createCaseworkerCase = (data) => api.post(`/api/caseworker/cases`, data);

export const updateCaseworkerCase = (id, data) => api.put(`/api/caseworker/cases/${id}`, data);

export const deleteCaseworkerCase = (id) => api.delete(`/api/caseworker/cases/${id}`);

export const updateCaseworkerCaseStatus = (id, data) => api.patch(`/api/caseworker/cases/${id}/status`, data);

export const getDepartments = () => api.get(`/api/caseworker/departments/dropdown`);

export const getCaseworkerCaseDetails = (id) => api.get(`/api/caseworker/cases/${id}/details`);

// Document APIs
export const getCaseDocuments = (caseId, params = {}) => api.get(`/api/caseworker/documents/case/${caseId}`, { params });

export const uploadDocument = (formData) => api.post('/api/caseworker/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateDocument = (documentId, data) => api.put(`/api/caseworker/documents/${documentId}`, data);

export const deleteDocument = (documentId) => api.delete(`/api/caseworker/documents/${documentId}`);

export const updateDocumentStatus = (documentId, data) => api.patch(`/api/caseworker/documents/status/${documentId}`, data);

export const downloadDocument = (documentId) => api.get(`/api/caseworker/documents/download/${documentId}`, { responseType: 'blob' });

// Note APIs
export const getCaseNotes = (params) => api.get('/api/caseworker/case-notes', { params });

export const createCaseNote = (data) => api.post('/api/caseworker/case-notes', data);

export const updateCaseNote = (id, data) => api.put(`/api/caseworker/case-notes/${id}`, data);

export const deleteCaseNote = (id) => api.delete(`/api/caseworker/case-notes/${id}`);

// Task APIs
export const getTasks = (params) => api.get('/api/tasks', { params });

export const getTaskByCaseId = (caseId) => api.get(`/api/tasks/case/${caseId}`);

export const createTask = (data) => api.post('/api/tasks', data);

export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);

export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
