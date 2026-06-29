import { useState, useEffect, useCallback } from "react";
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
import useSponsorLicence from "../../hooks/useSponsorLicence";
import LicenceGateBanner from "../../components/business/LicenceGateBanner";

const BusinessWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  // CRIT-03: modal-driven delete — replaces window.confirm()
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, workerId: null, workerName: "" });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { ready: licenceReady, licenceStatus, canSponsorWorkers } = useSponsorLicence();
  const workerBlocked = licenceReady && !canSponsorWorkers;

  // MED-02: stable reference so useEffect dep is satisfied without infinite loop
  const fetchWorkers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // CRIT-03: open modal instead of native confirm
  const openDeleteConfirm = (workerId, worker) => {
    const name = `${worker.workerFirstName || ""} ${worker.workerLastName || ""}`.trim() || "this worker";
    setDeleteConfirm({ open: true, workerId, workerName: name });
  };

  const confirmDeleteWorker = async () => {
    setDeleting(true);
    try {
      const response = await deleteSponsoredWorker(deleteConfirm.workerId);
      if (response.data.status === "success") {
        toast.success("Worker removed successfully");
        setDeleteConfirm({ open: false, workerId: null, workerName: "" });
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error deleting worker:", error);
      toast.error("Failed to remove worker");
    } finally {
      setDeleting(false);
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const workerName = `${worker.workerFirstName || ''} ${worker.workerLastName || ''}`.toLowerCase();
    const workerEmail = (worker.workerEmail || '').toLowerCase();

    const matchesSearch =
      workerName.includes(searchTerm.toLowerCase()) ||
      workerEmail.includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || (worker.status || "").toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Visa Granted":
        return "bg-emerald-100 text-emerald-700";
      case "Visa Rejected":
        return "bg-red-100 text-red-700";
      case "Registered":
        return "bg-blue-100 text-blue-700";
      case "CoS Assigned":
      case "Immigration Assessment":
      case "Visa Preparation":
      case "Compliance Review":
      case "Visa Decision":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Visa Granted":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Visa Rejected":
        return <AlertCircle size={16} className="text-red-600" />;
      case "Registered":
        return <Briefcase size={16} className="text-blue-500" />;
      case "CoS Assigned":
      case "Immigration Assessment":
      case "Visa Preparation":
      case "Compliance Review":
      case "Visa Decision":
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const awaitingCosCount = workers.filter((w) => w.status === "Registered").length;
  const cosAssignedCount = workers.filter((w) => w.workerCosNumber != null).length;

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
    <div className="space-y-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          Workers
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Manage sponsored workers and visa sponsorships.
        </p>
      </motion.div>

      {workerBlocked && <LicenceGateBanner status={licenceStatus} />}

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-primary" />
            <span className="font-black text-xs text-gray-600">Total Workers</span>
          </div>
          <p className="text-3xl font-black text-secondary">{workers.length}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={18} className="text-blue-500" />
            <span className="font-black text-xs text-gray-600">Awaiting CoS</span>
          </div>
          <p className="text-3xl font-black text-secondary">{awaitingCosCount}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">Registered, no CoS assigned</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span className="font-black text-xs text-gray-600">CoS Assigned</span>
          </div>
          <p className="text-3xl font-black text-secondary">{cosAssignedCount}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">Workers with CoS reference number</p>
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
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                aria-label="Search workers"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 px-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
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
                <option value="Registered">Registered (Awaiting CoS)</option>
                <option value="CoS Assigned">CoS Assigned</option>
                <option value="Immigration Assessment">Immigration Assessment</option>
                <option value="Visa Preparation">Visa Preparation</option>
                <option value="Compliance Review">Compliance Review</option>
                <option value="Visa Decision">Visa Decision</option>
                <option value="Visa Granted">Visa Granted</option>
                <option value="Visa Rejected">Visa Rejected</option>
              </select>
            </div>
            <button
              onClick={()=>{ if (!workerBlocked) navigate("/business/sponsored-workers"); }}
              disabled={workerBlocked}
              title={workerBlocked ? "Your Sponsorship Licence is not active." : "Add Worker"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white transition hover:bg-primary-dark shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus size={16} />
              Add Worker
            </button>
          </div>
        </div>
      </motion.div>

      {/* Workers Table / Empty State */}
      {filteredWorkers.length > 0 ? (
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
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Worker</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Nationality</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Visa Type</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">CoS Number</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                            {worker.workerFirstName?.charAt(0)}{worker.workerLastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-secondary">{worker.workerFirstName} {worker.workerLastName}</p>
                            <p className="text-xs font-bold text-gray-600">{worker.workerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700">{worker.workerNationality || "—"}</td>
                      <td className="px-3 py-2 text-sm font-bold text-gray-700">{worker.visaType || "—"}</td>
                      <td className="px-3 py-2">
                        {worker.workerCosNumber ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                            {worker.workerCosNumber}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(worker.status)}
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusColor(worker.status)}`}>
                            {worker.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate("/business/worker-details", { state: { workerId: worker.id } })}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white transition hover:bg-primary-dark shadow-sm"
                            title="View details"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(worker.id, worker)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-black text-red-600 transition hover:bg-red-200"
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
          </div>
        </motion.div>
      ) : (
        !loading && (
          <motion.div
            className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm overflow-hidden relative"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-600">No workers found matching your search</p>
            <button
              onClick={() => { if (!workerBlocked) navigate("/business/sponsored-workers"); }}
              disabled={workerBlocked}
              title={workerBlocked ? "Your Sponsorship Licence is not active." : "Add Your First Worker"}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-black text-primary transition hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add Your First Worker
            </button>
          </motion.div>
        )
      )}
      {/* CRIT-03: Delete confirmation modal — replaces window.confirm() */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Remove Worker</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to remove <span className="font-black text-secondary">{deleteConfirm.workerName}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDeleteConfirm({ open: false, workerId: null, workerName: "" })}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-black text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWorker}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-600 text-sm font-black text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                Remove Worker
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BusinessWorkers;
