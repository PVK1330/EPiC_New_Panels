import React, { useState } from "react";
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

const documentsData = [
  {
    id: 1,
    name: "Sponsor Licence Letter",
    type: "Licence",
    uploadDate: "1 Apr 2026",
    expiry: "Jun 2028",
    status: "Approved",
    reviewedBy: "Ahmed Al-Rashid",
    fileSize: "2.5 MB",
  },
  {
    id: 2,
    name: "HR Policies",
    type: "Policy",
    uploadDate: "3 Apr 2026",
    expiry: "-",
    status: "Under Review",
    reviewedBy: "Ahmed Al-Rashid",
    fileSize: "1.2 MB",
  },
  {
    id: 3,
    name: "Employer Liability Insurance",
    type: "Insurance",
    uploadDate: "28 Mar 2026",
    expiry: "Apr 2027",
    status: "Approved",
    reviewedBy: "TechCorp HR",
    fileSize: "3.8 MB",
  },
  {
    id: 4,
    name: "Employment Contracts Template",
    type: "Template",
    uploadDate: "25 Mar 2026",
    expiry: "Sep 2030",
    status: "Approved",
    reviewedBy: "Priya Sharma",
    fileSize: "0.8 MB",
  },
  {
    id: 5,
    name: "Right to Work Policy",
    type: "Policy",
    uploadDate: "25 Mar 2026",
    expiry: "Sep 2030",
    status: "Approved",
    reviewedBy: "Priya Sharma",
    fileSize: "1.5 MB",
  },
  {
    id: 6,
    name: "CoS Allocation Report",
    type: "Report",
    uploadDate: "15 Mar 2026",
    expiry: "Mar 2027",
    status: "Expiring",
    reviewedBy: "John Smith",
    fileSize: "2.1 MB",
  },
];

const DocumentList = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("");

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

  const filteredDocs = documentsData.filter((doc) => {
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

  const totalDocs = documentsData.length;
  const approvedDocs = documentsData.filter((d) => d.status === "Approved").length;
  const pendingDocs = documentsData.filter((d) => d.status !== "Approved").length;

  const handleView = (doc) => {
    setSelectedDoc(doc);
    setShowViewModal(true);
  };

  const handleDownload = (doc) => {
    // Simulate download
    alert(`Downloading: ${doc.name}`);
  };

  const handleDelete = (docId) => {
    if (confirm("Are you sure you want to delete this document?")) {
      alert(`Document deleted: ${docId}`);
    }
  };

  const handleUpload = () => {
    if (uploadName && uploadType) {
      alert(`Uploading: ${uploadName} (${uploadType})`);
      setShowUploadModal(false);
      setUploadName("");
      setUploadType("");
      setUploadFile(null);
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Compliance Documents
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage and track all compliance documents and their status.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <FileText size={20} className="text-primary" />
            <span className="font-black">Total Documents</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span className="font-black">Approved</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
            {approvedDocs}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock size={20} className="text-amber-500" />
            <span className="font-black">Pending Review</span>
          </div>
          <p className="text-3xl font-black text-secondary">{pendingDocs}</p>
        </motion.div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
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
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Document Name</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Upload Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">File Size</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Expiry</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Reviewed By</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-secondary">{doc.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full bg-primary/10 text-primary">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.uploadDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.fileSize}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.expiry}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.reviewedBy}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-300"
                      >
                        <Download size={14} />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-secondary">Upload Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Document Name *</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                    placeholder="Enter document name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Document Type *</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  <label className="block text-xs font-bold text-gray-700 mb-2">File *</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/50 transition cursor-pointer">
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
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
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-secondary">Document Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <FileText size={32} className="text-primary" />
                  <div>
                    <p className="text-sm font-black text-secondary">{selectedDoc.name}</p>
                    <p className="text-xs font-bold text-gray-500">{selectedDoc.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Upload Date</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedDoc.uploadDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">File Size</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedDoc.fileSize}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Expiry</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedDoc.expiry}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedDoc.status)}
                      <span className={`text-sm font-black rounded-full px-3 py-1 ${getStatusStyle(selectedDoc.status)}`}>
                        {selectedDoc.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Reviewed By</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedDoc.reviewedBy}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDownload(selectedDoc)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
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