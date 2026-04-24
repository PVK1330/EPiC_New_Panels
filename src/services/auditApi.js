import api from './api';

export const getAuditLogs = (params = {}) => api.get('/api/admin/audit-logs', { params });
