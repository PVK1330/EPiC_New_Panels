import api from "./api";

const BASE = "/api/documents";

/**
 * Upload one or more documents for a candidate.
 * Creates the user-ID folder on the server: uploads/documents/{userId}/
 *
 * @param {File[]}  files            - array of File objects
 * @param {object}  meta             - { userId, documentType, documentCategory?, caseId?, userFileName?, expiryDate? }
 * @param {function} onProgress      - (pct: number) => void  (optional)
 */
export const uploadDocuments = (files, meta, onProgress) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("documents", f));
  formData.append("userId", meta.userId);
  formData.append("documentType", meta.documentType || "General");
  formData.append("documentCategory", meta.documentCategory || "candidate");
  if (meta.caseId) formData.append("caseId", meta.caseId);
  if (meta.userFileName) formData.append("userFileName", meta.userFileName);
  if (meta.expiryDate) formData.append("expiryDate", meta.expiryDate);

  return api.post(`${BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
};

/** Fetch all documents for a user (paginated) */
export const getUserDocuments = (userId, page = 1, limit = 50) =>
  api.get(`${BASE}/category/candidate/user/${userId}`, {
    params: { page, limit },
  });

/** Fetch documents for a specific case */
export const getCaseDocuments = (caseId, params = {}) =>
  api.get(`${BASE}/case/${caseId}`, { params });

/** Get a single document by ID */
export const getDocumentById = (documentId) =>
  api.get(`${BASE}/${documentId}`);

/** Update document metadata */
export const updateDocument = (documentId, data) =>
  api.put(`${BASE}/${documentId}`, data);

/** Delete a document */
export const deleteDocument = (documentId) =>
  api.delete(`${BASE}/${documentId}`);

/** Update document review status (caseworker/admin) */
export const updateDocumentStatus = (documentId, status, reviewNotes = "") =>
  api.patch(`${BASE}/status/${documentId}`, { status, reviewNotes });

/** Download a document — returns a blob */
export const downloadDocument = (documentId) =>
  api.get(`${BASE}/download/${documentId}`, { responseType: "blob" });

/** Trigger a browser download for a document blob */
export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
