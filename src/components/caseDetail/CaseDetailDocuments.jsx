import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiEye, FiUpload, FiCheck, FiClock, FiX } from "react-icons/fi";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import { getCaseChecklist } from "../../services/documentChecklistApi";

const CaseDetailDocuments = ({ documents, caseId, uploadDocument, changeDocumentStatus }) => {
  const [open, setOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "General",
    documentCategory: "candidate",
    userFileName: "",
    expiryDate: "",
    notes: "",
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingForItem, setUploadingForItem] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const fetchChecklist = useCallback(async () => {
    if (!caseId) return;
    setChecklistLoading(true);
    try {
      const res = await getCaseChecklist(caseId);
      if (res.data?.status === 'success') {
        setChecklist(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch checklist:", err);
    } finally {
      setChecklistLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'uploaded':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'missing':
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'uploaded':
        return <FiCheck size={14} className="text-green-600" />;
      case 'under_review':
        return <FiClock size={14} className="text-blue-600" />;
      case 'rejected':
        return <FiX size={14} className="text-red-600" />;
      case 'missing':
      default:
        return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />;
    }
  };

  const categoryLabels = {
    identity: 'Identity Documents',
    education: 'Education & Qualifications',
    work: 'Work Experience',
    financial: 'Financial Documents',
    medical: 'Medical Documents',
    legal: 'Legal Documents',
    other: 'Other Documents'
  };

  const openUploadModal = useCallback((item = null) => {
    setUploadErrors({});
    setUploadForm({
      documentType: item ? item.documentType : "General",
      documentCategory: "candidate",
      userFileName: item ? item.documentName : "",
      expiryDate: "",
      notes: "",
    });
    setSelectedFile(null);
    setUploadingForItem(item);
    setOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setOpen(false);
    setUploadErrors({});
    setUploadForm({
      documentType: "",
      documentCategory: "candidate",
      userFileName: "",
      expiryDate: "",
      notes: "",
    });
    setSelectedFile(null);
    setUploadingForItem(null);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.userFileName) {
        setUploadForm((f) => ({ ...f, userFileName: file.name }));
      }
    }
  };

  const submitUpload = useCallback(async () => {
    const err = {};
    if (!selectedFile) err.file = "Required";
    if (!uploadForm.documentType) err.documentType = "Required";
    setUploadErrors(err);
    if (Object.keys(err).length) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("documents", selectedFile);
      formData.append("caseId", caseId);
      formData.append("documentType", uploadForm.documentType);
      formData.append("documentCategory", uploadForm.documentCategory);
      formData.append("userFileName", uploadForm.userFileName || selectedFile.name);
      if (uploadForm.expiryDate) {
        formData.append("expiryDate", uploadForm.expiryDate);
      }
      if (uploadForm.notes) {
        formData.append("notes", uploadForm.notes);
      }

      await uploadDocument(formData);
      await fetchChecklist();
      closeUploadModal();
    } catch (error) {
      console.error("Error uploading document:", error);
      if (error.response?.data?.message) {
        setUploadErrors({ api: error.response.data.message });
      } else {
        setUploadErrors({ api: "Failed to upload document" });
      }
    } finally {
      setUploading(false);
    }
  }, [uploadForm, selectedFile, caseId, uploadDocument, fetchChecklist, closeUploadModal]);

  // Group checklist by category - handle both array and object formats
  const groupedChecklist = checklist?.checklist ? checklist.checklist : 
    (Array.isArray(checklist) ? checklist.reduce((acc, item) => {
      const category = item.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {}) : {});

  // Calculate progress - use checklist data if available, otherwise calculate
  const totalItems = checklist?.total || (Array.isArray(checklist) ? checklist.length : Object.keys(groupedChecklist).reduce((sum, cat) => sum + groupedChecklist[cat].length, 0));
  const uploadedItems = checklist?.completed || (Array.isArray(checklist) ? checklist.filter(item => item.status !== 'missing').length : 0);
  const requiredItems = checklist?.required || totalItems;
  const progressPercent = checklist?.completionPercentage || (totalItems > 0 ? Math.round((uploadedItems / totalItems) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Document Checklist Section */}
      {checklist && !checklistLoading && Object.keys(groupedChecklist).length > 0 && (
        <>
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-secondary uppercase tracking-wide">
                Document Completion Progress
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-secondary">
                  {progressPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => openUploadModal()}
                  className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white"
                >
                  + Add Document
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{uploadedItems} of {requiredItems} required documents completed</span>
              <span>{totalItems} total documents</span>
            </div>
          </div>

          {/* Checklist by Category */}
          {Object.entries(groupedChecklist).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h5 className="text-sm font-bold text-secondary">
                  {categoryLabels[category] || category}
                </h5>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4"
                  >
                    <div className="shrink-0 mt-0.5">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.documentName}
                        </p>
                        {item.isRequired && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {!item.isRequired && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.expiryDate && (
                          <span className="text-[10px] text-gray-500">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                        {item.uploadedAt && (
                          <span className="text-[10px] text-gray-500">
                            Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.status === 'missing' ? (
                      <button
                        type="button"
                        onClick={() => openUploadModal(item)}
                        className="shrink-0 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-black text-secondary hover:bg-secondary/20 transition-colors"
                      >
                        Add
                      </button>
                    ) : item.documentId ? (
                      <button
                        type="button"
                        onClick={() => {
                          const doc = documents.find(d => d.id === item.documentId);
                          if (doc && doc.documentUrl) {
                            window.open(doc.documentUrl, "_blank");
                          }
                        }}
                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* General uploaded documents - always shown below checklist */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            All uploaded documents
          </p>
          <Button type="button" onClick={() => openUploadModal()} className="rounded-xl text-sm shrink-0">
            <FiUpload size={14} />
            Upload Document
          </Button>
        </div>
        {documents.length === 0 && (
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
        )}
        {documents.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <FiFileText size={18} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-sm font-bold text-gray-900">
                {d.name || d.userFileName || d.documentName}
              </p>
              <p className="text-[11px] font-bold text-gray-500">
                {d.meta}
              </p>
            </div>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${d.statusClass}`}>{d.status}</span>
            <button
              type="button"
              onClick={() => d.documentUrl && window.open(d.documentUrl, "_blank")}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600"
            >
              View
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={closeUploadModal}
        title="Upload document"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Document file
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                uploadErrors.file ? "border-red-300" : "border-gray-200"
              }`}
            />
            {uploadErrors.file && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {uploadErrors.file}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Document name
            </label>
            <input
              type="text"
              value={uploadForm.userFileName}
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, userFileName: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              placeholder="e.g. Passport copy"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Document type
              </label>
              <select
                value={uploadForm.documentType}
                onChange={(e) =>
                  setUploadForm((f) => ({ ...f, documentType: e.target.value }))
                }
                disabled={!!uploadingForItem}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="General">General</option>
                <option value="Passport">Passport</option>
                <option value="Visa">Visa</option>
                <option value="English Certificate">English Certificate</option>
                <option value="Right to Work">Right to Work</option>
                <option value="Education Certificate">Education Certificate</option>
                <option value="Employment Contract">Employment Contract</option>
                <option value="Sponsor Documents">Sponsor Documents</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Category
              </label>
              <select
                value={uploadForm.documentCategory}
                onChange={(e) =>
                  setUploadForm((f) => ({
                    ...f,
                    documentCategory: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
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
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Expiry date (optional)
            </label>
            <input
              type="date"
              value={uploadForm.expiryDate}
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, expiryDate: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={uploadForm.notes}
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={3}
              placeholder="Add any notes about this document…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-y min-h-[72px]"
            />
          </div>
          {uploadErrors.api && (
            <p className="text-xs font-bold text-red-600 mt-1">
              {uploadErrors.api}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={closeUploadModal}
              disabled={uploading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={submitUpload}
              disabled={uploading}
              className="rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload document"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CaseDetailDocuments;
