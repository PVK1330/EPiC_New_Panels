import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { uploadLicenceDocument, getLicenceDocuments, getMyLicenceApplications, downloadSponsorLicenceDocument } from "../../services/licenceApi";
import { useToast } from "../../context/ToastContext";
import { formatDateLong } from "../../utils/datetime";

const LicenceDocuments = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [docBusy, setDocBusy] = useState({});
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadAppId, setUploadAppId] = useState("");
  const [uploadDocType, setUploadDocType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [reuploadDoc, setReuploadDoc] = useState(null); // doc being re-uploaded
  const [reuploadFile, setReuploadFile] = useState(null);
  const [reuploading, setReuploading] = useState(false);
  const reuploadInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
    getMyLicenceApplications()
      .then((r) => setApplications(r.data?.data || []))
      .catch(() => {});
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getLicenceDocuments();
      if (res.data.status === "success") {
        const appCounters = {};
        const rows = Array.isArray(res.data.data)
          ? res.data.data.map((doc) => {
              const appId = doc.applicationId;
              if (appCounters[appId] === undefined) appCounters[appId] = 0;
              const docIndex = appCounters[appId]++;
              return {
                ...doc,
                docIndex,
                uploadDate: doc.uploadDate || doc.upload_date || Date.now(),
              };
            })
          : [];
        setDocuments(rows);
      }
    } catch (err) {
      showToast({ message: "Failed to fetch documents", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified":
      case "Valid":
        return "bg-emerald-100 text-emerald-700";
      case "Action Required":
        return "bg-amber-100 text-amber-700";
      case "Expired":
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Verified":
      case "Valid":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Action Required":
        return <AlertCircle size={16} className="text-amber-600" />;
      case "Expired":
      case "Rejected":
        return <AlertCircle size={16} className="text-red-600" />;
      case "Pending":
        return <Clock size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(q) ||
      (doc.fileName || "").toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q);
    const matchesFilter =
      filterType === "all" ||
      (filterType === "verified" && (doc.status === "Verified" || doc.status === "Valid")) ||
      (filterType === "action" && doc.status === "Action Required") ||
      (filterType === "expired" && (doc.status === "Expired" || doc.status === "Rejected")) ||
      (filterType === "pending" && doc.status === "Pending");
    return matchesSearch && matchesFilter;
  });

  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === "Verified" || d.status === "Valid").length;
  const actionDocs = documents.filter((d) => d.status === "Action Required").length;
  const expiredDocs = documents.filter((d) => d.status === "Expired" || d.status === "Rejected").length;

  const handleView = async (doc) => {
    setDocBusy((s) => ({ ...s, [doc.id]: "view" }));
    try {
      const res = await downloadSponsorLicenceDocument(doc.applicationId, doc.docIndex, { download: false });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      showToast({ message: "Failed to open document", variant: "danger" });
    } finally {
      setDocBusy((s) => ({ ...s, [doc.id]: null }));
    }
  };

  const handleDownload = async (doc) => {
    setDocBusy((s) => ({ ...s, [doc.id]: "download" }));
    try {
      const res = await downloadSponsorLicenceDocument(doc.applicationId, doc.docIndex, { download: true });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const cd = res.headers["content-disposition"] || "";
      const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
      const filename = match ? match[1].replace(/['"]/g, "") : (doc.fileName || doc.name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast({ message: "Failed to download document", variant: "danger" });
    } finally {
      setDocBusy((s) => ({ ...s, [doc.id]: null }));
    }
  };

  const handleDelete = (docId) => {
    showToast({ message: "Manual deletion of licence evidence is restricted. Please update the application.", variant: "info" });
  };

  const handleReuploadClick = (doc) => {
    setReuploadDoc(doc);
    setReuploadFile(null);
    // Trigger hidden file input
    setTimeout(() => reuploadInputRef.current?.click(), 50);
  };

  const handleReuploadFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setReuploadFile(file);
  };

  const handleReuploadSubmit = async () => {
    if (!reuploadFile || !reuploadDoc) return;
    try {
      setReuploading(true);
      await uploadLicenceDocument({
        files: [reuploadFile],
        applicationId: reuploadDoc.applicationId,
        documentType: reuploadDoc.name,
      });
      showToast({ message: "Document re-uploaded successfully. Status reset to Pending.", variant: "success" });
      setReuploadDoc(null);
      setReuploadFile(null);
      fetchDocuments();
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Re-upload failed", variant: "danger" });
    } finally {
      setReuploading(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          Licence Documents
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Manage all documents related to your sponsor licence.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-black">Total Documents</span>
          </div>
          <p className="text-2xl font-black text-secondary">{totalDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-sm font-black">Verified</span>
          </div>
          <p className="text-2xl font-black text-secondary">{verifiedDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <AlertCircle size={16} className="text-amber-500" />
            <span className="text-sm font-black">Action Required</span>
          </div>
          <p className="text-2xl font-black text-secondary">{actionDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-2 text-gray-900">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm font-black">Expired</span>
          </div>
          <p className="text-2xl font-black text-secondary">{expiredDocs}</p>
        </motion.div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="all">All Documents</option>
                <option value="verified">Verified</option>
                <option value="action">Action Required</option>
                <option value="expired">Expired / Rejected</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
            >
              <Upload size={14} />
              Upload Document
            </button>
          </div>
        </div>
      </motion.div>

      {/* Documents Table */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative min-h-[400px]"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-primary animate-spin mb-3" />
            <p className="text-gray-400 font-bold text-sm">Synchronizing documents...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px] w-12">Sr No</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Document Name</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Category</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Upload Date</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="text-right px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc, index) => (
                    <tr key={doc.id} className="border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2">
                        <span className="text-sm font-black text-gray-500 tabular-nums">{index + 1}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-secondary">{doc.name}</p>
                            {doc.fileName && doc.fileName !== doc.name && (
                              <p className="text-[10px] font-bold text-gray-400 truncate max-w-[220px]" title={doc.fileName}>
                                {doc.fileName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-black text-secondary">
                          {(() => {
                            const d = new Date(doc.uploadDate);
                            return Number.isNaN(d.getTime())
                              ? "—"
                              : formatDateLong(doc.uploadDate, { month: "short" });
                          })()}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(doc.status)}
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusStyle(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          {(doc.status === "Rejected" || doc.status === "rejected") && (
                            <button
                              onClick={() => handleReuploadClick(doc)}
                              disabled={reuploading && reuploadDoc?.id === doc.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm text-xs font-black disabled:opacity-50"
                              title="Re-upload rejected document"
                            >
                              {reuploading && reuploadDoc?.id === doc.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <RefreshCw size={13} />
                              )}
                              Re-upload
                            </button>
                          )}
                          <button
                            onClick={() => handleView(doc)}
                            disabled={!!docBusy[doc.id]}
                            className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View Document"
                          >
                            {docBusy[doc.id] === "view" ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            disabled={!!docBusy[doc.id]}
                            className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-secondary hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download"
                          >
                            {docBusy[doc.id] === "download" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 bg-red-50 text-red-300 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-20 text-center">
                      <div className="max-w-[200px] mx-auto">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText size={24} className="text-gray-200" />
                        </div>
                        <p className="text-sm font-black text-secondary mb-1">No documents found</p>
                        <p className="text-xs font-bold text-gray-400">Try adjusting your filters or search query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Hidden file input for re-upload */}
      <input
        ref={reuploadInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleReuploadFileChange}
      />

      {/* Re-upload confirmation modal */}
      {reuploadDoc && reuploadFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <RefreshCw size={17} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-black text-secondary">Re-upload Document</h3>
            </div>
            <p className="text-sm font-bold text-gray-600 mb-2">
              Replacing: <span className="text-secondary">{reuploadDoc.name}</span>
            </p>
            <p className="text-sm font-bold text-gray-600 mb-3">
              New file: <span className="text-secondary">{reuploadFile.name}</span>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              The document status will reset to <strong>Pending</strong> for caseworker review.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setReuploadDoc(null); setReuploadFile(null); }}
                className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-lg px-3 py-1.5 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReuploadSubmit}
                disabled={reuploading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-lg px-3 py-1.5 text-xs transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {reuploading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {reuploading ? "Uploading..." : "Confirm Re-upload"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-secondary">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Application *</label>
                <select
                  value={uploadAppId}
                  onChange={(e) => setUploadAppId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-secondary"
                >
                  <option value="">Select Application *</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      LIC-{a.id} — {a.companyName} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Document type (optional)</label>
                <input
                  type="text"
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="e.g. Evidence, Contract"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-black text-secondary mb-1">
                    Drag and drop file here, or click to browse
                  </p>
                  <p className="text-xs font-bold text-gray-500 mb-3">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload-modal"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="file-upload-modal"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition cursor-pointer shadow-sm"
                  >
                    <Upload size={13} />
                    Select File
                  </label>
                  {uploadFile ? (
                    <p className="text-xs font-bold text-gray-600 mt-2">{uploadFile.name}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadAppId("");
                    setUploadDocType("");
                  }}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-lg px-3 py-1.5 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={async () => {
                    if (!uploadFile || !uploadAppId) {
                      showToast({
                        message: "Select file and application",
                        variant: "danger",
                      });
                      return;
                    }
                    try {
                      setUploading(true);
                      await uploadLicenceDocument({
                        files: [uploadFile],
                        applicationId: uploadAppId,
                        documentType: uploadDocType,
                      });
                      showToast({ message: "Document uploaded", variant: "success" });
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadAppId("");
                      setUploadDocType("");
                      fetchDocuments();
                    } catch (err) {
                      showToast({
                        message: err.response?.data?.message || "Upload failed",
                        variant: "danger",
                      });
                    } finally {
                      setUploading(false);
                    }
                  }}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-lg px-3 py-1.5 text-xs transition disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LicenceDocuments;
