import { useState, useEffect } from "react";
import useCaseDetail from "../../../hooks/useCaseDetail";
import { formatDate } from "../../../utils/datetime";

function CasesNotesTab({ caseId, userName }) {
  const { notes, notesLoading: loading, fetchNotes, addNote } = useCaseDetail();
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!caseId) return;
    fetchNotes(caseId);
  }, [caseId, fetchNotes]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !caseId) return;
    try {
      await addNote({ caseId: Number(caseId), content: newNote });
      setNewNote("");
      await fetchNotes(caseId);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <textarea placeholder="Add an internal note…" rows={3} value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-y" />
      <button type="button" onClick={handleSaveNote} disabled={!newNote.trim()}
        className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white disabled:opacity-50 disabled:cursor-not-allowed">
        Save note
      </button>
      {loading ? (
        <p className="text-sm text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes added yet.</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-[11px] font-bold text-gray-500 mb-1">
              {note.author?.first_name && note.author?.last_name
                ? `${note.author.first_name} ${note.author.last_name}`
                : userName}{" "}
              · {formatDate(note.created_at)}
            </p>
            <p className="text-sm font-bold text-gray-800">{note.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default CasesNotesTab;
