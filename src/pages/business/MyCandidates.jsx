import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Search,
  Filter,
  Eye,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Briefcase,
  X,
} from "lucide-react";

const MyCandidates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Ananya Patel",
      caseStatus: "In Progress",
      visaType: "Skilled Worker",
      assignedCaseworker: "Sarah Johnson",
      submissionDate: "2024-02-15",
      expectedCompletion: "2024-04-15",
      documents: {
        passport: "complete",
        visaCopy: "pending",
        contract: "complete",
        payslips: "pending",
      },
      progress: 65,
    },
    {
      id: 2,
      name: "Michael Chen",
      caseStatus: "Pending Review",
      visaType: "Skilled Worker",
      assignedCaseworker: "John Smith",
      submissionDate: "2024-01-20",
      expectedCompletion: "2024-03-20",
      documents: {
        passport: "complete",
        visaCopy: "complete",
        contract: "complete",
        payslips: "complete",
      },
      progress: 90,
    },
    {
      id: 3,
      name: "Emma Wilson",
      caseStatus: "Approved",
      visaType: "Skilled Worker",
      assignedCaseworker: "Sarah Johnson",
      submissionDate: "2023-11-10",
      expectedCompletion: "2024-01-10",
      documents: {
        passport: "complete",
        visaCopy: "complete",
        contract: "complete",
        payslips: "complete",
      },
      progress: 100,
    },
    {
      id: 4,
      name: "David Brown",
      caseStatus: "In Progress",
      visaType: "Skilled Worker",
      assignedCaseworker: "John Smith",
      submissionDate: "2024-03-01",
      expectedCompletion: "2024-05-01",
      documents: {
        passport: "complete",
        visaCopy: "pending",
        contract: "pending",
        payslips: "pending",
      },
      progress: 35,
    },
  ]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Pending Review":
        return "bg-amber-100 text-amber-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "In Progress":
        return <Clock size={16} className="text-blue-600" />;
      case "Pending Review":
        return <AlertCircle size={16} className="text-amber-600" />;
      case "Rejected":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case "complete":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.assignedCaseworker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "approved" && candidate.caseStatus === "Approved") ||
      (filterType === "in-progress" && candidate.caseStatus === "In Progress") ||
      (filterType === "pending" && candidate.caseStatus === "Pending Review");
    return matchesSearch && matchesFilter;
  });

  const totalCandidates = candidates.length;
  const inProgress = candidates.filter((c) => c.caseStatus === "In Progress").length;
  const approved = candidates.filter((c) => c.caseStatus === "Approved").length;
  const pending = candidates.filter((c) => c.caseStatus === "Pending Review").length;

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
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
          My Candidates
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Track and manage all candidate applications and their progress.
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
            <Users size={20} className="text-primary" />
            <span className="font-black">Total Candidates</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalCandidates}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock size={20} className="text-blue-600" />
            <span className="font-black">In Progress</span>
          </div>
          <p className="text-3xl font-black text-secondary">{inProgress}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Approved</span>
          </div>
          <p className="text-3xl font-black text-secondary">{approved}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">Pending Review</span>
          </div>
          <p className="text-3xl font-black text-secondary">{pending}</p>
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
              placeholder="Search candidates..."
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
              <option value="all">All Candidates</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add Candidate
          </button>
        </div>
      </motion.div>

      {/* Candidates Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Candidate</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Case Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Caseworker</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Submission Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Expected Completion</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Progress</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Documents</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-secondary">{candidate.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(candidate.caseStatus)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(candidate.caseStatus)}`}>
                        {candidate.caseStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{candidate.visaType}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{candidate.assignedCaseworker}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{candidate.submissionDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{candidate.expectedCompletion}</td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${candidate.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">{candidate.progress}%</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {Object.entries(candidate.documents).map(([doc, status]) => (
                        <span
                          key={doc}
                          className={`inline-flex items-center px-2 py-1 text-[9px] font-black rounded ${getDocStatusStyle(status)}`}
                          title={doc}
                        >
                          {doc.charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleViewCandidate(candidate)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Candidate Details Modal */}
      {showModal && selectedCandidate && (
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
            className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-secondary">Candidate Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Candidate Information */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Candidate Information</h4>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-secondary">{selectedCandidate.name}</p>
                    <p className="text-xs font-bold text-gray-500">{selectedCandidate.visaType}</p>
                  </div>
                </div>
              </div>

              {/* Case Information */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Case Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Case Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedCandidate.caseStatus)}
                      <span className={`text-sm font-black rounded-full px-3 py-1 ${getStatusStyle(selectedCandidate.caseStatus)}`}>
                        {selectedCandidate.caseStatus}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Progress</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedCandidate.progress}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Submission Date</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedCandidate.submissionDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Expected Completion</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedCandidate.expectedCompletion}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Caseworker */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Assigned Caseworker</h4>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Briefcase size={16} className="text-primary" />
                  </div>
                  <p className="text-sm font-black text-secondary">{selectedCandidate.assignedCaseworker}</p>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Document Status</h4>
                <div className="space-y-3">
                  {Object.entries(selectedCandidate.documents).map(([doc, status]) => (
                    <div key={doc} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-500" />
                        <span className="text-sm font-black text-secondary capitalize">{doc}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getDocStatusStyle(status)}`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                >
                  Close
                </button>
                <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition">
                  Contact Caseworker
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyCandidates;
