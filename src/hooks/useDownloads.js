import { useCallback, useState } from "react";
import api from "../services/api";
import { formatDateTime } from "../utils/datetime";
import {
  downloadFilledApplicationPdf as fetchFilledPdf,
  downloadCaseSummaryPdf as fetchCasePdf,
  downloadSupportingDocumentsZip as fetchZip,
  downloadInvoiceReceiptPdf as fetchInvoiceReceiptPdf,
  downloadAdminCandidateApplicationPdf as fetchAdminCandidateApplicationPdf,
  downloadCosSummaryExcel as fetchCosSummaryExcel,
  downloadCosRequestsExcel as fetchCosRequestsExcel,
} from "../services/downloadApi";
import { exportDashboardPDF as fetchDashboardPdf } from "../services/dashboardApi";
import { exportAdmins } from "../services/adminService";
import { exportCaseworkers } from "../services/caseWorker";
import { exportSponsors, downloadSponsorDocument as fetchSponsorDocument } from "../services/sponsorApi";
import {
  exportCandidates,
  exportCandidateApplicationsExcel,
} from "../services/candidateApi";
import { exportCases, downloadDocument as fetchCaseworkerDocument } from "../services/caseApi";
import { exportAllCases } from "../services/caseApi";
import { exportWorkloadCSV as exportWorkload } from "../services/workloadApi";
import { exportAuditLogs } from "../services/auditApi";
import { exportAdminTransactionsCsv } from "../services/adminFinanceApi";
import { exportEscalationsExcel } from "../services/escalationApi";
import { exportReportingExcel } from "../services/reportingApi";
import {
  exportCaseCSV,
  exportCasePDF,
  downloadCaseDocument as fetchCaseDetailDocument,
} from "../services/caseDetailApi";
import { downloadDocument as fetchDocument } from "../services/documentApi";
import { downloadCandidateCcl } from "../services/workflowApi";
import { fetchPlatformAuditLogsExport } from "../services/superadminAudit.service";
import {
  exportFinancials,
  exportInvoicesPdf,
  downloadInvoicePdf as fetchInvoicePdf,
  downloadTransactionReceipt as fetchTransactionReceipt,
} from "../services/billingApi";

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function messageFromDownloadError(error) {
  const raw = error?.response?.data;
  if (raw instanceof Blob) {
    try {
      const text = await raw.text();
      const j = JSON.parse(text);
      if (typeof j.message === "string") return j.message;
    } catch {
      return error?.message || "Download failed";
    }
  }
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

function parseFilenameFromDisposition(cd) {
  if (!cd || typeof cd !== "string") return null;
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(cd);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ""));
    } catch {
      return star[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  const plain = /filename="([^"]+)"/i.exec(cd);
  if (plain) return plain[1];
  const plain2 = /filename=([^;]+)/i.exec(cd);
  return plain2 ? plain2[1].trim().replace(/^["']|["']$/g, "") : null;
}

function filenameFromResponse(res, fallback) {
  return (
    parseFilenameFromDisposition(res.headers?.["content-disposition"]) ||
    fallback
  );
}

function rowsToCsvContent(rows) {
  if (!rows?.length) return "";
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const header = keys.join(separator);
  const body = rows
    .map((row) =>
      keys
        .map((k) => {
          let cell = row[k] === null || row[k] === undefined ? "" : row[k];
          cell =
            cell instanceof Date ? formatDateTime(cell) : String(cell).replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        })
        .join(separator),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export default function useDownloads() {
  const [busy, setBusy] = useState({});

  const setBusyKey = (key, value) => {
    setBusy((s) => ({ ...s, [key]: value }));
  };

  const downloadBlob = useCallback((blob, filename) => {
    triggerBlobDownload(blob, filename);
  }, []);

  const downloadTextFile = useCallback((content, filename, mimeType = "text/csv;charset=utf-8;") => {
    triggerBlobDownload(new Blob([content], { type: mimeType }), filename);
  }, []);

  const downloadCsvFromRows = useCallback(
    (filename, rows) => {
      if (!rows?.length) {
        return { ok: false, message: "Nothing to export for the current selection." };
      }
      downloadTextFile(rowsToCsvContent(rows), filename);
      return { ok: true };
    },
    [downloadTextFile],
  );

  const downloadFromAxiosResponse = useCallback((res, defaultFilename) => {
    const filename = filenameFromResponse(res, defaultFilename);
    triggerBlobDownload(res.data, filename);
    return { ok: true, filename };
  }, []);

  const downloadAssetFile = useCallback(
    async (assetPath, filename) => {
      const key = "assetFile";
      setBusyKey(key, true);
      try {
        const normalized = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
        const res = await api.get(normalized, { responseType: "blob" });
        triggerBlobDownload(res.data, filename || "download");
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e, message: await messageFromDownloadError(e) };
      } finally {
        setBusyKey(key, false);
      }
    },
    [],
  );

  const wrapBlobPair = useCallback(async (key, fetchFn) => {
    setBusyKey(key, true);
    try {
      const { blob, filename } = await fetchFn();
      triggerBlobDownload(blob, filename);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e, message: await messageFromDownloadError(e) };
    } finally {
      setBusyKey(key, false);
    }
  }, []);

  const wrapAxiosBlob = useCallback(async (key, fetchFn, defaultFilename) => {
    setBusyKey(key, true);
    try {
      const res = await fetchFn();
      const filename = filenameFromResponse(res, defaultFilename);
      triggerBlobDownload(res.data, filename);
      return { ok: true, filename };
    } catch (e) {
      return { ok: false, error: e, message: await messageFromDownloadError(e) };
    } finally {
      setBusyKey(key, false);
    }
  }, []);

  const downloadFilledApplicationPdf = useCallback(
    () => wrapBlobPair("filledPdf", fetchFilledPdf),
    [wrapBlobPair],
  );

  const downloadCaseSummaryPdf = useCallback(
    () => wrapBlobPair("casePdf", fetchCasePdf),
    [wrapBlobPair],
  );

  const downloadSupportingDocumentsZip = useCallback(
    () => wrapBlobPair("zip", fetchZip),
    [wrapBlobPair],
  );

  const downloadInvoiceReceiptPdf = useCallback(
    (payload) => wrapBlobPair("invoiceReceiptPdf", () => fetchInvoiceReceiptPdf(payload)),
    [wrapBlobPair],
  );

  const downloadAdminCandidateApplicationPdf = useCallback(
    (candidateId) =>
      wrapBlobPair("adminCandidateApplicationPdf", () =>
        fetchAdminCandidateApplicationPdf(candidateId),
      ),
    [wrapBlobPair],
  );

  const downloadDashboardPdf = useCallback(
    () =>
      wrapAxiosBlob("dashboardPdf", fetchDashboardPdf, "dashboard_report.pdf"),
    [wrapAxiosBlob],
  );

  const downloadDocument = useCallback(
    (documentId, filename) =>
      wrapAxiosBlob(
        `document_${documentId}`,
        () => fetchDocument(documentId),
        filename || `document_${documentId}`,
      ),
    [wrapAxiosBlob],
  );

  const downloadCaseworkerDocument = useCallback(
    (documentId, filename) =>
      wrapAxiosBlob(
        `cwDocument_${documentId}`,
        () => fetchCaseworkerDocument(documentId),
        filename || "document",
      ),
    [wrapAxiosBlob],
  );

  const downloadCaseDetailDocument = useCallback(
    (documentId, filename) =>
      wrapAxiosBlob(
        `caseDoc_${documentId}`,
        () => fetchCaseDetailDocument(documentId),
        filename || `document_${documentId}`,
      ),
    [wrapAxiosBlob],
  );

  const downloadCandidateCclLetter = useCallback(
    (filename) =>
      wrapAxiosBlob(
        "candidateCcl",
        downloadCandidateCcl,
        filename || "client-care-letter.docx",
      ),
    [wrapAxiosBlob],
  );

  const exportAdminsList = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportAdmins",
        () => exportAdmins(params),
        defaultFilename || `admins_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportCaseworkersList = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportCaseworkers",
        () => exportCaseworkers(params),
        defaultFilename || `caseworkers_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportSponsorsList = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportSponsors",
        () => exportSponsors(params),
        defaultFilename || `sponsors_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportCandidatesList = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportCandidates",
        () => exportCandidates(params),
        defaultFilename || `candidates_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportCandidateApplications = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportCandidateApplications",
        () => exportCandidateApplicationsExcel(params),
        defaultFilename ||
          `candidate-applications_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportCaseworkerCases = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportCaseworkerCases",
        () => exportCases(params),
        defaultFilename || "cases_export.xlsx",
      ),
    [wrapAxiosBlob],
  );

  const exportAdminCases = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportAdminCases",
        () => exportAllCases(params),
        defaultFilename || "cases_export.xlsx",
      ),
    [wrapAxiosBlob],
  );

  const exportWorkloadReport = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportWorkload",
        () => exportWorkload(params),
        defaultFilename ||
          `workload_report_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportAuditLogsList = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportAuditLogs",
        () => exportAuditLogs(params),
        defaultFilename || `audit-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportFinanceTransactions = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportFinance",
        () => exportAdminTransactionsCsv(params),
        defaultFilename || `finance-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportEscalations = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportEscalations",
        () => exportEscalationsExcel(params),
        defaultFilename || `escalations_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportReportsWorkbook = useCallback(
    (params, defaultFilename) =>
      wrapAxiosBlob(
        "exportReports",
        () => exportReportingExcel(params),
        defaultFilename || `reports_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportCaseDetailPdf = useCallback(
    (caseId, defaultFilename) => {
      const cleanId = String(caseId).replace(/^#/, "");
      return wrapAxiosBlob(
        "exportCasePdf",
        () => exportCasePDF(cleanId),
        defaultFilename || `Case_${cleanId}_Report.pdf`,
      );
    },
    [wrapAxiosBlob],
  );

  const exportCaseDetailExcel = useCallback(
    (caseId, defaultFilename) => {
      const cleanId = String(caseId).replace(/^#/, "");
      return wrapAxiosBlob(
        "exportCaseExcel",
        () => exportCaseCSV(cleanId),
        defaultFilename || `Case_${cleanId}_Data.pdf`,
      );
    },
    [wrapAxiosBlob],
  );

  const exportPlatformAuditLogs = useCallback(
    (defaultFilename) =>
      wrapAxiosBlob(
        "exportPlatformAuditLogs",
        fetchPlatformAuditLogsExport,
        defaultFilename ||
          `EPiC_Platform_Audit_Logs_${new Date().toISOString().split("T")[0]}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportSuperadminFinancials = useCallback(
    (defaultFilename) =>
      wrapAxiosBlob(
        "exportFinancials",
        exportFinancials,
        defaultFilename || `financials_export_${Date.now()}.xlsx`,
      ),
    [wrapAxiosBlob],
  );

  const exportSuperadminInvoicesPdf = useCallback(
    () =>
      wrapAxiosBlob("exportInvoicesPdf", exportInvoicesPdf, "invoices_export.pdf"),
    [wrapAxiosBlob],
  );

  const downloadSuperadminInvoicePdf = useCallback(
    (invoice) => {
      const invoiceNumber = invoice?.invoice_number || `invoice_${invoice?.id}`;
      const safeFilename = `invoice_${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      return wrapAxiosBlob(
        `invoicePdf_${invoice?.id}`,
        () => fetchInvoicePdf(invoice?.id),
        safeFilename,
      );
    },
    [wrapAxiosBlob],
  );

  const downloadTransactionReceiptPdf = useCallback(
    (transaction) => {
      const ref = transaction?.reference || `TXN_${transaction?.id}`;
      const safeFilename = `Receipt_${ref.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      return wrapAxiosBlob(
        `receipt_${transaction?.id}`,
        () => fetchTransactionReceipt(transaction?.id),
        safeFilename,
      );
    },
    [wrapAxiosBlob],
  );

  const downloadSponsorDoc = useCallback(
    (sponsorId, field, filename) =>
      wrapAxiosBlob(
        `sponsorDoc_${sponsorId}_${field}`,
        () => fetchSponsorDocument(sponsorId, field),
        filename || field,
      ),
    [wrapAxiosBlob],
  );

  const downloadCosSummaryExcel = useCallback(
    () => wrapBlobPair("cosSummaryExcel", fetchCosSummaryExcel),
    [wrapBlobPair],
  );

  const downloadCosRequestsExcel = useCallback(
    () => wrapBlobPair("cosRequestsExcel", fetchCosRequestsExcel),
    [wrapBlobPair],
  );

  return {
    busy,
    downloadBlob,
    downloadTextFile,
    downloadCsvFromRows,
    downloadFromAxiosResponse,
    downloadAssetFile,
    downloadFilledApplicationPdf,
    downloadCaseSummaryPdf,
    downloadSupportingDocumentsZip,
    downloadInvoiceReceiptPdf,
    downloadAdminCandidateApplicationPdf,
    downloadDashboardPdf,
    downloadDocument,
    downloadCaseworkerDocument,
    downloadCaseDetailDocument,
    downloadCandidateCclLetter,
    exportAdminsList,
    exportCaseworkersList,
    exportSponsorsList,
    exportCandidatesList,
    exportCandidateApplications,
    exportCaseworkerCases,
    exportAdminCases,
    exportWorkloadReport,
    exportAuditLogsList,
    exportFinanceTransactions,
    exportEscalations,
    exportReportsWorkbook,
    exportCaseDetailPdf,
    exportCaseDetailExcel,
    exportPlatformAuditLogs,
    exportSuperadminFinancials,
    exportSuperadminInvoicesPdf,
    downloadSuperadminInvoicePdf,
    downloadTransactionReceiptPdf,
    downloadCosSummaryExcel,
    downloadCosRequestsExcel,
    downloadSponsorDoc,
  };
}
