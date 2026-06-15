import React, { useState, useEffect } from "react";
import { getComplianceDocuments } from "../../services/licenceApi";
import useDownloads from "../../hooks/useDownloads";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Eye,
  Download,
  Trash2,
  Search,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  ShieldCheck,
  X,
} from "lucide-react";

// Mock data removed for dynamic implementation

const DocumentList = () => {
  const { downloadAssetFile, busy } = useDownloads();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [documentRows, setDocumentRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const STATUS_LABELS = {
    valid: "Approved",
    under_review: "Under Review",
    expired: "Expiring",
    missing: "Missing",
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const mapDocument = (doc) => {
    const fileName = doc.documentPath
      ? doc.documentPath.split("/").pop().replace(/^\d+-/, "")
      : "";
    const reviewer = doc.reviewer
      ? [doc.reviewer.first_name, doc.reviewer.last_name].filter(Boolean).join(" ").trim()
      : "";
    return {
      ...doc,
      name: doc.documentName || fileName || doc.documentType || "Untitled document",
      type: doc.documentType || "—",
      uploadDate: doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "—",
      fileSize: formatBytes(doc.fileSize),
      expiry: doc.expiryDate || "—",
      status: STATUS_LABELS[doc.status] || doc.status || "—",
      reviewedBy: reviewer || "—",
      source: "compliance",
      path: doc.documentPath,
    };
  };

  const fetchDocuments = () => {
    setLoading(true);
    getComplianceDocuments({ status: filter })
      .then((res) => {
        const rows = (res.data?.data || []).map(mapDocument);
        setDocumentRows(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Under Review":
        return "bg-amber-100 text-amber-700";
      case "Expiring":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "Under Review":
        return <Clock size={16} className="text-amber-600" />;
      case "Expiring":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const filteredDocs = documentRows.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Valid" && doc.status === "Approved") ||
      (filter === "Expiring Soon" && doc.status === "Expiring") ||
      (filter === "Under Review" && doc.status === "Under Review");
    return matchesSearch && matchesFilter;
  });

  const totalDocs = documentRows.length;
  const approvedDocs = documentRows.filter((d) => d.status === "Approved").length;
  const pendingDocs = documentRows.filter((d) => d.status !== "Approved").length;

  const handleView = (doc) => {
    setSelectedDoc(doc);
    setShowViewModal(true);
  };

  const handleDownload = async (doc) => {
    if (!doc.path) return alert("No file path available for this document.");
    const result = await downloadAssetFile(doc.path, doc.name);
    if (!result.ok) {
      alert(result.message || "Failed to download document");
    }
  };

  const handleDelete = async (docId, source) => {
    if (source !== 'compliance') {
      return alert("This document is linked to your profile or a licence application. Please manage it from the respective section.");
    }

    if (confirm("Are you sure you want to delete this compliance document?")) {
      try {
        const { deleteComplianceDocument } = await import("../../services/licenceApi");
        const res = await deleteComplianceDocument(docId);
        if (res.data.status === "success") {
          fetchDocuments();
        }
      } catch (err) {
        alert("Failed to delete document.");
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadName || !uploadType || !uploadFile) {
      return alert("Please fill in all fields and select a file.");
    }

    try {
      const { uploadComplianceDocument } = await import("../../services/licenceApi");
      const res = await uploadComplianceDocument({
        documentName: uploadName,
        documentType: uploadType,
        file: uploadFile
      });

      if (res.data.status === "success") {
        setShowUploadModal(false);
        setUploadName("");
        setUploadType("");
        setUploadFile(null);
        fetchDocuments();
      }
    } catch (err) {
      alert("Failed to upload document.");
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
          Compliance Documents
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Manage and track all compliance documents and their status.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-gray-900">
            <FileText size={20} className="text-primary" />
            <span className="font-black text-sm">Total Documents</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-gray-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span className="font-black text-sm">Approved</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
            {approvedDocs}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-gray-900">
            <Clock size={20} className="text-amber-500" />
            <span className="font-black text-sm">Pending Review</span>
          </div>
          <p className="text-3xl font-black text-secondary">{pendingDocs}</p>
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
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="All">All Documents</option>
                <option value="Valid">Valid</option>
                <option value="Under Review">Under Review</option>
                <option value="Expiring Soon">Expiring Soon</option>
              </select>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
            >
              <Upload size={14} />
              Upload Document
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Document Name</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Type</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Upload Date</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">File Size</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Expiry</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Reviewed By</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-3 py-2">
                      <p className="text-sm font-black text-secondary">{doc.name}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full bg-primary/10 text-primary">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-600">{doc.uploadDate}</td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-600">{doc.fileSize}</td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-600">{doc.expiry}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(doc.status)}
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusStyle(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-gray-600">{doc.reviewedBy}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleView(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white transition hover:bg-primary-dark shadow-sm"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-black text-gray-700 transition hover:bg-gray-300"
                        >
                          <Download size={12} />
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.source)}
                          className={`p-1.5 rounded-lg transition ${doc.source === 'compliance' ? 'hover:bg-gray-100 text-gray-500 hover:text-red-600' : 'opacity-20 cursor-not-allowed text-gray-300'}`}
                          title={doc.source !== 'compliance' ? "Integrated document cannot be deleted here" : "Delete document"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
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
              className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl"
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
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Document Name *</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    placeholder="Enter document name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Document Type *</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  >
                    <option value="">Select type</option>
                    <option value="Licence">Licence</option>
                    <option value="Policy">Policy</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Template">Template</option>
                    <option value="Report">Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">File *</label>
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-primary/50 transition cursor-pointer block">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      accept=".pdf,.doc,.docx"
                    />
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-600">
                      {uploadFile ? uploadFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs font-bold text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                  </label>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-lg px-3 py-1.5 text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedDoc && (
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
                <h3 className="text-sm font-black text-secondary">Document Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FileText size={24} className="text-primary" />
                  <div>
                    <p className="text-sm font-black text-secondary">{selectedDoc.name}</p>
                    <p className="text-xs font-bold text-gray-500">{selectedDoc.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Upload Date</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedDoc.uploadDate}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">File Size</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedDoc.fileSize}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Expiry</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedDoc.expiry}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Status</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {getStatusIcon(selectedDoc.status)}
                      <span className={`text-[10px] font-black rounded-full px-2 py-0.5 ${getStatusStyle(selectedDoc.status)}`}>
                        {selectedDoc.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Reviewed By</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedDoc.reviewedBy}</p>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => handleDownload(selectedDoc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-lg px-3 py-1.5 text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentList;
