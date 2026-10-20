import api from "./api";

const BASE = "/api/superadmin/backups";
const LONG_TIMEOUT = 600000;

const unwrap = (res) => res.data?.data ?? res.data;

export const listBackups = (params = {}) => api.get(BASE, { params }).then(unwrap);

export const listBackupOrganisations = () => api.get(`${BASE}/organisations`).then(unwrap);

export const createBackup = ({ scope, organisation_id } = {}) =>
  api
    .post(BASE, { scope, ...(organisation_id ? { organisation_id } : {}) })
    .then(unwrap);

export const getBackupJob = (id) => api.get(`${BASE}/${id}`).then((r) => unwrap(r)?.job ?? unwrap(r));

export const deleteBackup = (id) => api.delete(`${BASE}/${id}`).then(unwrap);

export const restoreBackup = (formData, onUploadProgress) =>
  api
    .post(`${BASE}/restore`, formData, {
      timeout: 0,
      onUploadProgress,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(unwrap);

export const getBackupSettings = () => api.get(`${BASE}/settings`).then(unwrap);

export const saveBackupSettings = (payload) => api.put(`${BASE}/settings`, payload).then(unwrap);

/** Pull a readable message out of an axios error, including blob-typed error bodies. */
export async function readableError(err, fallback = "Request failed.") {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || err?.message || fallback;
}

/** Re-authenticates and saves the backup file to the user's computer via the browser. */
export async function downloadBackup(id, { password, totp } = {}) {
  let res;
  try {
    res = await api.post(
      `${BASE}/${id}/download`,
      { password, ...(totp ? { totp } : {}) },
      { responseType: "blob", timeout: LONG_TIMEOUT },
    );
  } catch (err) {
    throw new Error(await readableError(err, "Download failed."));
  }
  const disposition = res.headers?.["content-disposition"] || "";
  const match =
    /filename\*=UTF-8''([^;]+)/i.exec(disposition) || /filename="?([^";]+)"?/i.exec(disposition);
  let filename = `backup-${id}.sql.gz`;
  if (match) {
    try {
      filename = decodeURIComponent(match[1]);
    } catch {
      filename = match[1];
    }
  }
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return filename;
}
