import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import Button from "../Button";

const CaseDetailNotes = ({ notes }) => {
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");

  const save = () => {
    if (!body.trim()) {
      setErr("Note cannot be empty");
      return;
    }
    setBody("");
    setErr("");
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
          <div key={i} className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/80 text-sm text-gray-700">
            <p className="text-xs font-black text-amber-700 mb-1">
              {n.author} · {n.date}
            </p>
            <p className="leading-relaxed">{n.body}</p>
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
      <Button type="button" variant="primary" className="rounded-xl mt-3" onClick={save}>
        Save Note
      </Button>
    </motion.div>
  );
};

export default CaseDetailNotes;
