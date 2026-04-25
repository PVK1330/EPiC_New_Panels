import { useCallback, useState } from "react";
import {
  getCaseDetails,
  updateCaseStatus,
  exportCaseCSV,
  exportCasePDF,
  // Documents
  getDocumentsByCaseId,
  uploadCaseDocument,
  updateCaseDocumentStatus,
  downloadCaseDocument,
  deleteCaseDocument,
  // Notes
  getCaseNotesByCaseId,
  addCaseNote,
  deleteCaseNote,
  // Tasks
  getTasksByCaseId,
  addCaseTask,
  updateCaseTask,
  deleteCaseTask,
} from "../services/caseDetailApi";

export default function useCaseDetail() {
  const [caseData, setCaseData] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);

  const fetchCaseDetail = useCallback(async (id) => {
    setCaseLoading(true);
    try {
      const res = await getCaseDetails(id);
      if (res.data?.status === "success") {
        setCaseData(res.data.data);
      }
      return { ok: true, data: res.data?.data };
    } catch (e) {
      return { ok: false, error: e };
    } finally {
      setCaseLoading(false);
    }
  }, []);

  const changeCaseStatus = useCallback(async (id, data) => {
    return updateCaseStatus(id, data);
  }, []);

  // ── Documents ─────────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const fetchDocuments = useCallback(async (caseId) => {
    setDocsLoading(true);
    try {
      const res = await getDocumentsByCaseId(caseId);
      setDocuments(res.data?.data?.documents || []);
      return { ok: true };
    } catch (e) {
      setDocuments([]);
      return { ok: false, error: e };
    } finally {
      setDocsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (formData) => {
    return uploadCaseDocument(formData);
  }, []);

  const changeDocumentStatus = useCallback(async (id, data) => {
    return updateCaseDocumentStatus(id, data);
  }, []);

  const downloadDocument = useCallback(async (id) => {
    return downloadCaseDocument(id);
  }, []);

  const removeDocument = useCallback(async (id) => {
    return deleteCaseDocument(id);
  }, []);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const fetchNotes = useCallback(async (caseId, page = 1, limit = 20) => {
    setNotesLoading(true);
    try {
      const res = await getCaseNotesByCaseId(caseId, page, limit);
      setNotes(res.data?.data?.notes || []);
      return { ok: true };
    } catch (e) {
      setNotes([]);
      return { ok: false, error: e };
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const addNote = useCallback(async (data) => {
    return addCaseNote(data);
  }, []);

  const removeNote = useCallback(async (noteId) => {
    return deleteCaseNote(noteId);
  }, []);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const fetchTasks = useCallback(async (caseId) => {
    setTasksLoading(true);
    try {
      const res = await getTasksByCaseId(caseId);
      setTasks(res.data?.data?.tasks || []);
      return { ok: true };
    } catch (e) {
      setTasks([]);
      return { ok: false, error: e };
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const addTask = useCallback(async (data) => {
    return addCaseTask(data);
  }, []);

  const editTask = useCallback(async (id, data) => {
    return updateCaseTask(id, data);
  }, []);

  const removeTask = useCallback(async (id) => {
    return deleteCaseTask(id);
  }, []);

  // ── Exports ───────────────────────────────────────────────────────────────
  const exportPDF = useCallback((id) => exportCasePDF(id), []);
  const exportCSV = useCallback((id) => exportCaseCSV(id), []);

  return {
    // Case
    caseData,
    caseLoading,
    fetchCaseDetail,
    changeCaseStatus,
    // Documents
    documents,
    docsLoading,
    fetchDocuments,
    uploadDocument,
    changeDocumentStatus,
    downloadDocument,
    removeDocument,
    // Notes
    notes,
    notesLoading,
    fetchNotes,
    addNote,
    removeNote,
    // Tasks
    tasks,
    tasksLoading,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    // Exports
    exportPDF,
    exportCSV,
  };
}
