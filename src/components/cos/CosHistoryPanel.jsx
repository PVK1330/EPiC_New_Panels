import React from "react";
import { Send, UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { formatDateLong, formatTime } from "../../utils/datetime";

const fullName = (u) =>
  u ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email : null;

/**
 * Audit / review history for a single CoS request, derived from the record's own
 * fields (submitted → assigned → decision). No extra endpoint required.
 */
export default function CosHistoryPanel({ request }) {
  if (!request) return null;

  const assigned =
    Array.isArray(request.assignedCaseworkerIds) && request.assignedCaseworkerIds.length > 0;
  const reviewer = fullName(request.reviewer);

  const events = [
    {
      icon: Send,
      ring: "bg-blue-50 text-blue-500",
      title: "Request Submitted",
      detail: `${request.requestedAmount} CoS requested for ${request.visaType}`,
      at: request.created_at,
      notes: request.reason,
    },
  ];

  if (assigned) {
    events.push({
      icon: UserCheck,
      ring: "bg-indigo-50 text-indigo-500",
      title: "Assigned for Review",
      detail: "Moved to Under Review",
      at: request.updated_at,
    });
  }

  if (request.status === "Approved") {
    events.push({
      icon: CheckCircle2,
      ring: "bg-emerald-50 text-emerald-600",
      title: "Approved",
      detail: `${request.approvedAmount ?? request.requestedAmount} CoS approved${reviewer ? ` by ${reviewer}` : ""}`,
      at: request.reviewedAt,
      notes: request.reviewNotes,
    });
  } else if (request.status === "Rejected") {
    events.push({
      icon: XCircle,
      ring: "bg-red-50 text-red-600",
      title: "Rejected",
      detail: reviewer ? `Rejected by ${reviewer}` : "Rejected",
      at: request.reviewedAt,
      notes: request.reviewNotes,
    });
  }

  return (
    <div className="space-y-1">
      {events.map((e, i) => {
        const Icon = e.icon;
        const last = i === events.length - 1;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${e.ring}`}>
                <Icon size={16} />
              </div>
              {!last && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className={`flex-1 ${last ? "" : "pb-5"}`}>
              <p className="text-sm font-black text-secondary">{e.title}</p>
              {e.detail && <p className="text-xs font-bold text-gray-500 mt-0.5">{e.detail}</p>}
              {e.at && (
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                  {formatDateLong(e.at, { month: "short" })} · {formatTime(e.at)}
                </p>
              )}
              {e.notes && (
                <div className="mt-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs font-bold text-gray-600 italic leading-relaxed">"{e.notes}"</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
