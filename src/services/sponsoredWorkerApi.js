import api from "./api";

export const addSponsoredWorker = (workerData) =>
  api.post("/api/business/visa-workers", workerData);

export const getSponsoredWorkers = () =>
  api.get("/api/business/visa-workers");

export const getSponsoredWorkerDetails = (id) =>
  api.get(`/api/business/visa-workers/${id}`);

export const deleteSponsoredWorker = (id) =>
  api.delete(`/api/business/visa-workers/${id}`);

export const getWorkerAuditTrail = (id) =>
  api.get(`/api/business/visa-workers/${id}/audit`);

export const assignCosToWorker = (id, data) =>
  api.post(`/api/business/visa-workers/${id}/assign-cos`, data);

// --- Absence Record API ---

/** Fetch all absence records for a specific worker */
export const getAbsencesByWorker = (workerId) =>
  api.get(`/api/business/workers/absence/worker/${workerId}`);

/** Create a new absence record (FormData — supports file upload) */
export const createAbsenceRecord = (formData) =>
  api.post("/api/business/workers/absence", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Update an existing absence record (FormData — supports file upload) */
export const updateAbsenceRecord = (id, formData) =>
  api.put(`/api/business/workers/absence/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Delete an absence record */
export const deleteAbsenceRecord = (id) =>
  api.delete(`/api/business/workers/absence/${id}`);
