import api from "./api";

// ── Org-level CCL templates ────────────────────────────────────────────────────
export const getCclTags = () => api.get("/api/ccl/templates/tags");
export const listCclTemplates = () => api.get("/api/ccl/templates");
export const getCclTemplate = (id) => api.get(`/api/ccl/templates/${id}`);
export const createCclTemplate = (data) => api.post("/api/ccl/templates", data);
export const updateCclTemplate = (id, data) => api.put(`/api/ccl/templates/${id}`, data);
export const deleteCclTemplate = (id) => api.delete(`/api/ccl/templates/${id}`);

/** Render unsaved template HTML with sample data → PDF blob. */
export const previewCclTemplate = (data) =>
  api.post("/api/ccl/templates/preview", data, { responseType: "blob" });

// ── Per-case CCL (draft → issue) ───────────────────────────────────────────────
export const getCaseCcl = (caseId) => api.get(`/api/ccl/cases/${caseId}`);
export const saveCaseCclDraft = (caseId, draftHtml) =>
  api.put(`/api/ccl/cases/${caseId}/draft`, { draftHtml });
export const previewCaseCcl = (caseId) =>
  api.post(`/api/ccl/cases/${caseId}/preview`, {}, { responseType: "blob" });
export const issueCaseCcl = (caseId) => api.post(`/api/ccl/cases/${caseId}/issue`, {});

/** Upload a .docx CCL letter → converted to an editable HTML draft. */
export const importCaseCclDraft = (caseId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(`/api/ccl/cases/${caseId}/draft/import`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Visa types (for the template's visa assignment dropdown) ────────────────────
export const getVisaTypesDropdown = () => api.get("/api/settings/visa-types/dropdown");
