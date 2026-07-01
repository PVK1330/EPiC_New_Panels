import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarOff,
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAbsencesByWorker,
  createAbsenceRecord,
  updateAbsenceRecord,
  deleteAbsenceRecord,
} from "../../services/sponsoredWorkerApi";
import { formatDate } from "../../utils/datetime";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Count working days (Mon–Fri) between two ISO date strings, inclusive.
 * Returns 0 when either date is missing or invalid.
 */
const countWorkingDays = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;

  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

const ABSENCE_TYPES = [
  { value: "annual_leave", label: "Annual Leave" },
  { value: "sick_leave", label: "Sick Leave" },
  { value: "unauthorised", label: "Unauthorised Absence" },
  { value: "other", label: "Other" },
];

const ABSENCE_TYPE_LABELS = Object.fromEntries(
  ABSENCE_TYPES.map(({ value, label }) => [value, label])
);

const BLANK_FORM = {
  absenceType: "",
  startDate: "",
  endDate: "",
  notes: "",
  reportedToSms: false,
  document: null,
};

// ─── sub-components ─────────────────────────────────────────────────────────

const ReportingRequiredBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700 uppercase tracking-wide">
    <AlertTriangle size={10} />
    Reporting Required
  </span>
);

const AbsenceTypeBadge = ({ type }) => {
  const colour =
    type === "unauthorised"
      ? "bg-red-100 text-red-700"
      : type === "sick_leave"
        ? "bg-amber-100 text-amber-700"
        : type === "annual_leave"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${colour}`}>
      {ABSENCE_TYPE_LABELS[type] ?? type}
    </span>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const WorkerAbsenceTab = ({ workerId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Auto-calculated working days from form dates
  const calculatedDays = countWorkingDays(form.startDate, form.endDate);
  const requiresReporting = calculatedDays > 10;

  // ── data ──
  const fetchAbsences = useCallback(async () => {
    if (!workerId) return;
    try {
      setLoading(true);
      const res = await getAbsencesByWorker(workerId);
      setRecords(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load absence records");
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  // ── modal helpers ──
  const openCreate = () => {
    setEditingRecord(null);
    setForm(BLANK_FORM);
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setForm({
      absenceType: record.absenceType ?? "",
      startDate: record.startDate ?? "",
      endDate: record.endDate ?? "",
      notes: record.notes ?? "",
      reportedToSms: record.reportedToSms ?? false,
      document: null, // user must re-upload if they want to replace
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setForm(BLANK_FORM);
  };

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.absenceType || !form.startDate || !form.endDate) {
      toast.error("Absence type, start date and end date are required");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    const fd = new FormData();
    fd.append("workerId", String(workerId));
    fd.append("absenceType", form.absenceType);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    fd.append("totalWorkingDays", String(calculatedDays));
    fd.append("reportedToSms", String(form.reportedToSms));
    if (form.notes) fd.append("notes", form.notes);
    if (form.document) fd.append("document", form.document);

    try {
      setSubmitting(true);
      if (editingRecord) {
        await updateAbsenceRecord(editingRecord.id, fd);
        toast.success("Absence record updated");
      } else {
        await createAbsenceRecord(fd);
        toast.success("Absence record created");
      }
      closeModal();
      fetchAbsences();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save absence record");
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this absence record? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      await deleteAbsenceRecord(id);
      toast.success("Absence record deleted");
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete absence record");
    } finally {
      setDeletingId(null);
    }
  };

  // ── counts for the summary strip ──
  const reportingRequiredCount = records.filter((r) => r.reportingRequired).length;
  const unauthorisedCount = records.filter((r) => r.absenceType === "unauthorised").length;
  const sickLeaveCount = records.filter((r) => r.absenceType === "sick_leave").length;

  // ── render ──
  return (
    <div className="space-y-6">
      {/* Summary strip */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Records", value: records.length, colour: "text-secondary" },
            {
              label: "Reporting Required",
              value: reportingRequiredCount,
              colour: reportingRequiredCount > 0 ? "text-red-600" : "text-secondary",
            },
            { label: "Unauthorised", value: unauthorisedCount, colour: unauthorisedCount > 0 ? "text-red-600" : "text-secondary" },
            { label: "Sick Leave", value: sickLeaveCount, colour: "text-amber-600" },
          ].map(({ label, value, colour }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className={`text-2xl font-black ${colour}`}>{value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reporting-required alert banner */}
      {reportingRequiredCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-700">
              {reportingRequiredCount} absence record{reportingRequiredCount > 1 ? "s" : ""} require reporting to the Home Office
            </p>
            <p className="text-xs font-bold text-red-600 mt-0.5">
              Absences exceeding 10 consecutive working days must be reported to the Home Office via Email.
            </p>
          </div>
        </div>
      )}

      {/* Table header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-secondary uppercase tracking-wide">Absence Records</h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow hover:bg-primary/90 transition"
        >
          <Plus size={14} />
          Add Absence
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white text-center">
          <CalendarOff size={40} className="text-gray-300 mb-3" />
          <p className="text-sm font-black text-secondary">No absence records yet</p>
          <p className="text-xs font-bold text-gray-400 mt-1">
            Track annual leave, sick leave and unauthorised absences here.
          </p>
          <button
            onClick={openCreate}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow hover:bg-primary/90 transition"
          >
            <Plus size={13} /> Add First Record
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Type", "Start Date", "End Date", "Working Days", "Reported via Email", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <AbsenceTypeBadge type={record.absenceType} />
                      {record.reportingRequired && <ReportingRequiredBadge />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-secondary whitespace-nowrap">
                    {record.startDate ? formatDate(record.startDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-secondary whitespace-nowrap">
                    {record.endDate ? formatDate(record.endDate) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-black ${
                        (record.totalWorkingDays ?? 0) > 10 ? "text-red-600" : "text-secondary"
                      }`}
                    >
                      {record.totalWorkingDays ?? 0} days
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {record.reportedToSms ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                        <CheckCircle2 size={10} /> Yes
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {record.attendanceRecordPath ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
                        <FileText size={10} /> Evidence filed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">No evidence</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(record)}
                        className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === record.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes column (mobile-friendly read-out) */}
      {records.some((r) => r.notes) && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Record Notes</p>
          {records
            .filter((r) => r.notes)
            .map((r) => (
              <div key={`note-${r.id}`} className="flex items-start gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <Info size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">
                    {ABSENCE_TYPE_LABELS[r.absenceType] ?? r.absenceType} —{" "}
                    {r.startDate ? formatDate(r.startDate) : "?"} to {r.endDate ? formatDate(r.endDate) : "?"}
                  </p>
                  <p className="text-xs font-bold text-secondary">{r.notes}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-black text-secondary">
                    {editingRecord ? "Edit Absence Record" : "Add Absence Record"}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 mt-0.5">
                    Working days are auto-calculated from the selected dates (Mon–Fri only).
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Absence Type */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Absence Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.absenceType}
                    onChange={(e) => setForm((f) => ({ ...f, absenceType: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">— Select type —</option>
                    {ABSENCE_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Unauthorised absence notice */}
                {form.absenceType === "unauthorised" && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-amber-700">
                      Unauthorised absences exceeding 10 working days must be reported to the Home Office via Email.
                    </p>
                  </div>
                )}

                {/* Date row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate || undefined}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Auto-calculated working days */}
                {form.startDate && form.endDate && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
                      requiresReporting
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {requiresReporting ? (
                      <AlertTriangle size={14} className="text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    )}
                    <p
                      className={`text-xs font-black ${
                        requiresReporting ? "text-red-700" : "text-secondary"
                      }`}
                    >
                      {calculatedDays} working day{calculatedDays !== 1 ? "s" : ""}
                      {requiresReporting && " — Reporting Required (> 10 working days)"}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional context or reason for absence..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                </div>

                {/* Upload attendance record */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                    Upload Attendance Record / Evidence
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition px-4 py-3">
                    <Upload size={16} className="text-gray-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-500">
                      {form.document ? form.document.name : "Click to upload file (PDF, image)"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="sr-only"
                      onChange={(e) => setForm((f) => ({ ...f, document: e.target.files?.[0] ?? null }))}
                    />
                  </label>
                  {editingRecord?.attendanceRecordPath && !form.document && (
                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                      Existing evidence on file — upload a new file to replace it.
                    </p>
                  )}
                </div>

                {/* Reported to SMS toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.reportedToSms}
                      onChange={(e) => setForm((f) => ({ ...f, reportedToSms: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-primary transition" />
                    <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
                  </div>
                  <span className="text-xs font-black text-secondary">Already reported via Email</span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-black shadow hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={13} className="animate-spin" />}
                    {editingRecord ? "Save Changes" : "Create Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerAbsenceTab;
