import React from "react";
import { normalizeStatus } from "../../services/complianceReviewApi";

const STYLES = {
  Draft: "bg-gray-100 text-gray-500",
  Submitted: "bg-amber-100 text-amber-700",
  "Under Review": "bg-blue-100 text-blue-700",
  "Information Requested": "bg-orange-100 text-orange-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function ComplianceStatusBadge({ status, className = "" }) {
  const label = normalizeStatus(status);
  const cls = STYLES[label] || "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${cls} ${className}`}>
      {label}
    </span>
  );
}
