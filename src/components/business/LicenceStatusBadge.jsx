import React from "react";

/**
 * Sponsor licence status badge. Covers the full licence workflow:
 * Pending → Under Review → Information Requested → Rejected → Active
 * (plus Suspended / Expired).
 */
const STATUS_STYLES = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Information Requested": "bg-orange-50 text-orange-700 border-orange-200",
  "Government Processing": "bg-violet-50 text-violet-700 border-violet-200",
  "Decision Pending": "bg-orange-100 text-orange-700 border-orange-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Suspended: "bg-red-50 text-red-700 border-red-200",
  Expired: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function LicenceStatusBadge({ status, className = "" }) {
  if (!status) return null;
  const cls = STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cls} ${className}`}
      title={`Licence status: ${status}`}
    >
      {status}
    </span>
  );
}
