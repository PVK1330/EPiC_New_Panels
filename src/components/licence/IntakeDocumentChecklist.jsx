/**
 * IntakeDocumentChecklist
 *
 * Used by both the sponsor (upload mode) and the caseworker (review mode).
 *
 * Props:
 *   applicationId  — licence application ID
 *   viewerRole     — "sponsor" | "caseworker"
 *   data           — the intake summary object from the API
 *   onRefresh      — () => void — called after any mutating action
 */

import React, { useState, useRef } from "react";
import {
  CheckCircle2, XCircle, AlertCircle, Clock, Upload,
  FileText, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import {
  uploadIntakeDocument,
  deleteIntakeDocument,
  verifyIntakeDocument,
  rejectIntakeDocument,
  requestIntakeDocumentInfo,
} from "../../services/licenceApi";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:              { label: "Pending",              bg: "bg-gray-100",   text: "text-gray-600",   Icon: Clock },
  uploaded:             { label: "Uploaded",             bg: "bg-blue-100",   text: "text-blue-700",   Icon: Upload },
  verified:             { label: "Verified",             bg: "bg-green-100",  text: "text-green-700",  Icon: CheckCircle2 },
  rejected:             { label: "Rejected",             bg: "bg-red-100",    text: "text-red-700",    Icon: XCircle },
  information_required: { label: "Info Required",        bg: "bg-amber-100",  text: "text-amber-700",  Icon: AlertCircle },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
      <m.Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

// ─── Caseworker review panel ──────────────────────────────────────────────────

function CaseworkerReviewPanel({ doc, applicationId, onRefresh }) {
  const [action, setAction]       = useState(null); // "verify"|"reject"|"info"
  const [reason, setReason]       = useState("");
  const [notes, setNotes]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      if (action === "verify")  await verifyIntakeDocument(applicationId, doc.documentKey, notes);
      if (action === "reject")  await rejectIntakeDocument(applicationId, doc.documentKey, reason);
      if (action === "info")    await requestIntakeDocumentInfo(applicationId, doc.documentKey, notes);
      setAction(null); setReason(""); setNotes("");
      onRefresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  if (doc.status === "pending") return null;

  return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      {!action && (
        <div className="flex gap-2 flex-wrap">
          {doc.status !== "verified" && (
            <button
              onClick={() => setAction("verify")}
              className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 font-medium"
            >
              Verify
            </button>
          )}
          <button
            onClick={() => setAction("reject")}
            className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 font-medium"
          >
            Reject
          </button>
          <button
            onClick={() => setAction("info")}
            className="px-3 py-1 text-xs rounded-md bg-amber-500 text-white hover:bg-amber-600 font-medium"
          >
            Request Info
          </button>
        </div>
      )}

      {action === "verify" && (
        <div className="mt-2 space-y-2">
          <textarea
            placeholder="Verification notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              {loading ? "Saving…" : "Confirm Verify"}
            </button>
            <button onClick={() => { setAction(null); setError(""); }} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {action === "reject" && (
        <div className="mt-2 space-y-2">
          <textarea
            placeholder="Rejection reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading || !reason.trim()} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
              {loading ? "Saving…" : "Confirm Reject"}
            </button>
            <button onClick={() => { setAction(null); setError(""); }} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {action === "info" && (
        <div className="mt-2 space-y-2">
          <textarea
            placeholder="Notes for sponsor (required)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={loading || !notes.trim()} className="px-3 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50">
              {loading ? "Saving…" : "Send Request"}
            </button>
            <button onClick={() => { setAction(null); setError(""); }} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sponsor upload panel ─────────────────────────────────────────────────────

function SponsorUploadPanel({ doc, applicationId, onRefresh }) {
  const inputRef  = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError("");
    try {
      await uploadIntakeDocument(applicationId, doc.documentKey, file);
      onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setLoading(true); setError("");
    try {
      await deleteIntakeDocument(applicationId, doc.documentKey);
      onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Remove failed");
    } finally {
      setLoading(false);
    }
  }

  const canUpload  = ["pending", "rejected", "information_required"].includes(doc.status);
  const canRemove  = ["uploaded"].includes(doc.status);

  return (
    <div className="mt-2">
      {doc.rejectionReason && (
        <p className="text-xs text-red-600 mb-1">
          <span className="font-semibold">Rejected:</span> {doc.rejectionReason}
        </p>
      )}
      {doc.caseworkerNotes && doc.status === "information_required" && (
        <p className="text-xs text-amber-700 mb-1">
          <span className="font-semibold">Note:</span> {doc.caseworkerNotes}
        </p>
      )}
      {error && <p className="text-xs text-red-600 mb-1">{error}</p>}

      <div className="flex gap-2 flex-wrap items-center">
        {canUpload && (
          <label className="cursor-pointer">
            <input ref={inputRef} type="file" className="hidden" onChange={handleFile} disabled={loading} />
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
              <Upload className="w-3 h-3" />
              {loading ? "Uploading…" : doc.fileName ? "Replace" : "Upload"}
            </span>
          </label>
        )}
        {canRemove && (
          <button
            onClick={handleRemove}
            disabled={loading}
            className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Remove
          </button>
        )}
        {doc.fileName && (
          <span className="text-xs text-gray-500 truncate max-w-xs">{doc.fileName}</span>
        )}
      </div>
    </div>
  );
}

// ─── Document row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc, applicationId, viewerRole, onRefresh }) {
  const [expanded, setExpanded] = useState(
    ["rejected", "information_required"].includes(doc.status),
  );

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div
        className="flex items-start justify-between gap-2 cursor-pointer"
        onClick={() => setExpanded((x) => !x)}
      >
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 leading-tight">{doc.documentName}</p>
            {!doc.isRequired && (
              <span className="text-xs text-gray-400 italic">Conditional — not currently required</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={doc.status} />
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-2">
          {viewerRole === "sponsor" && (
            <SponsorUploadPanel doc={doc} applicationId={applicationId} onRefresh={onRefresh} />
          )}
          {viewerRole === "caseworker" && (
            <CaseworkerReviewPanel doc={doc} applicationId={applicationId} onRefresh={onRefresh} />
          )}
          {doc.verifiedAt && (
            <p className="text-xs text-green-600 mt-1">
              Verified {new Date(doc.verifiedAt).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Condition toggle (sponsor only) ─────────────────────────────────────────

const CONDITION_LABELS = {
  foodBusiness:          "Food Business",
  alcoholBusiness:       "Alcohol / Licensed Premises",
  careBusiness:          "Care / Health Business",
  tupeTransfer:          "TUPE Transfer of Staff",
  candidateIdentified:   "Candidate Already Identified",
  candidateNotIdentified:"No Candidate Identified Yet",
};

function ConditionToggles({ conditions, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(CONDITION_LABELS).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={!!conditions[key]}
            onChange={(e) => onChange({ ...conditions, [key]: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm text-gray-700">{label}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function IntakeDocumentChecklist({ applicationId, viewerRole = "sponsor", data, onRefresh }) {
  const { mandatory = [], conditionalByType = {}, stats = {}, form } = data || {};
  const [conditionsOpen, setConditionsOpen] = useState(false);

  const conditionalEntries = Object.entries(conditionalByType);
  const hasConditional = conditionalEntries.length > 0;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Required",    value: stats.total    ?? 0, color: "text-gray-700" },
          { label: "Uploaded",          value: stats.uploaded ?? 0, color: "text-blue-600" },
          { label: "Verified",          value: stats.verified ?? 0, color: "text-green-600" },
          { label: "Needs Attention",   value: (stats.rejected ?? 0) + (stats.pending ?? 0), color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Condition toggles (sponsor only) */}
      {viewerRole === "sponsor" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setConditionsOpen((x) => !x)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Additional Document Requirements</span>
            {conditionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {conditionsOpen && form?.conditions && (
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">
                Toggle the categories that apply to your business to add the relevant document requirements.
              </p>
              <ConditionToggles
                conditions={form.conditions}
                onChange={async (newConditions) => {
                  try {
                    const { updateSponsorIntakeForm } = await import("../../services/licenceApi");
                    await updateSponsorIntakeForm(applicationId, { conditions: newConditions });
                    onRefresh();
                  } catch {}
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Mandatory documents */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Mandatory Documents ({mandatory.length})</h4>
        <div className="space-y-2">
          {mandatory.map((doc) => (
            <DocumentRow key={doc.documentKey} doc={doc} applicationId={applicationId} viewerRole={viewerRole} onRefresh={onRefresh} />
          ))}
        </div>
      </div>

      {/* Conditional documents by category */}
      {hasConditional && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditional Documents</h4>
          <div className="space-y-4">
            {conditionalEntries.map(([conditionType, docs]) => (
              <div key={conditionType}>
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                  {conditionType.replace(/_/g, " ")}
                </p>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <DocumentRow key={doc.documentKey} doc={doc} applicationId={applicationId} viewerRole={viewerRole} onRefresh={onRefresh} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {mandatory.length === 0 && !hasConditional && (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Document checklist is being prepared…</p>
          <button onClick={onRefresh} className="mt-2 text-xs text-indigo-600 hover:underline inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}
