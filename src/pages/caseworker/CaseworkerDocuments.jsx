import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Upload, X } from "lucide-react";

const CASE_OPTIONS = [
  { id: "#C-2401", label: "#C-2401 — Ahmed Al-Rashid" },
  { id: "#C-2398", label: "#C-2398 — Priya Sharma" },
  { id: "#C-2391", label: "#C-2391 — Carlos Mendes" },
];

const DOC_TYPES = [
  "Passport",
  "Right to work",
  "English language certificate",
  "Certificate of sponsorship",
  "Job offer letter",
  "Bank statement",
  "Other",
];

const MISSING_ROWS = [
  {
    caseId: "#C-2401",
    candidate: "Ahmed Al-Rashid",
    summary: "1 missing",
    detail: "English Lang cert",
    tone: "red",
    reminder: "3 Apr 2026",
  },
  {
    caseId: "#C-2391",
    candidate: "Carlos Mendes",
    summary: "3 missing",
    detail: "Bank statement, P60, reference",
    tone: "red",
    reminder: "1 Apr 2026",
  },
  {
    caseId: "#C-2380",
    candidate: "Fatima Al-Zahra",
    summary: "2 missing",
    detail: "IELTS cert, ID photos",
    tone: "amber",
    reminder: "5 Apr 2026",
  },
];

const REVIEW_ROWS = [
  { title: "Right to work proof", caseId: "#C-2401", candidate: "Ahmed Al-Rashid" },
  { title: "Sponsor CoS document", caseId: "#C-2398", candidate: "Priya Sharma" },
  { title: "Compliance certificate", caseId: "#C-2385", candidate: "Ivan Petrov" },
];

const ALL_DOCS = [
  { name: "Passport — Ahmed Al-Rashid", type: "Identity", typeTone: "blue", caseId: "#C-2401", status: "Approved", statTone: "green", by: "Ahmed Al-Rashid", uploaded: "1 Apr 2026", expiry: "Jun 2028", action: "View" },
  { name: "Right to work — Ahmed Al-Rashid", type: "Legal", typeTone: "gray", caseId: "#C-2401", status: "Under review", statTone: "blue", by: "Ahmed Al-Rashid", uploaded: "3 Apr 2026", expiry: "—", action: "Review" },
  { name: "Certificate of sponsorship", type: "Sponsor", typeTone: "blue", caseId: "#C-2401", status: "Approved", statTone: "green", by: "TechCorp HR", uploaded: "28 Mar 2026", expiry: "Apr 2027", action: "View" },
  { name: "Passport — Priya Sharma", type: "Identity", typeTone: "blue", caseId: "#C-2398", status: "Approved", statTone: "green", by: "Priya Sharma", uploaded: "25 Mar 2026", expiry: "Sep 2030", action: "View" },
];

function typeBadge(tone) {
  const m = {
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return m[tone] || m.blue;
}

function statBadge(tone) {
  const m = {
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
  };
  return m[tone] || m.blue;
}

export default function CaseworkerDocuments() {
  const location = useLocation();
  const missingRef = useRef(null);
  const [caseId, setCaseId] = useState(CASE_OPTIONS[0].id);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [rejectModal, setRejectModal] = useState({ isOpen: false, doc: null, note: "" });

  const isMissingRoute = location.pathname.includes("/documents/missing");

  useEffect(() => {
    if (isMissingRoute && missingRef.current) {
      missingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isMissingRoute]);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
          Document management
        </h1>
        <p className="text-sm font-bold text-gray-600 mt-1">
          Upload, review, and track all case documents
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section>
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3">
            Upload centre
          </p>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-sm font-black text-gray-900">Upload document</h2>
            </div>
            <div className="p-5 space-y-5">
              <button
                type="button"
                onClick={() =>
                  window.alert("Demo: open file picker when storage is connected.")
                }
                className="w-full rounded-xl border-2 border-dashed border-gray-200 py-10 px-4 text-center hover:border-secondary/40 hover:bg-secondary/5 transition-colors"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3">
                  <Upload size={22} className="text-secondary" />
                </div>
                <p className="text-sm font-black text-gray-900">Drop files here or click to browse</p>
                <p className="text-xs font-bold text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
              </button>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Case ID
                </label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                >
                  {CASE_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Document type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this document…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-y min-h-[72px]"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  window.alert(`Demo upload: ${docType} for ${caseId}`)
                }
                className="w-full rounded-xl bg-secondary py-3 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
              >
                Upload document
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div ref={missingRef}>
            <p className="text-[11px] font-black uppercase tracking-wider text-red-600 mb-3">
              Missing documents ({MISSING_ROWS.length} cases)
            </p>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {["Case", "Missing docs", "Last reminder", "Action"].map((h) => (
                        <th
                          key={h}
                          className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MISSING_ROWS.map((r) => (
                      <tr key={r.caseId} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-black text-secondary">{r.caseId}</span>
                          <p className="text-sm font-bold text-gray-900">{r.candidate}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-black ${
                              r.tone === "red" ? "text-red-600" : "text-amber-600"
                            }`}
                          >
                            {r.summary}
                          </span>
                          <p className="text-[11px] font-bold text-gray-500">{r.detail}</p>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-500">{r.reminder}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-black text-gray-700 hover:bg-gray-50"
                          >
                            Send reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3">
              Review panel
            </p>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <h2 className="text-sm font-black text-gray-900">Pending review</h2>
                <span className="text-[11px] font-black rounded-full bg-secondary/15 text-secondary px-2.5 py-0.5">
                  {REVIEW_ROWS.length} docs
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {REVIEW_ROWS.map((r) => (
                  <li key={r.title} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <FileText size={18} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-sm font-bold text-gray-900">{r.title}</p>
                      <p className="text-[11px] font-bold text-gray-500">
                        {r.caseId} · {r.candidate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-800"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModal({ isOpen: true, doc: r, note: "" })}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-800"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section>
        <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3">
          All documents
        </p>
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    "Document name",
                    "Type",
                    "Case",
                    "Status",
                    "Uploaded by",
                    "Upload date",
                    "Expiry",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ALL_DOCS.map((d) => (
                  <tr key={d.name} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 text-sm font-bold text-gray-900">{d.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${typeBadge(d.typeTone)}`}
                      >
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-black text-secondary">{d.caseId}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${statBadge(d.statTone)}`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-700">{d.by}</td>
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">{d.uploaded}</td>
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">{d.expiry}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600 hover:border-secondary/40"
                      >
                        {d.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">Reject document</h3>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, doc: null, note: "" })}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {rejectModal.doc && (
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-bold text-gray-900">{rejectModal.doc.title}</p>
                  <p className="text-[11px] font-bold text-gray-500">
                    {rejectModal.doc.caseId} · {rejectModal.doc.candidate}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  value={rejectModal.note}
                  onChange={(e) => setRejectModal({ ...rejectModal, note: e.target.value })}
                  rows={4}
                  placeholder="Explain why this document is being rejected…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 resize-y min-h-[96px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, doc: null, note: "" })}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Demo: Rejected ${rejectModal.doc?.title} with note: "${rejectModal.note}"`);
                    setRejectModal({ isOpen: false, doc: null, note: "" });
                  }}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-red-600/20 hover:bg-red-600/90"
                >
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
