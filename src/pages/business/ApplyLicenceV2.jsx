import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, Loader2, Trash2, Clock, Save, Ban, Timer, Calendar } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  createLicenceV2Draft,
  listLicenceV2Applications,
  getLicenceV2Application,
  saveLicenceV2Draft,
  submitLicenceV2Application,
  deleteLicenceV2Draft,
  syncPersonnelFromProfile,
  getMyLicenceApplications,
} from "../../services/licenceApi";
import WizardStepBar from "../../components/licenceV2/WizardStepBar";
import Step1Routes from "../../components/licenceV2/Step1Routes";
import Step2Organisation from "../../components/licenceV2/Step2Organisation";
import Step3CosRequirements from "../../components/licenceV2/Step3CosRequirements";
import Step4AppendixDocuments from "../../components/licenceV2/Step4AppendixDocuments";
import Step5AuthorisingOfficer from "../../components/licenceV2/Step5AuthorisingOfficer";
import Step6KeyContact from "../../components/licenceV2/Step6KeyContact";
import Step7Level1Users from "../../components/licenceV2/Step7Level1Users";
import Step8Declarations from "../../components/licenceV2/Step8Declarations";

const EMPTY = {
  routes: [], sponsorSize: "", organisationInfo: {}, cosRequirements: [],
  appendixDocuments: [], authorisingOfficer: {}, keyContact: {},
  level1Users: [], declaration: {}, fee: {},
};

/**
 * Most recent "imported from Business Profile" timestamp across the synced
 * records (Company, Authorising Officer, Key Contact, Level 1 Users). Sourced
 * from the DB so it is accurate across devices/sessions (replaces localStorage).
 */
function deriveSyncedAt(app) {
  if (!app) return null;
  const stamps = [
    app.authorisingOfficer?.lastSyncedAt,
    app.keyContact?.lastSyncedAt,
    app.organisationInfo?.lastSyncedAt,
    ...(app.level1Users || []).map((u) => u?.lastSyncedAt),
  ].filter(Boolean);
  if (!stamps.length) return null;
  return stamps.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
}

function appToFormData(app) {
  if (!app) return { ...EMPTY };
  return {
    routes: app.routes || [],
    sponsorSize: app.fee?.sponsorSize || "",
    organisationInfo: app.organisationInfo || {},
    cosRequirements: app.cosRequirements || [],
    appendixDocuments: app.appendixDocuments || [],
    authorisingOfficer: app.authorisingOfficer || {},
    keyContact: app.keyContact || {},
    level1Users: app.level1Users || [],
    declaration: app.declaration || {},
    fee: app.fee || {},
  };
}

