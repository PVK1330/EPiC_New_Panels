import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

const LicenceDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Certificate of Incorporation",
      uploadDate: "2023-01-15",
      expiryDate: "N/A",
      status: "Verified",
      category: "Company Documents",
      size: "2.5 MB",
    },
    {
      id: 2,
      name: "Articles of Association",
      uploadDate: "2023-01-15",
      expiryDate: "N/A",
      status: "Verified",
      category: "Company Documents",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Latest Annual Accounts",
      uploadDate: "2023-12-20",
      expiryDate: "2024-12-31",
      status: "Valid",
      category: "Financial Documents",
      size: "4.2 MB",
    },
    {
      id: 4,
      name: "Business Plan",
      uploadDate: "2023-02-10",
      expiryDate: "N/A",
      status: "Verified",
      category: "Company Documents",
      size: "3.1 MB",
    },
    {
      id: 5,
      name: "Organisational Chart",
      uploadDate: "2023-03-05",
      expiryDate: "N/A",
      status: "Verified",
      category: "HR Documents",
      size: "1.2 MB",
    },
    {
      id: 6,
      name: "HR Policies",
      uploadDate: "2023-03-10",
      expiryDate: "2024-03-10",
      status: "Expiring Soon",
      category: "HR Documents",
      size: "2.8 MB",
    },
    {
      id: 7,
      name: "Key Personnel Details",
      uploadDate: "2023-02-20",
      expiryDate: "N/A",
      status: "Verified",
      category: "HR Documents",
      size: "1.5 MB",
    },
    {
      id: 8,
      name: "Insurance Certificate",
      uploadDate: "2023-11-15",
      expiryDate: "2024-11-15",
      status: "Valid",
      category: "Insurance",
      size: "0.8 MB",
    },
  ]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified":
      case "Valid":
        return "bg-emerald-100 text-emerald-700";
      case "Expiring Soon":
        return "bg-amber-100 text-amber-700";
      case "Expired":
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
      case "Expiring Soon":
        return <Clock size={16} className="text-amber-600" />;
      case "Expired":
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
      (filterType === "expiring" && doc.status === "Expiring Soon") ||
      (filterType === "expired" && doc.status === "Expired") ||
      (filterType === "pending" && doc.status === "Pending");
    return matchesSearch && matchesFilter;
  });

  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === "Verified" || d.status === "Valid").length;
  const expiringDocs = documents.filter((d) => d.status === "Expiring Soon").length;
  const expiredDocs = documents.filter((d) => d.status === "Expired").length;

  const handleView = (doc) => {
    setSelectedDoc(doc);
    alert(`Viewing: ${doc.name}`);
  };

  const handleDownload = (doc) => {
    alert(`Downloading: ${doc.name}`);
  };

  const handleDelete = (docId) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter((d) => d.id !== docId));
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
            <Clock size={20} className="text-amber-500" />
            <span className="font-black">Expiring Soon</span>
          </div>
          <p className="text-3xl font-black text-secondary">{expiringDocs}</p>
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
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
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

      {/* Documents Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Upload Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Expiry Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Size</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-secondary">{doc.name}</p>
                        <p className="text-[10px] font-bold text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.category}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.uploadDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.expiryDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{doc.size}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-600"
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
