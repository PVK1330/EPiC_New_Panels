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
