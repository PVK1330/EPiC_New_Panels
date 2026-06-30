/**
 * Section G — Audit Preparation Mode API client
 *
 * Uses the shared `api` axios instance (cookie-auth + CSRF + org-slug headers).
 *
 * Endpoints:
 *   POST /api/business/audit/generate       → JSON summary
 *   GET  /api/business/audit/export/pdf     → PDF blob
 *   GET  /api/business/audit/export/excel   → XLSX blob
 *   GET  /api/business/audit/export/zip     → ZIP blob
 */

import api from "./api";

/**
 * Fetch the JSON audit pack summary.
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const generateAuditPack = () =>
  api.post("/api/business/audit/generate");

/**
 * Download the audit PDF as a Blob.
 * @returns {Promise<import("axios").AxiosResponse<Blob>>}
 */
export const downloadAuditPdf = () =>
  api.get("/api/business/audit/export/pdf", { responseType: "blob" });

/**
 * Download the audit Excel workbook as a Blob.
 * @returns {Promise<import("axios").AxiosResponse<Blob>>}
 */
export const downloadAuditExcel = () =>
  api.get("/api/business/audit/export/excel", { responseType: "blob" });

/**
 * Download the audit ZIP bundle (PDF + Excel) as a Blob.
 * @returns {Promise<import("axios").AxiosResponse<Blob>>}
 */
export const downloadAuditZip = () =>
  api.get("/api/business/audit/export/zip", { responseType: "blob" });
