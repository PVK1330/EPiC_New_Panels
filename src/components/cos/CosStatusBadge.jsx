import React from "react";

const STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function CosStatusBadge({ status, className = "" }) {
  const cls = STYLES[status] || "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${cls} ${className}`}>
      {status || "—"}
    </span>
  );
}
