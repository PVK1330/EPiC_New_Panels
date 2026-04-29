import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { getCaseChecklist } from "../../services/documentChecklistApi";

const DOC_TYPES = [
  "Passport",
  "Right to work",
  "English language certificate",
  "Certificate of sponsorship",
  "Job offer letter",
  "Bank statement",
  "Other",
];





function typeBadge(tone) {
  const m = {
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return m[tone] || m.blue;
}

function statBadge(tone) {
  const m = {
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
  };
  return m[tone] || m.blue;
}

export default function CaseworkerDocuments() {
  const location = useLocation();
  const missingRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [rejectModal, setRejectModal] = useState({ isOpen: false, doc: null, note: "" });
  const [allDocuments, setAllDocuments] = useState([]);
  const [reviewDocuments, setReviewDocuments] = useState([]);
  const [missingDocuments, setMissingDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "General",
    documentCategory: "candidate",
    userFileName: "",
    expiryDate: "",
    notes: "",
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadingForItem, setUploadingForItem] = useState(null);

  const isMissingRoute = location.pathname.includes("/documents/missing");

  useEffect(() => {
    fetchCases();
    fetchAllDocuments();
    fetchReviewDocuments();
    fetchMissingDocuments();
  }, []);

  useEffect(() => {
    if (isMissingRoute && missingRef.current) {
      missingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isMissingRoute]);

  useEffect(() => {
    if (caseId) {
      fetchAllDocuments();
      fetchMissingDocuments();
    }
  }, [caseId]);

  const fetchCases = async () => {
    try {
      const response = await api.get("/api/caseworker/cases");
      const casesData = response.data.data.cases || [];
      setCases(casesData);
      if (casesData.length > 0 && !caseId) {
        setCaseId(casesData[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      if (!caseId) {
        setAllDocuments([]);
        return;
      }
      const response = await api.get(`/api/caseworker/documents/case/${caseId}`, {
        params: {
          limit: 100,
          page: 1
        }
      });
      const documents = response.data.data.documents || [];
      setAllDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setAllDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewDocuments = async () => {
    try {
      // Fetch documents from all cases
      if (cases.length === 0) return;
      
      const allDocs = [];
      for (const c of cases) {
        try {
          const response = await api.get(`/api/caseworker/documents/case/${c.id}`);
          const documents = response.data.data.documents || [];
          allDocs.push(...documents);
        } catch (err) {
          console.error(`Error fetching documents for case ${c.id}:`, err);
        }
      }
      
      // Filter for pending review (uploaded status)
      const pendingDocs = allDocs.filter(d => 
        d.status === 'uploaded'
      );
      setReviewDocuments(pendingDocs);
    } catch (error) {
      console.error("Error fetching review documents:", error);
      setReviewDocuments([]);
    }
  };

  const fetchMissingDocuments = async () => {
    try {
      if (!caseId) {
        setMissingDocuments([]);
        return;
      }
      
      const selectedCase = cases.find(c => c.id.toString() === caseId.toString());
      if (!selectedCase) {
        setMissingDocuments([]);
        return;
      }
      
      try {
        const response = await getCaseChecklist(selectedCase.id);
        if (response.data?.status === 'success' && response.data.data) {
          const checklist = response.data.data;
          const checklistItems = checklist.checklist ? Object.values(checklist.checklist).flat() : [];
          
          const missingItems = checklistItems.filter(item => item.status === 'missing').map(item => ({
            ...item,
            caseId: selectedCase.id,
            caseIdDisplay: selectedCase.caseId,
            candidateName: selectedCase.candidate ? `${selectedCase.candidate.first_name} ${selectedCase.candidate.last_name}` : 'Unknown',
          }));
          
          setMissingDocuments(missingItems);
        } else {
          setMissingDocuments([]);
        }
      } catch (err) {
        console.error(`Error fetching checklist for case ${selectedCase.id}:`, err);
        setMissingDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching missing documents:", error);
      setMissingDocuments([]);
    }
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
    setUploadOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setUploadOpen(false);
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

  const submitUploadDocument = useCallback(async () => {
    const err = {};
    if (!selectedFile) err.file = "Required";
    if (!uploadForm.documentType) err.documentType = "Required";
    setUploadErrors(err);
    if (Object.keys(err).length) return;

    try {
      setUploading(true);
      const selectedCase = cases.find(c => c.id.toString() === caseId.toString());
      const userId = selectedCase?.candidateId;

      if (!userId) {
        setUploadErrors({ api: "Unable to determine user ID from selected case" });
        return;
      }

      const formData = new FormData();
      formData.append("documents", selectedFile);
      formData.append("caseId", caseId);
      formData.append("documentType", uploadForm.documentType);
      formData.append("documentCategory", uploadForm.documentCategory);
      formData.append("userId", userId);
      formData.append("userFileName", uploadForm.userFileName);
      if (uploadForm.expiryDate) formData.append("expiryDate", uploadForm.expiryDate);
      if (uploadForm.notes) formData.append("notes", uploadForm.notes);

      const response = await api.post("/api/caseworker/documents/upload", formData);

      if (response.data.status === "success") {
        await fetchAllDocuments();
        await fetchReviewDocuments();
        await fetchMissingDocuments();
        closeUploadModal();
      }
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
  }, [uploadForm, selectedFile, caseId, cases, closeUploadModal, fetchAllDocuments, fetchReviewDocuments, fetchMissingDocuments]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !caseId) {
      alert("Please select a file and case");
      return;
    }

    try {
      setUploading(true);
      const selectedCase = cases.find(c => c.id.toString() === caseId.toString());
      const userId = selectedCase?.candidateId;

      if (!userId) {
        alert("Unable to determine user ID from selected case");
        return;
      }

      const formData = new FormData();
      formData.append("documents", selectedFile);
      formData.append("caseId", caseId);
      formData.append("documentType", docType);
      formData.append("documentCategory", "candidate");
      formData.append("userId", userId);
      formData.append("userFileName", selectedFile.name);
      if (expiryDate) {
        formData.append("expiryDate", expiryDate);
      }
      if (notes) {
        formData.append("notes", notes);
      }

      const response = await api.post("/api/caseworker/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Document uploaded successfully!");
      setSelectedFile(null);
      setNotes("");
      setExpiryDate("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchAllDocuments();
      fetchReviewDocuments();
      fetchMissingDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (documentId) => {
    try {
      await api.patch(`/api/caseworker/documents/status/${documentId}`, {
        status: "approved",
        reviewNotes: "Document approved",
      });
      fetchReviewDocuments();
      fetchAllDocuments();
      fetchMissingDocuments();
      alert("Document approved successfully!");
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Failed to approve document");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.doc) return;

    try {
      await api.patch(`/api/caseworker/documents/status/${rejectModal.doc.id}`, {
        status: "rejected",
        reviewNotes: rejectModal.note,
      });
      setRejectModal({ isOpen: false, doc: null, note: "" });
      fetchReviewDocuments();
      fetchAllDocuments();
      fetchMissingDocuments();
      alert("Document rejected successfully!");
    } catch (error) {
      console.error("Error rejecting document:", error);
      alert("Failed to reject document");
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/api/caseworker/documents/download/${documentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document");
    }
  };

  const openViewDocument = (url) => {
    setViewDocumentUrl(url);
    setViewDocumentOpen(true);
  };

  const closeViewDocument = () => {
    setViewDocumentOpen(false);
    setViewDocumentUrl('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusTone = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "uploaded":
        return "blue";
      case "under review":
        return "blue";
      default:
        return "gray";
    }
  };

  const getTypeTone = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("passport") || lowerType.includes("identity")) return "blue";
    if (lowerType.includes("legal") || lowerType.includes("right")) return "gray";
    if (lowerType.includes("sponsor")) return "blue";
    return "blue";
  };

  const getCaseLabel = (c) => {
    const candidateName = c.candidate ? `${c.candidate.first_name} ${c.candidate.last_name}` : "Unknown";
    return `${c.caseId} — ${candidateName}`;
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
          Document management
        </h1>
        <p className="text-sm font-bold text-gray-600 mt-1">
          Upload, review, and track all case documents
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section>
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3">
            Upload centre
          </p>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-sm font-black text-gray-900">Upload document</h2>
            </div>
            <div className="p-5 space-y-5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 py-10 px-4 text-center hover:border-secondary/40 hover:bg-secondary/5 transition-colors"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3">
                  <Upload size={22} className="text-secondary" />
                </div>
                <p className="text-sm font-black text-gray-900">Drop files here or click to browse</p>
                <p className="text-xs font-bold text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                {selectedFile && (
                  <p className="text-xs font-black text-secondary mt-2">Selected: {selectedFile.name}</p>
                )}
              </button>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Case ID
                </label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCaseLabel(c)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Document type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                >
                  {DOC_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Expiry date (optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this document…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-y min-h-[72px]"
                />
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full rounded-xl bg-secondary py-3 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload document"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div ref={missingRef}>
            <p className="text-[11px] font-black uppercase tracking-wider text-red-600 mb-3">
              Missing documents ({missingDocuments.length})
            </p>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {missingDocuments.length === 0 ? (
                  <li className="p-4 text-center text-sm font-bold text-gray-500">
                    No missing documents
                  </li>
                ) : (
                  missingDocuments.map((m, idx) => (
                    <li key={`${m.caseId}-${m.documentName}-${idx}`} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <AlertCircle size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-sm font-bold text-gray-900">{m.documentName}</p>
                        <p className="text-[11px] font-bold text-gray-500">
                          {m.caseIdDisplay} · {m.candidateName}
                        </p>
                      </div>
                      {m.isRequired && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => openUploadModal(m)}
                        className="shrink-0 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-black text-secondary hover:bg-secondary/20 transition-colors"
                      >
                        Upload
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3">
              Review panel
            </p>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                <h2 className="text-sm font-black text-gray-900">Pending review</h2>
                <span className="text-[11px] font-black rounded-full bg-secondary/15 text-secondary px-2.5 py-0.5">
                  {reviewDocuments.length} docs
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {reviewDocuments.length === 0 ? (
                  <li className="p-4 text-center text-sm font-bold text-gray-500">
                    No documents pending review
                  </li>
                ) : (
                  reviewDocuments.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FileText size={18} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-sm font-bold text-gray-900">{r.userFileName || r.documentName}</p>
                        <p className="text-[11px] font-bold text-gray-500">
                          {r.case?.caseId || `#${r.caseId}`} · {r.documentType}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openViewDocument(r.documentUrl)}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-gray-600 hover:border-secondary/40"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-800"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModal({ isOpen: true, doc: r, note: "" })}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-800"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
            All documents
          </p>
          <button
            type="button"
            onClick={() => openUploadModal()}
            className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white"
          >
            + Upload Document
          </button>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    "Document name",
                    "Type",
                    "Case",
                    "Status",
                    "Uploaded by",
                    "Upload date",
                    "Expiry",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </td>
                  </tr>
                ) : allDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm font-bold text-gray-500">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  allDocuments.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">{d.userFileName || d.documentName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${typeBadge(getTypeTone(d.documentType))}`}
                        >
                          {d.documentType || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-black text-secondary">{d.case?.caseId || `#${d.caseId}`}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${statBadge(getStatusTone(d.status))}`}
                        >
                          {d.status || "Uploaded"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-gray-700">{d.uploader ? `${d.uploader.first_name} ${d.uploader.last_name}` : "Unknown"}</td>
                      <td className="py-3 px-4 text-xs font-bold text-gray-500">{formatDate(d.uploadedAt)}</td>
                      <td className="py-3 px-4 text-xs font-bold text-gray-500">{formatDate(d.expiryDate)}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => openViewDocument(d.documentUrl)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600 hover:border-secondary/40"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">Upload document</h3>
              <button
                type="button"
                onClick={closeUploadModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
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
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitUploadDocument}
                  disabled={uploading}
                  className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload document"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">Reject document</h3>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, doc: null, note: "" })}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {rejectModal.doc && (
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-bold text-gray-900">{rejectModal.doc.userFileName || rejectModal.doc.documentName}</p>
                  <p className="text-[11px] font-bold text-gray-500">
                    {rejectModal.doc.case?.caseId || `#${rejectModal.doc.caseId}`} · {rejectModal.doc.documentType}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  value={rejectModal.note}
                  onChange={(e) => setRejectModal({ ...rejectModal, note: e.target.value })}
                  rows={4}
                  placeholder="Explain why this document is being rejected…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 resize-y min-h-[96px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, doc: null, note: "" })}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-red-600/20 hover:bg-red-600/90"
                >
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {viewDocumentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">View Document</h3>
              <button
                type="button"
                onClick={closeViewDocument}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50">
              {viewDocumentUrl ? (
                <iframe
                  src={viewDocumentUrl}
                  className="w-full h-[600px] border-0"
                  title="Document Viewer"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No document to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