function DraftPicker({ drafts, onResume, onNew, onDelete, deleting }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-black text-secondary mb-0.5">Resume or Start New</h2>
        <p className="text-xs font-bold text-gray-400">You have saved drafts. Continue where you left off, or start a fresh application.</p>
      </div>
      <div className="space-y-3">
        {drafts.map((d) => (
          <div key={d.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 gap-3">
            <div>
              <p className="text-sm font-black text-secondary">Draft #{d.id} — {d.companyName || "Untitled"}</p>
              <p className="text-xs font-bold text-gray-400">
                Step {d.currentStep || 1} of 8 · Updated {new Date(d.updatedAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onDelete(d.id)} disabled={deleting === d.id} className="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                {deleting === d.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
              <button onClick={() => onResume(d.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary font-black text-xs px-3 py-1.5 hover:bg-primary/20 transition-all">
                Resume
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNew} className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3 text-xs font-black text-gray-400 hover:border-primary/30 hover:text-primary transition-all">
        + Start New Application
      </button>
    </div>
  );
}

function ApplicationBlocked({ status, navigate }) {
  return (
    <div className="text-center py-10 space-y-4">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
        <Clock size={26} className="text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-secondary mb-1">Application Already Submitted</h2>
        <p className="text-sm font-bold text-gray-500 max-w-md mx-auto">
          You already have an application currently <span className="text-amber-600 font-black">{status}</span>. You can only submit a new application once your current one has been approved.
        </p>
      </div>
      <button
        onClick={() => navigate("/business/licence")}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white hover:bg-primary-dark transition shadow-sm"
      >
        View Current Application
      </button>
    </div>
  );
}

function CooldownBlocked({ cooldown, navigate }) {
  return (
    <div className="py-8 space-y-6">
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 overflow-hidden relative">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Ban size={28} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-red-700 mb-1">Reapplication Locked</h2>
            <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto">
              Your previous licence application was rejected. Under Home Office guidelines, you must wait <span className="font-black text-red-700">6 months</span> before reapplying.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-xl px-4 py-3">
              <Timer size={16} className="text-red-600" />
              <div className="text-left">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">Days Remaining</p>
                <p className="text-2xl font-black text-red-700 leading-none mt-0.5">
                  {cooldown.daysRemaining}
                  <span className="text-xs font-bold ml-1">day{cooldown.daysRemaining !== 1 ? "s" : ""}</span>
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-red-100 rounded-xl px-4 py-3">
              <Calendar size={16} className="text-red-500" />
              <div className="text-left">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">Available From</p>
                <p className="text-sm font-black text-red-700 mt-0.5">{cooldown.cooldownDate}</p>
              </div>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 max-w-xs mx-auto">
            The "New Licence Application" button will automatically unlock once the 6-month restriction period has passed.
          </p>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={() => navigate("/business/licence")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-black text-white hover:bg-secondary-dark transition shadow-sm"
        >
          Back to Licence Status
        </button>
      </div>
    </div>
  );
}

function SubmitSuccess({ navigate }) {
  return (
    <div className="text-center py-10 space-y-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <ShieldCheck size={26} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-secondary mb-1">Application Submitted!</h2>
        <p className="text-sm font-bold text-gray-500 max-w-md mx-auto">
          Your sponsor licence application has been received. Our team will review it and be in touch. Track progress from your Licence Status page.
        </p>
      </div>
      <button onClick={() => navigate("/business/licence")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-black text-white hover:bg-primary-dark transition shadow-sm">
        View Licence Status
      </button>
    </div>
  );
}

export default function ApplyLicenceV2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [phase, setPhase] = useState("loading"); // loading | pick | wizard | submitted | blocked | cooldown
  const [blockedStatus, setBlockedStatus] = useState(null);
  const [cooldownInfo, setCooldownInfo] = useState(null); // { daysRemaining, cooldownDate }
  const [drafts, setDrafts] = useState([]);
  const [appId, setAppId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [personnelSyncedAt, setPersonnelSyncedAt] = useState(null);
  const submitInFlight = useRef(false);
  // Track whether this was a brand-new draft (created by startNew) vs a resumed one
  const draftIsNew = useRef(false);
  // Track whether the sponsor explicitly committed this draft (Save Draft / Submit).
  // Per-step "Save & Continue", profile-sync and document uploads write to the working
  // row but do NOT count — a brand-new draft is discarded on exit unless it was
  // explicitly saved or submitted.
  const explicitlySaved = useRef(false);
  const appIdRef = useRef(null);
  const phaseRef = useRef("loading");

  const BLOCKING_STATUSES = ["Pending", "Under Review", "Government Processing", "Decision Pending", "Information Requested"];

  useEffect(() => {
    let cancelled = false;
    const draftParam = searchParams.get("draft");
    if (draftParam) { loadDraft(draftParam); return; }
    getMyLicenceApplications()
      .then((r) => {
        if (cancelled) return;
        const all = r.data.data || [];
        const blocking = all.find((a) => BLOCKING_STATUSES.includes(a.status));
        if (blocking) { setBlockedStatus(blocking.status); setPhase("blocked"); return; }
        // Check for active rejection cooldown before allowing new draft creation.
        // Catches ALL rejected apps — falls back to updatedAt + 6 months when
        // rejectionCooldownUntil is not set (e.g. V1 rejections).
        const now = new Date();
        const rejectedWithCooldown = all
          .filter((a) => {
            const s = (a.status || "").toLowerCase();
            return s === "rejected" || s === "licence rejected";
          })
          .map((a) => {
            const rawCooldown = a.rejectionCooldownUntil || a.rejection_cooldown_until;
            const cooldownDate = rawCooldown
              ? new Date(rawCooldown)
              : (() => {
                  const d = new Date(a.updatedAt || a.updated_at || a.createdAt || a.created_at || now);
                  d.setMonth(d.getMonth() + 6);
                  return d;
                })();
            return { ...a, cooldownDate };
          })
          .filter((a) => a.cooldownDate > now)
          .sort((a, b) => b.cooldownDate - a.cooldownDate);
        if (rejectedWithCooldown.length > 0) {
          const top = rejectedWithCooldown[0];
          const msRemaining = top.cooldownDate - now;
          const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
          const cooldownDate = top.cooldownDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          setCooldownInfo({ daysRemaining, cooldownDate });
          setPhase("cooldown");
          return;
        }
        // Only allow V2 drafts in the picker (V1 drafts cannot be resumed in the V2 wizard)
        const draftsOnly = all.filter((a) => a.status === "Draft" && Number(a.applicationVersion || a.application_version || 1) === 2);
        if (draftsOnly.length > 0) { setDrafts(draftsOnly); setPhase("pick"); }
        else startNew();
      })
      .catch(() => { if (!cancelled) startNew(); });
    return () => { cancelled = true; };
  }, []);

  // Keep refs in sync for use in the unmount cleanup
  useEffect(() => { appIdRef.current = appId; }, [appId]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // No discard-on-exit cleanup needed: the DB row is only created on the
  // first explicit save (Save & Continue / Save Draft), so there is nothing
  // to delete if the user leaves without saving.


  // Open the wizard with empty local state only — no DB row is created here.
  // Insertion happens lazily via ensureDraftCreated() on the first save.
  const startNew = () => {
    draftIsNew.current = true;
    explicitlySaved.current = false;
    setAppId(null);
    setFormData({ ...EMPTY });
    setCurrentStep(1);
    setPersonnelSyncedAt(null);
    setPhase("wizard");
  };

  const loadDraft = async (id) => {
    setPhase("loading");
    try {
      const r = await getLicenceV2Application(id);
      const app = r.data.data;
      if (app.status === "Pending" || app.status === "Approved") { setPhase("submitted"); return; }
      setAppId(app.id);
      setFormData(appToFormData(app));
      setCurrentStep(app.currentStep || 1);
      setPersonnelSyncedAt(deriveSyncedAt(app));
      setPhase("wizard");
    } catch {
      showToast({ message: "Failed to load draft", variant: "danger" });
      navigate("/business/licence");
    }
  };

  const handleDeleteDraft = async (id) => {
    setDeleting(id);
    try {
      await deleteLicenceV2Draft(id);
      const remaining = drafts.filter((d) => d.id !== id);
      setDrafts(remaining);
      showToast({ message: "Draft deleted", variant: "success" });
      if (remaining.length === 0) startNew();
    } catch {
      showToast({ message: "Failed to delete draft", variant: "danger" });
    } finally {
      setDeleting(null);
    }
  };

  const merge = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSyncFromProfile = async () => {
    if (!appId || syncing) return;
    setSyncing(true);
    try {
      const r = await syncPersonnelFromProfile(appId);
      const app = r.data.data;
      setFormData(appToFormData(app));
      // Use the server-recorded sync time (lastSyncedAt) so it matches the DB.
      setPersonnelSyncedAt(deriveSyncedAt(app) || new Date().toISOString());
      showToast({ message: r.data.message || "Imported from Business Profile", variant: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Sync failed — check your Business Profile is complete", variant: "danger" });
    } finally {
      setSyncing(false);
    }
  };

  const refreshAppendix = async () => {
    if (!appId) return;
    try {
      const r = await getLicenceV2Application(appId);
      const app = r.data.data;
      setFormData((prev) => ({ ...prev, appendixDocuments: app.appendixDocuments || [], fee: app.fee || prev.fee }));
    } catch { /* silent */ }
  };

  // Lazily create the DB draft row on the first save action.
  // Subsequent calls return the existing appId immediately.
  const ensureDraftCreated = async () => {
    if (appId) return appId;
    const r = await createLicenceV2Draft();
    const app = r.data.data;
    setAppId(app.id);
    appIdRef.current = app.id;
    setPersonnelSyncedAt(deriveSyncedAt(app));
    return app.id;
  };

  const saveStep = async (patch, nextStep) => {
    setSaving(true);
    try {
      const id = await ensureDraftCreated();
      const body = { currentStep: nextStep, ...patch };
      const r = await saveLicenceV2Draft(id, body);
      const app = r.data.data;
      setFormData(appToFormData(app));
      setCurrentStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to save progress", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = (patch) => saveStep(patch, currentStep + 1);

  // BUG-092: persist the current step's data when navigating backwards. Previously
  // handleBack only changed the step, so edits made on the current step were lost
  // if the user went Back (and gone entirely if the browser was then closed). Save
  // the draft-schema slice of the live formData before moving to the previous step.
  const handleBack = () => {
    if (currentStep <= 1) return;
    // If no draft exists yet, just step back in local state — nothing to save.
    if (!appId) { setCurrentStep(currentStep - 1); return; }
    const patch = {
      routes: formData.routes,
      sponsorSize: formData.sponsorSize || undefined,
      organisationInfo: formData.organisationInfo,
      cosRequirements: formData.cosRequirements,
      authorisingOfficer: formData.authorisingOfficer,
      keyContact: formData.keyContact,
      level1Users: formData.level1Users,
      declaration: formData.declaration,
    };
    saveStep(patch, currentStep - 1);
  };

  // Explicit, sponsor-initiated save. Lazily creates the DB row if it doesn't
  // exist yet (e.g. sponsor clicks Save Draft before Save & Continue on Step 1).
  const handleSaveDraft = async () => {
    if (savingDraft) return;
    const patch = {
      routes: formData.routes,
      sponsorSize: formData.sponsorSize || undefined,
      organisationInfo: formData.organisationInfo,
      cosRequirements: formData.cosRequirements,
      authorisingOfficer: formData.authorisingOfficer,
      keyContact: formData.keyContact,
      level1Users: formData.level1Users,
      declaration: formData.declaration,
    };
    setSavingDraft(true);
    try {
      const id = await ensureDraftCreated();
      const r = await saveLicenceV2Draft(id, { currentStep, ...patch });
      setFormData(appToFormData(r.data.data));
      explicitlySaved.current = true;
      showToast({ message: "Draft saved — you can safely leave and resume later.", variant: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to save draft", variant: "danger" });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (patch) => {
    if (submitInFlight.current) return;
    explicitlySaved.current = true;
    submitInFlight.current = true;
    setSubmitting(true); setSubmitErrors([]);
    try {
      const id = await ensureDraftCreated();
      await saveLicenceV2Draft(id, { currentStep: 8, ...patch });
      await submitLicenceV2Application(id);
      setPhase("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors?.length) {
        setSubmitErrors(data.errors);
        showToast({ message: "Application incomplete — see errors below", variant: "danger" });
      } else {
        showToast({ message: data?.message || "Submission failed", variant: "danger" });
      }
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-primary mx-auto" />
          <p className="text-sm font-bold text-gray-400">Setting up your application…</p>
        </div>
      </div>
    );
  }

  if (phase === "submitted") return <SubmitSuccess navigate={navigate} />;
  if (phase === "blocked") return <ApplicationBlocked status={blockedStatus} navigate={navigate} />;
  if (phase === "cooldown") return <CooldownBlocked cooldown={cooldownInfo} navigate={navigate} />;

  const stepProps = { data: formData, onChange: merge, onNext: handleNext, onBack: handleBack, saving };
  const personnelProps = { onSyncFromProfile: handleSyncFromProfile, syncing, personnelSyncedAt };

  return (
    <div className="space-y-5 pb-6 relative max-w-3xl mx-auto">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2.5 mb-0.5">
          <ShieldCheck size={26} className="text-primary" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">Sponsor Licence Application</h1>
        </div>
        <p className="text-primary font-bold text-sm mt-0.5 pl-9">
          {phase === "pick" ? "Continue a saved draft or start fresh." : `Step ${currentStep} of 8`}
        </p>
      </motion.div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5 space-y-4">
          {phase === "pick" ? (
            <DraftPicker drafts={drafts} onResume={loadDraft} onNew={startNew} onDelete={handleDeleteDraft} deleting={deleting} />
          ) : (
            <>
              <WizardStepBar current={currentStep} />
              <div className="pt-1">
                {currentStep === 1 && <Step1Routes {...stepProps} />}
                {currentStep === 2 && <Step2Organisation {...stepProps} {...personnelProps} />}
                {currentStep === 3 && <Step3CosRequirements {...stepProps} />}
                {currentStep === 4 && (
                  <Step4AppendixDocuments appId={appId} data={formData} onRefresh={refreshAppendix} onNext={handleNext} onBack={handleBack} saving={saving} />
                )}
                {currentStep === 5 && <Step5AuthorisingOfficer {...stepProps} {...personnelProps} />}
                {currentStep === 6 && <Step6KeyContact {...stepProps} {...personnelProps} />}
                {currentStep === 7 && <Step7Level1Users {...stepProps} {...personnelProps} />}
                {currentStep === 8 && (
                  <Step8Declarations data={formData} onChange={merge} onBack={handleBack} onSubmit={handleSubmit} submitting={submitting} submitErrors={submitErrors} />
                )}
              </div>
              <div className="flex flex-col items-center gap-2 pt-1 border-t border-gray-100">
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft || saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/5 text-secondary font-black text-xs px-4 py-2 hover:bg-secondary/10 active:scale-95 transition-all disabled:opacity-40"
                >
                  {savingDraft ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Draft
                </button>
                <p className="text-center text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                  <FileText size={11} />
                  {appId
                    ? `Draft #${appId} — your progress is only kept if you Save Draft or Submit`
                    : "Your progress is only saved when you click Save & Continue or Save Draft"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
