import api from "./api";

// ── Case Detail ──────────────────────────────────────────────────────────────
// GET /api/case-details/:id  — full aggregate for one case
export const getCaseDetails = (id) => api.get(`/api/case-details/${id}`);

// PATCH /api/case-details/:id/status
export const updateCaseStatus = (id, data) =>
  api.patch(`/api/case-details/${id}/status`, data);

// Export
export const exportCaseCSV = (id) =>
  api.get(`/api/case-details/${id}/export/csv`, { responseType: "blob" });

export const exportCasePDF = (id) =>
  api.get(`/api/case-details/${id}/export/pdf`, { responseType: "blob" });

// ── Cases (list / CRUD / pipeline) ──────────────────────────────────────────
// GET /api/cases?page=&limit=&search=&status=&priority=&visaType=
export const getCases = (params = {}) => api.get(`/api/cases`, { params });

// GET /api/cases/dropdown
export const getCasesDropdown = () => api.get(`/api/cases/dropdown`);

// GET /api/cases/pipeline
export const getCasesPipeline = () => api.get(`/api/cases/pipeline`);

// GET /api/cases/capacity
export const getCasesCapacity = () => api.get(`/api/cases/capacity`);

// GET /api/cases/:id
export const getCaseById = (id) => api.get(`/api/cases/${id}`);

// POST /api/cases
export const createCase = (data) => api.post(`/api/cases`, data);

// PUT /api/cases/:id
export const updateCase = (id, data) => api.put(`/api/cases/${id}`, data);

// DELETE /api/cases/:id
export const deleteCase = (id) => api.delete(`/api/cases/${id}`);

// PATCH /api/cases/:id/assign  { assignTo, assignToName, reason }
export const assignCase = (id, data) =>
  api.patch(`/api/cases/${id}/assign`, data);

// PATCH /api/cases/:id/stage  { status }
export const updateCaseStage = (id, status) =>
  api.patch(`/api/cases/${id}/stage`, { status });

// ── Documents ────────────────────────────────────────────────────────────────
// POST /api/documents/upload  (multipart/form-data: caseId, documentCategory, documents, expiryDate, userFileName, userId)
export const uploadCaseDocument = (formData) =>
  api.post(`/api/documents/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET /api/documents/:id
export const getDocument = (id) => api.get(`/api/documents/${id}`);

// DELETE /api/documents/:id
export const deleteCaseDocument = (id) => api.delete(`/api/documents/${id}`);

// GET /api/documents/download/:id
export const downloadCaseDocument = (id) =>
  api.get(`/api/documents/download/${id}`, { responseType: "blob" });

// PATCH /api/documents/status/:id  { status }
export const updateCaseDocumentStatus = (id, data) =>
  api.patch(`/api/documents/status/${id}`, data);

// GET /api/documents/case/:caseId
export const getDocumentsByCaseId = (caseId) =>
  api.get(`/api/documents/case/${caseId}`);

// ── Case Notes ───────────────────────────────────────────────────────────────
// POST /api/case-notes  { caseId, content }
export const addCaseNote = (data) => api.post(`/api/case-notes`, data);

// GET /api/case-notes?caseId=&page=&limit=
export const getCaseNotesByCaseId = (caseId, page = 1, limit = 20) =>
  api.get(`/api/case-notes`, { params: { caseId, page, limit } });

// GET /api/case-notes/note/:id
export const getCaseNoteById = (noteId) =>
  api.get(`/api/case-notes/note/${noteId}`);

// DELETE /api/case-notes/:id
export const deleteCaseNote = (noteId) =>
  api.delete(`/api/case-notes/${noteId}`);

// ── Case Tasks ───────────────────────────────────────────────────────────────
// POST /api/tasks  { title, due_date, priority, status, case_id, assigned_to, description }
export const addCaseTask = (data) => api.post(`/api/tasks`, data);

// GET /api/tasks
export const getAllCaseTasks = (params = {}) =>
  api.get(`/api/tasks`, { params });

// GET /api/tasks/:id
export const getCaseTaskById = (id) => api.get(`/api/tasks/${id}`);

// GET /api/tasks/case/:caseId
export const getTasksByCaseId = (caseId) =>
  api.get(`/api/tasks/case/${caseId}`);

// PUT /api/tasks/:id
export const updateCaseTask = (id, data) => api.put(`/api/tasks/${id}`, data);

// DELETE /api/tasks/:id
export const deleteCaseTask = (id) => api.delete(`/api/tasks/${id}`);
