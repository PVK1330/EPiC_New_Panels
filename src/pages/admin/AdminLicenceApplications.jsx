import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Building2,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Check,
  X,
  FileText,
  UserPlus,
  MessageSquare,
  ChevronDown,
  Trash2,
  Pencil,
  Save,
  Loader2,
  Key,
  Send,
  Lock,
  EyeOff,
  Globe,
  ClipboardCheck,
  BadgeCheck,
  CircleDot,
  Upload,
  RefreshCw,
} from "lucide-react";
import {
  getAllLicenceApplications,
  updateLicenceApplicationStatus,
  grantLicence,
  requestLicenceInfo,
  assignLicenceCaseworker,
  deleteLicenceApplicationByAdmin,
  downloadAdminLicenceDocument,
  generateLicenceCredentials,
  resendLicenceCredentials,
  dispatchDocumentToSponsor,
  getAdminSubmittedCredentials,
  verifyAdminSubmittedCredentials,
  requestAdminCredentialsResubmission,
} from "../../services/licenceApi";
import { triggerDownload } from "../../services/documentApi";
import LicenceStages from "../../components/licence/LicenceStages";
import LicenceWorkflowTimeline from "../../components/licence/LicenceWorkflowTimeline";
import api from "../../services/api";
import socketService from "../../services/socket.service";
import { getCaseworkers } from "../../services/caseWorker";
import { useToast } from "../../context/ToastContext";
import { formatDateLong, formatTime } from "../../utils/datetime";

