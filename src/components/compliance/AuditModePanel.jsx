/**
 * AuditModePanel — Section G: Audit Preparation Mode
 *
 * Renders an "Enter Audit Mode" button. When clicked it fetches a JSON summary
 * from the backend, displays key statistics, and offers three export buttons:
 *   • Download PDF
 *   • Download Excel
 *   • Download ZIP
 *
 * Usage (drop anywhere in a business / caseworker page):
 *   import AuditModePanel from "../../components/compliance/AuditModePanel";
 *   <AuditModePanel />
 */

import React, { useState, useCallback } from "react";
import {
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Archive,
  Users,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Loader2,
  X,
} from "lucide-react";
import {
  generateAuditPack,
  downloadAuditPdf,
  downloadAuditExcel,
  downloadAuditZip,
} from "../../services/auditModeApi";

// ---------------------------------------------------------------------------
// Small helper — trigger a browser file download from a Blob response
// ---------------------------------------------------------------------------
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Stat card sub-component
// ---------------------------------------------------------------------------
function StatCard({ icon: Icon, label, value, colour }) {
  const colourMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  const cls = colourMap[colour] || colourMap.blue;

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${cls}`}>
      <Icon size={20} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-70 truncate">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export button sub-component
// ---------------------------------------------------------------------------
function ExportButton({ icon: Icon, label, onClick, loading, colour }) {
  const colourMap = {
    blue: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500",
    green: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500",
    purple: "bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500",
  };
  const cls = colourMap[colour] || colourMap.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white
        transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed ${cls}
      `}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Icon size={16} />
      )}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AuditModePanel() {
  const [mode, setMode] = useState("idle"); // idle | loading | ready | error
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
    zip: false,
  });

  // Enter Audit Mode — fetch summary from the backend
  const handleEnter = useCallback(async () => {
    setMode("loading");
    setErrorMsg(null);
    try {
      const res = await generateAuditPack();
      setSummary(res.data?.data ?? null);
      setMode("ready");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate audit pack. Please try again.";
      setErrorMsg(msg);
      setMode("error");
    }
  }, []);

  // Generic blob download handler
  const handleExport = useCallback(async (type) => {
    const loaders = { pdf: downloadAuditPdf, excel: downloadAuditExcel, zip: downloadAuditZip };
    const extensions = { pdf: "pdf", excel: "xlsx", zip: "zip" };
    const mimes = {
      pdf: "application/pdf",
      excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      zip: "application/zip",
    };

    setExportLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await loaders[type]();
      const blob = new Blob([res.data], { type: mimes[type] });
      const dateStamp = new Date().toISOString().slice(0, 10);
      triggerBlobDownload(blob, `Audit_Pack_${dateStamp}.${extensions[type]}`);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to download ${type.toUpperCase()}. Please try again.`;
      setErrorMsg(msg);
    } finally {
      setExportLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  const handleClose = useCallback(() => {
    setMode("idle");
    setSummary(null);
    setErrorMsg(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Render: IDLE
  // ---------------------------------------------------------------------------
  if (mode === "idle") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-800">
              Audit Preparation Mode — Section G
            </h2>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Compile a UKVI-ready audit pack covering your complete worker list,
              required documents, Right to Work records, absence logs, and SMS
              reporting history. Export as PDF, Excel, or a combined ZIP archive.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={handleEnter}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <ShieldCheck size={16} />
            Enter Audit Mode
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: LOADING
  // ---------------------------------------------------------------------------
  if (mode === "loading") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm font-semibold">
            Compiling audit data — this may take a moment…
          </span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: ERROR
  // ---------------------------------------------------------------------------
  if (mode === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">Audit pack failed</p>
            <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleEnter}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: READY — summary + export buttons
  // ---------------------------------------------------------------------------
  const s = summary?.summary || {};
  const companyName = summary?.companyName || "Your Organisation";

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white leading-none">
              Audit Mode — Section G
            </h2>
            <p className="text-xs text-blue-200 mt-0.5 leading-none">{companyName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-blue-200 hover:text-white transition-colors focus:outline-none"
          aria-label="Exit Audit Mode"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Users}
            label="Sponsored Workers"
            value={s.totalWorkers ?? "—"}
            colour="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Document Completeness"
            value={s.docCompletenessPct != null ? `${s.docCompletenessPct}%` : "—"}
            colour={
              s.docCompletenessPct >= 80
                ? "green"
                : s.docCompletenessPct >= 50
                ? "amber"
                : "red"
            }
          />
          <StatCard
            icon={AlertTriangle}
            label="Overdue Reports"
            value={s.overdueChanges ?? "—"}
            colour={s.overdueChanges > 0 ? "red" : "green"}
          />
          <StatCard
            icon={ClipboardList}
            label="RTW Checks"
            value={s.rtwCount ?? "—"}
            colour="blue"
          />
        </div>

        {/* Informational note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          <strong>UKVI guidance:</strong> Keep this audit pack available for any
          compliance visit. Ensure all document statuses are &lsquo;approved&rsquo;
          before a UKVI inspection. Overdue SMS change reports must be submitted
          within 20 working days of the triggering event.
        </div>

        {/* Export buttons */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Export Audit Pack
          </p>
          <div className="flex flex-wrap gap-3">
            <ExportButton
              icon={FileText}
              label="Download PDF"
              colour="blue"
              loading={exportLoading.pdf}
              onClick={() => handleExport("pdf")}
            />
            <ExportButton
              icon={FileSpreadsheet}
              label="Download Excel"
              colour="green"
              loading={exportLoading.excel}
              onClick={() => handleExport("excel")}
            />
            <ExportButton
              icon={Archive}
              label="Download ZIP"
              colour="purple"
              loading={exportLoading.zip}
              onClick={() => handleExport("zip")}
            />
          </div>
          {errorMsg && mode === "ready" && (
            <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
          )}
        </div>

        {/* Worker count footer */}
        {Array.isArray(summary?.workers) && summary.workers.length > 0 && (
          <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
            Pack covers{" "}
            <strong className="text-slate-600">{summary.workers.length}</strong>{" "}
            worker{summary.workers.length !== 1 ? "s" : ""},{" "}
            <strong className="text-slate-600">{summary.rtwRecords?.length ?? 0}</strong> RTW
            check{(summary.rtwRecords?.length ?? 0) !== 1 ? "s" : ""}, and{" "}
            <strong className="text-slate-600">{summary.changeRequests?.length ?? 0}</strong>{" "}
            change request{(summary.changeRequests?.length ?? 0) !== 1 ? "s" : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
