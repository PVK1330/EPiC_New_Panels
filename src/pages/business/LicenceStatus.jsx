import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Fragment } from "react";
import {
  LayoutDashboard,
  Hash,
  ShieldCheck,
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
  Eye,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyLicenceApplications,
  getLicenceSummary,
  renewLicence,
  submitLicenceApplication,
  updateLicenceApplication,
  deleteMyLicenceApplication,
  downloadSponsorLicenceDocument,
} from "../../services/licenceApi";
import { triggerDownload } from "../../services/documentApi";
import LicenceWorkflowTimeline from "../../components/licence/LicenceWorkflowTimeline";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatDateLong } from "../../utils/datetime";

const LicenceStatus = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  const [summaryStats, setSummaryStats] = useState({
    licenceId: "Pending",
    status: "No Active Licence",
    allocation: { total: 0, used: 0, available: 0 },
    renewalDue: "N/A",
    daysRemaining: null,
    renewalEligible: false,
    pendingRenewal: null,
  });

  // Modals state
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [docBusy, setDocBusy] = useState(null); // `${index}:${mode}` while a doc loads
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
      const [appsRes, summaryRes] = await Promise.all([
        getMyLicenceApplications(),
        getLicenceSummary().catch(() => null),
      ]);
      const data = appsRes.data.data;
      setApplications(data);

      if (summaryRes?.data?.data) {
        const s = summaryRes.data.data;
        const latestPending = data.find(
          (app) => app.status === "Pending" || app.status === "Under Review"
        );
        setSummaryStats({
          licenceId: s.licenceId || (latestPending ? `REQ-${latestPending.id}` : "None"),
          status: typeof s.status === "string" ? s.status : "Inactive",
          allocation: {
            total: s.cos?.total ?? s.cosAllocation?.total ?? 0,
            used: s.cos?.used ?? s.cosAllocation?.used ?? 0,
            available: s.cos?.available ?? s.cosAllocation?.available ?? 0,
          },
          renewalDue: s.expiryDate ? formatDate(s.expiryDate) : "N/A",
          daysRemaining: s.daysRemaining ?? null,
          renewalEligible: s.renewalEligible ?? false,
          pendingRenewal: s.pendingRenewal ?? null,
        });
      } else {
        const latestApproved = data.find((app) => app.status === "Approved");
        const latestPending = data.find(
          (app) => app.status === "Pending" || app.status === "Under Review"
        );
        setSummaryStats({
          licenceId: latestApproved
            ? `LIC-2026-${latestApproved.id}`
            : latestPending
              ? `REQ-${latestPending.id}`
              : "None",
          status: latestApproved ? "Active" : latestPending ? "Pending Review" : "Inactive",
          allocation: {
            total: latestApproved ? parseInt(latestApproved.cosAllocation, 10) || 0 : 0,
            used: 0,
            available: latestApproved ? parseInt(latestApproved.cosAllocation, 10) || 0 : 0,
          },
          renewalDue: latestApproved?.proposedStartDate
            ? formatDate(latestApproved.proposedStartDate)
            : "N/A",
          daysRemaining: null,
          renewalEligible: false,
          pendingRenewal: null,
        });
      }
    } catch (err) {
      showToast({ message: "Failed to fetch applications", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Documents stream through an authenticated endpoint (no static serving).
  const handleDocument = async (index, mode) => {
    if (!selectedApp || docBusy) return;
    try {
      setDocBusy(`${index}:${mode}`);
      const res = await downloadSponsorLicenceDocument(selectedApp.id, index, { download: mode === "download" });
      const blob = res.data;
      const cd = res.headers?.["content-disposition"] || "";
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match ? match[1] : `document-${index + 1}`;
      if (mode === "download") {
        triggerDownload(blob, filename);
      } else {
        const url = window.URL.createObjectURL(blob);
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) triggerDownload(blob, filename);
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      let message = err?.response?.data?.message;
      if (!message && err?.response?.data instanceof Blob) {
        try { message = JSON.parse(await err.response.data.text())?.message; } catch { /* ignore */ }
      }
      showToast({ message: message || "Unable to open this document", variant: "danger" });
    } finally {
      setDocBusy(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete application?",
      text: "This will permanently remove the licence application. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
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
    if (!renewalData.renewalType) {
      showToast({ message: "Please select a renewal category before submitting.", variant: "danger" });
      return;
    }
    const approvedApp = applications.find((a) => a.status === "Approved");
    if (!approvedApp) {
      showToast({ message: "No approved licence application found to renew.", variant: "danger" });
      return;
    }
    try {
      setSubmitting(true);
      await renewLicence(approvedApp.id, renewalData);
      showToast({ message: "Renewal application submitted successfully!", variant: "success" });
      setShowRenewalForm(false);
      setRenewalData({ renewalType: "", requestedAllocation: "", reason: "" });
      fetchData();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) {
        showToast({ message: msg || "A renewal is already in progress for this licence.", variant: "danger" });
      } else if (status === 400) {
        showToast({ message: msg || "Your licence is not yet eligible for renewal (within 90 days of expiry).", variant: "danger" });
      } else {
        showToast({ message: msg || "Failed to submit renewal. Please try again.", variant: "danger" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':              return 'bg-emerald-100 text-emerald-700';
      case 'Rejected':              return 'bg-red-100 text-red-700';
      case 'Under Review':          return 'bg-blue-100 text-blue-700';
      case 'Information Requested': return 'bg-red-100 text-red-700 animate-pulse';
      case 'Government Processing': return 'bg-violet-100 text-violet-700';
      case 'Decision Pending':      return 'bg-orange-100 text-orange-700';
      default:                      return 'bg-amber-100 text-amber-700';
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
    <div className="space-y-5 pb-6 relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-primary shrink-0" size={26} />
            Sponsor Licence
          </h1>
          <p className="text-primary font-bold text-sm mt-0.5">
            Manage your sponsor licence applications, track their status, and upload evidence.
          </p>
        </div>
        <button
          onClick={() => navigate("/business/apply-licence-v2")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm w-fit"
        >
          <Plus size={14} />
          New Licence Application
        </button>
      </motion.div>

      {/* Information Request Alert */}
      {applications.find(app => app.status.toLowerCase() === 'information requested') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-100 bg-red-50 shadow-sm overflow-hidden relative flex items-center justify-between gap-4 p-5"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-red-600" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl text-red-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-secondary">Action Required: Information Requested</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">The Admin has requested more evidence for your application. Please review the details in the history table.</p>
            </div>
          </div>
          <button
            onClick={() => {
              const app = applications.find(a => a.status.toLowerCase() === 'information requested');
              if (app) handleEditClick(app);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-black text-white hover:bg-red-700 transition shadow-sm shrink-0"
          >
            Review Request
          </button>
        </motion.div>
      )}

      {/* Government Processing Banner */}
      {applications.find(app => app.status === 'Government Processing') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-100 bg-violet-50 shadow-sm overflow-hidden relative flex items-center justify-between gap-4 p-5"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-400 to-violet-600" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
              <ExternalLink size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-secondary">Government Portal Processing</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">Your application is being processed through the UK government portal. Track progress and confirm credentials in Licence Tracking.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/business/licence-process")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-black text-white hover:bg-violet-700 transition shadow-sm shrink-0 whitespace-nowrap"
          >
            Track Progress
          </button>
        </motion.div>
      )}

      {/* Decision Pending Banner */}
      {applications.find(app => app.status === 'Decision Pending') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-orange-100 bg-orange-50 shadow-sm overflow-hidden relative flex items-center justify-between gap-4 p-5"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-600" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-secondary">Awaiting UKVI Decision</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">Your application has been submitted to UKVI. Decisions typically take 8–12 weeks. You will be notified when a decision is made.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/business/licence-process")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-black text-white hover:bg-orange-600 transition shadow-sm shrink-0 whitespace-nowrap"
          >
            View Status
          </button>
        </motion.div>
      )}

      {/* Hero Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
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
            color: String(summaryStats.status).toLowerCase().includes('active') ? "text-emerald-600" : "text-amber-600",
            badge: true
          },
          { icon: Hash, label: "CoS Available", value: summaryStats.allocation.available, color: "text-emerald-600" },
          {
            icon: Calendar,
            label: "Renewal Due",
            value: summaryStats.renewalDue,
            color: "text-secondary",
            onClick: () => setShowRenewalForm(true)
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            onClick={stat.onClick}
            className={`rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-all ${stat.onClick ? 'cursor-pointer hover:border-primary/20 hover:scale-[1.02] active:scale-95' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{stat.label}</span>
            </div>
            {stat.badge ? (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${stat.color.replace('text-', 'bg-').replace('600', '100')} ${stat.color.replace('text-', 'text-')}`}>
                {stat.value}
              </span>
            ) : (
              <p className="text-lg font-black text-secondary">{stat.value}</p>
            )}
            {stat.onClick && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Action Required <ChevronRight size={10} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Applications Table */}
        <div className="lg:col-span-2 space-y-4">

          <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
            <div className="p-5 border-b border-gray-100 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <Clock size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-secondary">Application History</h2>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mt-0.5">Manage and edit your recent requests.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Type / ID</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Submitted</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="px-3 py-2">
                          <div className="animate-pulse bg-gray-200 h-12 w-full rounded-xl" />
                        </td>
                      </tr>
                    ))
                  ) : applications.length > 0 ? (
                    applications.map((app) => {
                      const isV2 = Number(app.applicationVersion) === 2;
                      return (
                      <Fragment key={app.id}>
                      <tr className="border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-2">
                          <p className="text-xs font-black text-secondary flex items-center gap-1.5">
                            {app.type} Application
                            {isV2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-primary/10 text-primary">
                                V2
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                            #LIC-{app.id}{app.licenceType ? ` · ${app.licenceType}` : ""}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <p className="text-xs font-black text-secondary">
                            {formatDateLong(app.createdAt, { month: 'short' })}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(() => {
                              const isDraftOrInfo = app.status === "Draft" || app.status === "Information Requested";
                              const canEdit = !isV2 || isDraftOrInfo;
                              const BtnIcon = canEdit ? PencilLine : Eye;
                              const btnLabel = isV2
                                ? (app.status === "Draft" ? "Edit Draft" : isDraftOrInfo ? "Edit" : "View")
                                : "Edit";
                              return (
                                <button
                                  onClick={() => {
                                    if (isV2) {
                                      if (isDraftOrInfo) {
                                        navigate(`/business/apply-licence-v2?draft=${app.id}`);
                                      } else {
                                        navigate("/business/licence-process");
                                      }
                                    } else {
                                      handleEditClick(app);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-black text-primary hover:bg-primary hover:text-white transition shadow-sm"
                                >
                                  <BtnIcon size={12} /> {btnLabel}
                                </button>
                              );
                            })()}
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="inline-flex items-center rounded-lg bg-red-50 px-2 py-1.5 text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isV2 && (
                        <tr className="bg-primary/5 border-b border-gray-100 last:border-0">
                          <td colSpan={4} className="px-3 py-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <p className="text-[11px] font-bold text-secondary/70 flex-1">
                                This application uses the new V2 process. View full details and stages on the Licence Tracking page.
                              </p>
                              <button
                                type="button"
                                onClick={() => navigate("/business/licence-process")}
                                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-black text-white hover:bg-secondary-dark transition shadow-sm"
                              >
                                Open Licence Tracking <ChevronRight size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center">
                        <FileText className="mx-auto text-gray-200 mb-3" size={36} />
                        <p className="text-xs font-bold text-gray-400">No applications found. Click "New Application" to begin.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* CoS Allocation */}
          <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative p-5">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/5 rounded-xl">
                <Hash size={18} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-sm font-black text-secondary">CoS Allocation Insights</h2>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mt-0.5">Current Certificate of Sponsorship usage.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Total Allocated", value: summaryStats.allocation.total, color: "text-secondary" },
                { label: "Used", value: summaryStats.allocation.used, color: "text-primary" },
                { label: "Available", value: summaryStats.allocation.available, color: "text-emerald-600" },
              ].map((cos, i) => (
                <div key={cos.label} className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">{cos.label}</p>
                  <p className={`text-2xl font-black ${cos.color}`}>{cos.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black text-secondary">
                <span>Usage Efficiency</span>
                <span>{summaryStats.allocation.total > 0 ? Math.round((summaryStats.allocation.used / summaryStats.allocation.total) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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
        <div className="space-y-4">

          {/* Renewal card — 4 states */}
          {(() => {
            const { daysRemaining, renewalEligible, pendingRenewal, status, renewalDue } = summaryStats;
            const isExpired = status === "Expired" || (daysRemaining !== null && daysRemaining <= 0);
            const isPending = pendingRenewal !== null;
            const isEligible = renewalEligible && !isPending && !isExpired;
            const isNotEligible = !isEligible && !isPending && !isExpired;

            if (isPending) {
              return (
                <motion.div variants={cardVariants} className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden relative p-5">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="absolute -right-8 -top-6 w-32 h-32 bg-amber-50 rounded-full blur-2xl" />
                  <Clock size={26} className="text-amber-400 mb-3" />
                  <h3 className="text-sm font-black text-secondary mb-1">Renewal In Progress</h3>
                  <p className="text-xs font-bold text-gray-500 mb-3">
                    A renewal application has been submitted and is being reviewed.
                  </p>
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-700">
                    #{`LIC-${pendingRenewal.id}`} · {pendingRenewal.status}
                  </div>
                </motion.div>
              );
            }

            if (isExpired) {
              return (
                <motion.div variants={cardVariants} className="rounded-2xl bg-red-600 text-white shadow-sm shadow-red-200 overflow-hidden relative p-5 group">
                  <div className="absolute -right-8 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <ShieldAlert size={32} className="text-white/20 mb-3" />
                  <h3 className="text-sm font-black mb-1">Licence Expired</h3>
                  <p className="text-white/70 text-xs font-bold mb-4">
                    Your licence has expired. Submit a renewal application immediately.
                  </p>
                  <button
                    onClick={() => setShowRenewalForm(true)}
                    className="w-full bg-white text-red-600 font-black py-2 rounded-xl hover:bg-red-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 text-xs"
                  >
                    <RefreshCw size={14} />
                    Renew Now
                  </button>
                </motion.div>
              );
            }

            if (isEligible) {
              const urgency = daysRemaining !== null && daysRemaining <= 14
                ? "bg-red-600 shadow-red-200"
                : daysRemaining !== null && daysRemaining <= 30
                  ? "bg-orange-500 shadow-orange-200"
                  : "bg-secondary shadow-secondary/20";
              return (
                <motion.div variants={cardVariants} className={`${urgency} rounded-2xl text-white shadow-sm overflow-hidden relative p-5 group`}>
                  <div className="absolute -right-8 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <ShieldAlert size={32} className="text-white/20 mb-3" />
                  <h3 className="text-sm font-black mb-1">Renewal Due</h3>
                  <p className="text-white/70 text-xs font-bold mb-1">
                    {daysRemaining !== null
                      ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining until expiry.`
                      : `Renewal due ${renewalDue}.`}
                  </p>
                  {renewalDue && renewalDue !== "N/A" && (
                    <p className="text-white/50 text-[10px] font-bold mb-4">Expires: {renewalDue}</p>
                  )}
                  <button
                    onClick={() => setShowRenewalForm(true)}
                    className="w-full bg-white text-secondary font-black py-2 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 text-xs"
                  >
                    <RefreshCw size={14} />
                    Quick Renew
                  </button>
                </motion.div>
              );
            }

            // Not eligible — window not open yet
            const daysUntilWindow = daysRemaining !== null ? daysRemaining - 90 : null;
            return (
              <motion.div variants={cardVariants} className="rounded-2xl bg-secondary text-white shadow-sm shadow-secondary/20 overflow-hidden relative p-5 group">
                <div className="absolute -right-8 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <ShieldAlert size={32} className="text-white/20 mb-3" />
                <h3 className="text-sm font-black mb-2">Renewal</h3>
                <p className="text-white/70 text-xs font-bold mb-4">
                  {daysUntilWindow !== null && daysUntilWindow > 0
                    ? `Renewal window opens in ${daysUntilWindow} day${daysUntilWindow !== 1 ? "s" : ""} (90 days before expiry).`
                    : renewalDue && renewalDue !== "N/A"
                      ? `Your licence is due for renewal on ${renewalDue}.`
                      : "Submit a renewal when your licence is within 90 days of expiry."}
                </p>
                <button
                  disabled
                  className="w-full bg-white/20 text-white/50 font-black py-2 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 text-xs"
                >
                  <RefreshCw size={14} />
                  Not Yet Eligible
                </button>
              </motion.div>
            );
          })()}

          <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative p-5">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">How it works</h3>
            <div className="space-y-3">
              {[
                { n: 1, label: "Submit your application", desc: "Complete the form and attach your supporting documents." },
                { n: 2, label: "Review by our team", desc: "We check your details and may request more information." },
                { n: 3, label: "Decision & activation", desc: "Once approved, your sponsor licence is activated." },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">{s.n}</div>
                  <div>
                    <p className="text-xs font-black text-secondary">{s.label}</p>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary">
                      <PencilLine size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-secondary">
                        {selectedApp?.status.toLowerCase() === 'pending' ? 'Edit Application' : 'Application Details'}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ID: #LIC-{selectedApp?.id}</p>
                        {selectedApp?.status.toLowerCase() !== 'pending' && (
                          <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Read-only</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowEditForm(false)} className="p-1.5 text-gray-400 hover:text-secondary transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {selectedApp?.status.toLowerCase() === 'information requested' && (
                  <div className="mb-4 p-4 rounded-xl border border-red-100 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={15} className="text-red-600" />
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-wider">Admin Request Details</h4>
                    </div>
                    <p className="text-xs font-bold text-secondary mb-3">{selectedApp.adminNotes || "Please provide the following additional documents/information."}</p>
                    {selectedApp.requestedDocuments && (
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedApp.requestedDocuments) ? selectedApp.requestedDocuments.map((doc, idx) => (
                          <span key={doc} className="bg-white border border-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{doc}</span>
                        )) : (
                          <span className="bg-white border border-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{selectedApp.requestedDocuments}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Company Name</label>
                      <input
                        type="text"
                        disabled
                        value={selectedApp?.companyName || ""}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Application Type</label>
                      <input
                        type="text"
                        disabled
                        value={selectedApp?.type || ""}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Registration Number</label>
                      <input
                        type="text"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.registrationNumber}
                        onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">CoS Allocation</label>
                      <input
                        type="text"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.cosAllocation}
                        onChange={(e) => setEditData({ ...editData, cosAllocation: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Contact Name</label>
                      <input
                        type="text"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.contactName}
                        onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-60"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Contact Email</label>
                      <input
                        type="email"
                        disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                        value={editData.contactEmail}
                        onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary focus:ring-4 focus:ring-primary/5 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Business Justification</label>
                    <textarea
                      disabled={selectedApp?.status.toLowerCase() === 'approved' || selectedApp?.status.toLowerCase() === 'rejected'}
                      value={editData.reason}
                      onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all resize-none disabled:opacity-60"
                      rows={4}
                    />
                  </div>

                  {/* Document Management */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-3">Evidence & Documents</label>
                    <div className="space-y-2 mb-4">
                      {selectedApp?.documents?.map((doc, i) => {
                        const previewing = docBusy === `${i}:preview`;
                        const downloading = docBusy === `${i}:download`;
                        return (
                          <div key={doc} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={15} className="text-gray-400 shrink-0" />
                              <span className="text-xs font-bold text-gray-500 truncate max-w-[200px]">{doc.split('\\').pop().split('/').pop()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleDocument(i, "preview")}
                                disabled={!!docBusy}
                                className="p-1.5 bg-white text-gray-400 rounded-lg hover:text-primary transition-all disabled:opacity-60"
                                title="View document"
                              >
                                {previewing ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDocument(i, "download")}
                                disabled={!!docBusy}
                                className="p-1.5 bg-white text-gray-400 rounded-lg hover:text-primary transition-all disabled:opacity-60"
                                title="Download document"
                              >
                                {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {newFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-primary/5 animate-pulse">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-primary" />
                            <span className="text-xs font-bold text-primary truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} className="text-primary/40 hover:text-primary">
                            <X size={14} />
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
                          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-[10px] font-black text-gray-400 hover:border-primary/20 hover:text-primary transition-all cursor-pointer"
                        >
                          <Upload size={14} />
                          Add More Evidence
                        </label>
                      </>
                    )}
                  </div>

                  {selectedApp?.id && (
                    <div className="pt-4">
                      <LicenceWorkflowTimeline applicationId={selectedApp.id} viewerRole="sponsor" />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {(selectedApp?.status.toLowerCase() !== 'approved' && selectedApp?.status.toLowerCase() !== 'rejected') ? (
                      <>
                        <button
                          onClick={handleUpdateSubmit}
                          disabled={submitting}
                          className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm disabled:opacity-60"
                        >
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Update Application</>}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowEditForm(false)}
                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-secondary px-3 py-1.5 text-xs font-black text-white hover:bg-secondary-dark transition shadow-sm"
                      >
                        Close Details
                      </button>
                    )}
                    {(selectedApp?.status.toLowerCase() !== 'approved' && selectedApp?.status.toLowerCase() !== 'rejected') && (
                      <button
                        onClick={() => setShowEditForm(false)}
                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-500 hover:bg-gray-100 transition shadow-sm"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                      <RefreshCw size={18} />
                    </div>
                    <h2 className="text-sm font-black text-secondary">Quick Renewal</h2>
                  </div>
                  <button onClick={() => setShowRenewalForm(false)} className="p-1.5 text-gray-400 hover:text-secondary transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Pre-fill notice */}
                {(() => {
                  const approvedApp = applications.find((a) => a.status === "Approved");
                  return approvedApp ? (
                    <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700">
                      Renewing licence #{`LIC-${approvedApp.id}`} · {approvedApp.licenceType || "Sponsor Licence"}
                    </div>
                  ) : null;
                })()}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">
                      Renewal Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={renewalData.renewalType}
                      onChange={(e) => setRenewalData({ ...renewalData, renewalType: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary"
                    >
                      <option value="">Select type</option>
                      <option value="Standard Renewal">Standard Renewal</option>
                      <option value="Allocation Increase">Allocation Increase</option>
                    </select>
                  </div>

                  {renewalData.renewalType === "Allocation Increase" && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Requested CoS Allocation</label>
                      <input
                        type="number"
                        min={1}
                        value={renewalData.requestedAllocation}
                        onChange={(e) => setRenewalData({ ...renewalData, requestedAllocation: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary"
                        placeholder="Number of CoS required"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider block mb-2">Reason / Notes</label>
                    <textarea
                      value={renewalData.reason}
                      onChange={(e) => setRenewalData({ ...renewalData, reason: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-secondary resize-none"
                      rows={3}
                      placeholder="Briefly describe the purpose of this renewal…"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={handleRenewalSubmit}
                      disabled={submitting || !renewalData.renewalType}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-black text-white hover:bg-secondary-dark transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <><RefreshCw size={14} /> Submit Renewal</>}
                    </button>
                    <button
                      onClick={() => setShowRenewalForm(false)}
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-500 hover:bg-gray-100 transition shadow-sm"
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
