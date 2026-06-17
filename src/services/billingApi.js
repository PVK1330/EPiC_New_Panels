import api from "./api";

export const getSubscriptions = () => api.get("/api/superadmin/subscriptions");

export const getSubscriptionByOrg = (orgId) => api.get(`/api/superadmin/subscriptions/org/${orgId}`);

export const createSubscription = (data) => api.post("/api/superadmin/subscriptions", data);

export const updateSubscription = (id, data) => api.put(`/api/superadmin/subscriptions/${id}`, data);

export const cancelSubscription = (id) => api.post(`/api/superadmin/subscriptions/${id}/cancel`);

export const renewSubscription = (id) => api.post(`/api/superadmin/subscriptions/${id}/renew`);

export const getInvoices = () => api.get("/api/superadmin/invoices");

export const getInvoiceById = (id) => api.get(`/api/superadmin/invoices/${id}`);

export const updateInvoiceStatus = (id, data) => api.patch(`/api/superadmin/invoices/${id}/status`, data);

export const downloadInvoicePdf = (id) =>
  api.get(`/api/superadmin/invoices/${id}/download`, { responseType: "blob" });

export const exportInvoicesPdf = () => api.get("/api/superadmin/invoices/export/pdf", { responseType: "blob" });


export const exportFinancials = () => api.get("/api/superadmin/financials/export", { responseType: "blob" });

export const getTransactions = (params = {}) => api.get("/api/superadmin/transactions", { params });

export const exportTransactions = (params = {}) =>
  api.get("/api/superadmin/transactions/export", { params, responseType: "blob" });

export const getTransactionById = (id) => api.get(`/api/superadmin/transactions/${id}`);

export const downloadTransactionReceipt = (id) =>
  api.get(`/api/superadmin/transactions/${id}/receipt`, { responseType: "blob" });

export const getGatewayStatus = () => api.get("/api/superadmin/gateway/status");

export const configureGateway = (data) => api.post("/api/superadmin/gateway/configure", data);

export const getDashboardStats = () => api.get("/api/superadmin/dashboard/stats");