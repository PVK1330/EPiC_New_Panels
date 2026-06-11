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
export const getAdminLicenceApplicationDetails = (id) => api.get(`/api/admin/licence/details/${id}`);
export const requestLicenceInfo = (id, data) => api.patch(`/api/admin/licence/request-info/${id}`, data);
export const assignLicenceCaseworker = (id, data) => api.post(`/api/admin/licence/assign-caseworker/${id}`, data);
export const deleteLicenceApplicationByAdmin = (id) => api.delete(`/api/admin/licence/delete/${id}`);

// Admin: stream a licence application's uploaded document (preview or download).
// Files are no longer served statically — they must come through this authenticated
// endpoint as a blob. Pass { download: true } to force a download disposition.
export const downloadAdminLicenceDocument = (id, index, { download = false } = {}) =>
  api.get(`/api/admin/licence/${id}/documents/${index}/download`, {
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

// Business: Renew licence (route already exists in backend)
export const renewLicence = (id) =>
  api.post(`/api/business/licence/renew/${id}`);

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

