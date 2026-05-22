import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import Button from "../Button";

const CaseDetailNotes = ({ notes, loading, onAdd, onDelete }) => {
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!body.trim()) {
      setErr("Note cannot be empty");
      return;
    }
    setSaving(true);
    if (onAdd) {
      await onAdd(body);
    }
    setBody("");
    setErr("");
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6"
    >
      <h3 className="text-sm font-black text-secondary mb-2 flex items-center gap-2">
        <span className="text-amber-500">●</span>
        Internal Notes (Hidden from Client &amp; Sponsor)
      </h3>
      <p className="text-xs text-gray-400 mb-5">
        Confidential — visible only to internal staff.
      </p>
      <div className="space-y-4 mb-6">
        {notes.length === 0 && (
          <p className="text-sm text-gray-400">No internal notes yet.</p>
        )}
        {notes.map((n, i) => (
          <div key={n.id || i} className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/80 text-sm text-gray-700">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-black text-amber-700">
                {n.author} · {n.date}
              </p>
              {onDelete && n.id && (
                <button onClick={() => onDelete(n.id)} className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors">
                  Delete
                </button>
              )}
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{n.body}</p>
          </div>
        ))}
      </div>
      <Input
        label="Add Internal Note"
        name="note"
        value={body}
        onChange={(e) => { setBody(e.target.value); setErr(""); }}
        rows={4}
        placeholder="Add a confidential note…"
        error={err}
      />
      <Button type="button" variant="primary" className="rounded-xl mt-3" onClick={save} disabled={saving || loading}>
        {saving ? "Saving..." : "Save Note"}
      </Button>
    </motion.div>
  );
};

export default CaseDetailNotes;
