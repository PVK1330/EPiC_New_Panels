import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  RiDatabase2Line,
  RiDownloadLine,
  RiDeleteBinLine,
  RiAlertLine,
  RiRefreshLine,
  RiUploadCloud2Line,
  RiTimeLine,
  RiLoader4Line,
} from "react-icons/ri";
import Modal from "../../components/Modal";
import {
  listBackups,
  listBackupOrganisations,
  createBackup,
  getBackupJob,
  downloadBackup,
  deleteBackup,
  restoreBackup,
  getBackupSettings,
  saveBackupSettings,
  readableError,
} from "../../services/superadminBackup.service";

// Client-side upload cap (server enforces its own limit as well).
const MAX_UPLOAD_MB = 2048;
const POLL_MS = 3000;
const PAGE_SIZE = 10;

const isActive = (j) => j?.status === "pending" || j?.status === "running";

function fmtDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function fmtSize(bytes) {
  const n = Number(bytes);
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {(status === "running" || status === "pending") && (
        <RiLoader4Line size={11} className="animate-spin" aria-hidden="true" />
      )}
      {status}
    </span>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:bg-gray-50 disabled:text-gray-400";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-black hover:bg-secondary-dark transition disabled:opacity-50 disabled:cursor-not-allowed";
const ghostBtn =
  "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed";
const dangerBtn =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-black hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed";
const cardCls = "bg-white border border-gray-100 rounded-2xl shadow-sm";

function ErrorBox({ message, onRetry }) {
  return (
    <div role="alert" className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
      <RiAlertLine size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-black underline">
          Retry
        </button>
      )}
    </div>
  );
}

