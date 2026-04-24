import api from "./api.js";

// Summary KPIs for the reports header
export const getReportingSummary = () =>
  api.get("/api/reports/summary");

// Case analytics — supports ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getCaseAnalytics = (params = {}) =>
  api.get("/api/reports/cases", { params });

// Caseworker workload report
export const getWorkloadReport = (params = {}) =>
  api.get("/api/reports/workload", { params });

// Financial report
export const getFinancialReport = (params = {}) =>
  api.get("/api/reports/financial", { params });

// Performance & KPI report
export const getPerformanceReport = (params = {}) =>
  api.get("/api/reports/performance", { params });
