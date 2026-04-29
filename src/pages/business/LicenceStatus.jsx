import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Hash,
  ShieldCheck,
  Star,
  Calendar,
  FileText,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  ChevronRight,
  ExternalLink,
  Loader2,
  PencilLine,
  Save,
  Plus,
  Trash2,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/constants";
import { 
  getMyLicenceApplications, 
  submitLicenceApplication, 
  updateLicenceApplication,
  deleteMyLicenceApplication
} from "../../services/licenceApi";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Skeleton } from "boneyard-js/react";

const LicenceStatus = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  
  const [summaryStats, setSummaryStats] = useState({
    licenceId: "Pending",
    status: "No Active Licence",
    allocation: { total: 0, used: 0, available: 0 },
    renewalDue: "N/A"
  });

  // Modals state
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editData, setEditData] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [renewalData, setRenewalData] = useState({
    renewalType: '',
    requestedAllocation: '',
    reason: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMyLicenceApplications();
      const data = res.data.data;
      setApplications(data);

      // Derive stats from data
      const latestApproved = data.find(app => app.status === 'Approved');
      const latestPending = data.find(app => app.status === 'Pending' || app.status === 'Under Review');
      
      setSummaryStats({
        licenceId: latestApproved ? `LIC-2026-${latestApproved.id}` : (latestPending ? `REQ-${latestPending.id}` : "None"),
        status: latestApproved ? "Active" : (latestPending ? "Pending Review" : "Inactive"),
        allocation: {
          total: latestApproved ? parseInt(latestApproved.cosAllocation) || 5 : 0,
          used: latestApproved ? Math.floor((parseInt(latestApproved.cosAllocation) || 5) * 0.4) : 0,
          available: latestApproved ? Math.ceil((parseInt(latestApproved.cosAllocation) || 5) * 0.6) : 0
        },
        renewalDue: latestApproved?.proposedStartDate ? new Date(latestApproved.proposedStartDate).toLocaleDateString() : "N/A"
      });
    } catch (err) {
      showToast({ message: "Failed to fetch applications", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await deleteMyLicenceApplication(id);
      showToast({ message: "Application deleted successfully", variant: "success" });
      fetchData();
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Delete failed", variant: "danger" });
    }
  };

  const handleEditClick = (app) => {
    setSelectedApp(app);
    // Only set editable fields to avoid sending internal DB fields back
    setEditData({
      registrationNumber: app.registrationNumber,
      cosAllocation: app.cosAllocation,
      reason: app.reason,
      industry: app.industry,
      licenceType: app.licenceType,
      proposedStartDate: app.proposedStartDate,
      contactName: app.contactName,
      contactEmail: app.contactEmail,
      contactPhone: app.contactPhone,
      fundingSource: app.fundingSource,
      estimatedAnnualCost: app.estimatedAnnualCost
    });
    setNewFiles([]);
    setShowEditForm(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await updateLicenceApplication(selectedApp.id, {
        ...editData,
        documents: newFiles
      });
      if (res.data.status === "success") {
        showToast({ message: "Application updated successfully", variant: "success" });
        setShowEditForm(false);
        fetchData();
      }
    } catch (err) {
      showToast({ message: "Update failed", variant: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewalSubmit = async () => {
    try {
      if (!applications[0]?.id) return;
      setSubmitting(true);
      
      const res = await api.post(`/api/business/licence/renew/${applications[0].id}`);
      
      if (res.data.status === "success") {
        showToast({ message: "Quick Renewal submitted successfully!", variant: "success" });
        setShowRenewalForm(false);
        fetchData();
      }
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Failed to submit renewal", variant: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Under Review': return 'bg-blue-100 text-blue-700';
      case 'Information Requested': return 'bg-red-100 text-red-700 animate-pulse';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-16 relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary" size={36} />
            Licence Intelligence
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">
            Manage your sponsor licence applications, track status, and upload evidence.
          </p>
        </div>
        <button 
          onClick={() => navigate("/business/apply-licence")}
          className="bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 w-fit"
        >
          <Plus size={20} />
          New Licence Application
        </button>
      </motion.div>

      {/* Information Request Alert */}
      {applications.find(app => app.status.toLowerCase() === 'information requested') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-secondary">Action Required: Information Requested</h3>
              <p className="text-sm font-bold text-gray-500">The Admin has requested more evidence for your application. Please review the details in the history table.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const app = applications.find(a => a.status.toLowerCase() === 'information requested');
              if (app) handleEditClick(app);
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            Review Request
          </button>
        </motion.div>
      )}

      {/* Hero Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: Hash, label: "Licence ID", value: summaryStats.licenceId, color: "text-primary" },
          { 
            icon: ShieldCheck, 
            label: "Current Status", 
            value: summaryStats.status, 
            color: summaryStats.status.toLowerCase().includes('active') ? "text-emerald-600" : "text-amber-600", 
            badge: true 
          },
          { icon: Star, label: "Compliance Rating", value: "A+", color: "text-amber-500" },
          { 
            icon: Calendar, 
            label: "Renewal Due", 
            value: summaryStats.renewalDue, 
            color: "text-secondary",
            onClick: () => setShowRenewalForm(true)
          },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants} 
            onClick={stat.onClick}
            className={`bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all ${stat.onClick ? 'cursor-pointer hover:border-primary/20 hover:scale-[1.02] active:scale-95' : ''}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-gray-50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
            </div>
            {stat.badge ? (
              <span className={`inline-flex rounded-full px-4 py-1.5 text-xs font-black ${stat.color.replace('text-', 'bg-').replace('600', '100')} ${stat.color.replace('text-', 'text-')}`}>
                {stat.value}
              </span>
            ) : (
              <p className="text-xl font-black text-secondary">{stat.value}</p>
            )}
            {stat.onClick && (
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Action Required <ChevronRight size={10} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Applications Table */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div variants={cardVariants} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-secondary">Application History</h2>
                    <p className="text-xs font-bold text-gray-400">Manage and edit your recent requests.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Type / ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Submitted</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="px-8 py-4">
                          <Skeleton height={60} className="w-full rounded-2xl" />
                        </td>
                      </tr>
                    ))
                  ) : applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-secondary">{app.type} Application</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">ID: #LIC-{app.id}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-secondary">
                            {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(app)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase"
                            >
                              <PencilLine size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedApp(app);
                                handleEditClick(app);
                              }}
                              className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                              title="View Details"
                            >
                              <ChevronRight size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(app.id)}
                              className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center">
                        <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-sm font-bold text-gray-400">No applications found. Click "New Application" to begin.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* CoS Allocation */}
          <motion.div variants={cardVariants} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-secondary/5 rounded-2xl">
                <Hash size={24} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-secondary">CoS Allocation Insights</h2>
                <p className="text-sm font-bold text-gray-400">Current Certificate of Sponsorship usage.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Total Allocated", value: summaryStats.allocation.total, color: "text-secondary" },
                { label: "Used", value: summaryStats.allocation.used, color: "text-primary" },
                { label: "Available", value: summaryStats.allocation.available, color: "text-emerald-600" },
              ].map((cos, i) => (
                <div key={i} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{cos.label}</p>
                  <p className={`text-4xl font-black ${cos.color}`}>{cos.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black text-secondary">
                <span>Usage Efficiency</span>
                <span>{summaryStats.allocation.total > 0 ? Math.round((summaryStats.allocation.used / summaryStats.allocation.total) * 100) : 0}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${summaryStats.allocation.total > 0 ? (summaryStats.allocation.used / summaryStats.allocation.total) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-8">
          
          <motion.div variants={cardVariants} className="bg-secondary text-white rounded-[2.5rem] p-8 shadow-xl shadow-secondary/20 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <ShieldAlert size={48} className="text-white/20 mb-6" />
            <h3 className="text-2xl font-black mb-2">Renewal Window</h3>
            <p className="text-white/70 text-sm font-bold mb-8">Your licence expires in 420 days. Strategic planning is recommended.</p>
            <button 
              onClick={() => setShowRenewalForm(true)}
              className="w-full bg-white text-secondary font-black py-4 rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Quick Renew
            </button>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Compliance Health</h3>
            <div className="space-y-4">
              {[
                { label: "Worker Records", status: "Compliant" },
                { label: "Absence Reporting", status: "Compliant" },
                { label: "HR Audit", status: "Action Required", warning: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                  <span className="text-xs font-black text-secondary">{item.label}</span>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.warning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                      <PencilLine size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-secondary">
                        {selectedApp?.status.toLowerCase() === 'pending' ? 'Edit Application' : 'Application Details'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: #LIC-{selectedApp?.id}</p>
                        {selectedApp?.status.toLowerCase() !== 'pending' && (
                          <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Read-only</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowEditForm(false)} className="p-2 text-gray-400 hover:text-secondary transition-colors">
                    <X size={28} />
                  </button>
                </div>

                {selectedApp?.status.toLowerCase() === 'information requested' && (
                  <div className="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={18} className="text-red-600" />
                      <h4 className="text-xs font-black text-red-600 uppercase tracking-widest">Admin Request Details</h4>
                    </div>
                    <p className="text-sm font-bold text-secondary mb-4">{selectedApp.adminNotes || "Please provide the following additional documents/information."}</p>
                    {selectedApp.requestedDocuments && (
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedApp.requestedDocuments) ? selectedApp.requestedDocuments.map((doc, idx) => (
                          <span key={idx} className="bg-white border border-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{doc}</span>
                        )) : (
                          <span className="bg-white border border-red-100 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{selectedApp.requestedDocuments}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Company Name</label>
                      <input
                        type="text"
                        disabled
                        value={selectedApp?.companyName || ""}
                        className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Application Type</label>
                      <input
                        type="text"
                        disabled
                        value={selectedApp?.type || ""}
                        className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Registration Number</label>
                      <input
                        type="text"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.registrationNumber}
                        onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">CoS Allocation</label>
                      <input
                        type="text"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.cosAllocation}
                        onChange={(e) => setEditData({ ...editData, cosAllocation: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Name</label>
                      <input
                        type="text"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.contactName}
                        onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Email</label>
                      <input
                        type="email"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.contactEmail}
                        onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Business Justification</label>
                    <textarea
                      disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                      value={editData.reason}
                      onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all resize-none disabled:opacity-60"
                      rows={4}
                    />
                  </div>

                  {/* Document Management */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Evidence & Documents</label>
                    <div className="space-y-3 mb-6">
                      {selectedApp?.documents?.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 truncate max-w-[200px]">{doc.split('\\').pop().split('/').pop()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <a 
                               href={`${API_BASE_URL}/${doc.replace(/\\/g, '/')}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-1.5 bg-white text-gray-400 rounded-lg hover:text-primary transition-all"
                               title="View Document"
                             >
                               <Eye size={14} />
                             </a>
                             <span className="text-[10px] font-black text-emerald-600 uppercase ml-2">Uploaded</span>
                          </div>
                        </div>
                      ))}
                      {newFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-pulse">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-primary" />
                            <span className="text-xs font-bold text-primary truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} className="text-primary/40 hover:text-primary">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {(selectedApp?.status.toLowerCase() !== 'approved' && selectedApp?.status.toLowerCase() !== 'rejected') && (
                      <>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files)])}
                          className="hidden"
                          id="edit-file-upload"
                        />
                        <label
                          htmlFor="edit-file-upload"
                          className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-100 rounded-2xl py-4 text-xs font-black text-gray-400 hover:border-primary/20 hover:text-primary transition-all cursor-pointer"
                        >
                          <Upload size={16} />
                          Add More Evidence
                        </label>
                      </>
                    )}
                  </div>

                   <div className="flex gap-4 pt-6">
                    {(selectedApp?.status.toLowerCase() !== 'approved' && selectedApp?.status.toLowerCase() !== 'rejected') ? (
                      <>
                        <button
                          onClick={handleUpdateSubmit}
                          disabled={submitting}
                          className="flex-[2] bg-primary hover:bg-primary-dark text-white font-black rounded-2xl py-4 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                          {submitting ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update Application</>}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowEditForm(false)}
                        className="flex-1 bg-secondary text-white font-black rounded-2xl py-4 transition-all"
                      >
                        Close Details
                      </button>
                    )}
                    {(selectedApp?.status.toLowerCase() !== 'approved' && selectedApp?.status.toLowerCase() !== 'rejected') && (
                      <button
                        onClick={() => setShowEditForm(false)}
                        className="flex-1 bg-gray-50 text-gray-500 hover:bg-gray-100 font-black rounded-2xl py-4 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Renewal Modal */}
      <AnimatePresence>
        {showRenewalForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                      <RefreshCw size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-secondary">Quick Renewal</h2>
                  </div>
                  <button onClick={() => setShowRenewalForm(false)} className="p-2 text-gray-400 hover:text-secondary transition-colors">
                    <X size={28} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Renewal Category</label>
                    <select
                      value={renewalData.renewalType}
                      onChange={(e) => setRenewalData({ ...renewalData, renewalType: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary"
                    >
                      <option value="">Select type</option>
                      <option>Standard Renewal</option>
                      <option>Allocation Increase</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Reason</label>
                    <textarea
                      value={renewalData.reason}
                      onChange={(e) => setRenewalData({ ...renewalData, reason: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleRenewalSubmit}
                      disabled={submitting}
                      className="flex-1 bg-secondary hover:bg-secondary-dark text-white font-black rounded-2xl py-4 transition-all shadow-lg active:scale-95"
                    >
                      {submitting ? <Loader2 className="animate-spin" /> : "Submit Request"}
                    </button>
                    <button
                      onClick={() => setShowRenewalForm(false)}
                      className="flex-1 bg-gray-50 text-gray-500 hover:bg-gray-100 font-black rounded-2xl py-4 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LicenceStatus;