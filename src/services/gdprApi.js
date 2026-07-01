import api from "./api";

/** Download all personal data for an org as a JSON file (GDPR Article 15/20). */
export const exportOrgGdprData = (orgId) =>
  api.get(`/api/superadmin/gdpr/${orgId}/export`, { responseType: "blob" });

/** Anonymise all PII for an org (GDPR erasure). */
export const purgeOrgGdprData = (orgId, reason = "") =>
  api.delete(`/api/superadmin/gdpr/${orgId}`, { data: { reason } });

/** Platform-wide retention report (all suspended orgs). */
export const getRetentionReport = () =>
  api.get("/api/superadmin/gdpr/retention-report").then((r) => r.data?.data ?? r.data);

/** Per-org retention report. */
export const getOrgRetentionReport = (orgId) =>
  api
    .get(`/api/superadmin/gdpr/${orgId}/retention-report`)
    .then((r) => r.data?.data ?? r.data);
