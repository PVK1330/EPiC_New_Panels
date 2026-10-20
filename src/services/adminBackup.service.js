import api from "./api";

const BASE = "/api/admin/backups";
const LONG_TIMEOUT = 10 * 60 * 1000;

const unwrap = (res) => res?.data?.data;

/** Turn any axios error (incl. blob-bodied ones) into an Error with a readable message. */
async function toReadableError(err, fallback) {
  let message = err?.response?.data?.message;
  const body = err?.response?.data;
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text());
      message = parsed?.message || parsed?.error || message;
    } catch {
      /* not JSON */
    }
  }
  const e = new Error(message || err?.message || fallback);
  e.status = err?.response?.status;
  return e;
}

export async function getBackupStatus() {
  return unwrap(await api.get(`${BASE}/status`));
}

export async function listBackups(params = {}) {
  return unwrap(await api.get(BASE, { params }));
}

export async function createBackup() {
  const data = unwrap(await api.post(BASE, {}));
  return data?.job;
}

export async function getBackupJob(id) {
  const data = unwrap(await api.get(`${BASE}/${id}`));
  return data?.job;
}

function filenameFromDisposition(header, fallback) {
  if (!header) return fallback;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      /* fall through */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1] : fallback;
}

/** Re-authenticates, then saves the backup file to the user's computer. */
export async function downloadBackup(id, { password, totp } = {}) {
  let res;
  try {
    res = await api.post(
      `${BASE}/${id}/download`,
      { password, ...(totp ? { totp } : {}) },
      { responseType: "blob", timeout: LONG_TIMEOUT },
    );
  } catch (err) {
    throw await toReadableError(err, "Download failed");
  }
  const filename = filenameFromDisposition(
    res.headers?.["content-disposition"],
    `backup-${id}.sql.gz`,
  );
  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  return filename;
}

export async function deleteBackup(id) {
  return (await api.delete(`${BASE}/${id}`)).data;
}

export async function restoreBackup(formData, onUploadProgress) {
  const res = await api.post(`${BASE}/restore`, formData, {
    timeout: LONG_TIMEOUT,
    onUploadProgress,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res)?.job;
}
