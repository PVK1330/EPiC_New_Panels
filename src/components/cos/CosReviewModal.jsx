import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, AlertTriangle, MessageSquare } from "lucide-react";

const fullName = (u) =>
  u ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email : "Sponsor";

/**
 * Approve / Reject confirmation dialog for a CoS request.
 * - Approve: editable approved amount (defaults to requested) + optional notes.
 * - Reject: review notes (reason) required.
 *
 * `onSubmit(payload)` receives { approvedAmount?, reviewNotes? }.
 */
export default function CosReviewModal({ open, request, action, onClose, onSubmit, busy }) {
  const isApprove = action === "approve";
  const isReject = action === "reject";
  const isRequestInfo = action === "requestInfo";
  const [approvedAmount, setApprovedAmount] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    if (open && request) {
      setApprovedAmount(isApprove ? String(request.requestedAmount ?? "") : "");
      setReviewNotes("");
    }
  }, [open, request, isApprove]);

  if (!open || !request) return null;

  const approveInvalid = isApprove && (approvedAmount === "" || Number(approvedAmount) <= 0);
  const rejectInvalid = isReject && !reviewNotes.trim();
  const requestInfoInvalid = isRequestInfo && !reviewNotes.trim();
  const disabled = approveInvalid || rejectInvalid || requestInfoInvalid;

  const submit = () => {
    if (disabled) return;
    if (isApprove) {
      onSubmit({ approvedAmount: Number(approvedAmount), reviewNotes: reviewNotes.trim() || undefined });
    } else {
      onSubmit({ reviewNotes: reviewNotes.trim() });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-secondary">
              {isApprove ? "Confirm Approval" : isReject ? "Confirm Rejection" : "Request Information"}
            </h3>
            <button onClick={onClose} disabled={busy} className="text-gray-400 hover:text-secondary">
              <X size={24} />
            </button>
          </div>

          {/* Request summary */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-6 space-y-1">
            <p className="text-sm font-black text-secondary">{fullName(request.sponsor)}</p>
            <p className="text-xs font-bold text-gray-500">
              {request.visaType} · #REQ-{request.id}
            </p>
            <p className="text-xs font-bold text-gray-500">
              Requested: <span className="text-primary">{request.requestedAmount} CoS</span>
            </p>
          </div>

          <div className="space-y-5">
            {isApprove && (
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                  Approved Amount *
                </label>
                <input
                  type="number"
                  min={1}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                  placeholder="Number of CoS to approve"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                {isRequestInfo ? "Information Required" : "Review Notes"}{" "}
                {(isReject || isRequestInfo) && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-secondary outline-none resize-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                placeholder={
                  isApprove
                    ? "Optional notes for the sponsor…"
                    : isReject
                    ? "Reason for rejection (required)…"
                    : "Describe what additional information is needed from the sponsor…"
                }
              />
            </div>

            {isReject && (
              <div className="flex items-start gap-2 text-amber-700">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold">
                  This will reject the request and notify the sponsor. This cannot be undone.
                </p>
              </div>
            )}
            {isRequestInfo && (
              <div className="flex items-start gap-2 text-blue-700 bg-blue-50 rounded-2xl p-3">
                <MessageSquare size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold">
                  The sponsor will be notified by email and in-app to provide the information above. The request will remain Under Review.
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                onClick={submit}
                disabled={busy || disabled}
                className={`flex-[2] py-4 rounded-2xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  isApprove
                    ? "bg-emerald-500 shadow-emerald-100"
                    : isReject
                    ? "bg-red-500 shadow-red-100"
                    : "bg-blue-500 shadow-blue-100"
                }`}
              >
                {busy ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isApprove ? (
                  <><Check size={18} /> Confirm Approval</>
                ) : isReject ? (
                  <><Check size={18} /> Confirm Rejection</>
                ) : (
                  <><MessageSquare size={18} /> Send Request</>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={busy}
                className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
