import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiTrash2, FiUsers, FiX } from "react-icons/fi";
import Input from "../Input";
import Button from "../Button";
import { getCaseworkers } from "../../services/caseApi";

const CaseDetailNotes = ({ notes = [], loading, onAdd, onDelete }) => {
  const [noteType, setNoteType] = useState("internal"); // "internal" | "attendance"
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCaseworkers, setSelectedCaseworkers] = useState([]);
  const [availableCaseworkers, setAvailableCaseworkers] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Load available caseworkers for tagging in attendance notes
  useEffect(() => {
    let active = true;
    getCaseworkers({ limit: 999 })
      .then((res) => {
        if (!active) return;
        const data = res?.data?.data;
        const list = data?.caseworker || data?.caseworkers || (Array.isArray(data) ? data : []);
        setAvailableCaseworkers(
          list.filter((u) => u.status !== "inactive" && u.status !== "suspended")
        );
      })
      .catch(() => {
        if (active) setAvailableCaseworkers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddCaseworker = (cwId) => {
    if (!cwId) return;
    const numId = Number(cwId);
    if (selectedCaseworkers.some((cw) => cw.id === numId)) return;
    const found = availableCaseworkers.find((cw) => cw.id === numId);
    if (found) {
      setSelectedCaseworkers((prev) => [...prev, found]);
    }
  };

  const handleRemoveCaseworker = (cwId) => {
    setSelectedCaseworkers((prev) => prev.filter((cw) => cw.id !== cwId));
  };

  const save = async () => {
    if (!body.trim()) {
      setErr("Note content cannot be empty");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      if (onAdd) {
        if (noteType === "attendance") {
          await onAdd({
            content: body.trim(),
            noteType: "attendance",
            title: title.trim() || undefined,
            participantIds: selectedCaseworkers.map((cw) => cw.id),
          });
        } else {
          await onAdd({
            content: body.trim(),
            noteType: "internal",
          });
        }
      }
      setBody("");
      setTitle("");
      setSelectedCaseworkers([]);
      setErr("");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save note";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-black text-secondary flex items-center gap-2">
            <span className="text-amber-500">●</span>
            Case Notes (Hidden from Client &amp; Sponsor)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Confidential — internal notes and attendance records for this case.
          </p>
        </div>
      </div>

      {/* Note List */}
      <div className="space-y-4 mb-6">
        {notes.length === 0 && (
          <p className="text-sm text-gray-400">No notes added yet.</p>
        )}
        {notes.map((n, i) => {
          const isAttendance = n.noteType === "attendance";
          const attendeesList =
            n.attendees && n.attendees.length > 0
              ? n.attendees
              : (n.participants || [])
                  .map((p) =>
                    p.caseworker
                      ? `${p.caseworker.first_name} ${p.caseworker.last_name}`.trim()
                      : p.caseworker_id
                  )
                  .filter(Boolean);

          return (
            <div
              key={n.id || i}
              className={`p-4 rounded-xl border text-sm text-gray-700 ${
                isAttendance
                  ? "bg-blue-50/40 border-blue-100/90"
                  : "bg-amber-50/50 border-amber-100/80"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                      isAttendance
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isAttendance ? "Attendance Note" : "Internal Note"}
                  </span>
                  <p className="text-xs font-black text-gray-600">
                    {n.author} · {n.date}
                  </p>
                </div>
                {onDelete && n.id && (
                  <button
                    type="button"
                    onClick={() => onDelete(n.id)}
                    title="Delete"
                    aria-label="Delete"
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiTrash2 size={15} />
                  </button>
                )}
              </div>

              {isAttendance && n.title && (
                <p className="font-bold text-gray-900 mb-1">{n.title}</p>
              )}

              <p className="leading-relaxed whitespace-pre-wrap">{n.body}</p>

              {isAttendance && attendeesList.length > 0 && (
                <div className="mt-3 pt-2 border-t border-blue-100/60 flex items-center gap-2 text-xs font-semibold text-blue-800">
                  <FiUsers className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>
                    <strong className="font-bold">Attended with:</strong>{" "}
                    {attendeesList.join(", ")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note Creation Form */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setNoteType("internal")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              noteType === "internal"
                ? "bg-secondary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Internal Note
          </button>
          <button
            type="button"
            onClick={() => setNoteType("attendance")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              noteType === "attendance"
                ? "bg-secondary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Attendance Note
          </button>
        </div>

        {noteType === "attendance" && (
          <div className="space-y-3 mb-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subject / Consultation Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Client consultation, Interview, Call"
                className="w-full text-xs rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Attended with (Tag Caseworkers)
              </label>
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    handleAddCaseworker(e.target.value);
                  }}
                  className="flex-1 text-xs rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="">Select caseworker attendee...</option>
                  {availableCaseworkers
                    .filter((cw) => !selectedCaseworkers.some((s) => s.id === cw.id))
                    .map((cw) => (
                      <option key={cw.id} value={cw.id}>
                        {cw.first_name} {cw.last_name} ({cw.email})
                      </option>
                    ))}
                </select>
              </div>

              {selectedCaseworkers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedCaseworkers.map((cw) => (
                    <span
                      key={cw.id}
                      className="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-800 font-semibold px-2.5 py-1 rounded-md shadow-xs"
                    >
                      <span>
                        {cw.first_name} {cw.last_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCaseworker(cw.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Input
          label={noteType === "attendance" ? "Attendance Note Details" : "Add Internal Note"}
          name="note"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setErr("");
          }}
          rows={4}
          placeholder={
            noteType === "attendance"
              ? "Record consultation details, advice given, decisions agreed..."
              : "Add a confidential note…"
          }
          error={err}
        />

        <Button
          type="button"
          variant="primary"
          className="rounded-xl mt-3"
          onClick={save}
          disabled={saving || loading || !body.trim()}
        >
          {saving
            ? "Saving..."
            : noteType === "attendance"
            ? "Save Attendance Note"
            : "Save Note"}
        </Button>
      </div>
    </motion.div>
  );
};

export default CaseDetailNotes;
