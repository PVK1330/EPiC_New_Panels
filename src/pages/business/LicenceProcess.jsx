import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Clock3,
  CircleCheck,
  ClipboardList,
  Loader2,
  ArrowRight,
  FileText,
  AlertCircle,
  Key,
  Check,
  CheckCircle2,
  Upload,
  Landmark,
  ShieldAlert,
  FolderOpen,
  Info,
  Save,
} from "lucide-react";
import LicenceStages from "../../components/licence/LicenceStages";
import IntakeDocumentChecklist from "../../components/licence/IntakeDocumentChecklist";
import LicenceWorkflowTimeline from "../../components/licence/LicenceWorkflowTimeline";
import { listLicenceV2Applications, getLicenceV2Application, getLicenceApplicationAuditTrail } from "../../services/licenceV2Api";
import { getLicenceStages, completeLicenceStageTask } from "../../services/licenceStageApi";
import {
  confirmSponsorGovCredentials,
  getSponsorIntakeSummary,
  updateSponsorIntakeForm,
  submitSponsorIntakeForm as submitIntakeFormApi,
  getMyLicenceApplications,
  getSponsorDispatchedDocuments,
  downloadSponsorDispatchedDocument,
} from "../../services/licenceApi";
import { LICENCE_STAGES, STAGE_ROLES, getSponsorStageAction } from "../../constants/licenceStages";
import { formatDate, formatDateTime } from "../../utils/datetime";
import { useToast } from "../../context/ToastContext";

const TABS = [
  { id: "status",   label: "Status",           icon: BarChart3 },
  { id: "intake",   label: "Info & Documents",  icon: FolderOpen },
  { id: "timeline", label: "Timeline",          icon: Clock3 },
  { id: "actions",  label: "Pending actions",   icon: CircleCheck },
];

const STAGE_DESC = Object.fromEntries(LICENCE_STAGES.map((s) => [s.key, s.description]));
const ROLE_LABEL = Object.fromEntries(STAGE_ROLES.map((r) => [r.key, r.label]));
const GOV_PIPELINE = ["Government Processing", "Decision Pending", "Approved"];

// Maps each LicenceApplicationAudit action token to display label, dot colour, and section.
const ACTION_META = {
  SUBMIT:                             { label: "Application submitted",                   tone: "bg-secondary",   section: "Submission" },
  assign:                             { label: "Caseworker assigned",                     tone: "bg-blue-500",    section: "Assignment" },
  reassign:                           { label: "Caseworker reassigned",                   tone: "bg-blue-400",    section: "Assignment" },
  approve:                            { label: "Application approved",                    tone: "bg-emerald-500", section: "Decision" },
  reject:                             { label: "Application rejected",                    tone: "bg-red-500",     section: "Decision" },
  request_info:                       { label: "Information requested by case team",      tone: "bg-amber-500",   section: "Review" },
  under_review:                       { label: "Application placed under review",         tone: "bg-blue-500",    section: "Review" },
  review_started:                     { label: "Review started",                          tone: "bg-blue-500",    section: "Review" },
  government_registration_started:    { label: "Government registration started",          tone: "bg-violet-500",  section: "Gov. Pipeline" },
  government_registration_completed:  { label: "SMS registration completed",              tone: "bg-violet-500",  section: "Gov. Pipeline" },
  credentials_generated:              { label: "Portal credentials generated",            tone: "bg-violet-500",  section: "Gov. Pipeline" },
  credentials_requested:              { label: "Credentials sent to sponsor",             tone: "bg-violet-500",  section: "Gov. Pipeline" },
  credentials_received:               { label: "Credentials receipt confirmed",           tone: "bg-emerald-400", section: "Gov. Pipeline" },
  government_forms_completed:         { label: "Government application forms completed",  tone: "bg-violet-500",  section: "Gov. Pipeline" },
  government_submitted:               { label: "Application submitted to UKVI",           tone: "bg-orange-500",  section: "UKVI" },
  decision_pending:                   { label: "Awaiting UKVI decision",                 tone: "bg-orange-400",  section: "UKVI" },
};

