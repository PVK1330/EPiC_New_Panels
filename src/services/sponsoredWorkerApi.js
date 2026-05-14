import api from "./api";

export const addSponsoredWorker = (workerData) =>
  api.post("/api/business/workers", workerData);

export const getSponsoredWorkers = () =>
  api.get("/api/business/workers");

export const getSponsoredWorkerDetails = (id) =>
  api.get(`/api/business/workers/${id}`);

export const updateSponsoredWorker = (id, workerData) =>
  api.put(`/api/business/workers/${id}`, workerData);

export const deleteSponsoredWorker = (id) =>
  api.delete(`/api/business/workers/${id}`);

export const updateWorkerStatus = (id, statusData) =>
  api.patch(`/api/business/workers/${id}/status`, statusData);
