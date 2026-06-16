import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, AlertTriangle } from "lucide-react";

const TITLES = {
  approve: "Confirm Approval",
  reject: "Confirm Rejection",
  "request-info": "Request Information",
};
const VERB = {
  approve: "Approve",
  reject: "Reject",
  "request-info": "Request Information",
};
const NOTES_REQUIRED = { approve: false, reject: true, "request-info": true };

/**
 * Reviewer action dialog for compliance items.
 * action: 'approve' | 'reject' | 'request-info'.
 * onSubmit({ notes }).
 */
export default function ComplianceReviewModal({ open, action, itemTitle, onClose, onSubmit, busy }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) setNotes("");
  }, [open, action]);

  if (!open) return null;
  const required = NOTES_REQUIRED[action];
  const invalid = required && !notes.trim();
  const danger = action === "reject";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-secondary">{TITLES[action]}</h3>
            <button onClick={onClose} disabled={busy} className="text-gray-400 hover:text-secondary">
              <X size={24} />
            </button>
          </div>
          {itemTitle && <p className="text-xs font-bold text-gray-400 mb-6">{itemTitle}</p>}

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                {action === "request-info" ? "What information is required" : "Review Notes"}{" "}
                {required && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-secondary outline-none resize-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                placeholder={
                  action === "approve"
                    ? "Optional notes for the sponsor…"
                    : action === "reject"
                    ? "Reason for rejection (required)…"
                    : "Describe the information / evidence required (required)…"
                }
              />
            </div>

            {danger && (
              <div className="flex items-start gap-2 text-amber-700">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold">This will reject the item and notify the sponsor.</p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => !invalid && onSubmit({ notes: notes.trim() || undefined })}
                disabled={busy || invalid}
                className={`flex-[2] py-4 rounded-2xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === "approve"
                    ? "bg-emerald-500 shadow-emerald-100"
                    : action === "reject"
                    ? "bg-red-500 shadow-red-100"
                    : "bg-orange-500 shadow-orange-100"
                } shadow-lg`}
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> {VERB[action]}</>}
              </button>
              <button onClick={onClose} disabled={busy} className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
