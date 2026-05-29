import api from './api';

export const createChangeRequest = async (data) => {
  const response = await api.post('/api/change-requests', data);
  return response.data;
};

export const listChangeRequests = async (params) => {
  const response = await api.get('/api/change-requests', { params });
  return response.data;
};

export const getChangeRequestById = async (id) => {
  const response = await api.get(`/api/change-requests/${id}`);
  return response.data;
};

export const getChangeRequestHistory = async (id) => {
  const response = await api.get(`/api/change-requests/history/${id}`);
  return response.data;
};

export const reviewChangeRequest = async (id) => {
  const response = await api.put(`/api/change-requests/${id}/review`);
  return response.data;
};

export const approveChangeRequest = async (id, notes = '') => {
  const response = await api.put(`/api/change-requests/${id}/approve`, { notes });
  return response.data;
};

export const rejectChangeRequest = async (id, notes = '') => {
  const response = await api.put(`/api/change-requests/${id}/reject`, { notes });
  return response.data;
};

export const escalateChangeRequest = async (id, notes = '') => {
  const response = await api.put(`/api/change-requests/${id}/escalate`, { notes });
  return response.data;
};
