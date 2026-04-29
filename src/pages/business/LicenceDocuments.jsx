import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { getLicenceDocuments } from "../../services/licenceApi";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../utils/constants";

const LicenceDocuments = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getLicenceDocuments();
      if (res.data.status === "success") {
        setDocuments(res.data.data);
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
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleView = (doc) => {
    const fullPath = doc.path.replace(/\\/g, '/');
    window.open(`${API_BASE_URL}/${fullPath}`, "_blank");
  };

  const handleDownload = (doc) => {
    const fullPath = doc.path.replace(/\\/g, '/');
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/${fullPath}`;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (docId) => {
    showToast({ message: "Manual deletion of licence evidence is restricted. Please update the application.", variant: "info" });
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
          Licence Documents
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage all documents related to your sponsor licence.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
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
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Verified</span>
          </div>
          <p className="text-3xl font-black text-secondary">{verifiedDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">Action Required</span>
          </div>
          <p className="text-3xl font-black text-secondary">{actionDocs}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-red-600" />
            <span className="font-black">Expired</span>
          </div>
          <p className="text-3xl font-black text-secondary">{expiredDocs}</p>
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
          <Link
            to="/business/apply-licence"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Upload size={16} />
            Upload Document
          </Link>
        </div>
      </motion.div>

      {/* Documents Table */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm min-h-[400px]"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <p className="text-gray-400 font-bold">Synchronizing documents...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-left">Document Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-left">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-left">Upload Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-left">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText size={22} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-secondary">{doc.name}</p>
                            <p className="text-[10px] font-bold text-gray-400">ID: #DOC-{doc.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-xs font-black text-secondary">
                          {new Date(doc.uploadDate).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="View Document"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2.5 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="max-w-[200px] mx-auto">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText size={32} className="text-gray-200" />
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
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Category *</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                  <option value="">Select category</option>
                  <option value="company">Company Documents</option>
                  <option value="financial">Financial Documents</option>
                  <option value="hr">HR Documents</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm font-black text-secondary mb-2">
                    Drag and drop file here, or click to browse
                  </p>
                  <p className="text-xs font-bold text-gray-500 mb-4">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                  <input type="file" className="hidden" id="file-upload-modal" />
                  <label
                    htmlFor="file-upload-modal"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark cursor-pointer"
                  >
                    <Upload size={16} />
                    Select File
                  </label>
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
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                >
                  Upload
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
