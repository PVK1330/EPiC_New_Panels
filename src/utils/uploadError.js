// Shared helpers for the document upload forms (admin case page, caseworker case
// tab, caseworker Documents page). They turn an axios error into something the
// user can act on instead of the bare "Failed to upload document" fallback, and
// catch obviously-bad files before a request is even made (BUG-019 / BUG-030).

// Mirrors MAX_FILE_SIZES.DOCUMENT and the extension allow-lists on the server
// (ElitePic_CRM_backend/src/config/fileSecurity.config.js).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".txt", ".csv", ".xlsx", ".xls",
  ".png", ".jpg", ".jpeg", ".webp",
];

/** Returns a user-facing problem with the chosen file, or null when it looks fine. */
export function validateUploadFile(file) {
  if (!file) return "Please choose a file to upload.";
  const name = String(file.name || "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return `Unsupported file type${ext ? ` (${ext})` : ""}. Allowed: PDF, Word, Excel, CSV, TXT, PNG, JPG, WEBP.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `This file is ${mb} MB — the maximum allowed size is 10 MB.`;
  }
  return null;
}

/** Best available explanation for a failed upload request. */
export function getUploadErrorMessage(error, fallback = "Failed to upload document") {
  if (!error) return fallback;

  const data = error.response?.data;
  const serverMessage =
    data && typeof data === "object" ? data.message || data.error : null;
  if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;

  const status = error.response?.status;
  if (status === 413) {
    return "This file is too large for the server to accept. Please upload a smaller file.";
  }
  if (status === 401) return "Your session has expired. Please sign in again and retry the upload.";
  if (status === 403) return "You don't have permission to upload documents here.";
  if (status === 429) return "Too many uploads in a short time. Please wait a few minutes and try again.";
  if (error.code === "ECONNABORTED" || /timeout/i.test(error.message || "")) {
    return "The upload timed out. Please check your connection and try again, ideally with a smaller file.";
  }
  if (!error.response) {
    return "Could not reach the server. Please check your connection and try again.";
  }
  return `${fallback} (server responded with ${status}).`;
}
