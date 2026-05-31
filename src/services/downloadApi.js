import api from "./api";

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

export async function downloadFilledApplicationPdf() {
  const res = await api.get("/api/candidate/application/filled-application-pdf", {
    responseType: "blob",
    timeout: 120000,
  });
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    "Filled_Application_Form.pdf";
  return { blob, filename };
}

export async function downloadCaseSummaryPdf() {
  const res = await api.get("/api/candidate/application/case-summary-pdf", {
    responseType: "blob",
    timeout: 120000,
  });
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    "Case_Summary_Report.pdf";
  return { blob, filename };
}

export async function downloadSupportingDocumentsZip() {
  const res = await api.get("/api/documents/bundle/me", {
    responseType: "blob",
    timeout: 300000,
  });
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    "Supporting_Documents.zip";
  return { blob, filename };
}

export async function downloadInvoiceReceiptPdf(payload) {
  const res = await api.post(
    "/api/candidate/payments/export-invoice-receipt-pdf",
    payload,
    { responseType: "blob", timeout: 120000 },
  );
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    `Receipt_${payload?.caseId || "invoice"}.pdf`;
  return { blob, filename };
}

export async function downloadAdminCandidateApplicationPdf(candidateId) {
  const res = await api.get(
    `/api/admin/candidates/${encodeURIComponent(candidateId)}/application-pdf`,
    { responseType: "blob", timeout: 120000 },
  );
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    `application-${candidateId}.pdf`;
  return { blob, filename };
}


export async function downloadCosSummaryExcel() {
  const res = await api.get("/api/business/cos/export/summary", {
    responseType: "blob",
    timeout: 120000,
  });
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    `cos_summary_${new Date().toISOString().split("T")[0]}.xlsx`;
  return { blob, filename };
}

export async function downloadCosRequestsExcel() {
  const res = await api.get("/api/business/cos/export/requests", {
    responseType: "blob",
    timeout: 120000,
  });
  const blob = res.data;
  const filename =
    parseFilenameFromDisposition(res.headers["content-disposition"]) ||
    `cos_requests_${new Date().toISOString().split("T")[0]}.xlsx`;
  return { blob, filename };
}
