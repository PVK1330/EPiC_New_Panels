import { useState, useEffect, useCallback } from "react";
import { Check, Clock, X, FileText, Pencil, Trash2 } from "lucide-react";
import Modal from "../../../components/Modal";
import DatePicker from "../../../components/DatePicker";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";
import {
  getCaseDocuments,
  uploadDocument,
  updateDocumentStatus,
} from "../../../services/caseApi";
import {
  getCaseChecklist,
  initializeCaseChecklist,
  createCaseChecklistItem,
  updateCaseChecklistItem,
  deleteCaseChecklistItem,
} from "../../../services/documentChecklistApi";
import { DOCUMENT_TYPE_OPTIONS } from "../../../utils/constants";
import { formatDate } from "../../../utils/datetime";
import { getUploadErrorMessage, validateUploadFile } from "../../../utils/uploadError";

const categoryLabels = {
  identity: "Identity Documents",
  education: "Education & Qualifications",
  work: "Work Experience",
  financial: "Financial Documents",
  medical: "Medical Documents",
  legal: "Legal Documents",
  other: "Other Documents",
};

function getStatusColor(status) {
  switch (status) {
    case "approved":
    case "uploaded":
      return "bg-green-100 text-green-700 border-green-200";
    case "under_review":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "approved":
    case "uploaded":
      return <Check size={14} className="text-green-600" />;
    case "under_review":
      return <Clock size={14} className="text-blue-600" />;
    case "rejected":
      return <X size={14} className="text-red-600" />;
    default:
      return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />;
  }
}

function getBadgeColor(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "rejected":
      return "bg-red-50 text-red-800 border-red-200";
    case "under review":
    case "under_review":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "uploaded":
      return "bg-gray-50 text-gray-800 border-gray-200";
    default:
      return "bg-gray-50 text-gray-800 border-gray-200";
  }
}

