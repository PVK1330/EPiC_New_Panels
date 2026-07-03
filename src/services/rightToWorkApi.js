import api from "./api";

export const getRtwRecords = () =>
  api.get("/api/business/right-to-work");

export const getRtwRecordsByWorker = (workerId) =>
  api.get(`/api/business/right-to-work/worker/${workerId}`);

export const createRtwRecord = (formData) =>
  api.post("/api/business/right-to-work", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRtwRecord = (id, formData) =>
  api.put(`/api/business/right-to-work/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Evidence document is stored privately (not web-served) — fetch it as a blob
// through the authenticated API so it can be opened/viewed.
export const fetchRtwDocument = (id) =>
  api.get(`/api/business/right-to-work/${id}/document`, { responseType: "blob" });
