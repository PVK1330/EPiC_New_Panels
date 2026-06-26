import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Search, Eye, EyeOff, Download, Building2, Mail, Phone, AlertCircle,
  Check, X, FileText, MessageSquare, Loader2, Play, Globe, Key, Send,
  ClipboardCheck, Calendar, Landmark, Hash, ExternalLink, Upload, RefreshCw, BadgeCheck,
} from "lucide-react";
import api from "../../services/api";
import socketService from "../../services/socket.service";
import {
  downloadCaseworkerLicenceDocument,
  startLicenceReview,
  startGovRegistration,
  completeGovRegistration,
  requestGovCredentials,
  recordGovSubmission,
  getCaseworkerIntakeSummary,
  getIntakeReadiness,
  dispatchDocumentToCaseworker,
  getCaseworkerSubmittedCredentials,
  verifyCaseworkerCredentials,
  requestCaseworkerCredentialsResubmission,
} from "../../services/licenceApi";
import { triggerDownload } from "../../services/documentApi";
import LicenceStages from "../../components/licence/LicenceStages";
import IntakeDocumentChecklist from "../../components/licence/IntakeDocumentChecklist";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/datetime";

const ACTIVE_STATUSES   = ["Pending", "Under Review", "Government Processing", "Decision Pending"];
const TERMINAL_STATUSES = ["Approved", "Rejected"];

const STATUS_COLOR = {
  "Approved":              "bg-emerald-100 text-emerald-700",
  "Rejected":              "bg-red-100 text-red-700",
  "Under Review":          "bg-blue-100 text-blue-700",
  "Information Requested": "bg-amber-100 text-amber-700",
  "Government Processing": "bg-violet-100 text-violet-700",
  "Decision Pending":      "bg-orange-100 text-orange-700",
  "Pending":               "bg-amber-100 text-amber-700",
};

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";

const GOV_MODAL_META = {
  startReview:  { title: "Start Review",                 Icon: Play },
  startGovReg:  { title: "Start Government Registration", Icon: Globe },
  completeReg:  { title: "Complete SMS Registration",     Icon: ClipboardCheck },
  requestCreds: { title: "Send Credentials to Sponsor",   Icon: Key },
  submitUKVI:   { title: "Submit Application to UKVI",    Icon: Send },
};

const InfoRow = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className="text-xs font-bold text-secondary">{value}</p>
    </div>
  ) : null;

