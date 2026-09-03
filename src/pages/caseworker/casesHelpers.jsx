import { useState } from "react";
import { formatDateLong, formatDateTime as fmtDateTime } from "../../utils/datetime";

export const PAGE_SIZE = 7;

export const REASSIGN_REASONS = [
  "Caseworker unavailable / on leave",
  "Conflict of interest",
  "Specialist expertise required",
  "Workload rebalancing",
  "Escalation to senior caseworker",
  "Other",
];

export const STATUS_CHIPS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "due_soon", label: "Due soon" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

export const VISA_OPTIONS = [
  "All visa types",
  "Tier 2",
  "Skilled Worker",
  "Graduate",
  "Intra-Co",
  "Health & Care",
];

export const PRIORITY_OPTIONS = ["All priorities", "Urgent", "High", "Medium", "Low"];

export const NEW_CASE_VISA = VISA_OPTIONS.filter((v) => v !== "All visa types");

export const CASE_STATUS_EDIT = [
  { value: "on_track", label: "On track" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
];

export const CASE_PAYMENT_EDIT = [
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "outstanding", label: "Outstanding" },
];

export const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const priorityBadge = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export const emptyNewCaseForm = () => ({
  candidateName: "",
  candidateId: "",
  nationality: "",
  jobTitle: "",
  department: "",
  businessName: "",
  businessId: "",
  sponsorId: "",
  visaTypeId: "",
  petitionTypeId: "",
  priority: "medium",
  targetSubmissionDate: "",
  lcaNumber: "",
  receiptNumber: "",
  assignedCaseworkerIds: [],
  salaryOffered: 0,
  totalAmount: 0,
  paidAmount: 0,
  notes: "",
});

export const caseToEditForm = (c) => ({
  candidate:
    c.candidate?.first_name && c.candidate?.last_name
      ? `${c.candidate.first_name} ${c.candidate.last_name}`
      : c.candidate || "",
  business:
    c.business?.sponsor?.first_name && c.business?.sponsor?.last_name
      ? `${c.business.sponsor.first_name} ${c.business.sponsor.last_name}`
      : c.business || "",
  visa: c.visaType?.name || c.visa || "",
  status: c.status || c.overview?.status || "",
  target:
    c.target ||
    c.targetSubmissionDate ||
    c.overview?.targetSubmissionDate ||
    "",
  priority: c.priority || c.overview?.priority || "",
  payment: c.payment || "",
  candidateId: c.candidateId || c.candidate?.id || "",
  sponsorId: c.sponsorId || c.business?.sponsor?.id || "",
  businessId: c.businessId || c.business?.businessId || "",
  visaTypeId: c.visaTypeId || c.visaType?.id || "",
  petitionTypeId: c.petitionTypeId || c.petitionType?.id || "",
  lcaNumber: c.lcaNumber || c.additional?.lcaNumber || "",
  receiptNumber: c.receiptNumber || c.additional?.receiptNumber || "",
  assignedCaseworkerIds: c.assignedcaseworkerId
    ? Array.isArray(c.assignedcaseworkerId)
      ? c.assignedcaseworkerId
      : [c.assignedcaseworkerId]
    : [],
  salaryOffered: c.salaryOffered || c.financial?.salaryOffered || "",
  totalAmount: c.totalAmount || c.financial?.totalFee || "",
  paidAmount: c.paidAmount || c.financial?.totalPaid || "",
  notes: c.notes || c.additional?.notes || "",
  nationality: c.nationality || c.candidate?.nationality || "",
  jobTitle: c.jobTitle || c.additional?.jobTitle || "",
  department:
    c.departmentId || c.department?.id || c.additional?.departmentId || "",
});

export const emptyReassignForm = () => ({
  caseworkerIds: [],
  reasonPreset: "",
  reasonCustom: "",
});

export function formatTarget(iso) {
  return formatDateLong(iso + "T12:00:00", { month: "short" });
}

export function formatDateTime(date) {
  return fmtDateTime(date);
}

export function badgeStatus(status) {
  const m = {
    on_track: "bg-emerald-50 text-emerald-800 border-emerald-200",
    due_soon: "bg-amber-50 text-amber-800 border-amber-200",
    overdue: "bg-red-50 text-red-800 border-red-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const labels = {
    on_track: "On track",
    due_soon: "Due soon",
    overdue: "Overdue",
    completed: "Completed",
  };
  return {
    className: m[status] || m.on_track,
    label: labels[status] || status,
  };
}

export function badgePriority(p) {
  const m = {
    urgent: "bg-red-50 text-red-800 border-red-200",
    high: "bg-red-50 text-red-800 border-red-200",
    medium: "bg-amber-50 text-amber-800 border-amber-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return m[p] || m.low;
}

export function badgePayment(p) {
  const m = {
    paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
    partial: "bg-amber-50 text-amber-800 border-amber-200",
    outstanding: "bg-red-50 text-red-800 border-red-200",
  };
  const labels = {
    paid: "Paid",
    partial: "Partial",
    outstanding: "Outstanding",
  };
  return { className: m[p], label: labels[p] };
}

export function badgeVisa(v) {
  const isPurple = v === "Health & Care";
  return isPurple
    ? "bg-violet-50 text-violet-800 border-violet-200"
    : "bg-sky-50 text-sky-800 border-sky-200";
}

export function loadColor(load) {
  if (load >= 10) return "bg-red-50 text-red-700 border-red-200";
  if (load >= 5) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-green-50 text-green-700 border-green-200";
}

export const priorityLabel = (p) => {
  return p.charAt(0).toUpperCase() + p.slice(1);
};

export function CaseworkerMultiSelect({ options, value, onChange, error }) {
  const [open, setOpen] = useState(false);

  const toggleId = (id) => {
    // BUG-017: one caseworker per case — selecting one replaces the previous.
    onChange(value.includes(id) ? [] : [id]);
  };

  const summaryText = value.length
    ? value
        .map((id) => {
          const o = options.find((x) => x.id === id);
          return o ? `${o.name} (${o.id})` : id;
        })
        .join(" · ")
    : "";

  return (
    <div className="relative md:col-span-2 space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Caseworker Assignment <span className="text-red-500">*</span>
        <span className="text-gray-400 font-normal ml-1">(one caseworker)</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-left text-sm bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary ${
          error ? "border-red-400" : ""
        }`}
      >
        <span
          className={
            value.length ? "text-gray-900 font-semibold" : "text-gray-400"
          }
        >
          {value.length ? summaryText : "Choose a caseworker…"}
        </span>
        <span className="text-xs font-bold text-gray-400 tabular-nums shrink-0">
          {value.length}/1
        </span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-[70] left-0 right-0 mt-1 border border-gray-200 rounded-xl bg-white shadow-xl py-1 max-h-60 overflow-y-auto">
            {options.map((o) => {
              const checked = value.includes(o.id);
              const disabled = false; // single-select: picking another replaces it
              return (
                <label
                  key={o.id}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm border-b border-gray-50 last:border-0 ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:bg-secondary/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-secondary rounded border-gray-300"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleId(o.id)}
                  />
                  <span className="font-semibold text-gray-800">{o.name}</span>
                  <span className="text-xs font-mono text-gray-500 ml-auto">
                    {o.id}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
      {value.length > 0 && (
        <p className="text-xs text-gray-600 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
          <span className="font-bold text-secondary">Assigned:</span>{" "}
          {value
            .map((id) => {
              const o = options.find((x) => x.id === id);
              return o ? `${o.name} — ${o.id}` : id;
            })
            .join(" · ")}
        </p>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
