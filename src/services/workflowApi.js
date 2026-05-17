import api from "./api";

const BASE = "/api/workflow";

export const getDataCaptureForm = () => api.get(`${BASE}/data-capture`);

export const saveDataCaptureDraft = (responses) =>
  api.put(`${BASE}/data-capture`, { responses });

export const submitDataCapture = (responses) =>
  api.post(`${BASE}/data-capture/submit`, { responses });

export const getDecisionDocuments = () => api.get(`${BASE}/decision-documents`);

export const confirmCclSigned = (documentId) =>
  api.post(`${BASE}/ccl/confirm-signed`, { documentId });

export const getCaseWorkflowBundle = (caseId) =>
  api.get(`${BASE}/cases/${encodeURIComponent(caseId)}/bundle`);

export const sendDataCaptureRequest = (caseId) =>
  api.post(`${BASE}/cases/${encodeURIComponent(caseId)}/data-capture/send`);

export const reviewDataCapture = (caseId, status, reviewNotes) =>
  api.patch(`${BASE}/cases/${encodeURIComponent(caseId)}/data-capture/review`, {
    status,
    reviewNotes,
  });

export const issueCcl = (caseId, payload) =>
  api.post(`${BASE}/cases/${encodeURIComponent(caseId)}/ccl/issue`, payload);

export const getCclStatus = (caseId) =>
  api.get(`${BASE}/cases/${encodeURIComponent(caseId)}/ccl`);