const LicenceProcess = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [app, setApp] = useState(null);
  const [stagesData, setStagesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credLoading, setCredLoading] = useState(false);
  const [credConfirmed, setCredConfirmed] = useState(false);
  const [intakeData, setIntakeData] = useState(null);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeForm, setIntakeForm] = useState({});
  const [intakeSaving, setIntakeSaving] = useState(false);
  const [completingStage, setCompletingStage] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineFetched, setTimelineFetched] = useState(false);
  const [dispatchDocs, setDispatchDocs] = useState([]);
  const [dispatchDocsLoading, setDispatchDocsLoading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  // Download a dispatched document through `api` (not a plain <a href>) so the CSRF
  // token and org-slug headers are attached. Filename comes from Content-Disposition.
  const handleDownloadDispatched = useCallback(async (doc) => {
    if (!app?.id || !doc?.id) return;
    setDownloadingDocId(doc.id);
    try {
      const res = await downloadSponsorDispatchedDocument(app.id, doc.id);
      const cd = res.headers?.["content-disposition"] || "";
      const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(cd);
      const filename = match ? decodeURIComponent(match[1]) : (doc.documentName || `document-${doc.id}`);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Download failed";
      showToast({ message, variant: "danger" });
    } finally {
      setDownloadingDocId(null);
    }
  }, [app?.id, showToast]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const list = await listLicenceV2Applications();
        let apps = list?.data?.data || [];

        // Fall back to V1 applications for sponsors who used the old submission flow
        if (!apps.length) {
          const v1 = await getMyLicenceApplications().catch(() => null);
          apps = v1?.data?.data || [];
        }

        if (!apps.length) { if (active) setLoading(false); return; }
        const latest = apps.reduce((a, b) => (Number(b.id) > Number(a.id) ? b : a), apps[0]);
        const isV2 = latest.applicationVersion === 2;
        const [full, stages] = await Promise.all([
          isV2 ? getLicenceV2Application(latest.id).catch(() => null) : Promise.resolve(null),
          getLicenceStages("sponsor", latest.id).catch(() => null),
        ]);
        if (!active) return;
        const appData = full?.data?.data || latest;
        setApp(appData);
        setStagesData(stages?.data?.data || null);

        // Load dispatched documents from caseworker/admin.
        if (appData?.id) {
          setDispatchDocsLoading(true);
          getSponsorDispatchedDocuments(appData.id)
            .then((r) => { if (active) setDispatchDocs(r?.data?.data || []); })
            .catch(() => {})
            .finally(() => { if (active) setDispatchDocsLoading(false); });
        }
      } catch {
        /* falls through to empty state */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return ["timeline", "actions", "intake"].includes(t) ? t : "status";
  }, [searchParams]);

  // Load intake summary on mount so the Status-tab banner has data, and again on tab switch to get fresh state.
  useEffect(() => {
    if (!app?.id) return;
    let active = true;
    (async () => {
      try {
        setIntakeLoading(true);
        const res = await getSponsorIntakeSummary(app.id);
        if (!active) return;
        const summary = res?.data?.data || res?.data || null;
        setIntakeData(summary);
        if (summary?.form) setIntakeForm(summary.form);
      } catch { /* ignore */ }
      finally { if (active) setIntakeLoading(false); }
    })();
    return () => { active = false; };
  }, [app?.id]);

  const handleIntakeSave = async () => {
    if (!app?.id || intakeSaving) return;
    try {
      setIntakeSaving(true);
      await updateSponsorIntakeForm(app.id, intakeForm);
      const res = await getSponsorIntakeSummary(app.id);
      const summary = res?.data?.data || res?.data || null;
      setIntakeData(summary);
      if (summary?.form) setIntakeForm(summary.form);
      showToast({ message: "Information form saved.", variant: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Save failed.", variant: "danger" });
    } finally { setIntakeSaving(false); }
  };

  const handleIntakeSubmit = async () => {
    if (!app?.id || intakeSaving) return;
    try {
      setIntakeSaving(true);
      await updateSponsorIntakeForm(app.id, intakeForm);
      await submitIntakeFormApi(app.id);
      const res = await getSponsorIntakeSummary(app.id);
      const summary = res?.data?.data || res?.data || null;
      setIntakeData(summary);
      if (summary?.form) setIntakeForm(summary.form);
      showToast({ message: "Information form submitted — your case team has been notified.", variant: "success" });
    } catch (err) {
      const missing = err?.response?.data?.missing;
      const msg = missing?.length
        ? `Please complete: ${missing.join(", ")}`
        : err?.response?.data?.message || "Submission failed.";
      showToast({ message: msg, variant: "danger" });
    } finally { setIntakeSaving(false); }
  };

  const refreshIntake = useCallback(async () => {
    if (!app?.id) return;
    try {
      const res = await getSponsorIntakeSummary(app.id);
      const summary = res?.data?.data || res?.data || null;
      setIntakeData(summary);
      if (summary?.form) setIntakeForm(summary.form);
    } catch { /* ignore */ }
  }, [app?.id]);

  // Derive credentials-confirmed state from stages data when available
  const credConfirmedFromStages = useMemo(() => {
    const govStage = (stagesData?.stages || []).find((s) => s.key === "government_portal_credentials");
    if (!govStage) return false;
    return (govStage.tasks || []).some((t) => t.role === "sponsor" && t.status === "completed");
  }, [stagesData]);

  const isCredConfirmed = credConfirmed || credConfirmedFromStages;

  const handleConfirmCredentials = async () => {
    if (!app?.id || credLoading) return;
    try {
      setCredLoading(true);
      await confirmSponsorGovCredentials(app.id);
      setCredConfirmed(true);
      showToast({ message: "Credentials receipt confirmed — your case team has been notified.", variant: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to confirm — please try again.", variant: "danger" });
    } finally {
      setCredLoading(false);
    }
  };

  const isIntakeDocStageTaskComplete = useMemo(() => {
    const stage = (stagesData?.stages || []).find((s) => s.key === "intake_document_checklist");
    if (!stage) return false;
    const task = (stage.tasks || []).find((t) => t.role === "sponsor");
    return task?.status === "completed";
  }, [stagesData]);

  const handleCompleteIntakeDocStage = async () => {
    if (!app?.id || completingStage) return;
    try {
      setCompletingStage(true);
      const res = await completeLicenceStageTask("sponsor", app.id, "intake_document_checklist", "sponsor");
      setStagesData(res.data?.data || null);
      showToast({ message: "Intake document stage task marked complete.", variant: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to mark stage complete.", variant: "danger" });
    } finally {
      setCompletingStage(false);
    }
  };

  const setTab = useCallback(
    (id) => setSearchParams(id === "status" ? {} : { tab: id }, { replace: true }),
    [setSearchParams],
  );

  const stages = useMemo(() => stagesData?.stages || [], [stagesData]);
  const currentStage = stages.find((s) => s.key === stagesData?.currentStageKey) || null;
  const doneCount = stages.filter((s) => s.status === "completed").length;

  const inferredAppStatus = useMemo(() => {
    if (app?.status) return app.status;
    if (!stages.length) return "Pending";

    const stageMap = Object.fromEntries(stages.map((s) => [s.key, s]));
    const govStageKeys = [
      "sponsor_information_provision",
      "government_sms_registration",
      "sponsor_portal_onboarding",
      "government_portal_credentials",
      "government_application_forms",
      "government_submission",
    ];
    const hasGovWork = stages.some((s) => govStageKeys.includes(s.key) && s.status !== "completed");
    const submissionCompleted = stageMap["submission"]?.status === "completed";
    const decisionPending = submissionCompleted && stageMap["decision_activation"]?.status !== "completed";

    if (decisionPending) return "Decision Pending";
    if (hasGovWork) return "Government Processing";
    return "Pending";
  }, [app?.status, stages]);

  const statusLabel = app?.status || inferredAppStatus;
  const isInfoRequested = statusLabel === "Information Requested";
  const isGovPipeline = GOV_PIPELINE.includes(statusLabel) || stages.some((s) => [
    "sponsor_information_provision",
    "government_sms_registration",
    "sponsor_portal_onboarding",
    "government_portal_credentials",
    "government_application_forms",
    "government_submission",
  ].includes(s.key) && s.status !== "completed");

  // Fetch audit trail lazily — only when the Timeline tab is first opened.
  useEffect(() => {
    if (!app?.id || activeTab !== "timeline" || timelineFetched) return;
    let active = true;
    (async () => {
      try {
        setTimelineLoading(true);
        const res = await getLicenceApplicationAuditTrail(app.id);
        if (!active) return;
        setTimeline(res?.data?.data || []);
        setTimelineFetched(true);
      } catch {
        /* keep empty state — error already logged server-side */
      } finally {
        if (active) setTimelineLoading(false);
      }
    })();
    return () => { active = false; };
  }, [app?.id, activeTab, timelineFetched]);

  const pendingActions = useMemo(() => {
    const out = [];
    for (const s of stages) {
      if (s.status === "completed") continue;
      const task = (s.tasks || []).find((t) => t.role === "sponsor" && t.status !== "completed");
      const cta = getSponsorStageAction(s.key, app?.id);
      if (task && cta) {
        out.push({ title: task.title, stage: s.title, current: s.key === stagesData?.currentStageKey, cta });
      }
    }
    return out;
  }, [stages, stagesData?.currentStageKey, app?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400">Loading your licence tracking…</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-5 pb-6">
        <Header />
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="p-5 text-center">
            <FileText className="mx-auto text-gray-300 mb-3" size={36} />
            <h2 className="text-sm font-black text-secondary">No licence application yet</h2>
            <p className="text-sm font-bold text-gray-500 mt-1 max-w-md mx-auto">
              Start your sponsor licence application to begin tracking its stages, tasks and progress here.
            </p>
            <button
              onClick={() => navigate("/business/apply-licence-v2")}
              className="mt-4 inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-black px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all active:scale-95"
            >
              Start application <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <Header
        subtitle={
          <>
            Reference: <span className="text-secondary font-black">#LIC-{app.id}</span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="capitalize">{statusLabel}</span>
          </>
        }
      />

      {/* ── Action Required Banners ─────────────────────────────────────────── */}
      {isInfoRequested && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg shrink-0">
                <ShieldAlert className="text-red-600" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-secondary">Action Required — Information Requested</h3>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  Your case team has requested additional information. Review the details in the Status tab below.
                </p>
              </div>
            </div>
            <button
              onClick={() => setTab("status")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-black text-white transition shadow-sm shrink-0"
            >
              View Request
            </button>
          </div>
        </motion.div>
      )}

      {/* Intake incomplete banner (pre-government stages) */}
      {!isGovPipeline && intakeData && !intakeData?.form?.isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Info className="text-blue-600" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-secondary">Intake Information Required</h3>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  Please complete the Information Form and upload your required documents to progress your application.
                </p>
              </div>
            </div>
            <button
              onClick={() => setTab("intake")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-black text-white transition shadow-sm shrink-0"
            >
              Complete Now
            </button>
          </div>
        </motion.div>
      )}

      {app.status === "Government Processing" && !isCredConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg shrink-0">
                <Key className="text-violet-600" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-secondary">Government Portal — Action Pending</h3>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  Your UKVI portal credentials are being prepared. Confirm receipt once you receive them from your caseworker.
                </p>
              </div>
            </div>
            <button
              onClick={() => setTab("status")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-xs font-black text-white transition shadow-sm shrink-0"
            >
              View Credentials
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-gray-200 bg-gray-50/80 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tab.id === "actions" ? pendingActions.length : 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
                isActive
                  ? "bg-secondary text-white shadow-md shadow-secondary/20"
                  : "text-gray-500 hover:text-primary hover:bg-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {count > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Status Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "status" && (
        <div className="space-y-4">
          {/* Current step card */}
          {currentStage && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-gray-100">
                  <ClipboardList className="text-primary" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Step {currentStage.order} of {stages.length} · {doneCount} complete
                  </p>
                  <h2 className="text-sm font-black text-secondary tracking-tight">{currentStage.title}</h2>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{STAGE_DESC[currentStage.key]}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Government Pipeline Panel ── */}
          {isGovPipeline && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Landmark className="text-violet-500" size={16} />
                  <h3 className="text-sm font-black text-secondary">Government Pipeline</h3>
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${
                    app.status === "Government Processing" ? "bg-violet-200 text-violet-700" :
                    app.status === "Decision Pending"       ? "bg-orange-100 text-orange-700" :
                                                              "bg-emerald-100 text-emerald-700"
                  }`}>{app.status}</span>
                </div>

                {/* ── SMS / Registration panel ── */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-3">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Sponsor Management System (SMS)</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={15} />
                    <p className="text-xs font-bold text-secondary">Your organisation has been registered on the UK Visas &amp; Immigration SMS portal.</p>
                  </div>
                  {app.governmentRegistrationRef ? (
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500">Government Registration Reference</span>
                      <span className="text-[10px] font-black text-secondary tracking-wider">{app.governmentRegistrationRef}</span>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-gray-400">
                      Your SMS registration reference will appear here once your caseworker completes the registration step.
                    </p>
                  )}
                </div>

                {/* ── UKVI Portal Credentials Confirmation ── */}
                {app.status === "Government Processing" && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-50 rounded-lg shrink-0 mt-0.5">
                        <Key className="text-amber-500" size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-secondary mb-1">UKVI Online Application Portal Credentials</p>
                        <p className="text-xs font-bold text-gray-500 mb-3 leading-relaxed">
                          Your caseworker will share UKVI portal login credentials via your registered contact details.
                          Once you receive them, confirm below — this lets your case team know you have access and can progress to the next stage.
                        </p>
                        {isCredConfirmed ? (
                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-emerald-700">
                            <CheckCircle2 size={14} className="shrink-0" />
                            <span className="text-[10px] font-black">Credentials receipt confirmed — thank you</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleConfirmCredentials}
                            disabled={credLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-black text-white transition shadow-sm disabled:opacity-60 active:scale-95"
                          >
                            {credLoading
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Check size={13} />}
                            Confirm Credentials Received
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── UKVI Submission details ── */}
                {app.governmentSubmissionRef && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">UKVI Application Submission</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-1">Submission Reference</p>
                        <p className="text-xs font-black text-secondary">{app.governmentSubmissionRef}</p>
                      </div>
                      {app.governmentSubmissionDate && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold mb-1">Submitted On</p>
                          <p className="text-xs font-black text-secondary">{formatDate(app.governmentSubmissionDate)}</p>
                        </div>
                      )}
                    </div>
                    {app.status === "Decision Pending" && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-orange-600">
                          Your application has been submitted to UKVI. We are awaiting their decision — this typically takes 8–12 weeks. You will be notified when a decision is made.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Information Request Response ── */}
          {isInfoRequested && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-500 shrink-0" size={16} />
                  <h3 className="text-sm font-black text-red-600">Information Requested by Your Case Team</h3>
                </div>

                {app.adminNotes && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-2">Message from caseworker</p>
                    <p className="text-xs font-bold text-secondary leading-relaxed">{app.adminNotes}</p>
                  </div>
                )}

                {app.requestedDocuments && (
                  <div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-2">Requested documents / information</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(app.requestedDocuments)
                        ? app.requestedDocuments
                        : [app.requestedDocuments]
                      ).map((doc, i) => (
                        <span key={doc} className="bg-white border border-red-200 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    to="/business/licence"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-black text-white transition shadow-sm active:scale-95"
                  >
                    <Upload size={13} /> Update Application &amp; Upload Documents
                  </Link>
                  <Link
                    to="/business/licence-documents"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 font-black px-3 py-1.5 text-xs transition"
                  >
                    <FileText size={13} /> Manage Documents
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── 16-stage progress tracker ── */}
          <LicenceStages
            applicationId={app.id}
            data={stagesData}
            viewerRole="sponsor"
            onChange={setStagesData}
          />
        </div>
      )}

      {/* ── Intake Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "intake" && (
        <div className="space-y-4">
          {intakeLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Readiness indicator */}
              {intakeData?.readiness && (
                <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative`}>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
                  <div className={`p-5 flex items-start gap-3 ${
                    intakeData.readiness.isReady
                      ? "bg-emerald-50/50"
                      : "bg-amber-50/50"
                  }`}>
                    {intakeData.readiness.isReady
                      ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      : <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    }
                    <div className="flex-1">
                      <p className={`text-sm font-black ${intakeData.readiness.isReady ? "text-emerald-700" : "text-amber-700"}`}>
                        {intakeData.readiness.isReady
                          ? isIntakeDocStageTaskComplete
                            ? "Intake complete — document stage marked complete. Awaiting government registration."
                            : "Intake complete — your case team can proceed to Government Registration."
                          : "Intake not yet complete"}
                      </p>
                      {!intakeData.readiness.isReady && intakeData.readiness.reasons?.map((r, i) => (
                        <p key={r} className="text-xs text-amber-600 mt-1">• {r}</p>
                      ))}
                      {intakeData.readiness.isReady && !isIntakeDocStageTaskComplete && (
                        <button
                          onClick={handleCompleteIntakeDocStage}
                          disabled={completingStage}
                          className="mt-3 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          {completingStage ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          Mark Stage Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Information Form */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-secondary">Sponsor Information Form</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Complete all 12 fields before submitting</p>
                  </div>
                  {intakeData?.form?.isComplete && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Submitted</span>
                  )}
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "tradingName",                   label: "Trading Name",                         type: "text" },
                    { key: "owningLimitedCompany",          label: "Owning Limited Company",               type: "text" },
                    { key: "namedPersonOnLicence",          label: "Named Person on Licence",              type: "text" },
                    { key: "phoneNumber",                   label: "Phone Number",                         type: "tel" },
                    { key: "niNumber",                      label: "NI Number",                            type: "text" },
                    { key: "emailAddress",                  label: "Email Address",                        type: "email" },
                    { key: "companyWebsite",                label: "Company Website",                      type: "url" },
                    { key: "totalEmployees",                label: "Total Employees",                      type: "number" },
                    { key: "employeesUnderImmigrationRules",label: "Employees Under Immigration Rules",    type: "number" },
                    { key: "numberOfCosRequired",           label: "Number of CoS Required",              type: "number" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">{label}</label>
                      <input
                        type={type}
                        value={intakeForm[key] || ""}
                        onChange={(e) => setIntakeForm((f) => ({ ...f, [key]: e.target.value }))}
                        disabled={intakeData?.form?.isComplete}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                  ))}

                  {/* Premises Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Premises Address</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { sub: "line1", ph: "Address Line 1" },
                        { sub: "line2", ph: "Address Line 2 (optional)" },
                        { sub: "city",  ph: "City" },
                        { sub: "county",ph: "County" },
                        { sub: "postcode", ph: "Postcode" },
                        { sub: "country",  ph: "Country" },
                      ].map(({ sub, ph }) => (
                        <input
                          key={sub}
                          type="text"
                          placeholder={ph}
                          value={intakeForm.premisesAddress?.[sub] || ""}
                          onChange={(e) => setIntakeForm((f) => ({
                            ...f,
                            premisesAddress: { ...(f.premisesAddress || {}), [sub]: e.target.value },
                          }))}
                          disabled={intakeData?.form?.isComplete}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Job Titles */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
                      Job Titles Required <span className="text-gray-400 normal-case">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(intakeForm.jobTitlesRequired) ? intakeForm.jobTitlesRequired.join(", ") : (intakeForm.jobTitlesRequired || "")}
                      onChange={(e) => setIntakeForm((f) => ({
                        ...f,
                        jobTitlesRequired: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      }))}
                      disabled={intakeData?.form?.isComplete}
                      placeholder="e.g. Software Engineer, Product Manager"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                </div>

                {!intakeData?.form?.isComplete && (
                  <div className="px-5 pb-5 flex gap-3 flex-wrap">
                    <button
                      onClick={handleIntakeSave}
                      disabled={intakeSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      <Save size={13} />
                      {intakeSaving ? "Saving…" : "Save Draft"}
                    </button>
                    <button
                      onClick={handleIntakeSubmit}
                      disabled={intakeSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg bg-primary text-white hover:bg-primary-dark shadow-sm disabled:opacity-50 transition"
                    >
                      <Check size={13} />
                      {intakeSaving ? "Submitting…" : "Submit Form"}
                    </button>
                  </div>
                )}
              </div>

              {/* Document Checklist */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-black text-secondary">Document Checklist</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Upload all required documents. Your caseworker will verify each one.</p>
                </div>
                <div className="p-5">
                  {intakeData ? (
                    <IntakeDocumentChecklist
                      applicationId={app.id}
                      viewerRole="sponsor"
                      data={intakeData}
                      onRefresh={refreshIntake}
                    />
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Loading checklist…</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Documents from Caseworker (shown on status tab) ────────────────── */}
      {activeTab === "status" && (dispatchDocsLoading || dispatchDocs.length > 0) && (
        <div className="rounded-2xl border border-teal-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-teal-50 flex items-center gap-3">
            <FileText size={16} className="text-teal-600 shrink-0" />
            <div>
              <h3 className="text-sm font-black text-secondary">Documents from Your Caseworker</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">Files sent to you by your caseworker or administrator.</p>
            </div>
          </div>
          <div className="p-5">
            {dispatchDocsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {dispatchDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-xl border border-teal-100 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-secondary truncate">{doc.documentName}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                        {doc.senderName} · {new Date(doc.sentAt).toLocaleDateString("en-GB")}
                        {doc.downloadedAt ? " · Downloaded" : " · New"}
                      </p>
                      {doc.message && <p className="text-xs text-gray-500 mt-1 italic">"{doc.message}"</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadDispatched(doc)}
                      disabled={downloadingDocId === doc.id}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-black rounded-lg hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloadingDocId === doc.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <ArrowRight size={12} />
                      )}{" "}
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Timeline Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "timeline" && (
        <div className="space-y-5 max-w-3xl">
        <LicenceWorkflowTimeline applicationId={app.id} viewerRole="sponsor" />
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-black text-secondary">Application History</h3>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">Every status change, assignment, and action on this application.</p>
          </div>
          <div className="p-5">
            {timelineLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : timeline.length > 0 ? (
              timeline.map((entry, i) => {
                const meta = ACTION_META[entry.action] || { label: entry.action, tone: "bg-gray-400", section: "Event" };
                const actorName = entry.actor
                  ? [entry.actor.first_name, entry.actor.last_name].filter(Boolean).join(" ") || null
                  : null;
                const showNotes = entry.notes && ["request_info", "reject", "approve"].includes(entry.action);
                return (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center w-6 shrink-0">
                      <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${meta.tone}`} />
                      {i < timeline.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] bg-gray-200" />}
                    </div>
                    <div className="pb-5 flex-1 min-w-0">
                      <p className="text-sm font-black text-secondary">{meta.label}</p>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                        {meta.section}
                        {actorName && <> · <span className="text-gray-500">{actorName}</span></>}
                        {" · "}{formatDateTime(entry.created_at)}
                      </p>
                      {showNotes && (
                        <p className="mt-1.5 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 leading-relaxed">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Clock3 className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-400">No activity recorded yet.</p>
                <p className="text-[11px] font-bold text-gray-300 mt-1">Events will appear here as your application progresses.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ── Pending Actions Tab ──────────────────────────────────────────────── */}
      {activeTab === "actions" && (
        <div className="max-w-3xl space-y-3">
          {pendingActions.length > 0 ? (
            pendingActions.map((a, idx) => (
              <div
                key={`${a.title}-${idx}`}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${a.current ? "bg-primary" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-secondary">
                      {a.title}
                      {a.current && (
                        <span className="text-[10px] font-black text-primary border border-primary/20 bg-primary/5 rounded-full px-2 py-0.5 ml-2 uppercase">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{a.stage}</p>
                  </div>
                  <Link
                    to={a.cta.to}
                    className="shrink-0 inline-flex items-center gap-1.5 justify-center rounded-lg bg-secondary px-3 py-1.5 text-xs font-black text-white hover:bg-secondary-dark shadow-sm transition-all"
                  >
                    {a.cta.label} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
              <div className="text-center p-5">
                <CircleCheck className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                <p className="text-sm font-bold text-gray-400">No pending actions — you&apos;re all caught up!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ subtitle }) => (
  <div>
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
      <LayoutDashboard className="text-primary" size={26} />
      Licence Tracking
    </h1>
    <p className="text-primary font-bold text-sm mt-0.5">
      {subtitle || "Track your sponsor licence application through every stage."}
    </p>
  </div>
);

export default LicenceProcess;