const CaseworkerLicenceApplications = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading,      setLoading]      = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter,       setFilter]       = useState("All");
  const [searchTerm,   setSearchTerm]   = useState("");

  // Details modal
  const [selectedApp,     setSelectedApp]     = useState(null);
  const [intakeTab,       setIntakeTab]       = useState("govpipeline");
  const [intakeData,      setIntakeData]      = useState(null);
  const [intakeLoading,   setIntakeLoading]   = useState(false);
  const [intakeReadiness, setIntakeReadiness] = useState(null);
  const [docBusy,         setDocBusy]         = useState(null);

  // Review action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType,      setActionType]      = useState("");
  const [adminNotes,      setAdminNotes]      = useState("");
  const [actionLoading,   setActionLoading]   = useState(false);

  // Gov pipeline modal
  const [govModal,  setGovModal]  = useState(null);
  const [govLoading,setGovLoading]= useState(false);
  const [regForm,   setRegForm]   = useState({ smsRegistrationRef: "", governmentRegistrationRef: "" });
  const [subForm,   setSubForm]   = useState({ submissionRef: "", submissionDate: "" });

  // Document dispatch (caseworker → sponsor)
  const [cwDispatch,     setCwDispatch]     = useState({ documentType: "sponsor_licence", documentName: "", message: "" });
  const [cwDispatchFile, setCwDispatchFile] = useState(null);
  const [cwDispatchLoading, setCwDispatchLoading] = useState(false);

  // Sponsor-submitted credentials view
  const [submittedCreds,      setSubmittedCreds]      = useState(null);
  const [credsLoading,        setCredsLoading]        = useState(false);
  const [showCredsPassword,   setShowCredsPassword]   = useState(false);
  const [credsActionLoading,  setCredsActionLoading]  = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/caseworker/licence/assigned");
      setApplications(res.data.data);
    } catch {
      showToast({ message: "Failed to fetch assigned applications", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  // Re-fetch list when any licence stage updates so the caseworker panel
  // reflects the new state without a manual refresh.
  useEffect(() => {
    socketService.on("licence:stage_updated", fetchApplications);
    return () => socketService.off("licence:stage_updated", fetchApplications);
  }, []);

  // Reset modal sub-state when a different app is selected
  useEffect(() => {
    if (!selectedApp?.id) { setIntakeData(null); setIntakeReadiness(null); return; }
    setIntakeTab("govpipeline");
    let active = true;
    (async () => {
      try {
        setIntakeLoading(true);
        const [sumRes, readRes] = await Promise.all([
          getCaseworkerIntakeSummary(selectedApp.id).catch(() => null),
          getIntakeReadiness(selectedApp.id).catch(() => null),
        ]);
        if (!active) return;
        setIntakeData(sumRes?.data?.data || sumRes?.data || null);
        setIntakeReadiness(readRes?.data?.data || readRes?.data || null);
      } catch { /* ignore */ }
      finally { if (active) setIntakeLoading(false); }
    })();
    return () => { active = false; };
  }, [selectedApp?.id]);

  // Fetch sponsor-submitted credentials whenever the selected app is in the credentials stage
  useEffect(() => {
    if (!selectedApp?.id) { setSubmittedCreds(null); return; }
    setSubmittedCreds(null);
    setShowCredsPassword(false);
    let active = true;
    (async () => {
      try {
        setCredsLoading(true);
        const res = await getCaseworkerSubmittedCredentials(selectedApp.id).catch(() => null);
        if (active) setSubmittedCreds(res?.data?.data || null);
      } finally {
        if (active) setCredsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedApp?.id]);

  const refreshIntake = async () => {
    if (!selectedApp?.id) return;
    try {
      const [sumRes, readRes] = await Promise.all([
        getCaseworkerIntakeSummary(selectedApp.id).catch(() => null),
        getIntakeReadiness(selectedApp.id).catch(() => null),
      ]);
      setIntakeData(sumRes?.data?.data || sumRes?.data || null);
      setIntakeReadiness(readRes?.data?.data || readRes?.data || null);
    } catch { /* ignore */ }
  };

  // ── Document handler ─────────────────────────────────────────────────────────
  const handleDocument = async (index, mode) => {
    if (!selectedApp || docBusy) return;
    try {
      setDocBusy(`${index}:${mode}`);
      const res = await downloadCaseworkerLicenceDocument(selectedApp.id, index, { download: mode === "download" });
      const blob = res.data;
      const cd   = res.headers?.["content-disposition"] || "";
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

  // ── Review action (Approve / Reject / Info) ──────────────────────────────────
  const handleAction = async () => {
    if (!actionType) return;
    if ((actionType === "Rejected" || actionType === "Information Requested") && !adminNotes.trim()) {
      showToast({ message: "Please enter a note for this action", variant: "warning" });
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/api/caseworker/licence/update-status/${selectedApp.id}`, { status: actionType, adminNotes });
      showToast({ message: `Status updated to ${actionType}`, variant: "success" });
      setShowActionModal(false);
      setAdminNotes("");
      setSelectedApp(null);
      fetchApplications();
    } catch {
      showToast({ message: "Action failed", variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Gov pipeline modal ───────────────────────────────────────────────────────
  const openGovModal = (type, app) => {
    setRegForm({ smsRegistrationRef: "", governmentRegistrationRef: "" });
    setSubForm({ submissionRef: "", submissionDate: "" });
    setGovModal({ type, app });
  };
  const closeGovModal = () => { setGovModal(null); setGovLoading(false); };

  const handleGovAction = async () => {
    if (!govModal || govLoading) return;
    const { type, app } = govModal;
    try {
      setGovLoading(true);
      let msg = "";
      switch (type) {
        case "startReview":
          await startLicenceReview(app.id);
          msg = "Review started — application moved to Under Review";
          break;
        case "startGovReg":
          await startGovRegistration(app.id);
          msg = "Government registration started";
          break;
        case "completeReg":
          if (!regForm.smsRegistrationRef.trim()) {
            showToast({ message: "SMS Registration Reference is required", variant: "warning" });
            setGovLoading(false); return;
          }
          await completeGovRegistration(app.id, {
            smsRegistrationRef: regForm.smsRegistrationRef.trim(),
            ...(regForm.governmentRegistrationRef.trim() && { governmentRegistrationRef: regForm.governmentRegistrationRef.trim() }),
          });
          msg = "SMS registration recorded";
          break;
        case "requestCreds":
          await requestGovCredentials(app.id);
          msg = "Credentials sent to sponsor";
          break;
        case "submitUKVI":
          if (!subForm.submissionRef.trim() || !subForm.submissionDate) {
            showToast({ message: "Both submission reference and date are required", variant: "warning" });
            setGovLoading(false); return;
          }
          await recordGovSubmission(app.id, { submissionRef: subForm.submissionRef.trim(), submissionDate: subForm.submissionDate });
          msg = "Application submitted to UKVI — status moved to Decision Pending";
          break;
        default: break;
      }
      showToast({ message: msg, variant: "success" });
      closeGovModal();
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Action failed — please try again", variant: "danger" });
      setGovLoading(false);
    }
  };

  // ── Caseworker dispatch document → sponsor ──────────────────────────────────
  const handleCwDispatch = async () => {
    if (!selectedApp || !cwDispatchFile || cwDispatchLoading) return;
    try {
      setCwDispatchLoading(true);
      const fd = new FormData();
      fd.append("document", cwDispatchFile);
      fd.append("documentType", cwDispatch.documentType);
      fd.append("documentName", cwDispatch.documentName || cwDispatchFile.name);
      if (cwDispatch.message.trim()) fd.append("message", cwDispatch.message.trim());
      await dispatchDocumentToCaseworker(selectedApp.id, fd);
      showToast({ message: "Document sent to sponsor successfully", variant: "success" });
      setCwDispatch({ documentType: "sponsor_licence", documentName: "", message: "" });
      setCwDispatchFile(null);
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to send document", variant: "danger" });
    } finally {
      setCwDispatchLoading(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filteredApps = applications.filter((app) => {
    const matchFilter = filter === "All" || app.status === filter;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (app.companyName || "").toLowerCase().includes(q) ||
      (app.contactName || "").toLowerCase().includes(q) ||
      (app.contactEmail || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const pipelineCounts = {
    pending:     applications.filter((a) => a.status === "Pending").length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    govProcess:  applications.filter((a) => a.status === "Government Processing").length,
    decision:    applications.filter((a) => a.status === "Decision Pending").length,
  };
  const hasPipelineWork = Object.values(pipelineCounts).some(Boolean);

  const isTerminal = (status) => TERMINAL_STATUSES.includes(status);
  const isActive   = (status) => ACTIVE_STATUSES.includes(status);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-10">

      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary flex items-center gap-2.5">
          <ShieldCheck className="text-primary shrink-0" size={26} />
          Assigned Licence Reviews
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-0.5">
          Review and progress sponsor licence applications assigned to you.
        </p>
      </div>

      {/* Pipeline dashboard */}
      {hasPipelineWork && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-violet-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="text-indigo-500 shrink-0" size={16} />
              <h3 className="text-sm font-black text-secondary">Government Pipeline — Work In Progress</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Needs Review",    count: pipelineCounts.pending,     color: "bg-amber-50 border-amber-100 text-amber-600",   hint: "Action: Start Review" },
                { label: "Under Review",    count: pipelineCounts.underReview,  color: "bg-blue-50 border-blue-100 text-blue-600",      hint: "Action: Start Gov. Reg." },
                { label: "Gov. Processing", count: pipelineCounts.govProcess,   color: "bg-violet-50 border-violet-100 text-violet-600",hint: "Actions required" },
                { label: "Decision Pending",count: pipelineCounts.decision,     color: "bg-orange-50 border-orange-100 text-orange-600",hint: "Awaiting UKVI" },
              ].map(({ label, count, color, hint }) => (
                <div key={label} className={`rounded-xl border p-4 ${color}`}>
                  <p className="text-2xl font-black">{count}</p>
                  <p className="text-xs font-black text-gray-700 mt-1">{label}</p>
                  <p className="text-[10px] font-bold opacity-60 mt-0.5">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            placeholder="Search by company, contact or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "Pending", "Under Review", "Information Requested", "Government Processing", "Decision Pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-[11px] font-black transition-all whitespace-nowrap ${
                filter === f ? "bg-primary text-white shadow-sm shadow-primary/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Applications table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Company / Type</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Updated</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[1,2,3,4,5].map((c) => (
                      <td key={c} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app) => {
                  const isV2 = Number(app.applicationVersion) === 2;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50/40 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-black text-secondary">{app.companyName || "—"}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${app.type === "Renewal" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                            {String(app.reason || "").startsWith("CoS Request:") ? "CoS Request" : app.type}
                          </span>
                          {isV2 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">V2</span>
                          )}
                          {isActive(app.status) && app.status !== "Pending" && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">Gov. Pipeline</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-black text-secondary">{app.contactName || "—"}</p>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">{app.contactEmail || ""}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-secondary">{formatDate(app.updatedAt)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${STATUS_COLOR[app.status] || "bg-gray-100 text-gray-600"}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-[11px] font-black transition-all"
                          >
                            <Eye size={13} /> Review
                          </button>
                          {isV2 && (
                            <button
                              onClick={() => navigate(`/caseworker/licence/v2/${app.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[11px] font-black transition-all"
                              title="View full 8-step application"
                            >
                              <ExternalLink size={13} /> Full App
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <ShieldCheck className="mx-auto text-gray-200 mb-3" size={36} />
                    <p className="text-sm font-bold text-gray-400">No assigned reviews found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Details Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedApp(null); }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                    <ShieldCheck size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-black text-secondary truncate">
                        {selectedApp.companyName || `Application #${selectedApp.id}`}
                      </h2>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${STATUS_COLOR[selectedApp.status] || "bg-gray-100 text-gray-500"}`}>
                        {selectedApp.status}
                      </span>
                      {Number(selectedApp.applicationVersion) === 2 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">V2 Application</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      #LIC-{selectedApp.id} · {selectedApp.type} · Updated {formatDate(selectedApp.updatedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-xl transition-all shrink-0 ml-2"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Company */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Building2 size={11} /> Company
                    </p>
                    <div className="space-y-1">
                      <InfoRow label="Name"               value={selectedApp.companyName} />
                      <InfoRow label="Reg. Number"        value={selectedApp.registrationNumber} />
                      <InfoRow label="Industry"           value={selectedApp.industry} />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Mail size={11} /> Contact Officer
                    </p>
                    <div className="space-y-1">
                      <InfoRow label="Name"  value={selectedApp.contactName} />
                      <InfoRow label="Email" value={selectedApp.contactEmail} />
                      <InfoRow label="Phone" value={selectedApp.contactPhone} />
                    </div>
                  </div>

                  {/* Licence details */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Hash size={11} /> Licence Details
                    </p>
                    <div className="space-y-1">
                      <InfoRow label="Type"          value={selectedApp.licenceType} />
                      <InfoRow label="CoS Allocation"value={selectedApp.cosAllocation} />
                      <InfoRow label="App. Type"     value={selectedApp.type} />
                      <InfoRow label="Sponsor Size"  value={selectedApp.feeSponsorSize === "small" ? "Small / Charity" : selectedApp.feeSponsorSize === "medium_large" ? "Medium / Large" : selectedApp.feeSponsorSize || "—"} />
                    </div>
                  </div>
                </div>

                {/* Justification */}
                {selectedApp.reason && !String(selectedApp.reason).startsWith("CoS Request:") && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1.5">Business Justification</p>
                    <p className="text-xs font-bold text-amber-900 leading-relaxed">"{selectedApp.reason}"</p>
                  </div>
                )}

                {/* Admin notes (if info was requested) */}
                {selectedApp.adminNotes && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1.5">Reviewer Notes</p>
                    <p className="text-xs font-bold text-blue-900 leading-relaxed">{selectedApp.adminNotes}</p>
                  </div>
                )}

                {/* Documents */}
                {selectedApp.documents?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Evidence &amp; Documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApp.documents.map((doc, i) => {
                        const previewing  = docBusy === `${i}:preview`;
                        const downloading = docBusy === `${i}:download`;
                        return (
                          <div key={doc} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-primary/20 transition-all">
                            <button
                              type="button"
                              onClick={() => handleDocument(i, "preview")}
                              disabled={!!docBusy}
                              className="flex items-center gap-2.5 min-w-0 flex-1 text-left disabled:opacity-60"
                            >
                              {previewing
                                ? <Loader2 size={15} className="text-primary animate-spin shrink-0" />
                                : <FileText size={15} className="text-gray-400 shrink-0" />}
                              <span className="text-xs font-bold text-secondary truncate">Document {i + 1}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDocument(i, "download")}
                              disabled={!!docBusy}
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all disabled:opacity-60 shrink-0"
                            >
                              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* UKVI submission info (read-only for Decision Pending / Approved) */}
                {["Decision Pending", "Approved"].includes(selectedApp.status) && selectedApp.governmentSubmissionRef && (
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="text-orange-500 shrink-0" size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">UKVI Submission</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow label="Submission Ref" value={selectedApp.governmentSubmissionRef} />
                      {selectedApp.governmentSubmissionDate && (
                        <InfoRow label="Submitted On" value={formatDate(selectedApp.governmentSubmissionDate)} />
                      )}
                    </div>
                  </div>
                )}

                {/* Pipeline / Intake panel — only for active statuses */}
                {isActive(selectedApp.status) && (
                  <div>
                    {/* Sub-tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                      {[{ id: "govpipeline", label: "Pipeline Actions" }, { id: "credentials", label: "Credentials" }, { id: "intake", label: "Intake & Documents" }, { id: "dispatch", label: "Send Document" }].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setIntakeTab(id)}
                          className={`px-4 py-2 text-[11px] font-black rounded-lg transition-all ${
                            intakeTab === id ? "bg-white text-secondary shadow-sm" : "text-gray-500 hover:text-secondary"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Pipeline actions */}
                    {intakeTab === "govpipeline" && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Landmark className="text-indigo-500 shrink-0" size={14} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Government Pipeline Actions</p>
                        </div>

                        {selectedApp.status === "Pending" && (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-indigo-800">
                              Start the review to progress this application through the government pipeline.
                            </p>
                            <button
                              onClick={() => openGovModal("startReview", selectedApp)}
                              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-black hover:bg-indigo-700 transition-all active:scale-95"
                            >
                              <Play size={15} /> Start Review
                            </button>
                          </div>
                        )}

                        {selectedApp.status === "Under Review" && (
                          <div className="space-y-3">
                            {!intakeReadiness?.isReady && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
                                <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[11px] font-black text-amber-700">Intake not yet complete</p>
                                  {intakeReadiness?.reasons?.map((r) => (
                                    <p key={r} className="text-[11px] text-amber-600 mt-0.5">• {r}</p>
                                  ))}
                                  <button onClick={() => setIntakeTab("intake")} className="mt-1 text-[11px] text-amber-700 underline">
                                    Review Intake &amp; Documents →
                                  </button>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => openGovModal("startGovReg", selectedApp)}
                              disabled={!intakeReadiness?.isReady}
                              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black transition-all active:scale-95 ${
                                intakeReadiness?.isReady
                                  ? "bg-violet-600 text-white hover:bg-violet-700"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Globe size={15} /> Start Government Registration
                              {!intakeReadiness?.isReady && <span className="text-[10px] opacity-70">(intake required)</span>}
                            </button>
                          </div>
                        )}

                        {selectedApp.status === "Government Processing" && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-indigo-800 mb-3">
                              Government portal processing is active. Complete each step in order.
                            </p>
                            {[
                              { type: "completeReg",  Icon: ClipboardCheck, label: "Complete SMS Registration",    hint: "Record SMS & Gov. ref." },
                              { type: "requestCreds", Icon: Key,            label: "Send Credentials to Sponsor",   hint: "Admin must generate first" },
                              { type: "submitUKVI",   Icon: Send,           label: "Submit Application to UKVI",    hint: "→ Decision Pending", primary: true },
                            ].map(({ type, Icon, label, hint, primary }) => (
                              <button
                                key={type}
                                onClick={() => openGovModal(type, selectedApp)}
                                className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                                  primary
                                    ? "bg-violet-600 text-white hover:bg-violet-700 active:scale-95"
                                    : "bg-white text-violet-700 border border-violet-200 hover:bg-violet-50"
                                }`}
                              >
                                <Icon size={14} className="shrink-0" />
                                <span>{label}</span>
                                <span className={`ml-auto text-[10px] ${primary ? "text-violet-200" : "text-gray-400"}`}>{hint}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedApp.status === "Decision Pending" && (
                          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                            <p className="text-xs font-bold text-orange-800">
                              The application has been submitted to UKVI. Awaiting their decision — typically 8–12 weeks. No action required at this stage.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sponsor-submitted UKVI Credentials */}
                    {intakeTab === "credentials" && (
                      <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Key className="text-violet-500 shrink-0" size={14} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Sponsor-Submitted UKVI Credentials</p>
                        </div>

                        {credsLoading ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Loader2 size={14} className="animate-spin" /> Loading…
                          </div>
                        ) : !submittedCreds ? (
                          <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-xs text-gray-500">
                            The sponsor has not yet submitted their UKVI portal credentials.
                            <p className="mt-1 text-[10px] text-gray-400">Use Pipeline Actions → Send Credentials to Sponsor to prompt them.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1">
                                <Check size={11} /> Submitted {submittedCreds.submittedAt ? new Date(submittedCreds.submittedAt).toLocaleString("en-GB") : ""}
                              </div>
                              {submittedCreds.caseworkerVerifiedAt && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-black">
                                  <BadgeCheck size={11} /> Verified
                                </span>
                              )}
                            </div>

                            {/* Portal User ID */}
                            <div className="rounded-xl bg-white border border-violet-100 px-4 py-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">UKVI Portal User ID</p>
                              <p className="text-sm font-black text-secondary">{submittedCreds.ukviPortalUserId || "—"}</p>
                            </div>

                            {/* Password */}
                            <div className="rounded-xl bg-white border border-violet-100 px-4 py-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">UKVI Portal Password</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-secondary flex-1 break-all">
                                  {showCredsPassword ? (submittedCreds.ukviPortalPassword || "—") : "••••••••"}
                                </p>
                                <button
                                  onClick={() => setShowCredsPassword((v) => !v)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                  {showCredsPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                </button>
                              </div>
                            </div>

                            {/* Actions */}
                            {submittedCreds.caseworkerVerifiedAt ? (
                              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-xs font-black text-green-700">
                                <BadgeCheck size={15} />
                                Credentials verified{submittedCreds.caseworkerVerifiedAt ? ` on ${new Date(submittedCreds.caseworkerVerifiedAt).toLocaleString("en-GB")}` : ""}. Sponsor has been notified.
                              </div>
                            ) : (
                              <div className="flex gap-2 pt-1">
                                <button
                                  disabled={credsActionLoading}
                                  onClick={async () => {
                                    try {
                                      setCredsActionLoading(true);
                                      await verifyCaseworkerCredentials(selectedApp.id);
                                      const res = await getCaseworkerSubmittedCredentials(selectedApp.id).catch(() => null);
                                      setSubmittedCreds(res?.data?.data || null);
                                      showToast({ message: "Credentials verified — sponsor notified", variant: "success" });
                                      fetchApplications();
                                    } catch {
                                      showToast({ message: "Failed to verify credentials", variant: "danger" });
                                    } finally { setCredsActionLoading(false); }
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white text-xs font-black py-2.5 hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                  {credsActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                  Mark as Verified
                                </button>
                                <button
                                  disabled={credsActionLoading}
                                  onClick={async () => {
                                    try {
                                      setCredsActionLoading(true);
                                      await requestCaseworkerCredentialsResubmission(selectedApp.id);
                                      setSubmittedCreds(null);
                                      showToast({ message: "Sponsor notified to resubmit credentials", variant: "success" });
                                    } catch {
                                      showToast({ message: "Failed to send resubmission request", variant: "danger" });
                                    } finally { setCredsActionLoading(false); }
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-xs font-black py-2.5 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                                >
                                  <RefreshCw size={13} />
                                  Request Resubmission
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Send Document to Sponsor */}
                    {intakeTab === "dispatch" && (
                      <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Upload className="text-teal-600 shrink-0" size={14} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Dispatch Document to Sponsor</p>
                        </div>
                        <p className="text-xs font-bold text-teal-800">
                          Upload the approved UKVI sponsor licence or any other document to send to the sponsor via email and their portal.
                        </p>
                        <select
                          value={cwDispatch.documentType}
                          onChange={(e) => setCwDispatch((f) => ({ ...f, documentType: e.target.value }))}
                          className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none"
                        >
                          <option value="sponsor_licence">Approved Sponsor Licence (UKVI)</option>
                          <option value="declaration_form">Declaration Form</option>
                          <option value="credentials">Credentials Document</option>
                          <option value="supporting_document">Supporting Document</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Document name (optional)"
                          value={cwDispatch.documentName}
                          onChange={(e) => setCwDispatch((f) => ({ ...f, documentName: e.target.value }))}
                          className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none"
                        />
                        <textarea
                          placeholder="Message to sponsor (optional)"
                          value={cwDispatch.message}
                          onChange={(e) => setCwDispatch((f) => ({ ...f, message: e.target.value }))}
                          rows={2}
                          className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-black text-secondary outline-none resize-none"
                        />
                        <label className="flex items-center gap-3 cursor-pointer bg-white border border-dashed border-teal-300 rounded-xl p-3 hover:bg-teal-50 transition-all">
                          <Upload size={16} className="text-teal-500 shrink-0" />
                          <span className="text-sm font-black text-teal-700 truncate">
                            {cwDispatchFile ? cwDispatchFile.name : "Choose file (PDF, DOC, JPG…)"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setCwDispatchFile(e.target.files[0] || null)}
                          />
                        </label>
                        <button
                          onClick={handleCwDispatch}
                          disabled={cwDispatchLoading || !cwDispatchFile}
                          className="w-full bg-teal-600 text-white font-black rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-teal-700 transition-all active:scale-95"
                        >
                          {cwDispatchLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {cwDispatchLoading ? "Sending…" : "Send to Sponsor"}
                        </button>
                      </div>
                    )}

                    {/* Intake & documents */}
                    {intakeTab === "intake" && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                        {intakeReadiness && (
                          <div className={`px-4 py-3 border-b flex items-center gap-2 ${
                            intakeReadiness.isReady ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
                          }`}>
                            {intakeReadiness.isReady
                              ? <Check size={13} className="text-emerald-600 shrink-0" />
                              : <AlertCircle size={13} className="text-amber-600 shrink-0" />}
                            <p className={`text-xs font-black ${intakeReadiness.isReady ? "text-emerald-700" : "text-amber-700"}`}>
                              {intakeReadiness.isReady
                                ? "All intake requirements met — ready for Government Registration"
                                : `Not ready: ${intakeReadiness.reasons?.[0] || "incomplete"}`}
                            </p>
                          </div>
                        )}
                        <div className="p-4">
                          {intakeLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                          ) : intakeData ? (
                            <>
                              {intakeData.form && (
                                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-black text-gray-700">Information Form</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      intakeData.form.isComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    }`}>
                                      {intakeData.form.isComplete ? "Complete" : "Incomplete"}
                                    </span>
                                  </div>
                                  {intakeData.form.isComplete && (
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        ["Trading Name",     intakeData.form.tradingName],
                                        ["Named Person",     intakeData.form.namedPersonOnLicence],
                                        ["NI Number",        intakeData.form.niNumber],
                                        ["Phone",            intakeData.form.phoneNumber],
                                        ["Email",            intakeData.form.emailAddress],
                                        ["Total Employees",  intakeData.form.totalEmployees],
                                        ["Immigration Rules",intakeData.form.employeesUnderImmigrationRules],
                                        ["CoS Required",     intakeData.form.numberOfCosRequired],
                                      ].map(([label, val]) => val != null ? (
                                        <div key={label}>
                                          <span className="text-[10px] font-bold text-gray-400">{label}: </span>
                                          <span className="text-[10px] font-black text-gray-700">{String(val)}</span>
                                        </div>
                                      ) : null)}
                                    </div>
                                  )}
                                </div>
                              )}
                              <IntakeDocumentChecklist
                                applicationId={selectedApp.id}
                                viewerRole="caseworker"
                                data={intakeData}
                                onRefresh={refreshIntake}
                              />
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 text-center py-6">Intake data not available yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Application stages */}
                <LicenceStages applicationId={selectedApp.id} viewerRole="caseworker" />

                {/* Review action buttons — hidden for terminal states */}
                {!isTerminal(selectedApp.status) && selectedApp.status !== "Decision Pending" && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => { setActionType("Approved"); setShowActionModal(true); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black text-xs transition-all active:scale-95"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => { setActionType("Rejected"); setShowActionModal(true); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-black text-xs transition-all active:scale-95"
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => { setActionType("Information Requested"); setShowActionModal(true); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-black text-xs transition-all active:scale-95"
                    >
                      <MessageSquare size={14} /> Request Info
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review Action Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Colour-coded header */}
              <div className={`px-5 py-4 ${
                actionType === "Approved"             ? "bg-gradient-to-r from-emerald-500 to-teal-600" :
                actionType === "Rejected"             ? "bg-gradient-to-r from-red-500 to-rose-600" :
                                                        "bg-gradient-to-r from-amber-500 to-orange-500"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      {actionType === "Approved"             ? <Check size={15} className="text-white" /> :
                       actionType === "Rejected"             ? <X size={15} className="text-white" /> :
                                                               <MessageSquare size={15} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {actionType === "Approved" ? "Confirm Approval" : actionType === "Rejected" ? "Confirm Rejection" : "Request Information"}
                      </h3>
                      {selectedApp && (
                        <p className="text-[10px] font-bold text-white/60 mt-0.5 truncate">{selectedApp.companyName} · #LIC-{selectedApp.id}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setShowActionModal(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Reviewer Notes{(actionType === "Rejected" || actionType === "Information Requested") && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <textarea
                    className={inp + " resize-none"}
                    rows={4}
                    placeholder={
                      actionType === "Approved" ? "Optional — add any approval notes for the record…" :
                      actionType === "Rejected" ? "Required — explain the reason for rejection…" :
                      "Required — describe what information is needed and why…"
                    }
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAction}
                    disabled={actionLoading}
                    className={`flex-[2] py-2.5 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 ${
                      actionType === "Approved" ? "bg-emerald-500 hover:bg-emerald-600" :
                      actionType === "Rejected" ? "bg-red-500 hover:bg-red-600" :
                                                  "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    {actionLoading
                      ? <Loader2 size={16} className="animate-spin" />
                      : actionType === "Approved" ? "Confirm Approval"
                      : actionType === "Rejected" ? "Confirm Rejection"
                      : "Send Request"}
                  </button>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 bg-gray-100 text-gray-500 font-black py-2.5 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Government Pipeline Action Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {govModal && (() => {
          const meta   = GOV_MODAL_META[govModal.type];
          const GovIcon = meta?.Icon ?? Globe;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <GovIcon className="text-white" size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{meta?.title}</h3>
                        {govModal?.app && (
                          <p className="text-[10px] font-bold text-indigo-200 mt-0.5 truncate">{govModal.app.companyName} · #LIC-{govModal.app.id}</p>
                        )}
                      </div>
                    </div>
                    <button onClick={closeGovModal} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Start Review */}
                  {govModal.type === "startReview" && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <p className="text-sm font-bold text-indigo-800">
                        This will move the application from <strong>Pending</strong> to <strong>Under Review</strong>. The sponsor will be notified that casework has begun.
                      </p>
                    </div>
                  )}

                  {/* Start Gov Registration */}
                  {govModal.type === "startGovReg" && (
                    <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                      <p className="text-sm font-bold text-violet-800">
                        This transitions the application to <strong>Government Processing</strong> and creates a government tracking record. The sponsor and admin will be notified.
                      </p>
                    </div>
                  )}

                  {/* Complete SMS Registration */}
                  {govModal.type === "completeReg" && (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                          SMS Registration Reference <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.smsRegistrationRef}
                          onChange={(e) => setRegForm((f) => ({ ...f, smsRegistrationRef: e.target.value }))}
                          className={inp}
                          placeholder="e.g. SMS-2024-001234"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                          Government Registration Reference <span className="text-gray-300 normal-case font-bold">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.governmentRegistrationRef}
                          onChange={(e) => setRegForm((f) => ({ ...f, governmentRegistrationRef: e.target.value }))}
                          className={inp}
                          placeholder="e.g. GOV-REG-001234"
                        />
                      </div>
                    </>
                  )}

                  {/* Request / Send Credentials */}
                  {govModal.type === "requestCreds" && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <p className="text-sm font-bold text-amber-800">
                        This will forward UKVI portal credentials to the sponsor. <strong>Credentials must have been generated by an admin first.</strong>
                      </p>
                    </div>
                  )}

                  {/* Submit to UKVI */}
                  {govModal.type === "submitUKVI" && (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                          UKVI Submission Reference <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={subForm.submissionRef}
                          onChange={(e) => setSubForm((f) => ({ ...f, submissionRef: e.target.value }))}
                          className={inp}
                          placeholder="e.g. UKVI-2024-SUB-001"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> Submission Date <span className="text-red-400">*</span>
                          </span>
                        </label>
                        <input
                          type="date"
                          value={subForm.submissionDate}
                          onChange={(e) => setSubForm((f) => ({ ...f, submissionDate: e.target.value }))}
                          className={inp}
                        />
                      </div>
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-xs font-bold text-red-700">
                          This transitions the application to <strong>Decision Pending</strong>. It cannot be undone without admin intervention.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Footer buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleGovAction}
                      disabled={govLoading}
                      className="flex-[2] bg-indigo-600 text-white font-black py-2.5 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {govLoading ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                    </button>
                    <button
                      onClick={closeGovModal}
                      className="flex-1 bg-gray-100 text-gray-500 font-black py-2.5 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default CaseworkerLicenceApplications;
