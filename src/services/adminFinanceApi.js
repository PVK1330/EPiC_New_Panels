import api from './api';

// ─── Finance Summary ──────────────────────────────────────────────────────────
export const getFinanceSummary = (params = {}) =>
  api.get('/api/admin/finance/summary', { params });

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getAdminTransactions = (params = {}) =>
  api.get('/api/admin/finance/transactions', { params });

export const getAdminTransactionById = (id) =>
  api.get(`/api/admin/finance/transactions/${id}`);

export const updateAdminTransactionStatus = (id, status) =>
  api.patch(`/api/admin/finance/transactions/${id}/status`, { status });

// ─── Invoice Creation ─────────────────────────────────────────────────────────
export const createAdminInvoice = (data) =>
  api.post('/api/admin/finance/invoices', data);

// ─── CSV Export ───────────────────────────────────────────────────────────────
export const exportAdminTransactionsCsv = (params = {}) =>
  api.get('/api/admin/finance/export/csv', { params, responseType: 'blob' });