function CasesDocumentsTab({ caseId, candidateId }) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistSaving, setChecklistSaving] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "",
    documentCategory: "candidate",
    userFileName: "",
    expiryDate: "",
    notes: "",
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingForItem, setUploadingForItem] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ documentName: "", description: "", isRequired: true });
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemForm, setAddItemForm] = useState({
    documentType: "Other",
    documentName: "",
    description: "",
    isRequired: true,
    category: "other",
  });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, docId: null, docName: "", reason: "" });

  const fetchDocuments = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await getCaseDocuments(id);
      setDocuments(res.data?.data?.documents || []);
    } catch (e) {
      console.error(e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChecklist = useCallback(async () => {
    if (!caseId) return;
    setChecklistLoading(true);
    try {
      const res = await getCaseChecklist(caseId);
      if (res.data?.status === "success") setChecklist(res.data.data);
    } catch (err) {
      console.error("Failed to fetch checklist:", err);
    } finally {
      setChecklistLoading(false);
    }
  }, [caseId]);

  useEffect(() => { if (!caseId) return; fetchDocuments(caseId); }, [caseId, fetchDocuments]);
  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const handleInitializeChecklist = useCallback(async () => {
    if (!caseId) return;
    setChecklistSaving(true);
    try {
      await initializeCaseChecklist(caseId);
      await fetchChecklist();
      showToast({ message: "Checklist customized specifically for this case!", variant: "success" });
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Failed to customize checklist.", variant: "danger" });
    } finally {
      setChecklistSaving(false);
    }
  }, [caseId, fetchChecklist, showToast]);

  const handleSaveChecklistItem = useCallback(async () => {
    if (!caseId || !editingItemId) return;
    setChecklistSaving(true);
    try {
      await updateCaseChecklistItem(editingItemId, editForm);
      setEditingItemId(null);
      await fetchChecklist();
      showToast({ message: "Checklist item updated.", variant: "success" });
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Failed to update item.", variant: "danger" });
    } finally {
      setChecklistSaving(false);
    }
  }, [caseId, editingItemId, editForm, fetchChecklist, showToast]);

  const handleDeleteChecklistItem = useCallback(async (itemId) => {
    if (!caseId || !itemId) return;
    const confirmed = await confirm({
      title: "Are you sure?",
      message: "Remove this document requirement from the case checklist?",
      confirmLabel: "Yes, remove it",
      variant: "danger",
    });
    if (!confirmed) return;
    setChecklistSaving(true);
    try {
      await deleteCaseChecklistItem(itemId);
      await fetchChecklist();
      showToast({ message: "Checklist item removed.", variant: "success" });
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Failed to delete item.", variant: "danger" });
    } finally {
      setChecklistSaving(false);
    }
  }, [fetchChecklist, showToast, confirm]);

  const handleToggleRequired = useCallback(async (item) => {
    if (!item?.id) return;
    setChecklistSaving(true);
    try {
      await updateCaseChecklistItem(item.id, { isRequired: !item.isRequired });
      await fetchChecklist();
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Failed to update item.", variant: "danger" });
    } finally {
      setChecklistSaving(false);
    }
  }, [fetchChecklist, showToast]);

  const handleCreateChecklistItem = useCallback(async () => {
    if (!caseId || !addItemForm.documentName.trim()) return;
    setChecklistSaving(true);
    try {
      await createCaseChecklistItem(caseId, { ...addItemForm, documentName: addItemForm.documentName.trim() });
      setAddItemOpen(false);
      setAddItemForm({ documentType: "Other", documentName: "", description: "", isRequired: true, category: "other" });
      await fetchChecklist();
      showToast({ message: "Document requirement added.", variant: "success" });
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Failed to add item.", variant: "danger" });
    } finally {
      setChecklistSaving(false);
    }
  }, [caseId, addItemForm, fetchChecklist, showToast]);

  const openUploadModal = useCallback((item = null) => {
    setUploadErrors({});
    setUploadForm({ documentType: item ? item.documentType : "General", documentCategory: "candidate", userFileName: item ? item.documentName : "", expiryDate: "", notes: "" });
    setSelectedFile(null);
    setUploadingForItem(item);
    setUploadOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setUploadOpen(false);
    setUploadErrors({});
    setUploadForm({ documentType: "", documentCategory: "candidate", userFileName: "", expiryDate: "", notes: "" });
    setSelectedFile(null);
    setUploadingForItem(null);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.userFileName) setUploadForm((f) => ({ ...f, userFileName: file.name }));
    }
  };

  const submitUploadDocument = useCallback(async () => {
    const err = {};
    const fileError = validateUploadFile(selectedFile);
    if (fileError) err.file = fileError;
    if (!uploadForm.documentType) err.documentType = "Required";
    setUploadErrors(err);
    if (Object.keys(err).length) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("caseId", caseId);
      // Server derives the client from caseId; only send userId when it is known
      // (appending undefined would post the literal string "undefined").
      if (candidateId) formData.append("userId", String(candidateId));
      formData.append("documentType", uploadForm.documentType);
      formData.append("documentCategory", uploadForm.documentCategory);
      formData.append("userFileName", uploadForm.userFileName || selectedFile.name);
      if (uploadForm.expiryDate) formData.append("expiryDate", uploadForm.expiryDate);
      if (uploadForm.notes) formData.append("notes", uploadForm.notes);
      const response = await uploadDocument(formData);
      if (response.data.status === "success") {
        await fetchDocuments(caseId);
        await fetchChecklist();
        closeUploadModal();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadErrors({ api: getUploadErrorMessage(error) });
    } finally {
      setUploading(false);
    }
  }, [uploadForm, selectedFile, caseId, candidateId, closeUploadModal, fetchDocuments, fetchChecklist]);

  const handleDocumentStatusChange = useCallback(async (documentId, status, rejectionReason) => {
    try {
      setStatusUpdatingId(documentId);
      const payload = { status };
      if (status === "approved") payload.reviewNotes = "Document approved by caseworker";
      else if (status === "rejected") { payload.rejectionReason = rejectionReason; payload.reviewNotes = rejectionReason; }
      await updateDocumentStatus(documentId, payload);
      await fetchDocuments(caseId);
      await fetchChecklist();
      showToast({ message: status === "approved" ? "Document approved successfully." : "Document rejected successfully.", variant: "success" });
    } catch (error) {
      showToast({ message: error.response?.data?.message || "Failed to update document status.", variant: "danger" });
    } finally {
      setStatusUpdatingId(null);
    }
  }, [fetchDocuments, fetchChecklist, caseId, showToast]);

  const openRejectModal = useCallback((docId, docName) => {
    setRejectModal({ isOpen: true, docId, docName: docName || "", reason: "" });
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal({ isOpen: false, docId: null, docName: "", reason: "" });
  }, []);

  const confirmReject = useCallback(async () => {
    if (!rejectModal.docId || !rejectModal.reason?.trim()) return;
    await handleDocumentStatusChange(rejectModal.docId, "rejected", rejectModal.reason.trim());
    closeRejectModal();
  }, [rejectModal, handleDocumentStatusChange, closeRejectModal]);

  return (
    <div className="space-y-6">
      {checklist && !checklistLoading && Object.keys(checklist.checklist).length > 0 && (
        <>
          <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-secondary uppercase tracking-wide">
                Document Completion Progress
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-black text-secondary">{checklist.completionPercentage}%</span>
                {!checklist.isCustomized && (
                  <button type="button" disabled={checklistSaving} onClick={handleInitializeChecklist}
                    className="rounded-xl border border-secondary text-secondary bg-white hover:bg-secondary/5 px-3 py-2 text-xs font-black transition-all disabled:opacity-50">
                    {checklistSaving ? "Setting up…" : "Customize Required Documents"}
                  </button>
                )}
                {checklist.isCustomized && (
                  <button type="button" onClick={() => setAddItemOpen(true)} disabled={checklistSaving}
                    className="rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs font-black text-secondary hover:bg-secondary/20 transition-all">
                    + Add Required Document
                  </button>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out"
                style={{ width: `${checklist.completionPercentage}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{checklist.completed} of {checklist.required} required documents completed</span>
              <span>{checklist.total} total documents</span>
            </div>
          </div>

          {Object.entries(checklist.checklist).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h5 className="text-sm font-bold text-secondary">{categoryLabels[category] || category}</h5>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="px-5 py-4 hover:bg-gray-50/50 transition-all duration-200 flex items-start gap-4 group">
                    <div className="shrink-0 mt-0.5">{getStatusIcon(item.status)}</div>
                    <div className="flex-1 min-w-0">
                      {editingItemId === item.id ? (
                        <div className="space-y-2 mb-2">
                          <input type="text" value={editForm.documentName}
                            onChange={(e) => setEditForm((f) => ({ ...f, documentName: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15" />
                          <textarea value={editForm.description}
                            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                            rows={2} placeholder="Description (optional)"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-secondary/15 resize-none" />
                          <div className="flex gap-2">
                            <button type="button" disabled={checklistSaving} onClick={handleSaveChecklistItem}
                              className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-black text-white">Save</button>
                            <button type="button" onClick={() => setEditingItemId(null)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-black text-gray-600">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">{item.documentName}</p>
                            {item.isRequired && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>}
                            {!item.isRequired && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>}
                          </div>
                          {item.description && <p className="text-xs text-gray-500 mb-2">{item.description}</p>}
                        </>
                      )}
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(item.status)}`}>
                          {item.status.replace("_", " ")}
                        </span>
                        {item.expiryDate && <span className="text-[10px] text-gray-500">Expires: {formatDate(item.expiryDate)}</span>}
                        {item.uploadedAt && <span className="text-[10px] text-gray-500">Uploaded: {formatDate(item.uploadedAt)}</span>}
                      </div>
                    </div>
                    {checklist.isCustomized && item.id && editingItemId !== item.id && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button type="button" disabled={checklistSaving}
                          onClick={() => { setEditingItemId(item.id); setEditForm({ documentName: item.documentName || "", description: item.description || "", isRequired: Boolean(item.isRequired) }); }}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
                          <Pencil size={12} /> Edit
                        </button>
                        <button type="button" disabled={checklistSaving} onClick={() => handleToggleRequired(item)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black border transition-all duration-200 ${item.isRequired ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                          {item.isRequired ? "Required" : "Optional"}
                        </button>
                        <button type="button" disabled={checklistSaving} onClick={() => handleDeleteChecklistItem(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 transition-all duration-200" aria-label="Delete requirement">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    {item.status === "missing" ? (
                      <button type="button" onClick={() => openUploadModal(item)}
                        className="shrink-0 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-black text-secondary hover:bg-secondary/20 transition-colors">
                        Add
                      </button>
                    ) : item.documentId ? (
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button type="button"
                          onClick={() => { const doc = documents.find((d) => d.id === item.documentId); if (doc?.documentUrl) window.open(doc.documentUrl, "_blank"); }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-colors">
                          View
                        </button>
                        {(item.status === "uploaded" || item.status === "under_review") && (
                          <>
                            <button type="button" disabled={statusUpdatingId === item.documentId}
                              onClick={() => handleDocumentStatusChange(item.documentId, "approved")}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-800 disabled:opacity-50">
                              Approve
                            </button>
                            <button type="button" disabled={statusUpdatingId === item.documentId}
                              onClick={() => openRejectModal(item.documentId, item.documentName || item.userFileName)}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-800 disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <div>
        {/* BUG-030: the Upload button used to live inside the checklist block above, so a
            case with no visa type / checklist had no way to upload at all. */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">All uploaded documents</p>
          <button type="button" onClick={() => openUploadModal()}
            className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white">
            + Upload Document
          </button>
        </div>
        {!checklistLoading && Object.keys(checklist?.checklist || {}).length === 0 && (
          <p className="text-xs text-gray-500 mb-3">
            No required-documents checklist applies to this case yet
            {checklist?.visaTypeMissing ? " (no visa type set on the case)" : ""}. You can still upload documents.
          </p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <FileText size={18} className="text-secondary" />
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm font-bold text-gray-900">{doc.userFileName || doc.documentName}</p>
                <p className="text-[11px] font-bold text-gray-500">Uploaded {formatDate(doc.uploadedAt)} · {doc.documentType}</p>
                {doc.reviewNotes && doc.status === "rejected" && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">{doc.reviewNotes}</p>
                )}
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getBadgeColor(doc.status)}`}>
                {doc.status || "Uploaded"}
              </span>
              <button type="button" onClick={() => window.open(doc.documentUrl, "_blank")}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600">
                View
              </button>
              {(doc.status === "uploaded" || doc.status === "under_review" || doc.status === "rejected") && (
                <>
                  <button type="button" disabled={statusUpdatingId === doc.id}
                    onClick={() => handleDocumentStatusChange(doc.id, "approved")}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-800 disabled:opacity-50">
                    Approve
                  </button>
                  {(doc.status === "uploaded" || doc.status === "under_review") && (
                    <button type="button" disabled={statusUpdatingId === doc.id}
                      onClick={() => openRejectModal(doc.id, doc.userFileName || doc.documentName)}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-800 disabled:opacity-50">
                      Reject
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <Modal open={addItemOpen} onClose={() => setAddItemOpen(false)} title="Add custom document requirement"
        titleId="add-checklist-item-modal-title" maxWidthClass="max-w-lg" bodyClassName="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Document name</label>
            <input type="text" value={addItemForm.documentName}
              onChange={(e) => setAddItemForm((f) => ({ ...f, documentName: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15"
              placeholder="e.g. Employment reference letter" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Document type</label>
            <select value={addItemForm.documentType}
              onChange={(e) => setAddItemForm((f) => ({ ...f, documentType: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15">
              {DOCUMENT_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Description (optional)</label>
            <textarea value={addItemForm.description}
              onChange={(e) => setAddItemForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/15 resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <input type="checkbox" checked={addItemForm.isRequired}
              onChange={(e) => setAddItemForm((f) => ({ ...f, isRequired: e.target.checked }))}
              className="accent-secondary rounded" />
            Required document
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAddItemOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700">Cancel</button>
            <button type="button" disabled={checklistSaving || !addItemForm.documentName.trim()} onClick={handleCreateChecklistItem}
              className="rounded-xl bg-secondary px-4 py-2 text-sm font-black text-white disabled:opacity-50">
              {checklistSaving ? "Adding…" : "Add requirement"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={uploadOpen} onClose={closeUploadModal} title="Upload document"
        titleId="upload-document-modal-title" maxWidthClass="max-w-lg" bodyClassName="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Document file</label>
            <input type="file" onChange={handleFileChange}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${uploadErrors.file ? "border-red-300" : "border-gray-200"}`} />
            {uploadErrors.file && <p className="text-xs font-bold text-red-600 mt-1">{uploadErrors.file}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Document name</label>
            <input type="text" value={uploadForm.userFileName}
              onChange={(e) => setUploadForm((f) => ({ ...f, userFileName: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              placeholder="e.g. Passport copy" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Document type</label>
              <select value={uploadForm.documentType}
                onChange={(e) => setUploadForm((f) => ({ ...f, documentType: e.target.value }))}
                disabled={!!uploadingForItem}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary disabled:bg-gray-50 disabled:text-gray-500">
                {DOCUMENT_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Category</label>
              <select value={uploadForm.documentCategory}
                onChange={(e) => setUploadForm((f) => ({ ...f, documentCategory: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary">
                <option value="candidate">Candidate</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
                <option value="legal">Legal</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Expiry date (optional)</label>
            <DatePicker name="expiryDate" value={uploadForm.expiryDate}
              onChange={(e) => setUploadForm((f) => ({ ...f, expiryDate: e.target.value }))}
              min={new Date().toISOString().split("T")[0]} placeholder="Select expiry date" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Notes (optional)</label>
            <textarea value={uploadForm.notes}
              onChange={(e) => setUploadForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Add any notes about this document…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-y min-h-[72px]" />
          </div>
          {uploadErrors.api && <p className="text-xs font-bold text-red-600 mt-1">{uploadErrors.api}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={closeUploadModal} disabled={uploading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={submitUploadDocument} disabled={uploading}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload document"}
            </button>
          </div>
        </div>
      </Modal>

      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900">Reject document</h3>
              <button type="button" onClick={closeRejectModal}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            {rejectModal.docName && <p className="text-sm font-bold text-gray-600 mb-3">{rejectModal.docName}</p>}
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea value={rejectModal.reason}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-y min-h-[72px]"
                placeholder="Explain why this document is being rejected…" autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeRejectModal}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={confirmReject}
                disabled={!rejectModal.reason?.trim() || statusUpdatingId === rejectModal.docId}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50">
                {statusUpdatingId === rejectModal.docId ? "Rejecting…" : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CasesDocumentsTab;
