import api from "./api";

export const fetchPlatformAuditLogs = (params) => 
  api.get("/api/superadmin/audit-log", { params });

export const getExportPlatformAuditLogsUrl = () => {
  // Returns raw URL for CSV download (which handles verification headers in browser download or window opens)
  const baseUrl = api.defaults.baseURL || "";
  return `${baseUrl}/api/superadmin/audit-log/export-csv`;
};
