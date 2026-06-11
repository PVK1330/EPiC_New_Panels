import React from "react";
import { Send, Eye, CheckCircle2, XCircle, MessageSquare, RotateCcw } from "lucide-react";
import { formatDateLong, formatTime } from "../../utils/datetime";
import { normalizeStatus } from "../../services/complianceReviewApi";

const fullName = (u) =>
  u ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email : null;

const ACTION_META = {
  submit: { icon: Send, ring: "bg-blue-50 text-blue-500", label: "Submitted" },
  create_draft: { icon: Send, ring: "bg-gray-50 text-gray-500", label: "Created Draft" },
  review: { icon: Eye, ring: "bg-indigo-50 text-indigo-500", label: "Under Review" },
  approve: { icon: CheckCircle2, ring: "bg-emerald-50 text-emerald-600", label: "Approved" },
  reject: { icon: XCircle, ring: "bg-red-50 text-red-600", label: "Rejected" },
  request_info: { icon: MessageSquare, ring: "bg-orange-50 text-orange-600", label: "Information Requested" },
  respond: { icon: RotateCcw, ring: "bg-blue-50 text-blue-500", label: "Sponsor Responded" },
  resubmit: { icon: RotateCcw, ring: "bg-blue-50 text-blue-500", label: "Re-submitted" },
};

/**
 * Review audit timeline. Handles both engines' history rows:
 *  - generic: { action, previousStatus, newStatus, notes, created_at, actor }
 *  - documents: { action, previousStatus, newStatus, notes, created_at|reviewedAt, reviewer }
 */
export default function ComplianceTimeline({ history = [] }) {
  if (!history.length) {
    return <p className="text-xs font-bold text-gray-400 text-center py-6">No review history yet.</p>;
  }

  return (
    <div className="space-y-1">
      {history.map((h, i) => {
        const meta = ACTION_META[h.action] || { icon: Eye, ring: "bg-gray-50 text-gray-500", label: h.action };
        const Icon = meta.icon;
        const actor = fullName(h.actor || h.reviewer);
        const at = h.created_at || h.reviewedAt;
        const last = i === history.length - 1;
        return (
          <div key={h.id || i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.ring}`}>
                <Icon size={16} />
              </div>
              {!last && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className={`flex-1 ${last ? "" : "pb-5"}`}>
              <p className="text-sm font-black text-secondary">
                {meta.label}
                {h.previousStatus && h.newStatus && (
                  <span className="ml-2 text-[10px] font-bold text-gray-400">
                    {normalizeStatus(h.previousStatus)} → {normalizeStatus(h.newStatus)}
                  </span>
                )}
              </p>
              {actor && <p className="text-xs font-bold text-gray-500 mt-0.5">by {actor}</p>}
              {at && (
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                  {formatDateLong(at, { month: "short" })} · {formatTime(at)}
                </p>
              )}
              {h.notes && (
                <div className="mt-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs font-bold text-gray-600 italic leading-relaxed">"{h.notes}"</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
