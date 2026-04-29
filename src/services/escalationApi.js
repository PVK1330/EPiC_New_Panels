import api from "./api";

export const getEscalations = (params = {}) =>
  api.get(`/api/escalations`, { params });

export const getEscalationKPI = (params = {}) =>
  api.get(`/api/escalations/kpi`, { params });

export const getEscalationById = (id) =>
  api.get(`/api/escalations/${id}`);

export const createEscalation = (data) =>
  api.post(`/api/escalations`, data);

export const updateEscalation = (id, data) =>
  api.put(`/api/escalations/${id}`, data);

export const assignEscalation = (id, data) =>
  api.patch(`/api/escalations/${id}/assign`, data);

export const deleteEscalation = (id) =>
  api.delete(`/api/escalations/${id}`);