// ── Re-auth modal (password / TOTP) used for downloads ───────────────────────

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
      const name = await downloadBackup(job.id, { password, totp: totp.trim() });
      toast.success(`Downloaded ${name}`);
      onDone();
    } catch (err) {
      setError(err.message || "Download failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title="Confirm your identity to download"
      titleId="backup-download-title"
    >
      <form onSubmit={submit} className="p-4 sm:p-6 space-y-4">
        <p className="text-sm text-gray-500">
          Downloading <span className="font-semibold text-gray-800 break-all">{job.file_name || `backup #${job.id}`}</span>{" "}
          saves the file to this computer. Enter your password to continue.
        </p>
        <div>
          <label htmlFor="dl-password" className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
          <input id="dl-password" type="password" autoComplete="current-password" required value={password}
            onChange={(e) => setPassword(e.target.value)} className={inputCls} disabled={busy} />
        </div>
        <div>
          <label htmlFor="dl-totp" className="block text-xs font-semibold text-gray-600 mb-1.5">
            Authenticator code (only if 2FA is enabled)
          </label>
          <input id="dl-totp" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={totp}
            onChange={(e) => setTotp(e.target.value)} className={inputCls} disabled={busy} />
        </div>
        {error && <ErrorBox message={error} />}
        <div className="flex gap-3 justify-end">
          <button type="button" className={ghostBtn} onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className={primaryBtn} disabled={busy || !password}>
            <RiDownloadLine size={16} /> {busy ? "Preparing download…" : "Download"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Backups tab ──────────────────────────────────────────────────────────────

function BackupsTab({ orgs, orgsLoading, orgsError, reloadOrgs }) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ organisation_id: "", kind: "", status: "" });
  const [creating, setCreating] = useState("");
  const [dlJob, setDlJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const params = { page, limit: PAGE_SIZE };
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params[k] = v;
        });
        const res = await listBackups(params);
        if (!mounted.current) return;
        setData({ items: res?.items ?? [], total: res?.total ?? 0, page: res?.page ?? page, limit: res?.limit ?? PAGE_SIZE });
        setError("");
      } catch (e) {
        const msg = await readableError(e, "Could not load backups.");
        if (mounted.current && !silent) setError(msg);
      } finally {
        if (mounted.current && !silent) setLoading(false);
      }
    },
    [page, filters],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while any job is pending/running; the timer is cleared on unmount / when idle.
  const hasActive = data.items.some(isActive);
  useEffect(() => {
    if (!hasActive) return undefined;
    const t = setInterval(async () => {
      const active = data.items.filter(isActive);
      const updated = await Promise.all(active.map((j) => getBackupJob(j.id).catch(() => null)));
      if (!mounted.current) return;
      const byId = {};
      updated.forEach((j) => {
        if (j) byId[j.id] = j;
      });
      setData((d) => ({ ...d, items: d.items.map((j) => byId[j.id] ?? j) }));
      Object.values(byId).forEach((j) => {
        if (isActive(j)) return;
        if (j.status === "completed") toast.success(`Backup finished (${j.organisation_name || j.scope}).`);
        else if (j.status === "failed") toast.error(`Backup failed: ${j.error || "unknown error"}`);
        reloadOrgs();
      });
    }, POLL_MS);
    return () => clearInterval(t);
  }, [hasActive, data.items, reloadOrgs]);

  const start = async (key, payload, label) => {
    setCreating(key);
    try {
      await createBackup(payload);
      toast.success(`${label} started.`);
      setPage(1);
      await load(true);
    } catch (e) {
      toast.error(await readableError(e, "Could not start backup."));
    } finally {
      setCreating("");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteBackup(deleteJob.id);
      toast.success("Backup deleted.");
      setDeleteJob(null);
      await load(true);
    } catch (e) {
      toast.error(await readableError(e, "Delete failed."));
    } finally {
      setDeleting(false);
    }
  };

  const setFilter = (k, v) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v }));
  };
  const totalPages = Math.max(1, Math.ceil(data.total / (data.limit || PAGE_SIZE)));

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-start gap-3 text-sm text-amber-800">
        <RiTimeLine size={18} className="shrink-0 mt-0.5" />
        <span>
          Backup files are kept on the server only until their expiry time (see the Expires column).{" "}
          <strong>Download each backup to your computer now</strong> to keep a permanent copy.
        </span>
      </div>

      <div className={`${cardCls} p-4 sm:p-5`}>
        <h2 className="text-sm font-black text-gray-900 mb-3">Create a backup</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" className={primaryBtn} disabled={!!creating}
            onClick={() => start("platform", { scope: "platform" }, "Platform database backup")}>
            <RiDatabase2Line size={16} /> {creating === "platform" ? "Starting…" : "Backup platform database"}
          </button>
          <button type="button" className={ghostBtn} disabled={!!creating}
            onClick={() => start("all", { scope: "all" }, "All-organisations backup")}>
            <RiDatabase2Line size={16} /> {creating === "all" ? "Starting…" : "Backup all organisations (zip)"}
          </button>
        </div>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900">Organisation databases</h2>
          <button type="button" className={ghostBtn} onClick={reloadOrgs} aria-label="Refresh organisations">
            <RiRefreshLine size={16} />
          </button>
        </div>
        {orgsError ? (
          <div className="p-4"><ErrorBox message={orgsError} onRetry={reloadOrgs} /></div>
        ) : orgsLoading ? (
          <p className="p-6 text-sm text-gray-400">Loading organisations…</p>
        ) : orgs.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No organisations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-2.5">Organisation</th>
                  <th className="px-4 py-2.5">Database</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Last backup</th>
                  <th className="px-4 py-2.5">Last restore</th>
                  <th className="px-4 py-2.5">Self-restore</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orgs.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">{o.name}</td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{o.database_name || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{o.status || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(o.last_backup_at)}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(o.last_restore_at)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{o.restore_enabled === false ? "Disabled" : "Enabled"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" className={ghostBtn} disabled={!!creating}
                        aria-label={`Backup ${o.name}`}
                        onClick={() => start(`org-${o.id}`, { scope: "organisation", organisation_id: o.id }, `Backup of ${o.name}`)}>
                        {creating === `org-${o.id}` ? "Starting…" : "Backup"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 space-y-3">
          <h2 className="text-sm font-black text-gray-900">Backup &amp; restore history</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="f-org" className="sr-only">Filter by organisation</label>
              <select id="f-org" className={inputCls} value={filters.organisation_id} onChange={(e) => setFilter("organisation_id", e.target.value)}>
                <option value="">All organisations</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-kind" className="sr-only">Filter by kind</label>
              <select id="f-kind" className={inputCls} value={filters.kind} onChange={(e) => setFilter("kind", e.target.value)}>
                <option value="">All kinds</option>
                <option value="backup">Backup</option>
                <option value="restore">Restore</option>
              </select>
            </div>
            <div>
              <label htmlFor="f-status" className="sr-only">Filter by status</label>
              <select id="f-status" className={inputCls} value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="">All statuses</option>
                {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        {error ? (
          <div className="p-4"><ErrorBox message={error} onRetry={() => load()} /></div>
        ) : loading ? (
          <p className="p-6 text-sm text-gray-400">Loading history…</p>
        ) : data.items.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No backups or restores yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-2.5">Kind</th>
                  <th className="px-4 py-2.5">Scope</th>
                  <th className="px-4 py-2.5">Organisation</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Size</th>
                  <th className="px-4 py-2.5">Created</th>
                  <th className="px-4 py-2.5">Expires</th>
                  <th className="px-4 py-2.5">Error</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((j) => (
                  <tr key={j.id}>
                    <td className="px-4 py-2.5 capitalize">{j.kind}</td>
                    <td className="px-4 py-2.5 capitalize">{j.scope}</td>
                    <td className="px-4 py-2.5">{j.organisation_name || "—"}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={j.status} />
                      {isActive(j) && j.stage && <div className="text-[11px] text-gray-400 mt-0.5">{j.stage}</div>}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{fmtSize(j.file_size)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-500">{fmtDate(j.created_at)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-500">{j.kind === "backup" ? fmtDate(j.expires_at) : "—"}</td>
                    <td className="px-4 py-2.5 text-red-600 max-w-xs truncate" title={j.error || ""}>{j.error || ""}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2">
                        {j.kind === "backup" && j.status === "completed" && (
                          <button type="button" className={ghostBtn} onClick={() => setDlJob(j)} aria-label={`Download backup ${j.id}`}>
                            <RiDownloadLine size={16} /> Download
                          </button>
                        )}
                        {!isActive(j) && (
                          <button type="button" className={ghostBtn} onClick={() => setDeleteJob(j)} aria-label={`Delete job ${j.id}`}>
                            <RiDeleteBinLine size={16} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
          <span>{data.total} total</span>
          <div className="flex items-center gap-2">
            <button type="button" className={ghostBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" className={ghostBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {dlJob && <DownloadModal job={dlJob} onClose={() => setDlJob(null)} onDone={() => setDlJob(null)} />}
      <Modal
        open={!!deleteJob}
        onClose={deleting ? () => {} : () => setDeleteJob(null)}
        title="Delete backup"
        titleId="backup-delete-title"
      >
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Delete <span className="font-semibold break-all">{deleteJob?.file_name || `job #${deleteJob?.id}`}</span>? The file is
            removed from the server and cannot be recovered.
          </p>
          <div className="flex gap-3 justify-end">
            <button type="button" className={ghostBtn} onClick={() => setDeleteJob(null)} disabled={deleting}>Cancel</button>
            <button type="button" className={dangerBtn} onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Restore tab ──────────────────────────────────────────────────────────────

function RestoreTab({ orgs, reloadOrgs }) {
  const [scope, setScope] = useState("organisation");
  const [orgId, setOrgId] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [uploadPct, setUploadPct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  const fileRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const org = orgs.find((o) => String(o.id) === String(orgId));
  const expected = scope === "organisation" ? org?.name || "" : "platform";
  const polling = isActive(job);
  const busy = uploading || polling;

  // Poll restore job.
  const jobId = job?.id;
  useEffect(() => {
    if (!jobId || !polling) return undefined;
    const t = setInterval(async () => {
      try {
        const j = await getBackupJob(jobId);
        if (!mounted.current) return;
        setJob(j);
        if (!isActive(j)) {
          if (j.status === "completed") {
            toast.success("Restore completed.");
            reloadOrgs();
          } else toast.error(`Restore failed: ${j.error || "unknown error"}`);
        }
      } catch {
        /* transient; keep polling */
      }
    }, POLL_MS);
    return () => clearInterval(t);
  }, [jobId, polling, reloadOrgs]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    setFileError("");
    setFile(null);
    if (!f) return;
    if (!/\.sql\.gz$/i.test(f.name)) {
      setFileError("Only .sql.gz backup files are accepted.");
      return;
    }
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setFileError(`File is too large (${fmtSize(f.size)}). Maximum is ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const confirmOk = expected !== "" && confirmName === expected;
  const canSubmit = !busy && file && password && confirmOk && (scope === "platform" || orgId);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setJob(null);
    setUploading(true);
    setUploadPct(0);
    const fd = new FormData();
    fd.append("scope", scope);
    if (scope === "organisation") fd.append("organisation_id", orgId);
    fd.append("confirm_name", confirmName);
    fd.append("password", password);
    if (totp.trim()) fd.append("totp", totp.trim());
    fd.append("file", file);
    try {
      const res = await restoreBackup(fd, (ev) => {
        if (ev.total) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
      });
      if (!mounted.current) return;
      setJob(res?.job ?? res);
      setPassword("");
      setTotp("");
      toast.success("Upload complete. Restore started.");
    } catch (err) {
      const msg = await readableError(err, "Restore request failed.");
      if (mounted.current) setError(msg);
    } finally {
      if (mounted.current) {
        setUploading(false);
        setUploadPct(null);
      }
    }
  };

  const reset = () => {
    setJob(null);
    setFile(null);
    setConfirmName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={submit} className="space-y-6" aria-busy={busy}>
      <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 text-sm text-red-800 space-y-2">
        <div className="flex items-center gap-2 font-black"><RiAlertLine size={18} /> Destructive operation</div>
        {scope === "organisation" ? (
          <ul className="list-disc pl-5 space-y-1">
            <li>Restoring <strong>replaces all current data</strong> of the selected organisation with the contents of the uploaded file.</li>
            <li>A safety backup of the current data is taken automatically before the restore begins.</li>
            <li>Users of that organisation may be unable to work while the restore runs.</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            <li>A platform restore is loaded into a <strong>new database only</strong>; the live platform database is not touched.</li>
            <li>Switching the platform over to the restored database is a manual step done by an engineer.</li>
          </ul>
        )}
      </div>

      <fieldset disabled={busy} className={`${cardCls} p-4 sm:p-5 space-y-4`}>
        <legend className="sr-only">Restore settings</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="r-scope" className="block text-xs font-semibold text-gray-600 mb-1.5">Scope</label>
            <select id="r-scope" className={inputCls} value={scope} onChange={(e) => { setScope(e.target.value); setConfirmName(""); }}>
              <option value="organisation">Organisation database</option>
              <option value="platform">Platform database (new DB only)</option>
            </select>
          </div>
          {scope === "organisation" && (
            <div>
              <label htmlFor="r-org" className="block text-xs font-semibold text-gray-600 mb-1.5">Organisation</label>
              <select id="r-org" className={inputCls} value={orgId} onChange={(e) => { setOrgId(e.target.value); setConfirmName(""); }}>
                <option value="">Select organisation…</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}{o.restore_enabled === false ? " (self-restore off)" : ""}
                  </option>
                ))}
              </select>
              {org && (
                <p className="text-xs text-gray-500 mt-1">
                  Organisation self-restore is <strong>{org.restore_enabled === false ? "disabled" : "enabled"}</strong>.
                  {org.restore_enabled === false && " As superadmin you can still restore (override)."}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="r-file" className="block text-xs font-semibold text-gray-600 mb-1.5">
            Backup file (.sql.gz, max {MAX_UPLOAD_MB} MB)
          </label>
          <input id="r-file" ref={fileRef} type="file" accept=".gz,.sql.gz,application/gzip" onChange={pickFile}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold" />
          {fileError && <p role="alert" className="text-xs text-red-600 mt-1">{fileError}</p>}
          {file && <p className="text-xs text-gray-500 mt-1 break-all">{file.name} · {fmtSize(file.size)}</p>}
        </div>

        <div>
          <label htmlFor="r-confirm" className="block text-xs font-semibold text-gray-600 mb-1.5">
            {scope === "organisation"
              ? <>Type the organisation name <span className="font-black text-gray-900">{org?.name || "(select one above)"}</span> to confirm</>
              : <>Type <span className="font-black text-gray-900">platform</span> to confirm</>}
          </label>
          <input id="r-confirm" className={inputCls} autoComplete="off" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="r-pass" className="block text-xs font-semibold text-gray-600 mb-1.5">Your password</label>
            <input id="r-pass" type="password" autoComplete="current-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label htmlFor="r-totp" className="block text-xs font-semibold text-gray-600 mb-1.5">Authenticator code (if 2FA enabled)</label>
            <input id="r-totp" inputMode="numeric" autoComplete="one-time-code" maxLength={8} className={inputCls} value={totp} onChange={(e) => setTotp(e.target.value)} />
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button type="submit" className={dangerBtn} disabled={!canSubmit}>
          <RiUploadCloud2Line size={18} /> {uploading ? "Uploading…" : "Upload & restore"}
        </button>
      </fieldset>

      {uploadPct !== null && (
        <div className={`${cardCls} p-4`} aria-live="polite">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5"><span>Uploading file</span><span>{uploadPct}%</span></div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={uploadPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-secondary transition-all" style={{ width: `${uploadPct}%` }} />
          </div>
        </div>
      )}

      {job && (
        <div className={`${cardCls} p-4 sm:p-5 space-y-2`} aria-live="polite">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-gray-900">Restore job #{job.id}</h2>
            <StatusBadge status={job.status} />
          </div>
          {job.stage && <p className="text-sm text-gray-600">Stage: <span className="font-semibold">{job.stage}</span></p>}
          {job.status === "completed" && (
            <p className="text-sm text-green-700 font-semibold">
              Restore completed successfully.
              {job.scope === "platform" && " The data was loaded into a new database; switch-over is a manual step."}
            </p>
          )}
          {job.status === "failed" && <ErrorBox message={job.error || "Restore failed."} />}
          {!isActive(job) && <button type="button" className={ghostBtn} onClick={reset}>Start another restore</button>}
        </div>
      )}
    </form>
  );
}

// ── Settings tab ─────────────────────────────────────────────────────────────

const triToStr = (v) => (v === null || v === undefined ? "" : String(v));
const strToTri = (s) => (s === "" ? null : s === "true");

function Toggle({ id, label, checked, onChange, hint }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-gray-800">{label}</label>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <input id={id} type="checkbox" role="switch" checked={!!checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-[var(--color-secondary)]" />
    </div>
  );
}

function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [global, setGlobal] = useState(null);
  const [defaults, setDefaults] = useState({});
  const [overrides, setOverrides] = useState([]);

  const apply = (d) => {
    setGlobal(d.global || {});
    setDefaults(d.env_defaults || {});
    setOverrides(d.organisations || []);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      apply(await getBackupSettings());
    } catch (e) {
      setError(await readableError(e, "Could not load settings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setG = (k, v) => setGlobal((g) => ({ ...g, [k]: v }));
  const setO = (id, k, v) => setOverrides((rows) => rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)));

  const save = async (e) => {
    e.preventDefault();
    const days = Number(global.reminder_days);
    if (!Number.isInteger(days) || days < 1 || days > 90) return toast.error("Reminder days must be between 1 and 90.");
    const hours = Number(global.retention_hours);
    if (!Number.isFinite(hours) || hours < 1) return toast.error("Retention hours must be at least 1.");
    for (const r of overrides) {
      if (r.reminder_days !== null && r.reminder_days !== "" && r.reminder_days !== undefined) {
        const n = Number(r.reminder_days);
        if (!Number.isInteger(n) || n < 1 || n > 90) return toast.error(`${r.name}: reminder days must be 1–90 or blank.`);
      }
    }
    setSaving(true);
    try {
      const res = await saveBackupSettings({
        global: { ...global, reminder_days: days, retention_hours: hours },
        organisation_overrides: overrides.map((r) => ({
          organisation_id: r.id,
          reminder_days: r.reminder_days === "" || r.reminder_days == null ? null : Number(r.reminder_days),
          download_enabled: r.download_enabled ?? null,
          restore_enabled: r.restore_enabled ?? null,
        })),
      });
      if (res?.global) apply(res);
      toast.success("Backup settings saved.");
    } catch (err) {
      toast.error(await readableError(err, "Could not save settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading settings…</p>;
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!global) return null;

  return (
    <form onSubmit={save} className="space-y-6">
      <div className={`${cardCls} p-4 sm:p-5 space-y-4`}>
        <h2 className="text-sm font-black text-gray-900">Global defaults</h2>
        <Toggle id="s-rem" label="Backup reminders enabled" checked={global.reminder_enabled} onChange={(v) => setG("reminder_enabled", v)}
          hint={`Default from server: ${triToStr(defaults.reminder_enabled) || "—"}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="s-days" className="block text-xs font-semibold text-gray-600 mb-1.5">Reminder every (days, 1–90)</label>
            <input id="s-days" type="number" min={1} max={90} className={inputCls} value={global.reminder_days ?? ""} onChange={(e) => setG("reminder_days", e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Default from server: {triToStr(defaults.reminder_days) || "—"}</p>
          </div>
          <div>
            <label htmlFor="s-ret" className="block text-xs font-semibold text-gray-600 mb-1.5">Keep backup files on server (hours)</label>
            <input id="s-ret" type="number" min={1} className={inputCls} value={global.retention_hours ?? ""} onChange={(e) => setG("retention_hours", e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Default from server: {triToStr(defaults.retention_hours) || "—"}</p>
          </div>
        </div>
        <Toggle id="s-dl" label="Organisation admins can download backups" checked={global.org_download_enabled} onChange={(v) => setG("org_download_enabled", v)}
          hint={`Default from server: ${triToStr(defaults.org_download_enabled) || "—"}`} />
        <Toggle id="s-rs" label="Organisation admins can restore" checked={global.org_restore_enabled} onChange={(v) => setG("org_restore_enabled", v)}
          hint={`Default from server: ${triToStr(defaults.org_restore_enabled) || "—"}`} />
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900">Per-organisation overrides</h2>
          <p className="text-xs text-gray-400">&ldquo;Inherit&rdquo; uses the global value above.</p>
        </div>
        {overrides.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No organisations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-2.5">Organisation</th>
                  <th className="px-4 py-2.5">Reminder days</th>
                  <th className="px-4 py-2.5">Download</th>
                  <th className="px-4 py-2.5">Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {overrides.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">{r.name}</td>
                    <td className="px-4 py-2.5">
                      <input type="number" min={1} max={90} placeholder="inherit" aria-label={`Reminder days for ${r.name}`}
                        className={`${inputCls} w-28`} value={r.reminder_days ?? ""} onChange={(e) => setO(r.id, "reminder_days", e.target.value === "" ? null : e.target.value)} />
                    </td>
                    {["download_enabled", "restore_enabled"].map((k) => (
                      <td key={k} className="px-4 py-2.5">
                        <select aria-label={`${k === "download_enabled" ? "Download" : "Restore"} for ${r.name}`} className={`${inputCls} w-32`}
                          value={triToStr(r[k])} onChange={(e) => setO(r.id, k, strToTri(e.target.value))}>
                          <option value="">Inherit</option>
                          <option value="true">Allowed</option>
                          <option value="false">Blocked</option>
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button type="submit" className={primaryBtn} disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "backups", label: "Backups" },
  { key: "restore", label: "Restore" },
  { key: "settings", label: "Settings" },
];

export default function SuperadminBackups() {
  const [tab, setTab] = useState("backups");
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState("");
  const mounted = useRef(true);

  const reloadOrgs = useCallback(async () => {
    try {
      const rows = await listBackupOrganisations();
      if (!mounted.current) return;
      setOrgs(Array.isArray(rows) ? rows : []);
      setOrgsError("");
    } catch (e) {
      const msg = await readableError(e, "Could not load organisations.");
      if (mounted.current) setOrgsError(msg);
    } finally {
      if (mounted.current) setOrgsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    reloadOrgs();
    return () => {
      mounted.current = false;
    };
  }, [reloadOrgs]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <RiDatabase2Line size={22} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Database Backups</h1>
          <p className="text-sm text-gray-400 mt-0.5">Back up, download and restore platform and organisation databases</p>
        </div>
      </div>

      <div role="tablist" aria-label="Backup sections" className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-selected={tab === t.key} aria-controls={`panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-black whitespace-nowrap border-b-2 -mb-px transition ${tab === t.key ? "border-secondary text-secondary" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "backups" && <BackupsTab orgs={orgs} orgsLoading={orgsLoading} orgsError={orgsError} reloadOrgs={reloadOrgs} />}
        {tab === "restore" && <RestoreTab orgs={orgs} reloadOrgs={reloadOrgs} />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
