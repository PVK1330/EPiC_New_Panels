import api from "./api";

export const getWorkloadOverview = (params = {}) =>
  api.get(`/api/workload/overview`, { params });

export const getCaseworkerWorkload = (caseworkerId) =>
  api.get(`/api/workload/caseworker/${caseworkerId}`);

export const getWorkloadTrends = (params = {}) =>
  api.get(`/api/workload/trends`, { params });

export const getWorkloadAlerts = (params = {}) =>
  api.get(`/api/workload/alerts`, { params });

export const exportWorkloadCSV = (params = {}) =>
  api.get(`/api/workload/export`, { params, responseType: 'blob' });

export const getPendingTasks = (params = {}) =>
  api.get(`/api/tasks`, { params });

export const getCases = (params = {}) =>
  api.get(`/api/cases`, { params });
