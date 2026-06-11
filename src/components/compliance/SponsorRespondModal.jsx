import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Send, Loader2, FileText } from "lucide-react";

/**
 * Sponsor "Respond to information request" dialog.
 * Lets the sponsor add a note and (optionally) attach additional evidence, then
 * re-submits the item for review. onSubmit({ notes, evidence }).
 */
export default function SponsorRespondModal({ open, itemTitle, requiredEvidence = false, onClose, onSubmit, busy }) {
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) { setNotes(""); setEvidence(null); }
  }, [open]);

  if (!open) return null;
  const invalid = (requiredEvidence && !evidence) || (!notes.trim() && !evidence);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-secondary">Respond to Review</h3>
            <button onClick={onClose} disabled={busy} className="text-gray-400 hover:text-secondary"><X size={24} /></button>
          </div>
          {itemTitle && <p className="text-xs font-bold text-gray-400 mb-6">{itemTitle}</p>}

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Your Response</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-secondary outline-none resize-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20"
                placeholder="Add a note for the reviewer…"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                Additional Evidence {requiredEvidence && <span className="text-red-500">*</span>}
              </label>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => setEvidence(e.target.files?.[0] || null)} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-primary/30 transition-all"
              >
                {evidence ? <FileText size={18} className="text-primary" /> : <Upload size={18} className="text-gray-400" />}
                <span className="text-sm font-bold text-gray-600 truncate">
                  {evidence ? evidence.name : "Click to attach a file (optional)"}
                </span>
              </button>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => !invalid && onSubmit({ notes: notes.trim() || undefined, evidence })}
                disabled={busy || invalid}
                className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Submit Response</>}
              </button>
              <button onClick={onClose} disabled={busy} className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl">Cancel</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
