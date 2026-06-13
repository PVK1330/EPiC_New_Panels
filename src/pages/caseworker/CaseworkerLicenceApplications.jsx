import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Search, Eye, Download, Building2, Mail, Phone, AlertCircle,
  Check, X, FileText, MessageSquare, Loader2, Play, Globe, Key, Send,
  ClipboardCheck, Calendar, Landmark,
} from "lucide-react";
import api from "../../services/api";
import {
  downloadCaseworkerLicenceDocument,
  startLicenceReview,
  startGovRegistration,
  completeGovRegistration,
  requestGovCredentials,
  recordGovSubmission,
  getCaseworkerIntakeSummary,
  getIntakeReadiness,
} from "../../services/licenceApi";
import { triggerDownload } from "../../services/documentApi";
import LicenceStages from "../../components/licence/LicenceStages";
import IntakeDocumentChecklist from "../../components/licence/IntakeDocumentChecklist";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/datetime";

const GOV_PIPELINE_STATUSES = ["Pending", "Under Review", "Government Processing", "Decision Pending"];

const CaseworkerLicenceApplications = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [docBusy, setDocBusy] = useState(null);

  // Government pipeline modal state
  const [govModal, setGovModal] = useState(null); // { type, app }
  const [govLoading, setGovLoading] = useState(false);
  const [regForm, setRegForm] = useState({ smsRegistrationRef: "", governmentRegistrationRef: "" });
  const [subForm, setSubForm] = useState({ submissionRef: "", submissionDate: "" });

  // Intake panel state
  const [intakeData, setIntakeData] = useState(null);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeReadiness, setIntakeReadiness] = useState(null); // { isReady, reasons }
  const [intakeTab, setIntakeTab] = useState("govpipeline"); // "govpipeline" | "intake"

  const handleDocument = async (index, mode) => {
    if (!selectedApp || docBusy) return;
    try {
      setDocBusy(`${index}:${mode}`);
      const res = await downloadCaseworkerLicenceDocument(selectedApp.id, index, { download: mode === "download" });
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

  // Load intake data when an application is selected
  useEffect(() => {
    if (!selectedApp?.id) { setIntakeData(null); setIntakeReadiness(null); return; }
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

  // ── Legacy status action (Approve / Reject / Information Requested) ──────────
  const handleAction = async () => {
    if (!actionType) return;
    if ((actionType === "Rejected" || actionType === "Information Requested") && !adminNotes.trim()) {
      showToast({ message: "Please enter a note for this action", variant: "warning" });
      return;
    }
    try {
      setActionLoading(true);
      await api.patch(`/api/caseworker/licence/update-status/${selectedApp.id}`, {
        status: actionType,
        adminNotes,
      });
      showToast({ message: `Status updated to ${actionType} successfully`, variant: "success" });
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

  // ── Government pipeline modal helpers ────────────────────────────────────────
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
            setGovLoading(false);
            return;
          }
          await completeGovRegistration(app.id, {
            smsRegistrationRef: regForm.smsRegistrationRef.trim(),
            ...(regForm.governmentRegistrationRef.trim() && {
              governmentRegistrationRef: regForm.governmentRegistrationRef.trim(),
            }),
          });
          msg = "SMS registration recorded successfully";
          break;
        case "requestCreds":
          await requestGovCredentials(app.id);
          msg = "Credentials sent to sponsor";
          break;
        case "submitUKVI":
          if (!subForm.submissionRef.trim() || !subForm.submissionDate) {
            showToast({ message: "Both submission reference and date are required", variant: "warning" });
            setGovLoading(false);
            return;
          }
          await recordGovSubmission(app.id, {
            submissionRef: subForm.submissionRef.trim(),
            submissionDate: subForm.submissionDate,
          });
          msg = "Application submitted to UKVI — status moved to Decision Pending";
          break;
        default:
          break;
      }
      showToast({ message: msg, variant: "success" });
      closeGovModal();
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Action failed — please try again";
      showToast({ message: errMsg, variant: "danger" });
      setGovLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const filteredApps = applications.filter((app) => {
    const matchesFilter = filter === "All" || app.status === filter;
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":             return "bg-emerald-100 text-emerald-700";
      case "Rejected":             return "bg-red-100 text-red-700";
      case "Under Review":         return "bg-blue-100 text-blue-700";
      case "Information Requested":return "bg-amber-100 text-amber-700";
      case "Government Processing":return "bg-violet-100 text-violet-700";
      case "Decision Pending":     return "bg-orange-100 text-orange-700";
      default:                     return "bg-amber-100 text-amber-700";
    }
  };

  // Gov pipeline modal title / icon helpers
  const govModalMeta = {
    startReview:  { title: "Start Review",                   Icon: Play },
    startGovReg:  { title: "Start Government Registration",   Icon: Globe },
    completeReg:  { title: "Complete SMS Registration",       Icon: ClipboardCheck },
    requestCreds: { title: "Send Credentials to Sponsor",     Icon: Key },
    submitUKVI:   { title: "Submit Application to UKVI",      Icon: Send },
  };

  // Pipeline counts (for dashboard)
  const pipelineCounts = {
    pending:    applications.filter((a) => a.status === "Pending").length,
    underReview:applications.filter((a) => a.status === "Under Review").length,
    govProcess: applications.filter((a) => a.status === "Government Processing").length,
    decision:   applications.filter((a) => a.status === "Decision Pending").length,
  };
  const hasPipelineWork = Object.values(pipelineCounts).some(Boolean);

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} />
          Assigned Licence Reviews
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          Review and manage sponsor licence applications assigned to you.
        </p>
      </div>

      {/* ── Government Pipeline Task Dashboard ── */}
      {hasPipelineWork && (
        <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="text-indigo-500" size={18} />
            <h3 className="text-sm font-black text-secondary">Government Pipeline — Work In Progress</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-2xl font-black text-amber-600">{pipelineCounts.pending}</p>
              <p className="text-xs font-black text-gray-600 mt-1">Needs Review</p>
              <p className="text-[10px] font-bold text-amber-400 mt-0.5">Action: Start Review</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-2xl font-black text-blue-600">{pipelineCounts.underReview}</p>
              <p className="text-xs font-black text-gray-600 mt-1">Under Review</p>
              <p className="text-[10px] font-bold text-blue-400 mt-0.5">Action: Start Gov. Reg.</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
              <p className="text-2xl font-black text-violet-600">{pipelineCounts.govProcess}</p>
              <p className="text-xs font-black text-gray-600 mt-1">Gov. Processing</p>
              <p className="text-[10px] font-bold text-violet-400 mt-0.5">Actions required</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <p className="text-2xl font-black text-orange-600">{pipelineCounts.decision}</p>
              <p className="text-xs font-black text-gray-600 mt-1">Decision Pending</p>
              <p className="text-[10px] font-bold text-orange-400 mt-0.5">Awaiting UKVI</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {["All", "Pending", "Under Review", "Information Requested", "Government Processing", "Decision Pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Applications Table ── */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Company / Type</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned At</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/20" />
                </tr>
              ))
            ) : filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-secondary">{app.companyName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${app.type === "Renewal" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                          {String(app.reason || "").startsWith("CoS Request:") ? "CoS Request" : app.type}
                        </span>
                        {GOV_PIPELINE_STATUSES.includes(app.status) && app.status !== "Pending" && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                            Gov. Pipeline
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-secondary">{app.contactName}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">{app.contactEmail}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-secondary">{formatDate(app.updatedAt)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                      {app.applicationVersion === 2 && (
                        <button
                          onClick={() => navigate(`/caseworker/licence/v2/${app.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                          title="View the full 8-step application"
                        >
                          <FileText size={14} /> Full App
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-sm font-bold text-gray-400">No assigned reviews found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Details Modal ── */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Blue gradient header */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/15 rounded-2xl">
                      <FileText className="text-white" size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">Review Application</h2>
                      <p className="text-xs font-bold text-blue-200 mt-0.5">
                        #{selectedApp.id} ·{" "}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                          {selectedApp.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <X size={22} />
                  </button>
                </div>
              </div>
              <div className="p-8">

                {/* Company + Contact grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Company Information</label>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.companyName}</p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Building2 size={14} /> {selectedApp.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Licence Request</label>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.licenceType}</p>
                        <p className="text-xs font-bold text-gray-500">Allocation: {selectedApp.cosAllocation}</p>
                        <p className="text-xs font-bold text-gray-500">Type: {selectedApp.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Officer</label>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.contactName}</p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Mail size={14} /> {selectedApp.contactEmail}
                        </p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Phone size={14} /> {selectedApp.contactPhone}
                        </p>
                      </div>
                    </div>
                    {selectedApp.reason && (
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Justification / Reason</label>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <p className="text-xs font-bold text-amber-900 leading-relaxed italic">"{selectedApp.reason}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="mb-6">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Evidence & Documents</label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedApp.documents.map((doc, i) => {
                        const previewing = docBusy === `${i}:preview`;
                        const downloading = docBusy === `${i}:download`;
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/20 transition-all shadow-sm">
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
                              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Intake Panel Tab Switcher ── */}
                {["Pending", "Under Review", "Government Processing", "Decision Pending"].includes(selectedApp.status) && (
                  <div className="mb-6">
                    {/* Sub-tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4 w-fit">
                      {[{ id: "govpipeline", label: "Pipeline Actions" }, { id: "intake", label: "Intake & Documents" }].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setIntakeTab(id)}
                          className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                            intakeTab === id ? "bg-white text-secondary shadow-sm" : "text-gray-500 hover:text-secondary"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* ── Intake & Documents Sub-panel ── */}
                    {intakeTab === "intake" && (
                      <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Readiness status bar */}
                        {intakeReadiness && (
                          <div className={`px-4 py-3 border-b flex items-center gap-2 ${
                            intakeReadiness.isReady ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
                          }`}>
                            {intakeReadiness.isReady
                              ? <Check size={14} className="text-emerald-600 shrink-0" />
                              : <AlertCircle size={14} className="text-amber-600 shrink-0" />}
                            <p className={`text-xs font-black ${intakeReadiness.isReady ? "text-emerald-700" : "text-amber-700"}`}>
                              {intakeReadiness.isReady
                                ? "All intake requirements met — ready for Government Registration"
                                : `Not ready for Government Registration: ${intakeReadiness.reasons?.[0] || "incomplete"}`}
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
                              {/* Information form summary */}
                              {intakeData.form && (
                                <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-black text-gray-700">Information Form</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      intakeData.form.isComplete
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}>
                                      {intakeData.form.isComplete ? "Complete" : "Incomplete"}
                                    </span>
                                  </div>
                                  {intakeData.form.isComplete && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {[
                                        ["Trading Name", intakeData.form.tradingName],
                                        ["Named Person", intakeData.form.namedPersonOnLicence],
                                        ["NI Number", intakeData.form.niNumber],
                                        ["Phone", intakeData.form.phoneNumber],
                                        ["Email", intakeData.form.emailAddress],
                                        ["Total Employees", intakeData.form.totalEmployees],
                                        ["Under Immigration Rules", intakeData.form.employeesUnderImmigrationRules],
                                        ["CoS Required", intakeData.form.numberOfCosRequired],
                                      ].map(([label, val]) => val != null && (
                                        <div key={label}>
                                          <span className="font-bold text-gray-400">{label}:</span>{" "}
                                          <span className="text-gray-700">{String(val)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Document checklist in caseworker verify mode */}
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

                    {/* ── Government Pipeline Actions Sub-panel ── */}
                    {intakeTab === "govpipeline" && ["Pending", "Under Review", "Government Processing"].includes(selectedApp.status) && (
                  <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Landmark className="text-indigo-500" size={16} />
                      <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                        Government Pipeline Actions
                      </label>
                    </div>

                    {selectedApp.status === "Pending" && (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-indigo-800">
                          This application is pending casework review. Start the review to progress the application through the government pipeline.
                        </p>
                        <button
                          onClick={() => openGovModal("startReview", selectedApp)}
                          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3 text-sm font-black hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          <Play size={16} /> Start Review
                        </button>
                      </div>
                    )}

                    {selectedApp.status === "Under Review" && (
                      <div className="space-y-3">
                        {!intakeReadiness?.isReady && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-black text-amber-700">Intake not yet complete</p>
                                {intakeReadiness?.reasons?.map((r, i) => (
                                  <p key={i} className="text-[11px] text-amber-600 mt-0.5">• {r}</p>
                                ))}
                                <button
                                  onClick={() => setIntakeTab("intake")}
                                  className="mt-1 text-[11px] text-amber-700 underline"
                                >
                                  Review Intake & Documents →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-xs font-bold text-indigo-800">
                          Review is in progress. All intake documents must be verified before Government Registration can begin.
                        </p>
                        <button
                          onClick={() => openGovModal("startGovReg", selectedApp)}
                          disabled={!intakeReadiness?.isReady}
                          title={!intakeReadiness?.isReady ? "Complete intake verification first" : "Start Government Registration"}
                          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all active:scale-95 ${
                            intakeReadiness?.isReady
                              ? "bg-violet-600 text-white hover:bg-violet-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Globe size={16} /> Start Government Registration
                          {!intakeReadiness?.isReady && <span className="text-[10px] ml-1">(intake required)</span>}
                        </button>
                      </div>
                    )}

                    {selectedApp.status === "Government Processing" && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-indigo-800 mb-3">
                          Government portal processing is active. Complete the steps in order.
                        </p>
                        <button
                          onClick={() => openGovModal("completeReg", selectedApp)}
                          className="w-full flex items-center gap-3 bg-white text-violet-700 border border-violet-200 rounded-xl px-4 py-3 text-xs font-black hover:bg-violet-50 transition-all"
                        >
                          <ClipboardCheck size={15} className="shrink-0" />
                          <span>Complete SMS Registration</span>
                          <span className="ml-auto text-violet-300 text-[10px]">Record SMS & Gov. ref.</span>
                        </button>
                        <button
                          onClick={() => openGovModal("requestCreds", selectedApp)}
                          className="w-full flex items-center gap-3 bg-white text-violet-700 border border-violet-200 rounded-xl px-4 py-3 text-xs font-black hover:bg-violet-50 transition-all"
                        >
                          <Key size={15} className="shrink-0" />
                          <span>Send Credentials to Sponsor</span>
                          <span className="ml-auto text-violet-300 text-[10px]">Requires admin to generate first</span>
                        </button>
                        <button
                          onClick={() => openGovModal("submitUKVI", selectedApp)}
                          className="w-full flex items-center gap-3 bg-violet-600 text-white rounded-xl px-4 py-3 text-xs font-black hover:bg-violet-700 transition-all active:scale-95"
                        >
                          <Send size={15} className="shrink-0" />
                          <span>Submit Application to UKVI</span>
                          <span className="ml-auto text-violet-300 text-[10px]">→ Decision Pending</span>
                        </button>
                      </div>
                    )}
                  </div>
                    )}
                  </div>
                )}

                {/* Government registration info (read-only for Decision Pending / Approved) */}
                {["Decision Pending", "Approved"].includes(selectedApp.status) && selectedApp.governmentSubmissionRef && (
                  <div className="mb-6 bg-orange-50 rounded-2xl p-5 border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="text-orange-500" size={16} />
                      <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest">
                        UKVI Submission
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Submission Ref</p>
                        <p className="text-sm font-black text-secondary">{selectedApp.governmentSubmissionRef}</p>
                      </div>
                      {selectedApp.governmentSubmissionDate && (
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Submitted On</p>
                          <p className="text-sm font-black text-secondary">{formatDate(selectedApp.governmentSubmissionDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Application stages */}
                <div className="mb-6">
                  <LicenceStages applicationId={selectedApp.id} viewerRole="caseworker" />
                </div>

                {/* Standard review actions */}
                <div className="pt-5 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActionType("Approved"); setShowActionModal(true); }}
                      className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => { setActionType("Rejected"); setShowActionModal(true); }}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <X size={16} /> Reject
                    </button>
                    <button
                      onClick={() => { setActionType("Information Requested"); setShowActionModal(true); }}
                      className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-black rounded-xl py-3 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <MessageSquare size={16} /> Request Info
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legacy Action Modal (Approve / Reject / Request Info) ── */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Colour-coded gradient header */}
              <div className={`px-6 py-5 ${
                actionType === "Approved"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                  : actionType === "Rejected"
                  ? "bg-gradient-to-r from-red-500 to-rose-600"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/15 rounded-xl">
                      {actionType === "Approved"
                        ? <Check size={16} className="text-white" />
                        : actionType === "Rejected"
                        ? <X size={16} className="text-white" />
                        : <MessageSquare size={16} className="text-white" />}
                    </div>
                    <h3 className="text-base font-black text-white">
                      {actionType === "Approved" ? "Confirm Approval"
                        : actionType === "Rejected" ? "Confirm Rejection"
                        : "Request Information"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
                {selectedApp && (
                  <p className="text-[11px] font-bold text-white/60 mt-1.5 truncate">{selectedApp.companyName} · #{selectedApp.id}</p>
                )}
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Reviewer Notes</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none resize-none"
                    rows={4}
                    placeholder="Enter your assessment notes here..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAction}
                    disabled={actionLoading}
                    className={`flex-[2] py-3 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                      actionType === "Approved"
                        ? "bg-emerald-500 shadow-emerald-100"
                        : actionType === "Rejected"
                        ? "bg-red-500 shadow-red-100"
                        : "bg-primary shadow-primary/20"
                    }`}
                  >
                    {actionLoading
                      ? <Loader2 className="animate-spin" />
                      : `Confirm ${actionType.replace("Information Requested", "Request")}`}
                  </button>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 bg-gray-50 text-gray-500 font-black py-3 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Government Pipeline Action Modal ── */}
      <AnimatePresence>
        {govModal && (() => {
          const meta = govModalMeta[govModal.type];
          const GovIcon = meta?.Icon ?? Globe;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Blue-to-violet gradient header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-700 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/15 rounded-xl">
                        <GovIcon className="text-white" size={18} />
                      </div>
                      <h3 className="text-base font-black text-white">{meta?.title}</h3>
                    </div>
                    <button onClick={closeGovModal} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  {govModal?.app && (
                    <p className="text-[11px] font-bold text-blue-200 mt-1.5 truncate">{govModal.app.companyName} · #{govModal.app.id}</p>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* Start Review */}
                  {govModal.type === "startReview" && (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-sm font-bold text-indigo-800">
                        This will move the application from <strong>Pending</strong> to <strong>Under Review</strong>. The sponsor will be notified that casework has begun.
                      </p>
                    </div>
                  )}

                  {/* Start Government Registration */}
                  {govModal.type === "startGovReg" && (
                    <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                      <p className="text-sm font-bold text-violet-800">
                        This will transition the application to <strong>Government Processing</strong> and create a government tracking record. The sponsor and admin will be notified.
                      </p>
                    </div>
                  )}

                  {/* Complete SMS Registration */}
                  {govModal.type === "completeReg" && (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                          SMS Registration Reference <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.smsRegistrationRef}
                          onChange={(e) => setRegForm((f) => ({ ...f, smsRegistrationRef: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:ring-4 focus:ring-violet-500/10 outline-none"
                          placeholder="e.g. SMS-2024-001234"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                          Government Registration Reference <span className="text-gray-300 normal-case font-bold">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.governmentRegistrationRef}
                          onChange={(e) => setRegForm((f) => ({ ...f, governmentRegistrationRef: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:ring-4 focus:ring-violet-500/10 outline-none"
                          placeholder="e.g. GOV-REG-001234"
                        />
                      </div>
                    </>
                  )}

                  {/* Request / Send Credentials */}
                  {govModal.type === "requestCreds" && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-sm font-bold text-amber-800">
                        This will send the UKVI portal credentials to the sponsor. <strong>Credentials must have been generated by an admin first.</strong> If none exist, this action will fail.
                      </p>
                    </div>
                  )}

                  {/* Submit to UKVI */}
                  {govModal.type === "submitUKVI" && (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                          UKVI Submission Reference <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={subForm.submissionRef}
                          onChange={(e) => setSubForm((f) => ({ ...f, submissionRef: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:ring-4 focus:ring-violet-500/10 outline-none"
                          placeholder="e.g. UKVI-2024-SUB-001"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 flex items-center gap-1">
                          <Calendar size={12} />
                          Submission Date <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={subForm.submissionDate}
                          onChange={(e) => setSubForm((f) => ({ ...f, submissionDate: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:ring-4 focus:ring-violet-500/10 outline-none"
                        />
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <p className="text-xs font-bold text-red-700">
                          This action transitions the application to <strong>Decision Pending</strong>. It cannot be undone without admin intervention.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Confirm / Cancel */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleGovAction}
                      disabled={govLoading}
                      className="flex-[2] bg-violet-600 text-white font-black py-3 rounded-xl hover:bg-violet-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-violet-100"
                    >
                      {govLoading ? <Loader2 className="animate-spin" size={18} /> : "Confirm"}
                    </button>
                    <button
                      onClick={closeGovModal}
                      className="flex-1 bg-gray-50 text-gray-500 font-black py-3 rounded-xl hover:bg-gray-100 transition-all"
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