const AdminLicenceApplications = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [caseworkers, setCaseworkers] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionType, setActionType] = useState(""); // Approve, Reject, RequestInfo
  const [adminNotes, setAdminNotes] = useState("");
  const [requestedDocs, setRequestedDocs] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedCaseworkerIds, setSelectedCaseworkerIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [docBusy, setDocBusy] = useState(null); // `${index}:${mode}` while a doc loads
  const [credForm, setCredForm] = useState({ ukviPortalUserId: "", ukviPortalPassword: "", smsPortalUsername: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [grantForm, setGrantForm] = useState({ licenceNumber: "", expiryDate: "", cosAllocation: "" });
  const [showDispatch, setShowDispatch] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({ documentType: "supporting_document", documentName: "", message: "" });
  const [dispatchFile, setDispatchFile] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Sponsor-submitted UKVI credentials (admin view)
  const [adminSubmittedCreds,     setAdminSubmittedCreds]     = useState(null);
  const [adminCredsLoading,       setAdminCredsLoading]       = useState(false);
  const [showAdminCredsPassword,  setShowAdminCredsPassword]  = useState(false);
  const [adminCredsActionLoading, setAdminCredsActionLoading] = useState(false);

  // Pagination + "New" badge tracking (plain object — Set state is unreliable in React)
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;
  const [viewedMap, setViewedMap] = useState({});

  const markViewed = (id) => {
    setViewedMap(prev => {
      if (prev[id]) return prev;          // no change → same reference → no re-render
      return { ...prev, [id]: true };     // new object → forces re-render
    });
  };

  // "New" = created within last 48 h AND not yet clicked open this session
  const isNew = (app) =>
    !viewedMap[app.id] &&
    Date.now() - new Date(app.createdAt).getTime() < 48 * 3600000;

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getAllLicenceApplications();
      setApplications(res.data.data);
    } catch (err) {
      showToast({ message: "Failed to fetch applications", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseworkers = async () => {
    try {
      const res = await getCaseworkers(1, 100);
      setCaseworkers(res.data?.data?.caseworkers || []);
    } catch (err) {
      console.error("Failed to fetch caseworkers");
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCaseworkers();
  }, []);

  // Re-fetch list when any licence stage updates so the admin panel reflects
  // the new state without a manual refresh.
  useEffect(() => {
    socketService.on("licence:stage_updated", fetchApplications);
    return () => socketService.off("licence:stage_updated", fetchApplications);
  }, []);

  // Fetch sponsor-submitted credentials whenever the selected app changes.
  useEffect(() => {
    if (!selectedApp?.id) { setAdminSubmittedCreds(null); return; }
    setAdminSubmittedCreds(null);
    setShowAdminCredsPassword(false);
    let active = true;
    (async () => {
      try {
        setAdminCredsLoading(true);
        const res = await getAdminSubmittedCredentials(selectedApp.id).catch(() => null);
        if (active) setAdminSubmittedCreds(res?.data?.data || null);
      } finally {
        if (active) setAdminCredsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedApp?.id]);

  // Open the action modal for a specific application + action, seeding any
  // action-specific state. Keeps a single source of truth for the target app.
  const openAction = (app, type) => {
    setSelectedApp(app);
    setActionType(type);
    setAdminNotes("");
    setRequestedDocs("");
    if (type === "Assign") {
      setSelectedCaseworkerIds(Array.isArray(app?.assignedcaseworkerId) ? app.assignedcaseworkerId : []);
    }
    if (type === "GenerateCredentials") {
      setCredForm({ ukviPortalUserId: "", ukviPortalPassword: "", smsPortalUsername: "" });
      setShowPwd(false);
    }
    if (type === "Approved") {
      setGrantForm({ licenceNumber: "", expiryDate: "", cosAllocation: "" });
    }
    setShowActionModal(true);
  };

  // Fully reset the action modal so no state (notes, selection, target app)
  // leaks into the next action or re-opens the details modal underneath.
  const closeActionModal = () => {
    setShowActionModal(false);
    setActionType("");
    setAdminNotes("");
    setRequestedDocs("");
    setSelectedCaseworkerIds([]);
    setCredForm({ ukviPortalUserId: "", ukviPortalPassword: "", smsPortalUsername: "" });
    setShowPwd(false);
    setGrantForm({ expiryDate: "", cosAllocation: "" });
    setShowDispatch(false);
    setSelectedApp(null);
  };

  // Closing the read-only "Request Details" side panel must also reset the
  // dispatch form toggle — otherwise reopening any application shows the
  // "Send Document" form expanded from a previous session.
  const closeDetailsPanel = () => {
    setShowDispatch(false);
    setSelectedApp(null);
  };

  const handleAction = async () => {
    if (actionLoading) return;
    if (!actionType || !selectedApp) return;
    if ((actionType === 'Rejected' || actionType === 'RequestInfo') && !adminNotes.trim()) {
      showToast({ message: "Please enter a note for this action", variant: "warning" });
      return;
    }

    try {
      setActionLoading(true);
      if (actionType === 'RequestInfo') {
        const docs = requestedDocs.split(',').map(d => d.trim()).filter(d => d);
        await requestLicenceInfo(selectedApp?.id, {
          adminNotes: adminNotes,
          requestedDocuments: docs
        });
        showToast({ message: "Information request sent to business", variant: "success" });
      } else if (actionType === 'Approved') {
        if (!grantForm.licenceNumber?.trim()) {
          showToast({ message: "Enter the UKVI licence number before granting", variant: "error" });
          return;
        }
        await grantLicence(selectedApp?.id, {
          licenceNumber: grantForm.licenceNumber.trim(),
          notes: adminNotes || undefined,
          ...(grantForm.expiryDate    && { expiryDate:    grantForm.expiryDate }),
          ...(grantForm.cosAllocation && { cosAllocation: Number(grantForm.cosAllocation) }),
        });
        showToast({ message: "Licence granted — sponsor has been notified by email", variant: "success" });
      } else {
        await updateLicenceApplicationStatus(selectedApp?.id, {
          status: actionType,
          adminNotes: adminNotes
        });
        const verb = actionType === 'Rejected' ? 'rejected' : 'updated';
        showToast({ message: `Application ${verb} successfully`, variant: "success" });
      }

      closeActionModal();
      fetchApplications();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.code === "ECONNABORTED" ? "Request timed out. Please try again." : null) ||
        err?.message ||
        "Action failed. Please try again.";
      showToast({ message, variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (appId, selectedIds) => {
    if (actionLoading) return;
    if (!appId) return;
    if (!selectedIds || selectedIds.length === 0) {
      showToast({ message: "Select at least one caseworker", variant: "warning" });
      return;
    }
    try {
      setActionLoading(true);
      await assignLicenceCaseworker(appId, { caseworkerIds: selectedIds });
      showToast({ message: "Caseworker(s) assigned successfully", variant: "success" });
      closeActionModal();
      fetchApplications();
    } catch (err) {
      const message = err?.response?.data?.message || "Assignment failed. Please try again.";
      showToast({ message, variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  // Documents are streamed through an authenticated endpoint (no static serving).
  // mode "preview" opens inline in a new tab; "download" forces a file download.
  const handleDocument = async (index, mode) => {
    if (!selectedApp || docBusy) return;
    try {
      setDocBusy(`${index}:${mode}`);
      const res = await downloadAdminLicenceDocument(selectedApp.id, index, { download: mode === "download" });
      const blob = res.data;

      const cd = res.headers?.["content-disposition"] || "";
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match ? match[1] : `document-${index + 1}`;

      if (mode === "download") {
        triggerDownload(blob, filename);
      } else {
        const url = window.URL.createObjectURL(blob);
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
          // Popup blocked — fall back to a download so the action isn't lost.
          triggerDownload(blob, filename);
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      let message = err?.response?.data?.message;
      // Error bodies come back as a Blob when responseType is "blob".
      if (!message && err?.response?.data instanceof Blob) {
        try { message = JSON.parse(await err.response.data.text())?.message; } catch { /* ignore */ }
      }
      showToast({ message: message || "Unable to open this document", variant: "danger" });
    } finally {
      setDocBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleteLoading) return;
    try {
      setDeleteLoading(true);
      await deleteLicenceApplicationByAdmin(deleteTarget.id);
      showToast({ message: "Application deleted successfully", variant: "success" });
      setDeleteTarget(null);
      fetchApplications();
    } catch (err) {
      const message = err?.response?.data?.message || "Delete failed. Please try again.";
      showToast({ message, variant: "danger" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGenerateCredentials = async () => {
    if (credLoading || !selectedApp) return;
    if (!credForm.ukviPortalUserId.trim() || !credForm.ukviPortalPassword.trim()) {
      showToast({ message: "UKVI Portal User ID and password are required", variant: "warning" });
      return;
    }
    if (credForm.ukviPortalPassword.length < 8) {
      showToast({ message: "Password must be at least 8 characters", variant: "warning" });
      return;
    }
    try {
      setCredLoading(true);
      await generateLicenceCredentials(selectedApp.id, {
        ukviPortalUserId: credForm.ukviPortalUserId.trim(),
        ukviPortalPassword: credForm.ukviPortalPassword,
        ...(credForm.smsPortalUsername.trim() && { smsPortalUsername: credForm.smsPortalUsername.trim() }),
      });
      showToast({ message: "Credentials generated. Caseworkers have been notified.", variant: "success" });
      closeActionModal();
      fetchApplications();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to generate credentials";
      showToast({ message, variant: "danger" });
    } finally {
      setCredLoading(false);
    }
  };

  const handleResendCredentials = async (appId) => {
    if (resendLoading) return;
    try {
      setResendLoading(true);
      await resendLicenceCredentials(appId);
      showToast({ message: "Credentials resent to sponsor.", variant: "success" });
      const res = await getAllLicenceApplications();
      const updated = res.data.data;
      setApplications(updated);
      const refreshed = updated.find((a) => a.id === appId);
      if (refreshed) setSelectedApp(refreshed);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to resend credentials";
      showToast({ message, variant: "danger" });
    } finally {
      setResendLoading(false);
    }
  };

  const handleDispatchDocument = async () => {
    if (dispatchLoading || !selectedApp) return;
    if (!dispatchFile) {
      showToast({ message: "Please select a file to send", variant: "warning" });
      return;
    }
    try {
      setDispatchLoading(true);
      const fd = new FormData();
      fd.append("document", dispatchFile);
      fd.append("documentType", dispatchForm.documentType);
      fd.append("documentName", dispatchForm.documentName || dispatchFile.name);
      if (dispatchForm.message) fd.append("message", dispatchForm.message);
      await dispatchDocumentToSponsor(selectedApp.id, fd);
      showToast({ message: "Document sent to sponsor successfully", variant: "success" });
      setShowDispatch(false);
      setDispatchFile(null);
      setDispatchForm({ documentType: "supporting_document", documentName: "", message: "" });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to send document";
      showToast({ message, variant: "danger" });
    } finally {
      setDispatchLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData({});
    setSelectedApp(null);
  };

  const handleEditSubmit = async () => {
    if (actionLoading || !selectedApp) return;
    try {
      setActionLoading(true);
      await api.put(`/api/admin/licence/update/${selectedApp.id}`, editData);
      showToast({ message: "Application updated successfully", variant: "success" });
      closeEditModal();
      fetchApplications();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update application";
      showToast({ message, variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === "All" || app.status === filter;

    let matchesType = true;
    if (typeFilter === "CoS Requests") {
      matchesType = String(app.reason || "").startsWith("CoS Request:");
    } else if (typeFilter !== "All") {
      matchesType = app.type === typeFilter;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      String(app.companyName || "").toLowerCase().includes(term) ||
      String(app.contactName || "").toLowerCase().includes(term);
    return matchesFilter && matchesType && matchesSearch;
  });

  // Reset to page 1 whenever filters / search change
  useEffect(() => { setPage(1); }, [filter, typeFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / PER_PAGE));
  const pagedApps  = filteredApps.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const newCount   = applications.filter(isNew).length;

  // Resolve assigned caseworker IDs to their loaded records (for showing names).
  const getAssignedCaseworkers = (app) => {
    const ids = Array.isArray(app?.assignedcaseworkerId) ? app.assignedcaseworkerId : [];
    return ids.map((id) => {
      const cw = caseworkers.find((c) => String(c.id) === String(id));
      return {
        id,
        name: cw ? `${cw.first_name || ""} ${cw.last_name || ""}`.trim() || cw.email : `Caseworker #${id}`,
      };
    });
  };

  const getInitials = (name) =>
    String(name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "CW";

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':              return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected':              return 'bg-red-100 text-red-700 border-red-200';
      case 'Under Review':          return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Information Requested': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending':               return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Government Processing': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'Decision Pending':      return 'bg-orange-100 text-orange-700 border-orange-200';
      default:                      return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            Licence Requests
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">Manage sponsor licence applications and renewals.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Requests",       value: applications.length,                                                                                                        color: "text-secondary" },
          { label: "Pending Approval",     value: applications.filter(a => a.status === "Pending").length,                                                                     color: "text-amber-600" },
          { label: "Gov. Processing",      value: applications.filter(a => ["Government Processing", "Decision Pending"].includes(a.status)).length,                           color: "text-violet-600" },
          { label: "Approved",             value: applications.filter(a => a.status === "Approved").length,                                                                    color: "text-emerald-600" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search by company or contact..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:border-primary/20 transition-all">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-secondary outline-none cursor-pointer py-1 w-full sm:w-auto"
            >
              {["All", "Pending", "Under Review", "Information Requested", "Government Processing", "Decision Pending", "Approved", "Rejected"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:border-primary/20 transition-all">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Category:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-black text-secondary outline-none cursor-pointer py-1 w-full sm:w-auto"
            >
              {[
                { value: "All", label: "All" },
                { value: "New", label: "Initial" },
                { value: "Renewal", label: "Renewal" },
                { value: "CoS Requests", label: "CoS Requests" },
              ].map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 h-24"></div>
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100">
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-wider text-gray-400 w-10">#</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Company / Type</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Contact</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Requested At</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">Assigned To</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedApps.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-4 text-xs font-black text-gray-400 text-center">
                      {(page - 1) * PER_PAGE + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors">{app.companyName}</p>
                          {isNew(app) && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white uppercase tracking-wide">New</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${app.type === 'Renewal' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' : 'bg-blue-50 text-blue-600 border border-blue-200/50'}`}>
                            {String(app.reason || "").startsWith("CoS Request:") ? "CoS Request" : app.type === "New" ? "Initial" : app.type}
                          </span>
                          {(String(app.reason || "").startsWith("CoS Request:") || Number(app.cosAllocation) > 1) && (
                            <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full">
                              Alloc: {app.cosAllocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-secondary">{app.contactName}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                        <Mail size={12} className="text-gray-300" />
                        {app.contactEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-secondary">
                        {formatDateLong(app.createdAt, { month: 'short' })}
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        {formatTime(app.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(app.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const assigned = getAssignedCaseworkers(app);
                        if (assigned.length === 0) {
                          return <span className="text-xs font-bold text-gray-300 italic">Unassigned</span>;
                        }
                        return (
                          <div className="flex items-center gap-2" title={assigned.map((c) => c.name).join(", ")}>
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-primary/20">
                              {getInitials(assigned[0].name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-secondary truncate max-w-[140px]">{assigned[0].name}</p>
                              {assigned.length > 1 && (
                                <p className="text-[10px] font-bold text-gray-400">+{assigned.length - 1} more</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedApp(app); markViewed(app.id); }}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-all border border-gray-100"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {app.applicationVersion === 2 && (
                          <button
                            onClick={() => navigate(`/admin/licence/v2/${app.id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase border border-indigo-100"
                            title="View the full 8-step application"
                          >
                            <FileText size={14} /> Full App
                          </button>
                        )}

                        <button
                          onClick={() => { 
                            setSelectedApp(app); 
                            setEditData({
                              companyName: app.companyName,
                              registrationNumber: app.registrationNumber,
                              industry: app.industry,
                              licenceType: app.licenceType,
                              cosAllocation: app.cosAllocation,
                              contactName: app.contactName,
                              contactEmail: app.contactEmail,
                              contactPhone: app.contactPhone,
                            });
                            setShowEditModal(true); 
                          }}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-all border border-gray-100"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(app)}
                          className="p-2 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredApps.length)} of {filteredApps.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-xl text-xs font-black text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 disabled:opacity-40 transition-all">
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce((acc, n, i, arr) => {
                      if (i > 0 && n - arr[i - 1] > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-300">…</span>
                      ) : (
                        <button key={n} onClick={() => setPage(n)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${n === page ? "bg-primary text-white shadow-sm" : "text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100"}`}>
                          {n}
                        </button>
                      )
                    )}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-xl text-xs font-black text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 disabled:opacity-40 transition-all">
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {pagedApps.map((app, idx) => (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400">#{(page - 1) * PER_PAGE + idx + 1}</span>
                      {isNew(app) && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-primary text-white uppercase tracking-wide">New</span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-secondary">{app.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${app.type === 'Renewal' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' : 'bg-blue-50 text-blue-600 border border-blue-200/50'}`}>
                        {String(app.reason || "").startsWith("CoS Request:") ? "CoS Request" : app.type === "New" ? "Initial" : app.type}
                      </span>
                      {(String(app.reason || "").startsWith("CoS Request:") || Number(app.cosAllocation) > 1) && (
                        <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full">
                          Alloc: {app.cosAllocation}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusColor(app.status)} shrink-0`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50 text-xs">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Contact</p>
                    <p className="font-bold text-secondary mt-0.5">{app.contactName}</p>
                    <p className="text-gray-400 truncate mt-0.5">{app.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Requested At</p>
                    <p className="font-bold text-secondary mt-0.5">{formatDateLong(app.createdAt, { month: 'short' })}</p>
                    <p className="text-gray-400 mt-0.5">{formatTime(app.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Assigned Caseworker</p>
                    {(() => {
                      const assigned = getAssignedCaseworkers(app);
                      if (assigned.length === 0) {
                        return <span className="text-xs font-bold text-gray-300 italic">Unassigned</span>;
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-[9px] font-black text-primary shrink-0 border border-primary/20">
                            {getInitials(assigned[0].name)}
                          </div>
                          <p className="text-xs font-black text-secondary truncate max-w-[120px]">{assigned[0].name}</p>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setSelectedApp(app); markViewed(app.id); }}
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all border border-gray-100"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    {app.applicationVersion === 2 && (
                      <button
                        onClick={() => navigate(`/admin/licence/v2/${app.id}`)}
                        className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all border border-indigo-100"
                        title="View the full 8-step application"
                      >
                        <FileText size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => { 
                        setSelectedApp(app); 
                        setEditData({
                          companyName: app.companyName,
                          registrationNumber: app.registrationNumber,
                          industry: app.industry,
                          licenceType: app.licenceType,
                          cosAllocation: app.cosAllocation,
                          contactName: app.contactName,
                          contactEmail: app.contactEmail,
                          contactPhone: app.contactPhone,
                        });
                        setShowEditModal(true); 
                      }}
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all border border-gray-100"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(app)}
                      className="p-2.5 bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-100"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-sm font-bold text-gray-400">No applications found matching your criteria.</p>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedApp && !showActionModal && !showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-xl">
                      <FileText className="text-primary" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-secondary">Request Details</h2>
                      <p className="text-xs font-bold text-gray-400">Application ID: #{selectedApp?.id}</p>
                    </div>
                  </div>
                  <button onClick={closeDetailsPanel} className="p-2 text-gray-400 hover:text-secondary transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Company Information</label>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.companyName}</p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Building2 size={14} /> {selectedApp.registrationNumber}
                        </p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Filter size={14} /> {selectedApp.industry}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Licence Request</label>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.licenceType}</p>
                        <p className="text-xs font-bold text-gray-500">Allocation: {selectedApp.cosAllocation}</p>
                        <p className="text-xs font-bold text-gray-500">Type: {selectedApp.type}</p>
                        <p className="text-xs font-bold text-gray-500">Sponsor Size: {selectedApp.feeSponsorSize === "small" ? "Small / Charity" : selectedApp.feeSponsorSize === "medium_large" ? "Medium / Large" : selectedApp.feeSponsorSize || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Authorising Officer</label>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">
                          {selectedApp.intakeForm?.namedPersonOnLicence || selectedApp.contactName}
                        </p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Mail size={14} /> {selectedApp.intakeForm?.emailAddress || selectedApp.contactEmail}
                        </p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Phone size={14} /> {selectedApp.intakeForm?.phoneNumber || selectedApp.contactPhone}
                        </p>
                        {selectedApp.intakeForm?.niNumber && (
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                            <Key size={14} />
                            <span>NI Number: </span>
                            <span className="font-mono font-black text-secondary tracking-widest">
                              {selectedApp.intakeForm.niNumber}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedApp.reason && (
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Business Justification</label>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{selectedApp.reason}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="mb-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Evidence & Documents</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApp.documents.map((doc, i) => {
                        const previewing = docBusy === `${i}:preview`;
                        const downloading = docBusy === `${i}:download`;
                        return (
                          <div
                            key={doc}
                            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/20 transition-all shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => handleDocument(i, "preview")}
                              disabled={!!docBusy}
                              title="Preview document"
                              className="flex items-center gap-3 min-w-0 flex-1 text-left disabled:opacity-60"
                            >
                              {previewing
                                ? <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                                : <FileText size={18} className="text-primary shrink-0" />}
                              <span className="text-xs font-black text-secondary truncate">Document {i + 1}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDocument(i, "download")}
                              disabled={!!docBusy}
                              title="Download document"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-60 shrink-0"
                            >
                              {downloading
                                ? <Loader2 size={16} className="animate-spin" />
                                : <Download size={16} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Government Processing Panel */}
                {["Government Processing", "Decision Pending", "Approved"].includes(selectedApp.status) && (
                  <div className="mb-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 flex items-center gap-2">
                      <Globe size={12} /> Government Processing
                    </label>
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-4">

                      {/* Row 1 — registration references */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">Registration Ref</p>
                          {selectedApp.governmentRegistrationRef ? (
                            <p className="text-sm font-black text-secondary font-mono">{selectedApp.governmentRegistrationRef}</p>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 italic">Not yet recorded</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">SMS Reg. Ref</p>
                          {selectedApp.governmentTracking?.smsRegistrationRef ? (
                            <p className="text-sm font-black text-secondary font-mono">{selectedApp.governmentTracking.smsRegistrationRef}</p>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 italic">Not yet recorded</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">Submission Ref</p>
                          {selectedApp.governmentSubmissionRef ? (
                            <p className="text-sm font-black text-secondary font-mono">{selectedApp.governmentSubmissionRef}</p>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 italic">Not yet submitted</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2 — credential status + timestamps */}
                      <div className="pt-3 border-t border-violet-100">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">Credential Status</p>
                            {selectedApp.governmentTracking?.credentialsSentAt ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                <BadgeCheck size={10} /> Sent to sponsor
                              </span>
                            ) : selectedApp.governmentTracking?.credentialsGeneratedAt ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                <Key size={10} /> Generated
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                <CircleDot size={10} /> Pending
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">Generated At</p>
                            {selectedApp.governmentTracking?.credentialsGeneratedAt ? (
                              <p className="text-xs font-black text-secondary">{formatDateLong(selectedApp.governmentTracking.credentialsGeneratedAt)}</p>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400 italic">—</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1.5">Sent At</p>
                            {selectedApp.governmentTracking?.credentialsSentAt ? (
                              <p className="text-xs font-black text-secondary">{formatDateLong(selectedApp.governmentTracking.credentialsSentAt)}</p>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400 italic">—</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sponsor-submitted credentials panel */}
                      {(adminSubmittedCreds || adminCredsLoading) && (
                        <div className="pt-3 border-t border-violet-100 space-y-3">
                          <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-1">
                            <Key size={11} /> Sponsor-Submitted UKVI Credentials
                          </p>
                          {adminCredsLoading ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 size={13} className="animate-spin" /> Loading…</div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[10px] font-black text-green-600 flex items-center gap-1">
                                  <Check size={11} /> Submitted {adminSubmittedCreds.submittedAt ? new Date(adminSubmittedCreds.submittedAt).toLocaleString("en-GB") : ""}
                                </div>
                                {adminSubmittedCreds.adminVerifiedAt && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-black">
                                    <BadgeCheck size={11} /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="rounded-xl bg-white border border-violet-100 px-3 py-2">
                                <p className="text-[10px] font-black text-gray-400 mb-1">Portal User ID</p>
                                <p className="text-sm font-black text-secondary">{adminSubmittedCreds.ukviPortalUserId || "—"}</p>
                              </div>
                              <div className="rounded-xl bg-white border border-violet-100 px-3 py-2">
                                <p className="text-[10px] font-black text-gray-400 mb-1">Password</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-secondary flex-1 break-all">
                                    {showAdminCredsPassword ? (adminSubmittedCreds.ukviPortalPassword || "—") : "••••••••"}
                                  </p>
                                  <button onClick={() => setShowAdminCredsPassword((v) => !v)} className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200">
                                    {showAdminCredsPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                  </button>
                                </div>
                              </div>
                              {adminSubmittedCreds.adminVerifiedAt ? (
                                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-xs font-black text-green-700">
                                  <BadgeCheck size={14} />
                                  Verified{adminSubmittedCreds.adminVerifiedAt ? ` on ${new Date(adminSubmittedCreds.adminVerifiedAt).toLocaleString("en-GB")}` : ""}. Sponsor notified.
                                </div>
                              ) : (
                                <div className="flex gap-2 pt-1">
                                  <button
                                    disabled={adminCredsActionLoading}
                                    onClick={async () => {
                                      try {
                                        setAdminCredsActionLoading(true);
                                        await verifyAdminSubmittedCredentials(selectedApp.id);
                                        const res = await getAdminSubmittedCredentials(selectedApp.id).catch(() => null);
                                        setAdminSubmittedCreds(res?.data?.data || null);
                                        showToast({ message: "Credentials verified — sponsor notified", variant: "success" });
                                        fetchApplications();
                                      } catch { showToast({ message: "Failed to verify", variant: "danger" }); }
                                      finally { setAdminCredsActionLoading(false); }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 text-white text-xs font-black py-2 hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {adminCredsActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Verify
                                  </button>
                                  <button
                                    disabled={adminCredsActionLoading}
                                    onClick={async () => {
                                      try {
                                        setAdminCredsActionLoading(true);
                                        await requestAdminCredentialsResubmission(selectedApp.id);
                                        setAdminSubmittedCreds(null);
                                        showToast({ message: "Sponsor notified to resubmit", variant: "success" });
                                      } catch { showToast({ message: "Failed to send request", variant: "danger" }); }
                                      finally { setAdminCredsActionLoading(false); }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-xs font-black py-2 hover:bg-orange-100 disabled:opacity-50"
                                  >
                                    <RefreshCw size={12} /> Request Resubmission
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Portal User ID + Resend button (only once credentials exist) */}
                      {selectedApp.governmentTracking?.ukviPortalUserId && (
                        <div className="pt-3 border-t border-violet-100 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">SMS Portal User ID</p>
                            <p className="text-sm font-black text-secondary font-mono truncate">{selectedApp.governmentTracking.ukviPortalUserId}</p>
                          </div>
                          <button
                            onClick={() => handleResendCredentials(selectedApp.id)}
                            disabled={resendLoading}
                            className="shrink-0 flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 shadow-sm shadow-violet-200"
                          >
                            {resendLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            Resend Credentials
                          </button>
                        </div>
                      )}

                      {selectedApp.governmentSubmissionDate && (
                        <div className="pt-3 border-t border-violet-100 flex items-center gap-2 text-xs font-bold text-violet-500">
                          <Calendar size={12} />
                          Submitted on {new Date(selectedApp.governmentSubmissionDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Task Center — pending admin actions */}
                {(() => {
                  const noAssignment = !selectedApp.assignedcaseworkerId ||
                    (Array.isArray(selectedApp.assignedcaseworkerId) && selectedApp.assignedcaseworkerId.length === 0);
                  const tasks = [
                    {
                      key: "assign",
                      label: noAssignment ? "Assign a caseworker to this application" : "Re-assign caseworker for this application",
                      icon: UserPlus,
                      urgency: "amber",
                      actionType: "Assign",
                      cta: noAssignment ? "Assign" : "Re-assign",
                    },
                    ...(selectedApp.status === "Government Processing" && !selectedApp.governmentTracking?.credentialsGeneratedAt ? [{
                      key: "credentials",
                      label: "Generate UKVI portal credentials for the sponsor",
                      icon: Key,
                      urgency: "violet",
                      actionType: "GenerateCredentials",
                      cta: "Generate",
                    }] : []),
                    ...(selectedApp.governmentTracking?.credentialsGeneratedAt && !selectedApp.governmentTracking?.credentialsSentAt ? [{
                      key: "resend",
                      label: "Portal credentials generated — send them to the sponsor",
                      icon: Send,
                      urgency: "violet",
                      actionType: "Resend",
                      cta: "Resend",
                    }] : []),
                    ...(selectedApp.status === "Decision Pending" ? [
                      {
                        key: "decision-approve",
                        label: "UKVI decision received — approve the licence",
                        icon: CheckCircle2,
                        urgency: "emerald",
                        actionType: "Approved",
                        cta: "Approve",
                      },
                      {
                        key: "decision-reject",
                        label: "UKVI decision received — reject the licence",
                        icon: XCircle,
                        urgency: "red",
                        actionType: "Rejected",
                        cta: "Reject",
                      },
                    ] : []),
                  ];
                  if (tasks.length === 0) return null;
                  const urgencyStyles = {
                    amber:   { bg: "bg-amber-50 border-amber-100",  icon: "text-amber-500",   btn: "bg-amber-500 hover:bg-amber-600" },
                    violet:  { bg: "bg-violet-50 border-violet-100", icon: "text-violet-500",  btn: "bg-violet-600 hover:bg-violet-700" },
                    emerald: { bg: "bg-emerald-50 border-emerald-100", icon: "text-emerald-500", btn: "bg-emerald-500 hover:bg-emerald-600" },
                    red:     { bg: "bg-red-50 border-red-100",       icon: "text-red-500",     btn: "bg-red-500 hover:bg-red-600" },
                  };
                  return (
                    <div className="mb-4">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 flex items-center gap-2">
                        <ClipboardCheck size={12} /> Pending Actions
                        <span className="text-primary normal-case tracking-normal">({tasks.length})</span>
                      </label>
                      <div className="space-y-2">
                        {tasks.map((task) => {
                          const s = urgencyStyles[task.urgency];
                          const Icon = task.icon;
                          return (
                            <div key={task.key} className={`flex items-center justify-between p-3.5 rounded-xl border ${s.bg}`}>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon size={16} className={`${s.icon} shrink-0`} />
                                <p className="text-sm font-black text-secondary truncate">{task.label}</p>
                              </div>
                              <button
                                onClick={() => task.actionType === "Resend"
                                  ? handleResendCredentials(selectedApp.id)
                                  : openAction(selectedApp, task.actionType)
                                }
                                disabled={task.actionType === "Resend" && resendLoading}
                                className={`ml-3 shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black text-white transition-all active:scale-95 disabled:opacity-60 ${s.btn}`}
                              >
                                {task.actionType === "Resend" && resendLoading
                                  ? <Loader2 size={13} className="animate-spin" />
                                  : task.cta}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Application stages — the communication channel shared with the sponsor. */}
                <div className="mb-4">
                  <LicenceStages applicationId={selectedApp.id} viewerRole="admin" />
                </div>

                {/* Full cross-entity workflow timeline (licence + CoS + workers). */}
                <div className="mb-4">
                  <LicenceWorkflowTimeline applicationId={selectedApp.id} viewerRole="admin" />
                </div>

                <div className="mt-4">
                  {selectedApp.adminNotes && (
                    <div className="mb-4">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Reviewer Notes</label>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm font-bold text-amber-900 leading-relaxed">{selectedApp.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-5 border-t border-gray-50">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openAction(selectedApp, "Assign")}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} /> Assign
                      </button>
                      <button
                        onClick={() => openAction(selectedApp, "RequestInfo")}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={18} /> Request Info
                      </button>
                    </div>
                    {selectedApp.status === "Government Processing" && (
                      <button
                        onClick={() => openAction(selectedApp, "GenerateCredentials")}
                        className="w-full bg-violet-50 text-violet-700 hover:bg-violet-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2"
                      >
                        <Key size={18} />
                        {selectedApp.governmentTracking?.credentialsGeneratedAt ? "Re-generate Credentials" : "Generate Portal Credentials"}
                      </button>
                    )}
                    {selectedApp.governmentTracking?.credentialsGeneratedAt && (
                      <button
                        onClick={() => handleResendCredentials(selectedApp.id)}
                        disabled={resendLoading}
                        className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {resendLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Resend Credentials to Sponsor
                      </button>
                    )}

                    {/* Send Document to Sponsor */}
                    <button
                      onClick={() => setShowDispatch((v) => !v)}
                      className="w-full bg-teal-50 text-teal-700 hover:bg-teal-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={18} /> Send Document to Sponsor
                    </button>
                    {showDispatch && (
                      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Send Document</p>
                        <select
                          value={dispatchForm.documentType}
                          onChange={(e) => setDispatchForm((f) => ({ ...f, documentType: e.target.value }))}
                          className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none"
                        >
                          <option value="declaration_form">Declaration Form</option>
                          <option value="credentials">Credentials Document</option>
                          <option value="sponsor_licence">Sponsor Licence</option>
                          <option value="supporting_document">Supporting Document</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Document name (optional)"
                          value={dispatchForm.documentName}
                          onChange={(e) => setDispatchForm((f) => ({ ...f, documentName: e.target.value }))}
                          className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none"
                        />
                        <textarea
                          placeholder="Message to sponsor (optional)"
                          value={dispatchForm.message}
                          onChange={(e) => setDispatchForm((f) => ({ ...f, message: e.target.value }))}
                          rows={2}
                          className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none resize-none"
                        />
                        <label className="flex items-center gap-3 cursor-pointer bg-white border border-dashed border-teal-300 rounded-xl p-3 hover:bg-teal-50 transition-all">
                          <Upload size={18} className="text-teal-500 shrink-0" />
                          <span className="text-sm font-black text-teal-700 truncate">
                            {dispatchFile ? dispatchFile.name : "Choose file…"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setDispatchFile(e.target.files[0] || null)}
                          />
                        </label>
                        <button
                          onClick={handleDispatchDocument}
                          disabled={dispatchLoading || !dispatchFile}
                          className="w-full bg-teal-600 text-white font-black rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-teal-700 transition-all active:scale-95"
                        >
                          {dispatchLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {dispatchLoading ? "Sending…" : "Send to Sponsor"}
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => openAction(selectedApp, "Approved")}
                        disabled={selectedApp.status !== 'Decision Pending'}
                        className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button
                        onClick={() => openAction(selectedApp, "Rejected")}
                        disabled={selectedApp.status === 'Rejected'}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Action Modal (Approve/Reject/RequestInfo) */}
      <AnimatePresence>
        {showActionModal && selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-secondary">
                    {actionType === 'Approved'             ? 'Confirm Approval' :
                     actionType === 'Rejected'             ? 'Confirm Rejection' :
                     actionType === 'Assign'               ? 'Assign Caseworker' :
                     actionType === 'GenerateCredentials'  ? 'Generate UKVI Credentials' :
                     'Request More Evidence'}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 truncate max-w-[20rem]">
                    {selectedApp?.companyName || 'Application'} · #{selectedApp?.id}
                  </p>
                </div>
                <button
                  onClick={closeActionModal}
                  disabled={actionLoading}
                  className="p-1 text-gray-400 hover:text-secondary transition-colors disabled:opacity-40"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                {actionType === 'GenerateCredentials' ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-500 leading-relaxed -mt-2">
                      Generate secure UKVI portal credentials for this sponsor. The password is encrypted before storage. Assigned caseworkers will be notified to send them securely to the sponsor.
                    </p>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                        SMS Portal Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={credForm.ukviPortalUserId}
                        onChange={(e) => setCredForm({ ...credForm, ukviPortalUserId: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                        placeholder="e.g. sponsor@sms.ukvi.gov.uk"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                        Temporary Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          value={credForm.ukviPortalPassword}
                          onChange={(e) => setCredForm({ ...credForm, ukviPortalPassword: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pr-12 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                          placeholder="Min. 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-secondary transition-colors"
                        >
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                        SMS Reference <span className="text-gray-300 font-bold normal-case tracking-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={credForm.smsPortalUsername}
                        onChange={(e) => setCredForm({ ...credForm, smsPortalUsername: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                        placeholder="e.g. REF-2024-001"
                      />
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                      <Lock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-700 leading-snug">
                        The password is AES-256 encrypted before being stored. Only authorised users can request it to be sent to the sponsor.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={handleGenerateCredentials}
                        disabled={credLoading}
                        className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white font-black py-3 rounded-xl shadow-lg shadow-violet-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
                      >
                        {credLoading ? <Loader2 className="animate-spin" size={18} /> : <><Key size={18} /> Generate Credentials</>}
                      </button>
                      <button
                        onClick={closeActionModal}
                        disabled={credLoading}
                        className="flex-1 bg-gray-50 text-gray-500 font-black py-3 rounded-xl disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : actionType === 'Assign' ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        Select Caseworkers
                        {selectedCaseworkerIds.length > 0 && (
                          <span className="ml-2 text-primary normal-case tracking-normal">
                            ({selectedCaseworkerIds.length} selected)
                          </span>
                        )}
                      </p>
                      {caseworkers.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                          <p className="text-xs font-bold text-gray-400">No caseworkers available to assign.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {caseworkers.map(cw => {
                            const isSelected = selectedCaseworkerIds.some(id => String(id) === String(cw.id));
                            return (
                              <button
                                key={cw.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCaseworkerIds(selectedCaseworkerIds.filter(id => String(id) !== String(cw.id)));
                                  } else {
                                    setSelectedCaseworkerIds([...selectedCaseworkerIds, cw.id]);
                                  }
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                                  isSelected
                                  ? "bg-primary/5 border-primary text-primary"
                                  : "bg-gray-50 border-gray-100 text-secondary hover:border-gray-200"
                                } shadow-sm group`}
                              >
                                <div className="text-left">
                                  <p className="text-sm font-black">{cw.first_name} {cw.last_name}</p>
                                  <p className="text-[10px] opacity-70 font-bold">{cw.email}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "bg-primary border-primary" : "border-gray-200"
                                }`}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAssign(selectedApp?.id, selectedCaseworkerIds)}
                        disabled={actionLoading || selectedCaseworkerIds.length === 0}
                        className="flex-[2] bg-primary text-white font-black py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                      >
                        {actionLoading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} /> Confirm Assignment</>}
                      </button>
                      <button
                        onClick={closeActionModal}
                        disabled={actionLoading}
                        className="flex-1 bg-gray-50 text-gray-500 font-black py-3 rounded-xl disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed -mt-2">
                      {actionType === 'Approved'
                        ? 'Approving will activate the sponsor licence and notify the business.'
                        : actionType === 'Rejected'
                        ? 'Rejecting will notify the business. A reason is required.'
                        : 'The business will be asked to supply the information below.'}
                    </p>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                        {actionType === 'RequestInfo' ? 'Request Instructions' : 'Admin Note / Reason'}
                        {(actionType === 'Rejected' || actionType === 'RequestInfo') && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none resize-none"
                        rows={4}
                        placeholder={actionType === 'Approved' ? 'Optional note for the business...' : 'Enter details here...'}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>

                    {actionType === 'RequestInfo' && (
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Requested Documents (Comma separated)</label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold text-secondary outline-none"
                          placeholder="e.g. Passport, Bank Statements"
                          value={requestedDocs}
                          onChange={(e) => setRequestedDocs(e.target.value)}
                        />
                      </div>
                    )}

                    {actionType === 'Approved' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                            UKVI Licence Number <span className="text-red-500 ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            value={grantForm.licenceNumber}
                            onChange={(e) => setGrantForm((g) => ({ ...g, licenceNumber: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 font-mono"
                            placeholder="e.g. 1A-TECH-2025-00142"
                          />
                          <p className="text-[10px] text-gray-400 mt-1.5">Enter the licence number assigned by UKVI — this will appear in the grant email sent to the sponsor.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                              Licence Expiry <span className="font-bold normal-case text-gray-300">(optional)</span>
                            </label>
                            <input
                              type="date"
                              value={grantForm.expiryDate}
                              onChange={(e) => setGrantForm((g) => ({ ...g, expiryDate: e.target.value }))}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                              CoS Allocation <span className="font-bold normal-case text-gray-300">(optional)</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={grantForm.cosAllocation}
                              onChange={(e) => setGrantForm((g) => ({ ...g, cosAllocation: e.target.value }))}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none"
                              placeholder="e.g. 10"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleAction}
                        disabled={actionLoading}
                        className={`flex-[2] py-3 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100 ${
                          actionType === 'Approved' ? 'bg-emerald-500 shadow-emerald-100' :
                          actionType === 'Rejected' ? 'bg-red-500 shadow-red-100' :
                          'bg-primary shadow-primary/20'
                        } shadow-lg`}
                      >
                        {actionLoading ? <Loader2 className="animate-spin" /> : (
                          actionType === 'Approved' ? 'Approve Application' :
                          actionType === 'Rejected' ? 'Reject Application' :
                          'Send Request'
                        )}
                      </button>
                      <button
                        onClick={closeActionModal}
                        disabled={actionLoading}
                        className="flex-1 bg-gray-50 text-gray-500 font-black py-3 rounded-xl disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 custom-scrollbar"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary">
                      <Pencil size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-secondary">Edit Application</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: #LIC-{selectedApp?.id}</p>
                    </div>
                  </div>
                  <button onClick={closeEditModal} className="p-2 text-gray-400 hover:text-secondary transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Company Name</label>
                    <input
                      type="text"
                      value={editData.companyName ?? ""}
                      onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Registration Number</label>
                    <input
                      type="text"
                      value={editData.registrationNumber ?? ""}
                      onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Licence Type</label>
                    <input
                      type="text"
                      value={editData.licenceType ?? ""}
                      onChange={(e) => setEditData({ ...editData, licenceType: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">CoS Allocation</label>
                    <input
                      type="text"
                      value={editData.cosAllocation ?? ""}
                      onChange={(e) => setEditData({ ...editData, cosAllocation: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={editData.contactName ?? ""}
                      onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={editData.contactEmail ?? ""}
                      onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleEditSubmit}
                    disabled={actionLoading}
                    className="flex-[2] bg-primary hover:bg-primary-dark text-white font-black rounded-xl py-3 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                  </button>
                  <button
                    onClick={closeEditModal}
                    disabled={actionLoading}
                    className="flex-1 bg-gray-50 text-gray-500 font-black rounded-xl py-3 transition-all disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-secondary">Delete Application</h3>
                  <p className="text-xs font-bold text-gray-400 truncate max-w-[16rem]">
                    {deleteTarget?.companyName || 'Application'} · #{deleteTarget?.id}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-6">
                Are you sure you want to delete this licence application? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-[2] bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:active:scale-100"
                >
                  {deleteLoading ? <Loader2 className="animate-spin" /> : <><Trash2 size={18} /> Delete</>}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-50 text-gray-500 font-black py-3 rounded-xl disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLicenceApplications;
