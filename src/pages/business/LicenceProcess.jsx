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
import { listLicenceV2Applications, getLicenceV2Application } from "../../services/licenceV2Api";
import { getLicenceStages } from "../../services/licenceStageApi";
import {
  confirmSponsorGovCredentials,
  getSponsorIntakeSummary,
  updateSponsorIntakeForm,
  submitSponsorIntakeForm as submitIntakeFormApi,
  getMyLicenceApplications,
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
        setApp(full?.data?.data || latest);
        setStagesData(stages?.data?.data || null);
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

  // Load intake summary whenever the intake tab is active
  useEffect(() => {
    if (!app?.id || activeTab !== "intake") return;
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
  }, [app?.id, activeTab]);

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

  const timeline = useMemo(() => {
    const entries = [];
    for (const s of stages) {
      for (const t of s.tasks || []) {
        if (t.status === "completed" && t.completedAt) {
          entries.push({
            title: `${ROLE_LABEL[t.role] || t.role}: ${t.title}`,
            stage: s.title,
            time: t.completedAt,
            tone: "bg-emerald-500",
          });
        }
      }
    }
    if (app?.submittedAt) {
      entries.push({ title: "Application submitted", stage: "Submission", time: app.submittedAt, tone: "bg-secondary" });
    }
    return entries.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [stages, app?.submittedAt]);

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
      <div className="space-y-8 pb-10">
        <Header />
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <FileText className="mx-auto text-gray-300 mb-4" size={40} />
          <h2 className="text-lg font-black text-secondary">No licence application yet</h2>
          <p className="text-sm font-bold text-gray-500 mt-1 max-w-md mx-auto">
            Start your sponsor licence application to begin tracking its stages, tasks and progress here.
          </p>
          <button
            onClick={() => navigate("/business/apply-licence-v2")}
            className="mt-5 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Start application <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
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
          className="bg-red-50 border border-red-100 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl shrink-0">
              <ShieldAlert className="text-red-600" size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-secondary">Action Required — Information Requested</h3>
              <p className="text-sm font-bold text-gray-500">
                Your case team has requested additional information. Review the details in the Status tab below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTab("status")}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl transition-all text-sm shrink-0 active:scale-95"
          >
            View Request
          </button>
        </motion.div>
      )}

      {/* Intake incomplete banner (pre-government stages) */}
      {!isGovPipeline && intakeData && !intakeData?.form?.isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl shrink-0">
              <Info className="text-blue-600" size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-secondary">Intake Information Required</h3>
              <p className="text-sm font-bold text-gray-500">
                Please complete the Information Form and upload your required documents to progress your application.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTab("intake")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl transition-all text-sm shrink-0 active:scale-95"
          >
            Complete Now
          </button>
        </motion.div>
      )}

      {app.status === "Government Processing" && !isCredConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-violet-50 border border-violet-100 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-2xl shrink-0">
              <Key className="text-violet-600" size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-secondary">Government Portal — Action Pending</h3>
              <p className="text-sm font-bold text-gray-500">
                Your UKVI portal credentials are being prepared. Confirm receipt once you receive them from your caseworker.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTab("status")}
            className="bg-violet-600 hover:bg-violet-700 text-white font-black px-5 py-2.5 rounded-xl transition-all text-sm shrink-0 active:scale-95"
          >
            View Credentials
          </button>
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
        <div className="space-y-6">
          {/* Current step card */}
          {currentStage && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 border border-gray-100">
                  <ClipboardList className="text-primary" size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Step {currentStage.order} of {stages.length} · {doneCount} complete
                  </p>
                  <h2 className="text-xl font-black text-secondary tracking-tight">{currentStage.title}</h2>
                  <p className="text-sm font-bold text-gray-500 mt-0.5">{STAGE_DESC[currentStage.key]}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Government Pipeline Panel ── */}
          {isGovPipeline && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Landmark className="text-violet-500" size={18} />
                <h3 className="text-sm font-black text-secondary">Government Pipeline</h3>
                <span className={`ml-auto text-[10px] font-black px-2.5 py-1 rounded-full ${
                  app.status === "Government Processing" ? "bg-violet-200 text-violet-700" :
                  app.status === "Decision Pending"       ? "bg-orange-100 text-orange-700" :
                                                            "bg-emerald-100 text-emerald-700"
                }`}>{app.status}</span>
              </div>

              {/* ── SMS / Registration panel ── */}
              <div className="bg-white rounded-xl p-4 border border-violet-100 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sponsor Management System (SMS)</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                  <p className="text-sm font-bold text-secondary">Your organisation has been registered on the UK Visas &amp; Immigration SMS portal.</p>
                </div>
                {app.governmentRegistrationRef ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                    <span className="text-xs font-bold text-gray-500">Government Registration Reference</span>
                    <span className="text-xs font-black text-secondary tracking-wider">{app.governmentRegistrationRef}</span>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-400">
                    Your SMS registration reference will appear here once your caseworker completes the registration step.
                  </p>
                )}
              </div>

              {/* ── UKVI Portal Credentials Confirmation ── */}
              {app.status === "Government Processing" && (
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg shrink-0 mt-0.5">
                      <Key className="text-amber-500" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-secondary mb-1">UKVI Online Application Portal Credentials</p>
                      <p className="text-xs font-bold text-gray-500 mb-4 leading-relaxed">
                        Your caseworker will share UKVI portal login credentials via your registered contact details.
                        Once you receive them, confirm below — this lets your case team know you have access and can progress to the next stage.
                      </p>
                      {isCredConfirmed ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-emerald-700">
                          <CheckCircle2 size={16} className="shrink-0" />
                          <span className="text-xs font-black">Credentials receipt confirmed — thank you</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleConfirmCredentials}
                          disabled={credLoading}
                          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-amber-100 disabled:opacity-60"
                        >
                          {credLoading
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Check size={14} />}
                          Confirm Credentials Received
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── UKVI Submission details ── */}
              {app.governmentSubmissionRef && (
                <div className="bg-white rounded-xl p-4 border border-violet-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">UKVI Application Submission</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold mb-1">Submission Reference</p>
                      <p className="text-sm font-black text-secondary">{app.governmentSubmissionRef}</p>
                    </div>
                    {app.governmentSubmissionDate && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-1">Submitted On</p>
                        <p className="text-sm font-black text-secondary">{formatDate(app.governmentSubmissionDate)}</p>
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
          )}

          {/* ── Information Request Response ── */}
          {isInfoRequested && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <h3 className="text-sm font-black text-red-600">Information Requested by Your Case Team</h3>
              </div>

              {app.adminNotes && (
                <div className="bg-white rounded-xl p-4 border border-red-100">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Message from caseworker</p>
                  <p className="text-sm font-bold text-secondary leading-relaxed">{app.adminNotes}</p>
                </div>
              )}

              {app.requestedDocuments && (
                <div>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Requested documents / information</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(app.requestedDocuments)
                      ? app.requestedDocuments
                      : [app.requestedDocuments]
                    ).map((doc, i) => (
                      <span key={i} className="bg-white border border-red-200 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to="/business/licence"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-red-100"
                >
                  <Upload size={14} /> Update Application &amp; Upload Documents
                </Link>
                <Link
                  to="/business/licence-documents"
                  className="flex items-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-black px-5 py-2.5 rounded-xl text-xs transition-all"
                >
                  <FileText size={14} /> Manage Documents
                </Link>
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
        <div className="space-y-6">
          {intakeLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Readiness indicator */}
              {intakeData?.readiness && (
                <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  intakeData.readiness.isReady
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-amber-50 border-amber-100"
                }`}>
                  {intakeData.readiness.isReady
                    ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    : <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  }
                  <div>
                    <p className={`text-sm font-black ${intakeData.readiness.isReady ? "text-emerald-700" : "text-amber-700"}`}>
                      {intakeData.readiness.isReady
                        ? "Intake complete — your case team can proceed to Government Registration."
                        : "Intake not yet complete"}
                    </p>
                    {!intakeData.readiness.isReady && intakeData.readiness.reasons?.map((r, i) => (
                      <p key={i} className="text-xs text-amber-600 mt-1">• {r}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Form */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-secondary">Sponsor Information Form</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Complete all 12 fields before submitting</p>
                  </div>
                  {intakeData?.form?.isComplete && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Submitted</span>
                  )}
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                      <input
                        type={type}
                        value={intakeForm[key] || ""}
                        onChange={(e) => setIntakeForm((f) => ({ ...f, [key]: e.target.value }))}
                        disabled={intakeData?.form?.isComplete}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                  ))}

                  {/* Premises Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Premises Address</label>
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
                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Job Titles */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Job Titles Required <span className="text-gray-400">(comma-separated)</span>
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
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                </div>

                {!intakeData?.form?.isComplete && (
                  <div className="px-5 pb-5 flex gap-3 flex-wrap">
                    <button
                      onClick={handleIntakeSave}
                      disabled={intakeSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Save size={14} />
                      {intakeSaving ? "Saving…" : "Save Draft"}
                    </button>
                    <button
                      onClick={handleIntakeSubmit}
                      disabled={intakeSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 disabled:opacity-50"
                    >
                      <Check size={14} />
                      {intakeSaving ? "Submitting…" : "Submit Form"}
                    </button>
                  </div>
                )}
              </div>

              {/* Document Checklist */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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

      {/* ── Timeline Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "timeline" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm max-w-3xl">
          {timeline.length > 0 ? (
            timeline.map((e, i) => (
              <div key={`${e.title}-${e.time}-${i}`} className="flex gap-4">
                <div className="flex flex-col items-center w-6 shrink-0">
                  <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${e.tone}`} />
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] bg-gray-200" />}
                </div>
                <div className="pb-6 flex-1 min-w-0">
                  <p className="text-sm font-black text-secondary">{e.title}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                    {e.stage} · {formatDateTime(e.time)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Clock3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-400">No activity yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Pending Actions Tab ──────────────────────────────────────────────── */}
      {activeTab === "actions" && (
        <div className="max-w-3xl space-y-3">
          {pendingActions.length > 0 ? (
            pendingActions.map((a, idx) => (
              <div
                key={`${a.title}-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm"
              >
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
                  className="shrink-0 inline-flex items-center gap-1.5 justify-center rounded-lg bg-secondary px-4 py-2.5 text-xs font-black text-white hover:bg-secondary-dark shadow-md shadow-secondary/20 transition-all"
                >
                  {a.cta.label} <ArrowRight size={14} />
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <CircleCheck className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-gray-400">No pending actions — you&apos;re all caught up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ subtitle }) => (
  <div>
    <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
      <LayoutDashboard className="text-primary" size={30} />
      Licence Tracking
    </h1>
    <p className="text-gray-500 font-bold text-sm mt-1">
      {subtitle || "Track your sponsor licence application through every stage."}
    </p>
  </div>
);

export default LicenceProcess;
