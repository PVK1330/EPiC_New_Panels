import api from "./api";

export const fetchPlatformAuditLogs = (params) =>
  api.get("/api/superadmin/audit-log", { params });

export const fetchPlatformAuditLogsExport = () =>
  api.get("/api/superadmin/audit-log/export-csv", { responseType: "blob" });

export const getExportPlatformAuditLogsUrl = () => {
  const baseUrl = api.defaults.baseURL || "";
  return `${baseUrl}/api/superadmin/audit-log/export-csv`;
};
