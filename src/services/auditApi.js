import api from './api';

export const getAuditLogs = (params = {}) => api.get('/api/admin/audit-logs', { params });
export const getAuditActionTypes = () => api.get('/api/admin/audit-logs/actions');
export const exportAuditLogs = (params = {}) => api.get('/api/admin/audit-logs/export', { params, responseType: 'blob' });
