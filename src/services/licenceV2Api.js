import api from "./api";

// Sponsor Licence Application V2 (8-step wizard) — sponsor side.
const BASE = "/api/business/licence/v2";

export const createLicenceDraft = () => api.post(`${BASE}/applications`);
export const listLicenceV2Applications = () => api.get(`${BASE}/applications`);
export const getLicenceV2Application = (id) => api.get(`${BASE}/applications/${id}`);
export const saveLicenceV2Draft = (id, data) => api.put(`${BASE}/applications/${id}`, data);
export const submitLicenceV2Application = (id) => api.post(`${BASE}/applications/${id}/submit`);
export const deleteLicenceV2Draft = (id) => api.delete(`${BASE}/applications/${id}`);
export const previewLicenceV2Fee = (data) => api.post(`${BASE}/fee/preview`, data);

export const uploadAppendixDocument = (id, docId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(`${BASE}/applications/${id}/appendix-documents/${docId}/file`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Reviewer (read-only) detail.
export const getAdminLicenceV2 = (id) => api.get(`/api/admin/licence/v2/${id}`);
export const getCaseworkerLicenceV2 = (id) => api.get(`/api/caseworker/licence/v2/${id}`);
