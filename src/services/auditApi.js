import api from './api';

// ─── Admin Audit Logs ─────────────────────────────────────────────────────────
// Both /api/audit-logs and /api/admin/audit-logs are served by the same router.
// The frontend AdminAuditLogs page calls /api/audit-logs directly.

export const getAuditLogs = (params = {}) =>
  api.get('/api/audit-logs', { params });

export const getAuditStats = () =>
  api.get('/api/audit-logs/stats');

export const getAuditActionTypes = () =>
  api.get('/api/audit-logs/actions');

export const exportAuditLogs = (params = {}) =>
  api.get('/api/audit-logs/export', { params, responseType: 'blob' });

// ─── Caseworker audit ─────────────────────────────────────────────────────────
export const getCaseAuditLogs = (caseId, params = {}) =>
  api.get(`/api/caseworker/audit/case/${caseId}`, { params });
