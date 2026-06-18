import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, Loader2, Trash2, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  createLicenceV2Draft,
  listLicenceV2Applications,
  getLicenceV2Application,
  saveLicenceV2Draft,
  submitLicenceV2Application,
  deleteLicenceV2Draft,
  syncPersonnelFromProfile,
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

  const [phase, setPhase] = useState("loading"); // loading | pick | wizard | submitted | blocked
  const [blockedStatus, setBlockedStatus] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [appId, setAppId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [personnelSyncedAt, setPersonnelSyncedAt] = useState(null);
  const submitInFlight = useRef(false);

  const BLOCKING_STATUSES = ["Pending", "Under Review", "Government Processing", "Decision Pending", "Information Requested"];

  useEffect(() => {
    let cancelled = false;
    const draftParam = searchParams.get("draft");
    if (draftParam) { loadDraft(draftParam); return; }
    listLicenceV2Applications()
      .then((r) => {
        if (cancelled) return;
        const all = r.data.data || [];
        const blocking = all.find((a) => BLOCKING_STATUSES.includes(a.status));
        if (blocking) { setBlockedStatus(blocking.status); setPhase("blocked"); return; }
        const draftsOnly = all.filter((a) => a.status === "Draft");
        if (draftsOnly.length > 0) { setDrafts(draftsOnly); setPhase("pick"); }
        else startNew();
      })
      .catch(() => { if (!cancelled) startNew(); });
    return () => { cancelled = true; };
  }, []);

  const startNew = async () => {
    setPhase("loading");
    try {
      const r = await createLicenceV2Draft();
      const app = r.data.data;
      setAppId(app.id);
      setFormData(appToFormData(app));
      setCurrentStep(app.currentStep || 1);
      setPersonnelSyncedAt(deriveSyncedAt(app));
      setPhase("wizard");
    } catch (err) {
      if (err?.response?.status === 409) {
        // Server blocked the new application (pending one already exists)
        const msg = err?.response?.data?.message || "";
        const match = msg.match(/\(([^)]+)\)/);
        setBlockedStatus(match ? match[1] : "Under Review");
        setPhase("blocked");
      } else {
        showToast({ message: "Failed to create draft application", variant: "danger" });
        navigate("/business/licence");
      }
    }
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

  const saveStep = async (patch, nextStep) => {
    setSaving(true);
    try {
      const body = { currentStep: nextStep, ...patch };
      const r = await saveLicenceV2Draft(appId, body);
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

  const handleSubmit = async (patch) => {
    if (submitInFlight.current) return;
    submitInFlight.current = true;
    setSubmitting(true); setSubmitErrors([]);
    try {
      await saveLicenceV2Draft(appId, { currentStep: 8, ...patch });
      await submitLicenceV2Application(appId);
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
              {appId && (
                <p className="text-center text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                  <FileText size={11} /> Draft #{appId} — progress saved automatically on each step
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
