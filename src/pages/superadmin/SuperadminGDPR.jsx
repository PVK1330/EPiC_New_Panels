import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  RiShieldCheckLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiAlertLine,
  RiRefreshLine,
  RiFileTextLine,
  RiTimeLine,
} from "react-icons/ri";
import { fetchOrganisations } from "../../services/superadminOrganisation.service";
import {
  exportOrgGdprData,
  purgeOrgGdprData,
  getRetentionReport,
  getOrgRetentionReport,
} from "../../services/gdprApi";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-green-100 text-green-700",
    trial: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Confirm Erasure Modal ────────────────────────────────────────────────────

function EraseModal({ org, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <RiAlertLine size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Confirm GDPR Erasure</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              This will permanently anonymise all PII for{" "}
              <span className="font-semibold text-gray-800">{org.name}</span>. This
              cannot be undone.
            </p>
          </div>
        </div>

        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Reason for erasure (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Account closure request, GDPR Article 17 request"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
        />

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-black hover:bg-red-700 transition disabled:opacity-60"
          >
            {loading ? "Erasing…" : "Confirm Erasure"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Retention Report Panel ───────────────────────────────────────────────────

function RetentionReportPanel() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getRetentionReport();
      setReport(data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load retention report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
            <RiTimeLine size={16} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
            Data Retention Report
          </h3>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
        >
          <RiRefreshLine size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Orgs Checked", value: report.totalOrgsChecked ?? report.orgs?.length ?? "—" },
              { label: "Records Past Retention", value: report.totalExpiredRecords ?? "—" },
              { label: "Retention Policy", value: `${report.retentionPolicyDays ?? 2555}d` },
              { label: "Generated", value: report.reportedAt ? formatDate(report.reportedAt) : "Now" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
                <p className="text-lg font-black text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {report.orgs?.length > 0 ? (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
              {report.orgs.map((org) => (
                <div key={org.orgId} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{org.orgName}</p>
                    <p className="text-xs text-gray-400">
                      {org.expiredCases ?? 0} expired cases · {org.expiredAuditLogs ?? 0} audit logs
                    </p>
                  </div>
                  <StatusBadge status={org.status ?? "suspended"} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-400">
              No organisations have records past the retention deadline.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Org Row ──────────────────────────────────────────────────────────────────

function OrgRow({ org, onExport, onErase, exportingId, eraseTarget }) {
  const isExporting = exportingId === org.id;
  const isErasing = eraseTarget?.id === org.id;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3 hover:bg-gray-50 transition">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{org.name}</p>
          <StatusBadge status={org.status} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{org.primary_email || org.email || "—"}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onExport(org)}
          disabled={isExporting}
          title="Download GDPR data export (JSON)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <RiDownloadLine size={13} />
          {isExporting ? "Exporting…" : "Export Data"}
        </button>

        <button
          onClick={() => onErase(org)}
          disabled={isErasing}
          title="GDPR erasure — anonymise all PII"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
        >
          <RiDeleteBinLine size={13} />
          Erase
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SuperadminGDPR() {
  const [orgs, setOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [search, setSearch] = useState("");
  const [exportingId, setExportingId] = useState(null);
  const [eraseTarget, setEraseTarget] = useState(null);
  const [eraseLoading, setEraseLoading] = useState(false);

  // Load org list
  useEffect(() => {
    setLoadingOrgs(true);
    fetchOrganisations({ limit: 500 })
      .then((res) => {
        const rows = res.data?.data?.organisations ?? res.data?.data ?? [];
        setOrgs(Array.isArray(rows) ? rows : []);
      })
      .catch(() => toast.error("Could not load organisations."))
      .finally(() => setLoadingOrgs(false));
  }, []);

  const handleExport = async (org) => {
    setExportingId(org.id);
    try {
      const res = await exportOrgGdprData(org.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr-export-${org.slug || org.id}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`GDPR export downloaded for ${org.name}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Export failed. Try again.");
    } finally {
      setExportingId(null);
    }
  };

  const handleErase = (org) => setEraseTarget(org);

  const confirmErase = async (reason) => {
    if (!eraseTarget) return;
    setEraseLoading(true);
    try {
      await purgeOrgGdprData(eraseTarget.id, reason);
      toast.success(`PII anonymised for ${eraseTarget.name}`);
      setEraseTarget(null);
      // Refresh org list to reflect suspension
      const res = await fetchOrganisations({ limit: 500 });
      const rows = res.data?.data?.organisations ?? res.data?.data ?? [];
      setOrgs(Array.isArray(rows) ? rows : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Erasure failed. Try again.");
    } finally {
      setEraseLoading(false);
    }
  };

  const filtered = orgs.filter(
    (o) =>
      !search ||
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.primary_email?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
          <RiShieldCheckLine size={22} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">GDPR &amp; Data Privacy</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Subject access requests, data erasure, and retention compliance
          </p>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <RiFileTextLine size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <span className="font-black">UK GDPR compliance.</span> Data exports cover all personal data held
          (Article 15/20). Erasure anonymises PII across users, candidates, sponsored workers, and
          licence forms (Article 17). Retention policy: <strong>7 years</strong> for active orgs
          (UK immigration law); <strong>3 years</strong> for suspended orgs.
        </div>
      </div>

      {/* Retention Report */}
      <RetentionReportPanel />

      {/* Per-Org Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-100">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
            Per-Organisation Actions
          </h3>
          <div className="relative">
            <RiSearchLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organisations…"
              className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
        </div>

        {loadingOrgs ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            {search ? "No organisations match your search." : "No organisations found."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                onExport={handleExport}
                onErase={handleErase}
                exportingId={exportingId}
                eraseTarget={eraseTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Erase confirmation modal */}
      {eraseTarget && (
        <EraseModal
          org={eraseTarget}
          onConfirm={confirmErase}
          onCancel={() => setEraseTarget(null)}
          loading={eraseLoading}
        />
      )}
    </div>
  );
}
