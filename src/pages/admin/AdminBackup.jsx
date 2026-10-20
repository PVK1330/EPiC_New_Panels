import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  DatabaseBackup,
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  X,
} from "lucide-react";
import Button from "../../components/Button";
import Pagination from "../../components/common/Pagination";
import { formatDateTime } from "../../utils/datetime";
import { getOrganisationBranding } from "../../services/settingsService";
import {
  getBackupStatus,
  listBackups,
  createBackup,
  getBackupJob,
  downloadBackup,
  deleteBackup,
  restoreBackup,
} from "../../services/adminBackup.service";

const POLL_MS = 3000;
const PAGE_LIMIT = 10;
const fmt = (v) => formatDateTime(v, { fallback: "—" });
const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb;
const isActive = (j) => j && (j.status === "pending" || j.status === "running");

function fmtSize(bytes) {
  const n = Number(bytes);
  if (!n) return "—";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  running: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  expired: "bg-gray-100 text-gray-500",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-secondary/30";

/** Password (+ optional TOTP) re-authentication modal for downloads. */
function DownloadModal({ job, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await downloadBackup(job.id, { password, totp: totp.trim() });
      toast.success("Backup download started");
      onDone();
    } catch (err) {
      setError(errMsg(err, "Download failed"));
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dl-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="dl-title" className="text-lg font-black text-secondary">
              Confirm your identity
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Re-enter your password to download{" "}
              <span className="font-bold">{job.file_name || `backup #${job.id}`}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        <div>
          <label htmlFor="dl-pw" className="text-xs font-bold text-gray-500">
            Password
          </label>
          <input
            id="dl-pw"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="dl-totp" className="text-xs font-bold text-gray-500">
            Authenticator code (only if you use two-factor)
          </label>
          <input
            id="dl-totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            className={inputCls}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !password}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download
          </Button>
        </div>
      </form>
    </div>
  );
}

const AdminBackup = () => {
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [history, setHistory] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [creating, setCreating] = useState(false);
  const [backupJob, setBackupJob] = useState(null);
  const [downloadFor, setDownloadFor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [orgName, setOrgName] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rTotp, setRTotp] = useState("");
  const [uploadPct, setUploadPct] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreJob, setRestoreJob] = useState(null);
  const [restoreError, setRestoreError] = useState("");

  const mounted = useRef(true);
  const backupTimer = useRef(null);
  const restoreTimer = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(backupTimer.current);
      clearTimeout(restoreTimer.current);
    };
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const s = await getBackupStatus();
      if (!mounted.current) return;
      setStatus(s);
      setStatusError("");
    } catch (e) {
      if (mounted.current) setStatusError(errMsg(e, "Could not load backup status"));
    } finally {
      if (mounted.current) setLoadingStatus(false);
    }
  }, []);

  const loadHistory = useCallback(async (p) => {
    setLoadingHistory(true);
    try {
      const d = await listBackups({ page: p, limit: PAGE_LIMIT });
      if (!mounted.current) return;
      setHistory({ items: d?.items || [], total: d?.total || 0 });
      setHistoryError("");
    } catch (e) {
      if (mounted.current) setHistoryError(errMsg(e, "Could not load backup history"));
    } finally {
      if (mounted.current) setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  useEffect(() => {
    loadHistory(page);
  }, [loadHistory, page]);

  // Organisation name for the type-to-confirm step (same source the sidebar uses).
  useEffect(() => {
    let cancelled = false;
    getOrganisationBranding()
      .then((res) => {
        if (!cancelled) setOrgName(res.data?.data?.organisation?.name || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Schedules itself every POLL_MS until the job leaves an active state.
  const poll = useCallback((id, timerRef, setJob, onFinish) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const job = await getBackupJob(id);
        if (!mounted.current) return;
        setJob(job);
        if (isActive(job)) poll(id, timerRef, setJob, onFinish);
        else onFinish(job);
      } catch {
        // transient failure (e.g. server restarting during restore): keep trying
        if (mounted.current) poll(id, timerRef, setJob, onFinish);
      }
    }, POLL_MS);
  }, []);

  const onBackupFinished = useCallback(
    (job) => {
      setCreating(false);
      if (job?.status === "completed") toast.success("Backup is ready to download");
      else toast.error(job?.error || "Backup failed");
      loadStatus();
      loadHistory(1);
      setPage(1);
    },
    [loadStatus, loadHistory],
  );

  const handleCreate = async () => {
    setCreating(true);
    setBackupJob(null);
    try {
      const job = await createBackup();
      setBackupJob(job);
      if (isActive(job)) poll(job.id, backupTimer, setBackupJob, onBackupFinished);
      else onBackupFinished(job);
    } catch (e) {
      setCreating(false);
      toast.error(errMsg(e, "Could not start backup"));
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm("Delete this backup from the server? This cannot be undone.")) return;
    setDeletingId(job.id);
    try {
      await deleteBackup(job.id);
      toast.success("Backup deleted");
      if (backupJob?.id === job.id) setBackupJob(null);
      loadHistory(page);
    } catch (e) {
      toast.error(errMsg(e, "Could not delete backup"));
    } finally {
      setDeletingId(null);
    }
  };

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    setFileError("");
    setFile(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".sql.gz")) {
      setFileError("Only .sql.gz backup files created by this system are accepted.");
      return;
    }
    const maxMb = Number(status?.max_upload_mb);
    if (maxMb && f.size > maxMb * 1024 * 1024) {
      setFileError(`File is too large. The maximum is ${maxMb} MB.`);
      return;
    }
    setFile(f);
  };

  const onRestoreFinished = useCallback(
    (job) => {
      setRestoring(false);
      if (job?.status === "completed") toast.success("Restore completed");
      else toast.error(job?.error || "Restore failed");
      loadStatus();
      loadHistory(1);
      setPage(1);
    },
    [loadStatus, loadHistory],
  );

  const nameMatches = orgName && confirmName.trim() === orgName.trim();
  const canRestore =
    file && nameMatches && rPassword && !restoring && !isActive(restoreJob);

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!canRestore) return;
    setRestoring(true);
    setRestoreError("");
    setRestoreJob(null);
    setUploadPct(0);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("confirm_name", confirmName.trim());
    fd.append("password", rPassword);
    if (rTotp.trim()) fd.append("totp", rTotp.trim());
    try {
      const job = await restoreBackup(fd, (ev) => {
        if (ev.total && mounted.current) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
      });
      if (!mounted.current) return;
      setUploadPct(null);
      setRPassword("");
      setRTotp("");
      setRestoreJob(job);
      if (isActive(job)) poll(job.id, restoreTimer, setRestoreJob, onRestoreFinished);
      else onRestoreFinished(job);
    } catch (err) {
      if (!mounted.current) return;
      setRestoring(false);
      setUploadPct(null);
      setRestoreError(errMsg(err, "Restore could not be started"));
    }
  };

  const days = status?.days_since_last_backup;
  const neverBacked = status && !status.last_backup_at;
  const overdue =
    status && !neverBacked && status.reminder_days && days != null && days >= status.reminder_days;
  const downloadOn = status?.download_enabled !== false;
  const totalPages = Math.max(1, Math.ceil((history.total || 0) / PAGE_LIMIT));

  return (
    <div className="space-y-5 p-1">
      <div>
        <h1 className="text-2xl font-black text-secondary tracking-tight flex items-center gap-3">
          <DatabaseBackup className="text-primary" size={24} />
          Backup &amp; Restore
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Create a backup of your organisation's data and keep a copy on your own computer.
        </p>
      </div>

      {statusError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{statusError}</span>
          <Button variant="outline" onClick={loadStatus}>
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      )}

      {(neverBacked || overdue) && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex gap-3 text-sm text-amber-800">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>
            {neverBacked
              ? "You have never backed up your organisation's data. We recommend creating a backup now."
              : `Your last backup was ${days} day${days === 1 ? "" : "s"} ago. We recommend a backup at least every ${status.reminder_days} days.`}
          </span>
        </div>
      )}

      {/* Status card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div>
                <dt className="text-xs font-bold text-gray-500">Last backup</dt>
                <dd className="text-sm font-bold text-secondary">
                  {status?.last_backup_at ? fmt(status.last_backup_at) : "Never"}
                </dd>
                {days != null && status?.last_backup_at && (
                  <dd className="text-xs text-gray-500">
                    {days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`}
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500">Reminder interval</dt>
                <dd className="text-sm font-bold text-secondary">
                  {status?.reminder_days ? `Every ${status.reminder_days} days` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-500">Server copy kept for</dt>
                <dd className="text-sm font-bold text-secondary">
                  {status?.retention_hours ? `${status.retention_hours} hours` : "—"}
                </dd>
              </div>
            </dl>
            <div className="lg:text-right">
              <Button onClick={handleCreate} disabled={!downloadOn || creating || !status} className="rounded-xl">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <DatabaseBackup size={14} />}
                Backup now
              </Button>
              {!downloadOn && (
                <p className="text-xs text-gray-500 mt-2 max-w-xs lg:ml-auto">
                  Backups are disabled for your organisation. Contact the platform administrator.
                </p>
              )}
            </div>
          </div>
        )}

        {backupJob && (
          <div className="mt-4 border-t border-gray-100 pt-4" aria-live="polite">
            {isActive(backupJob) && (
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <Loader2 size={16} className="animate-spin" />
                <span>
                  Creating backup… <span className="font-bold capitalize">{backupJob.stage || backupJob.status}</span>
                </span>
              </div>
            )}
            {backupJob.status === "failed" && (
              <p className="text-sm text-red-600 font-medium">Backup failed: {backupJob.error || "unknown error"}</p>
            )}
            {backupJob.status === "completed" && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-green-800">
                  <p className="font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Your backup is ready ({fmtSize(backupJob.file_size)})
                  </p>
                  <p className="mt-1">
                    Download it to your computer now. The file is kept on the server only until{" "}
                    <span className="font-bold">{fmt(backupJob.expires_at)}</span>.
                  </p>
                </div>
                <Button onClick={() => setDownloadFor(backupJob)} className="rounded-xl shrink-0">
                  <Download size={14} /> Download to your computer
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-secondary">Backup history</h2>
          <button
            type="button"
            onClick={() => loadHistory(page)}
            aria-label="Refresh history"
            className="p-1.5 text-gray-400 hover:text-secondary"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {historyError ? (
          <p role="alert" className="p-5 text-sm text-red-600">{historyError}</p>
        ) : loadingHistory && history.items.length === 0 ? (
          <div className="p-5 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : history.items.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No backups yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-500">
                <tr>
                  {["Date", "Status", "Size", "Expires", "Details", "Actions"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.items.map((j) => {
                  const canDownload = j.kind === "backup" && j.status === "completed";
                  return (
                    <tr key={j.id} className="align-top">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmt(j.created_at)}
                        {j.requested_by_name && (
                          <div className="text-xs text-gray-400">{j.requested_by_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={j.status} />
                        {j.kind === "restore" && (
                          <div className="text-xs text-gray-500 mt-1">Restore</div>
                        )}
                        {j.meta?.safety && (
                          <div className="text-xs text-gray-500 mt-1 max-w-[180px]">
                            Automatic safety backup before restore
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtSize(j.file_size)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{j.expires_at ? fmt(j.expires_at) : "—"}</td>
                      <td className="px-4 py-3 text-xs text-red-600 max-w-[240px] break-words">{j.error || ""}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {canDownload && (
                            <button
                              type="button"
                              onClick={() => setDownloadFor(j)}
                              aria-label={`Download backup from ${fmt(j.created_at)}`}
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-secondary"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          {j.kind === "backup" && !isActive(j) && (
                            <button
                              type="button"
                              onClick={() => handleDelete(j)}
                              disabled={deletingId === j.id}
                              aria-label={`Delete backup from ${fmt(j.created_at)}`}
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              {deletingId === j.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={history.total}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
            hideIfSinglePage
          />
        </div>
      </div>

      {/* Restore */}
      {status && (
        status.restore_enabled ? (
          <form onSubmit={handleRestore} className="bg-white rounded-xl border border-red-200 shadow-sm p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-black text-secondary flex items-center gap-2">
              <Upload size={16} className="text-red-600" /> Restore from a backup
            </h2>
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-1.5">
              <p className="font-bold flex items-center gap-2">
                <AlertTriangle size={16} /> This is a destructive action
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Restoring replaces <strong>all</strong> current data of your organisation with the contents of the backup.</li>
                <li>A safety backup of your current data is taken automatically before the restore starts.</li>
                <li>Your organisation will be briefly unavailable while the data is switched over.</li>
                <li>Only backups taken from this same organisation are accepted.</li>
              </ul>
            </div>

            <div>
              <label htmlFor="rs-file" className="text-xs font-bold text-gray-500">
                Backup file (.sql.gz{status.max_upload_mb ? `, max ${status.max_upload_mb} MB` : ""})
              </label>
              <input
                id="rs-file"
                type="file"
                accept=".gz,.sql.gz,application/gzip"
                onChange={pickFile}
                disabled={restoring}
                className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-bold"
              />
              {fileError && <p role="alert" className="text-xs text-red-600 mt-1">{fileError}</p>}
              {file && <p className="text-xs text-gray-500 mt-1">{file.name} ({fmtSize(file.size)})</p>}
            </div>

            <div>
              <label htmlFor="rs-name" className="text-xs font-bold text-gray-500">
                Type the organisation name{orgName ? <> (<span className="font-black text-secondary">{orgName}</span>)</> : ""} to confirm
              </label>
              <input
                id="rs-name"
                type="text"
                autoComplete="off"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                disabled={restoring}
                className={inputCls}
              />
              {!orgName && (
                <p className="text-xs text-amber-700 mt-1">Could not determine your organisation name; reload the page and try again.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rs-pw" className="text-xs font-bold text-gray-500">Password</label>
                <input
                  id="rs-pw"
                  type="password"
                  autoComplete="current-password"
                  value={rPassword}
                  onChange={(e) => setRPassword(e.target.value)}
                  disabled={restoring}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="rs-totp" className="text-xs font-bold text-gray-500">
                  Authenticator code (only if you use two-factor)
                </label>
                <input
                  id="rs-totp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={rTotp}
                  onChange={(e) => setRTotp(e.target.value)}
                  disabled={restoring}
                  className={inputCls}
                />
              </div>
            </div>

            {restoreError && <p role="alert" className="text-sm text-red-600 font-medium">{restoreError}</p>}

            {uploadPct != null && (
              <div aria-live="polite">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading…</span>
                  <span>{uploadPct}%</span>
                </div>
                <div
                  className="h-2 rounded-full bg-gray-100 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={uploadPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full bg-primary transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
              </div>
            )}

            {restoreJob && (
              <div aria-live="polite" className="rounded-xl border border-gray-200 p-4 text-sm space-y-2">
                {isActive(restoreJob) && (
                  <p className="flex items-center gap-2 text-blue-700">
                    <Loader2 size={16} className="animate-spin" />
                    Restoring… <span className="font-bold capitalize">{restoreJob.stage || restoreJob.status}</span>
                  </p>
                )}
                {restoreJob.status === "completed" && (
                  <>
                    <p className="flex items-center gap-2 text-green-700 font-bold">
                      <CheckCircle2 size={16} /> Restore completed successfully.
                    </p>
                    <p className="text-gray-600">Please reload the page so you see the restored data.</p>
                    <Button onClick={() => window.location.reload()} className="rounded-xl">
                      <RefreshCw size={14} /> Reload page
                    </Button>
                  </>
                )}
                {restoreJob.status === "failed" && (
                  <p className="text-red-600 font-medium">
                    Restore failed{restoreJob.stage ? ` during "${restoreJob.stage}"` : ""}: {restoreJob.error || "unknown error"}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" variant="danger" disabled={!canRestore} className="rounded-xl">
              {restoring ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Restore organisation data
            </Button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100 p-4">
            Restore is disabled for your organisation. Ask the platform administrator to enable it.
          </p>
        )
      )}

      {downloadFor && (
        <DownloadModal
          job={downloadFor}
          onClose={() => setDownloadFor(null)}
          onDone={() => setDownloadFor(null)}
        />
      )}
    </div>
  );
};

export default AdminBackup;
