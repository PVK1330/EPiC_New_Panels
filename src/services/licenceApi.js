import api from "./api";

// Sponsor / Business side
export const submitLicenceApplication = (data) => {
  // Use FormData if documents are present
  if (data.documents && data.documents.length > 0) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'documents') {
        data.documents.forEach(file => formData.append('documents', file));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post("/api/business/licence/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
  return api.post("/api/business/licence/apply", data);
};

export const getMyLicenceApplications = () => api.get("/api/business/licence/my-applications");
export const getLicenceApplicationDetails = (id) => api.get(`/api/business/licence/details/${id}`);

export const updateLicenceApplication = async (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'documents' && Array.isArray(data[key])) {
      data[key].forEach(file => {
        if (file instanceof File) {
          formData.append('documents', file);
        }
      });
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  return await api.put(`/api/business/licence/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteMyLicenceApplication = (id) => api.delete(`/api/business/licence/delete/${id}`);
export const getLicenceDocuments = () => api.get("/api/business/licence/documents");

// Admin side
export const getAllLicenceApplications = (params = {}) => api.get("/api/admin/licence/all", { params });
export const updateLicenceApplicationStatus = (id, data) => api.patch(`/api/admin/licence/update-status/${id}`, data);
export const grantLicence = (id, data) => api.post(`/api/admin/licence/${id}/grant`, data);
export const getAdminLicenceApplicationDetails = (id) => api.get(`/api/admin/licence/details/${id}`);
export const requestLicenceInfo = (id, data) => api.patch(`/api/admin/licence/request-info/${id}`, data);
export const assignLicenceCaseworker = (id, data) => api.post(`/api/admin/licence/assign-caseworker/${id}`, data);
export const deleteLicenceApplicationByAdmin = (id) => api.delete(`/api/admin/licence/delete/${id}`);
// Admin: government credential management (Phase 3)
export const generateLicenceCredentials = (id, data) => api.post(`/api/admin/licence/${id}/generate-credentials`, data);
export const resendLicenceCredentials = (id) => api.post(`/api/admin/licence/${id}/resend-credentials`);

// Sponsor: confirm UKVI portal credentials received
export const confirmSponsorGovCredentials = (id) => api.post(`/api/business/licence/${id}/government-credentials`);

// Caseworker: government pipeline (Phase 3)
export const startLicenceReview = (id) => api.post(`/api/caseworker/licence/${id}/start-review`);
export const startGovRegistration = (id) => api.post(`/api/caseworker/licence/${id}/government-registration/start`);
export const completeGovRegistration = (id, data) => api.post(`/api/caseworker/licence/${id}/government-registration/complete`, data);
export const requestGovCredentials = (id) => api.post(`/api/caseworker/licence/${id}/request-government-credentials`);
export const recordGovSubmission = (id, data) => api.post(`/api/caseworker/licence/${id}/government-submission`, data);

// Dispatch documents (admin/caseworker → sponsor)
export const dispatchDocumentToSponsor = (id, formData) =>
  api.post(`/api/admin/licence/${id}/dispatch-document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const dispatchDocumentToCaseworker = (id, formData) =>
  api.post(`/api/caseworker/licence/${id}/dispatch-document`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getAdminDispatchedDocuments = (id) => api.get(`/api/admin/licence/${id}/dispatch-documents`);
export const getCaseworkerDispatchedDocuments = (id) => api.get(`/api/caseworker/licence/${id}/dispatch-documents`);

// Sponsor: view documents sent by caseworker/admin
export const getSponsorDispatchedDocuments = (id) => api.get(`/api/business/licence/${id}/dispatch-documents`);

// Sponsor: download a dispatched document (blob). Routed through `api` so the CSRF
// token and org-slug headers are attached — a plain <a href> would bypass them.
export const downloadSponsorDispatchedDocument = (id, docId) =>
  api.get(`/api/business/licence/${id}/dispatch-documents/${docId}/download`, {
    responseType: "blob",
  });

// Admin: stream a licence application's uploaded document (preview or download).
// Files are no longer served statically — they must come through this authenticated
// endpoint as a blob. Pass { download: true } to force a download disposition.
export const downloadAdminLicenceDocument = (id, index, { download = false } = {}) =>
  api.get(`/api/admin/licence/${id}/documents/${index}/download`, {
    params: download ? { download: 1 } : {},
    responseType: "blob",
  });

// Caseworker: stream a document on an assigned licence application (blob).
export const downloadCaseworkerLicenceDocument = (id, index, { download = false } = {}) =>
  api.get(`/api/caseworker/licence/${id}/documents/${index}/download`, {
    params: download ? { download: 1 } : {},
    responseType: "blob",
  });

// Sponsor: stream a document on the sponsor's own licence application (blob).
export const downloadSponsorLicenceDocument = (id, index, { download = false } = {}) =>
  api.get(`/api/business/licence/${id}/documents/${index}/download`, {
    params: download ? { download: 1 } : {},
    responseType: "blob",
  });

// Business: Licence Summary (real CoS used count from DB)
export const getLicenceSummary = () =>
  api.get("/api/business/licence/summary");

// Business: Request more CoS from LicenceStatus modal
export const requestMoreCos = (data) =>
  api.patch("/api/business/licence/request-more-cos", data);

// Business: Upload document to a licence application
export const uploadLicenceDocument = ({ files, applicationId, documentType = "" }) => {
  const fd = new FormData();
  files.forEach((f) => fd.append("documents", f));
  fd.append("applicationId", String(applicationId));
  fd.append("documentType", documentType);
  return api.post("/api/business/licence/documents/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Business: Delete a document from a licence application by index
export const deleteLicenceDocument = (applicationId, docIndex) =>
  api.delete(`/api/business/licence/documents/${applicationId}/${docIndex}`);

// Business: CoS summary for CosPage
export const getCosSummary = () =>
  api.get("/api/business/cos/summary");

// Business: Request CoS allocation from CosPage modal
export const requestCosAllocation = (data) =>
  api.post("/api/business/cos/request", data);

// Canonical CoS request endpoints (the /licence/cos-requests aliases are deprecated).
export const getCosRequests = () =>
  api.get("/api/business/cos/requests");

export const updateCosRequest = (id, data) =>
  api.put(`/api/business/cos/requests/${id}`, data);

export const deleteCosRequest = (id) =>
  api.delete(`/api/business/cos/requests/${id}`);

// Business: Renew licence
export const renewLicence = (id, data = {}) =>
  api.post(`/api/business/licence/renew/${id}`, data);

// ── V2 Wizard ────────────────────────────────────────────────────────────────
export const createLicenceV2Draft = () =>
  api.post("/api/business/licence/v2/applications");
export const listLicenceV2Applications = () =>
  api.get("/api/business/licence/v2/applications");
export const getLicenceV2Application = (id) =>
  api.get(`/api/business/licence/v2/applications/${id}`);
export const saveLicenceV2Draft = (id, data) =>
  api.put(`/api/business/licence/v2/applications/${id}`, data);
export const submitLicenceV2Application = (id) =>
  api.post(`/api/business/licence/v2/applications/${id}/submit`);
export const deleteLicenceV2Draft = (id) =>
  api.delete(`/api/business/licence/v2/applications/${id}`);
export const uploadLicenceV2AppendixDocument = (appId, docId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(
    `/api/business/licence/v2/applications/${appId}/appendix-documents/${docId}/file`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};
export const getLicenceV2FeePreview = (data) =>
  api.post("/api/business/licence/v2/fee/preview", data);
export const syncPersonnelFromProfile = (id) =>
  api.post(`/api/business/licence/v2/applications/${id}/sync-from-profile`);

// Business: Compliance summary
export const getComplianceSummary = () =>
  api.get("/api/business/compliance/summary");

// Business: Compliance documents (company-level + licence docs)
export const getComplianceDocuments = (params = {}) =>
  api.get("/api/business/compliance-documents", { params });

export const uploadComplianceDocument = (data) => {
  const fd = new FormData();
  Object.keys(data).forEach(key => fd.append(key, data[key]));
  return api.post("/api/business/compliance-documents/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const deleteComplianceDocument = (id) =>
  api.delete(`/api/business/compliance-documents/${id}`);

// Business: Employee records (sponsored workers with compliance info)
export const getEmployeeRecords = () =>
  api.get("/api/business/workers/employee-records");

// ── Intake: Information Form + Document Checklist ────────────────────────────

// Sponsor: get intake summary (form + document checklist)
export const getSponsorIntakeSummary = (id) =>
  api.get(`/api/business/licence/${id}/intake`);

// Sponsor: save intake form fields
export const updateSponsorIntakeForm = (id, data) =>
  api.put(`/api/business/licence/${id}/intake`, data);

// Sponsor: mark intake form as submitted/complete
export const submitSponsorIntakeForm = (id) =>
  api.post(`/api/business/licence/${id}/intake/submit`);

// Sponsor: upload a single document to a checklist slot
export const uploadIntakeDocument = (id, documentKey, file) => {
  const fd = new FormData();
  fd.append("document", file);
  return api.post(`/api/business/licence/${id}/intake/documents/${documentKey}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Sponsor: remove an uploaded intake document
export const deleteIntakeDocument = (id, documentKey) =>
  api.delete(`/api/business/licence/${id}/intake/documents/${documentKey}`);

// Caseworker: get intake summary for review
export const getCaseworkerIntakeSummary = (id) =>
  api.get(`/api/caseworker/licence/${id}/intake`);

// Caseworker: check readiness for government registration
export const getIntakeReadiness = (id) =>
  api.get(`/api/caseworker/licence/${id}/intake/readiness`);

// Caseworker: verify a document
export const verifyIntakeDocument = (id, documentKey, notes = "") =>
  api.patch(`/api/caseworker/licence/${id}/intake/documents/${documentKey}/verify`, { notes });

// Caseworker: reject a document
export const rejectIntakeDocument = (id, documentKey, reason) =>
  api.patch(`/api/caseworker/licence/${id}/intake/documents/${documentKey}/reject`, { reason });

// Caseworker: request more information on a document
export const requestIntakeDocumentInfo = (id, documentKey, notes) =>
  api.patch(`/api/caseworker/licence/${id}/intake/documents/${documentKey}/request-info`, { notes });

// Business: Reporting obligations
export const getReportingObligations = () =>
  api.get("/api/business/worker-events");

// Business: Submit/Update a reporting obligation
export const submitReportingObligation = (data) => {
  const fd = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      fd.append(key, data[key]);
    }
  });
  return api.post("/api/business/worker-events", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const updateReportingObligation = (id, data) => {
  const fd = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      fd.append(key, data[key]);
    }
  });
  return api.put(`/api/business/worker-events/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

