import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  Loader2,
  Trash2
} from "lucide-react";
import { getSponsoredWorkers, deleteSponsoredWorker } from "../../services/sponsoredWorkerApi";
import { toast } from "react-hot-toast";

const MyCandidates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await getSponsoredWorkers();
      if (response.data.status === "success") {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to remove this candidate?")) return;
    try {
      const response = await deleteSponsoredWorker(id);
      if (response.data.status === "success") {
        toast.success("Candidate removed successfully");
        fetchCandidates();
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to remove candidate");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
      case "Active":
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "In Progress":
      case "Under Review":
        return "bg-blue-100 text-blue-700";
      case "Pending Review":
      case "Docs Pending":
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
      case "Active":
      case "Completed":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "In Progress":
      case "Under Review":
        return <Clock size={16} className="text-blue-600" />;
      case "Pending Review":
      case "Docs Pending":
      case "Pending":
        return <AlertCircle size={16} className="text-amber-600" />;
      case "Rejected":
      case "Cancelled":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const filteredCandidates = candidates.filter((item) => {
    const candidate = item.candidate;
    const name = `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || 
                         (candidate?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterType === "all" ||
      (filterType === "approved" && item.status === "Approved") ||
      (filterType === "in-progress" && item.status === "In Progress") ||
      (filterType === "pending" && (item.status === "Pending" || item.status === "Pending Review"));
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: candidates.length,
    inProgress: candidates.filter(c => ["In Progress", "Under Review"].includes(c.status)).length,
    approved: candidates.filter(c => ["Approved", "Active", "Completed"].includes(c.status)).length,
    pending: candidates.filter(c => ["Pending", "Pending Review", "Docs Pending"].includes(c.status)).length
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-black text-secondary animate-pulse">Loading candidates...</p>
      </div>
    );
  }

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
          <p className="text-3xl font-black text-secondary">{stats.total}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock size={20} className="text-blue-600" />
            <span className="font-black">In Progress</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.inProgress}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Approved</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.approved}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">Pending Review</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.pending}</p>
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
              placeholder="Search candidates by name or email..."
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
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
          <button
            onClick={() => navigate("/business/sponsored-workers")}
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
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-left">Candidate</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-left">Case Status</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-left">Job Title</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-left">Case ID</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-left">Salary</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-left">Stage</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs uppercase">
                        {item.candidate?.first_name?.charAt(0)}{item.candidate?.last_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-secondary">{item.candidate?.first_name} {item.candidate?.last_name}</p>
                        <p className="text-[10px] font-bold text-gray-500">{item.candidate?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{item.jobTitle || "N/A"}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600 font-mono">{item.caseId || "N/A"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">£{Number(item.salaryOffered).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-600 uppercase">
                      {item.caseStage}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/business/Sponsorworkerdetails?candidateId=${item.candidateId}`)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(item.candidateId)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                        title="Remove"
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

      {/* Empty State */}
      {!loading && filteredCandidates.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-lg font-black text-secondary">No candidates found</p>
          <p className="text-sm font-bold text-gray-500 mt-1">Try adjusting your search or filter settings.</p>
        </div>
      )}
    </div>
  );
};

export default MyCandidates;
