import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getRtwRecords,
  createRtwRecord,
  fetchRtwDocument,
} from "../../services/rightToWorkApi";
import { getSponsoredWorkers } from "../../services/sponsoredWorkerApi";
import DatePicker from "../../components/DatePicker";

const STATUS_COLOURS = {
  valid: "bg-emerald-50 text-emerald-700",
  expired: "bg-red-50 text-red-700",
  pending_followup: "bg-amber-50 text-amber-700",
};

function StatusBadge({ status }) {
  const cls = STATUS_COLOURS[status] ?? "bg-gray-100 text-gray-600";
  const Icon =
    status === "valid" ? CheckCircle2 : status === "expired" ? AlertTriangle : Clock;
  const label = status === "pending_followup" ? "pending" : status;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${cls}`}>
      <Icon size={10} /> {label}
    </span>
  );
}

const EMPTY_FORM = {
  workerId: "",
  initialCheckDate: "",
  referenceNumber: "",
  followUpCheckDate: "",
  status: "valid",
  document: null,
};

export default function RightToWork() {
  const [records, setRecords] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewingId, setViewingId] = useState(null);

  // Evidence documents are stored privately (not web-served). Fetch through the
  // authenticated API and open the returned file in a new tab.
  const viewDocument = async (record) => {
    // Open the tab synchronously (inside the click) so it isn't popup-blocked.
    const tab = window.open("", "_blank", "noopener,noreferrer");
    setViewingId(record.id);
    try {
      const res = await fetchRtwDocument(record.id);
      const blob = new Blob([res.data], {
        type: res.headers?.["content-type"] || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      if (tab) tab.close();
      toast.error(err?.response?.data?.message || "Could not open the document.");
    } finally {
      setViewingId(null);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getRtwRecords(), getSponsoredWorkers()])
      .then(([rtwRes, workerRes]) => {
        setRecords(rtwRes.data?.data ?? []);
        setWorkers(workerRes.data?.data ?? workerRes.data ?? []);
      })
      .catch(() => toast.error("Failed to load RTW records."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleField = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workerId || !form.initialCheckDate) {
      toast.error("Worker and Initial Check Date are required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("workerId", form.workerId);
      fd.append("initialCheckDate", form.initialCheckDate);
      fd.append("status", form.status);
      if (form.referenceNumber) fd.append("referenceNumber", form.referenceNumber);
      if (form.followUpCheckDate) fd.append("followUpCheckDate", form.followUpCheckDate);
      if (form.document) fd.append("document", form.document);

      await createRtwRecord(fd);
      toast.success("RTW record created.");
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create RTW record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-primary" size={24} />
            Right to Work Records
          </h1>
          <p className="text-sm font-bold text-primary mt-0.5">
            Section H — Maintain and evidence Right to Work checks for all sponsored workers.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow hover:bg-primary/90 transition"
        >
          <Plus size={14} /> Add RTW Check
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700 font-medium">
        <strong>UKVI requirement:</strong> You must conduct an initial Right to Work check before employment begins and keep a copy of the evidence. Follow-up checks are required for time-limited permissions.
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            <ShieldCheck size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-black text-secondary">No RTW records yet</p>
            <p className="text-xs mt-1">Add your first Right to Work check to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Worker", "Initial Check Date", "Reference No.", "Follow-up Date", "Status", "Document"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => {
                  const workerName = r.worker
                    ? `${r.worker.workerFirstName ?? ""} ${r.worker.workerLastName ?? ""}`.trim()
                    : `Worker #${r.workerId}`;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-secondary whitespace-nowrap">{workerName}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.initialCheckDate ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.referenceNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.followUpCheckDate ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        {r.documentPath ? (
                          <button
                            type="button"
                            onClick={() => viewDocument(r)}
                            disabled={viewingId === r.id}
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline disabled:opacity-50"
                          >
                            {viewingId === r.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <FileText size={12} />
                            )}
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-secondary">Add RTW Check</h3>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="text-gray-400 hover:text-gray-700 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Worker select */}
              <div>
                <label className="block text-xs font-black text-secondary mb-1">Worker <span className="text-red-500">*</span></label>
                <select
                  name="workerId"
                  value={form.workerId}
                  onChange={handleField}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select worker…</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.workerFirstName} {w.workerLastName} — {w.workerCosNumber ?? `#${w.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial check date */}
              <div>
                <label className="block text-xs font-black text-secondary mb-1">Initial Check Date <span className="text-red-500">*</span></label>
                <DatePicker
                  name="initialCheckDate"
                  value={form.initialCheckDate}
                  onChange={handleField}
                  placeholder="Select initial check date"
                  required
                />
              </div>

              {/* Reference number */}
              <div>
                <label className="block text-xs font-black text-secondary mb-1">Reference Number</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={form.referenceNumber}
                  onChange={handleField}
                  placeholder="e.g. RTW-2026-001"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Follow-up date */}
              <div>
                <label className="block text-xs font-black text-secondary mb-1">Follow-up Check Date</label>
                <DatePicker
                  name="followUpCheckDate"
                  value={form.followUpCheckDate}
                  onChange={handleField}
                  placeholder="Select follow-up check date"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-black text-secondary mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleField}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="valid">Valid</option>
                  <option value="pending_followup">Pending Follow-up</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Document upload */}
              <div>
                <label className="block text-xs font-black text-secondary mb-1">Evidence Document</label>
                <input
                  type="file"
                  name="document"
                  onChange={handleField}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save RTW Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
