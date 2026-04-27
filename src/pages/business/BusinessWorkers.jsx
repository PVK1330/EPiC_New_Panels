import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Filter,
  Search,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { getSponsoredWorkers, deleteSponsoredWorker } from "../../services/sponsoredWorkerApi";
import { toast } from "react-hot-toast";

const BusinessWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await getSponsoredWorkers();
      if (response.data.status === "success") {
        setWorkers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast.error("Failed to load workers");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (candidateId) => {
    if (!window.confirm("Are you sure you want to remove this worker? This will delete their case association.")) return;
    
    try {
      const response = await deleteSponsoredWorker(candidateId);
      if (response.data.status === "success") {
        toast.success("Worker removed successfully");
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error deleting worker:", error);
      toast.error("Failed to remove worker");
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const candidateName = `${worker.candidate?.first_name || ''} ${worker.candidate?.last_name || ''}`.toLowerCase();
    const candidateEmail = (worker.candidate?.email || '').toLowerCase();
    
    const matchesSearch =
      candidateName.includes(searchTerm.toLowerCase()) ||
      candidateEmail.includes(searchTerm.toLowerCase()) ||
      (worker.caseId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter =
      filterStatus === "all" || worker.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
      case "Active":
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Pending":
      case "Under Review":
      case "Docs Pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
      case "Active":
      case "Completed":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Rejected":
      case "Cancelled":
        return <AlertCircle size={16} className="text-red-600" />;
      case "Pending":
      case "Under Review":
      case "Docs Pending":
        return <AlertCircle size={16} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const activeCount = workers.filter((w) => ["Active", "Approved", "Completed"].includes(w.status)).length;
  const pendingCount = workers.filter((w) => ["Pending", "Under Review", "Docs Pending"].includes(w.status)).length;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-black text-secondary animate-pulse">Loading workers...</p>
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
          Workers
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage sponsored workers and visa sponsorships.
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
            <Users size={20} className="text-primary" />
            <span className="font-black">Total Workers</span>
          </div>
          <p className="text-3xl font-black text-secondary">{workers.length}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span className="font-black">Active / Approved</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
            {activeCount}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">Pending Review</span>
          </div>
          <p className="text-3xl font-black text-secondary">{pendingCount}</p>
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
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            >
              <option value="all">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={()=>navigate("/business/sponsored-workers")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add Worker
          </button>
        </div>
      </motion.div>

      {/* Workers Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Job Title</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Case ID</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Salary</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Stage</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                        {worker.candidate?.first_name?.charAt(0)}{worker.candidate?.last_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-secondary">{worker.candidate?.first_name} {worker.candidate?.last_name}</p>
                        <p className="text-xs font-bold text-gray-600">{worker.candidate?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">{worker.jobTitle || "Not specified"}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600 font-mono">{worker.caseId || "N/A"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">£{Number(worker.salaryOffered).toLocaleString()}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{worker.caseStage}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(worker.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusColor(worker.status)}`}>
                        {worker.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/business/Sponsorworkerdetails?candidateId=${worker.candidateId}`)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                        title="View details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteWorker(worker.candidateId)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-200"
                        title="Remove Worker"
                      >
                        <Trash2 size={14} />
                        Delete
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
      {!loading && filteredWorkers.length === 0 && (
        <motion.div
          className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-sm font-bold text-gray-600">No workers found matching your search</p>
          <button
            onClick={()=>navigate("/business/sponsored-workers")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary px-6 py-2 text-sm font-black text-primary transition hover:bg-primary/5"
          >
            <Plus size={16} />
            Add Your First Worker
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BusinessWorkers;
