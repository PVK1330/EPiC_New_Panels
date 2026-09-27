import { useState, useEffect } from "react";
import { FiUsers, FiX } from "react-icons/fi";
import useCaseDetail from "../../../hooks/useCaseDetail";
import { formatDate } from "../../../utils/datetime";
import { getCaseworkers } from "../../../services/caseApi";

function CasesNotesTab({ caseId, userName }) {
  const { notes, notesLoading: loading, fetchNotes, addNote } = useCaseDetail();
  const [noteType, setNoteType] = useState("internal"); // "internal" | "attendance"
  const [title, setTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedCaseworkers, setSelectedCaseworkers] = useState([]);
  const [availableCaseworkers, setAvailableCaseworkers] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    fetchNotes(caseId);
  }, [caseId, fetchNotes]);

  // Load available caseworkers for attendee tagging
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

  const handleSaveNote = async () => {
    if (!newNote.trim() || !caseId) return;
    setSaving(true);
    setErr("");
    try {
      if (noteType === "attendance") {
        await addNote({
          caseId: Number(caseId),
          content: newNote.trim(),
          noteType: "attendance",
          title: title.trim() || undefined,
          participantIds: selectedCaseworkers.map((cw) => cw.id),
        });
      } else {
        await addNote({
          caseId: Number(caseId),
          content: newNote.trim(),
          noteType: "internal",
        });
      }
      setNewNote("");
      setTitle("");
      setSelectedCaseworkers([]);
      setErr("");
      await fetchNotes(caseId);
    } catch (error) {
      console.error("Error saving note:", error);
      const errMsg = error?.response?.data?.message || error?.message || "Failed to save note. Please try again.";
      setErr(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Note type selection */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setNoteType("internal");
            setErr("");
          }}
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
          onClick={() => {
            setNoteType("attendance");
            setErr("");
          }}
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
        <div className="space-y-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
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
                onChange={(e) => handleAddCaseworker(e.target.value)}
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

      {err && (
        <div className="p-2.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {err}
        </div>
      )}

      <textarea
        placeholder={
          noteType === "attendance"
            ? "Record attendance details, advice given, decisions agreed..."
            : "Add an internal note…"
        }
        rows={3}
        value={newNote}
        onChange={(e) => {
          setNewNote(e.target.value);
          setErr("");
        }}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-y"
      />

      <button
        type="button"
        onClick={handleSaveNote}
        disabled={!newNote.trim() || saving}
        className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving
          ? "Saving..."
          : noteType === "attendance"
          ? "Save Attendance Note"
          : "Save note"}
      </button>

      {loading ? (
        <p className="text-sm text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes added yet.</p>
      ) : (
        notes.map((note) => {
          const isAttendance = note.noteType === "attendance";
          const attendeesList =
            note.attendees && note.attendees.length > 0
              ? note.attendees
              : (note.participants || [])
                  .map((p) =>
                    p.caseworker
                      ? `${p.caseworker.first_name} ${p.caseworker.last_name}`.trim()
                      : p.caseworker_id
                  )
                  .filter(Boolean);

          return (
            <div
              key={note.id}
              className={`rounded-xl border p-4 ${
                isAttendance
                  ? "bg-blue-50/40 border-blue-100"
                  : "bg-gray-50/80 border-gray-100"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                    isAttendance
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isAttendance ? "Attendance Note" : "Internal Note"}
                </span>
                <p className="text-[11px] font-bold text-gray-500">
                  {note.author?.first_name && note.author?.last_name
                    ? `${note.author.first_name} ${note.author.last_name}`
                    : userName}{" "}
                  · {formatDate(note.created_at)}
                </p>
              </div>

              {isAttendance && note.title && (
                <p className="font-bold text-gray-900 mb-1 text-sm">{note.title}</p>
              )}

              <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap">
                {note.content}
              </p>

              {isAttendance && attendeesList.length > 0 && (
                <div className="mt-3 pt-2 border-t border-blue-100/70 flex items-center gap-2 text-xs font-semibold text-blue-800">
                  <FiUsers className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>
                    <strong className="font-bold">Attended with:</strong>{" "}
                    {attendeesList.join(", ")}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default CasesNotesTab;
