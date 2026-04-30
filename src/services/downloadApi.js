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

export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
