import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, Loader2, Trash2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  createLicenceV2Draft,
  listLicenceV2Applications,
  getLicenceV2Application,
  saveLicenceV2Draft,
  submitLicenceV2Application,
  deleteLicenceV2Draft,
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
  level1Users: [], declarations: {}, fee: {},
};

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
    declarations: app.declaration || {},
    fee: app.fee || {},
  };
}

function DraftPicker({ drafts, onResume, onNew, onDelete, deleting }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Resume or Start New</h2>
        <p className="text-sm font-bold text-gray-400">You have saved drafts. Continue where you left off, or start a fresh application.</p>
      </div>
      <div className="space-y-3">
        {drafts.map((d) => (
          <div key={d.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 gap-4">
            <div>
              <p className="text-sm font-black text-secondary">Draft #{d.id} — {d.companyName || "Untitled"}</p>
              <p className="text-xs font-bold text-gray-400">
                Step {d.currentStep || 1} of 8 · Updated {new Date(d.updatedAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onDelete(d.id)} disabled={deleting === d.id} className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                {deleting === d.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
              <button onClick={() => onResume(d.id)} className="bg-primary/10 text-primary font-black text-xs px-4 py-2 rounded-xl hover:bg-primary/20 transition-all">
                Resume
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNew} className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-black text-gray-400 hover:border-primary/30 hover:text-primary transition-all">
        + Start New Application
      </button>
    </div>
  );
}

function SubmitSuccess({ navigate }) {
  return (
    <div className="text-center py-16 space-y-6">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <ShieldCheck size={36} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-secondary mb-2">Application Submitted!</h2>
        <p className="text-sm font-bold text-gray-500 max-w-md mx-auto">
          Your sponsor licence application has been received. Our team will review it and be in touch. Track progress from your Licence Status page.
        </p>
      </div>
      <button onClick={() => navigate("/business/licence")} className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
        View Licence Status
      </button>
    </div>
  );
}

export default function ApplyLicenceV2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [phase, setPhase] = useState("loading"); // loading | pick | wizard | submitted
  const [drafts, setDrafts] = useState([]);
  const [appId, setAppId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const draftParam = searchParams.get("draft");
    if (draftParam) { loadDraft(draftParam); return; }
    listLicenceV2Applications()
      .then((r) => {
        const existing = (r.data.data || []).filter((a) => a.status === "Draft");
        if (existing.length > 0) { setDrafts(existing); setPhase("pick"); }
        else startNew();
      })
      .catch(() => startNew());
  }, []);

  const startNew = async () => {
    setPhase("loading");
    try {
      const r = await createLicenceV2Draft();
      const app = r.data.data;
      setAppId(app.id); setFormData(appToFormData(app)); setCurrentStep(app.currentStep || 1); setPhase("wizard");
    } catch {
      showToast({ message: "Failed to create draft application", variant: "danger" });
      navigate("/business/licence");
    }
  };

  const loadDraft = async (id) => {
    setPhase("loading");
    try {
      const r = await getLicenceV2Application(id);
      const app = r.data.data;
      if (app.status === "Pending" || app.status === "Approved") { setPhase("submitted"); return; }
      setAppId(app.id); setFormData(appToFormData(app)); setCurrentStep(app.currentStep || 1); setPhase("wizard");
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
  const handleBack = () => { setCurrentStep((s) => Math.max(1, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = async (patch) => {
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

  const stepProps = { data: formData, onChange: merge, onNext: handleNext, onBack: handleBack, saving };

  return (
    <div className="space-y-6 pb-10 relative max-w-3xl mx-auto">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={24} className="text-primary" />
          <h1 className="text-2xl font-black text-secondary">Sponsor Licence Application</h1>
        </div>
        <p className="text-sm font-bold text-gray-400 pl-9">
          {phase === "pick" ? "Continue a saved draft or start fresh." : `Step ${currentStep} of 8`}
        </p>
      </motion.div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
        {phase === "pick" ? (
          <DraftPicker drafts={drafts} onResume={loadDraft} onNew={startNew} onDelete={handleDeleteDraft} deleting={deleting} />
        ) : (
          <>
            <WizardStepBar current={currentStep} />
            <div className="pt-2">
              {currentStep === 1 && <Step1Routes {...stepProps} />}
              {currentStep === 2 && <Step2Organisation {...stepProps} />}
              {currentStep === 3 && <Step3CosRequirements {...stepProps} />}
              {currentStep === 4 && (
                <Step4AppendixDocuments appId={appId} data={formData} onRefresh={refreshAppendix} onNext={handleNext} onBack={handleBack} saving={saving} />
              )}
              {currentStep === 5 && <Step5AuthorisingOfficer {...stepProps} />}
              {currentStep === 6 && <Step6KeyContact {...stepProps} />}
              {currentStep === 7 && <Step7Level1Users {...stepProps} />}
              {currentStep === 8 && (
                <Step8Declarations data={formData} onChange={merge} onBack={handleBack} onSubmit={handleSubmit} submitting={submitting} submitErrors={submitErrors} />
              )}
            </div>
            {appId && (
              <p className="text-center text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <FileText size={12} /> Draft #{appId} — progress saved automatically on each step
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
