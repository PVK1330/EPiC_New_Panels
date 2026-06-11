import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Building2, Briefcase, ClipboardCheck, UserCheck, Phone, Users, FileSignature,
  CheckCircle2, ChevronLeft, ChevronRight, Loader2, Save, Plus, Trash2, Upload, AlertTriangle,
} from "lucide-react";
import Input from "../../components/Input";
import { useToast } from "../../context/ToastContext";
import {
  createLicenceDraft, getLicenceV2Application, saveLicenceV2Draft,
  submitLicenceV2Application, previewLicenceV2Fee, uploadAppendixDocument,
} from "../../services/licenceV2Api";

const ROUTE_OPTIONS = [
  { code: "SkilledWorker", label: "Skilled Worker" },
  { code: "Student", label: "Student" },
  { code: "ScaleUp", label: "Scale-up" },
  { code: "GBM", label: "Global Business Mobility (GBM)" },
  { code: "GAE", label: "Government Authorised Exchange (GAE)" },
];

const STEPS = [
  { id: 1, title: "Licence Routes", icon: Layers },
  { id: 2, title: "Organisation", icon: Building2 },
  { id: 3, title: "CoS Requirements", icon: Briefcase },
  { id: 4, title: "Appendix A", icon: ClipboardCheck },
  { id: 5, title: "Authorising Officer", icon: UserCheck },
  { id: 6, title: "Key Contact", icon: Phone },
  { id: 7, title: "Level 1 Users", icon: Users },
  { id: 8, title: "Declarations & Fee", icon: FileSignature },
];

const EMPTY = {
  sponsorSize: "large",
  routes: [],
  organisationInfo: {
    organisationType: "", companiesHouseNumber: "", payeReference: "", accountsOfficeReference: "",
    vatNumber: "", charityStatus: false, charityNumber: "", tradingStartDate: "",
    sicCodes: [], regions: [], accreditations: [], previousTradingNames: [],
  },
  cosRequirements: [],
  authorisingOfficer: {
    title: "", firstName: "", lastName: "", dob: "", nationality: "", niNumber: "",
    immigrationStatus: "", hasConvictions: false, convictionsDetails: "", email: "", phone: "",
  },
  keyContact: { sameAsAuthorisingOfficer: false, title: "", firstName: "", lastName: "", email: "", phone: "", jobTitle: "" },
  level1Users: [],
  declarations: { accuracyConfirmed: false, dutiesUnderstood: false, dataConsent: false, signatoryName: "", signatoryRole: "", signedDate: "" },
};

const emptyCos = () => ({ socCode: "", roleTitle: "", salary: "", candidateName: "", candidateNationality: "", candidateDob: "", candidateEmail: "", sponsorshipDurationMonths: "" });
const emptyL1 = () => ({ firstName: "", lastName: "", email: "", phone: "", jobTitle: "", isAuthorisingOfficer: false });

const mergeSection = (base, server) => ({ ...base, ...Object.fromEntries(Object.entries(server || {}).filter(([, v]) => v !== null && v !== undefined)) });

function mapServerToForm(d) {
  if (!d) return { ...EMPTY };
  return {
    sponsorSize: d.fee?.sponsorSize || "large",
    routes: d.routes || [],
    organisationInfo: mergeSection(EMPTY.organisationInfo, d.organisationInfo),
    cosRequirements: (d.cosRequirements || []).map((c) => ({ ...emptyCos(), ...c })),
    authorisingOfficer: mergeSection(EMPTY.authorisingOfficer, d.authorisingOfficer),
    keyContact: mergeSection(EMPTY.keyContact, d.keyContact),
    level1Users: (d.level1Users || []).map((u) => ({ ...emptyL1(), ...u })),
    declarations: mergeSection(EMPTY.declarations, d.declaration),
  };
}

const toList = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);

export default function ApplyLicenceV2() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [draftId, setDraftId] = useState(routeId || null);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [appendixDocs, setAppendixDocs] = useState([]);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);

  // Bootstrap: resume an existing draft, otherwise create a fresh one.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        let data;
        if (routeId) {
          const res = await getLicenceV2Application(routeId);
          data = res.data.data;
          if (active) setDraftId(routeId);
        } else {
          const res = await createLicenceDraft();
          data = res.data.data;
          if (active) setDraftId(data.id);
        }
        if (!active) return;
        setForm(mapServerToForm(data));
        setAppendixDocs(data.appendixDocuments || []);
        setCurrentStep(Math.min(Math.max(data.currentStep || 1, 1), 8));
      } catch {
        showToast({ message: "Could not start the application. Please try again.", variant: "danger" });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  // --- form helpers -------------------------------------------------------
  const setField = (section, key, value) => setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
  const toggleRoute = (code) =>
    setForm((f) => ({ ...f, routes: f.routes.includes(code) ? f.routes.filter((r) => r !== code) : [...f.routes, code] }));
  const updateRow = (section, idx, key, value) =>
    setForm((f) => ({ ...f, [section]: f[section].map((row, i) => (i === idx ? { ...row, [key]: value } : row)) }));
  const addRow = (section, factory) => setForm((f) => ({ ...f, [section]: [...f[section], factory()] }));
  const removeRow = (section, idx) => setForm((f) => ({ ...f, [section]: f[section].filter((_, i) => i !== idx) }));

  const buildPayload = (step) => ({
    currentStep: step,
    sponsorSize: form.sponsorSize,
    routes: form.routes,
    organisationInfo: {
      ...form.organisationInfo,
      sicCodes: form.organisationInfo.sicCodes,
      regions: form.organisationInfo.regions,
      accreditations: form.organisationInfo.accreditations,
      previousTradingNames: form.organisationInfo.previousTradingNames,
    },
    cosRequirements: form.cosRequirements,
    authorisingOfficer: form.authorisingOfficer,
    keyContact: form.keyContact,
    level1Users: form.level1Users,
    declarations: form.declarations,
  });

  const persist = async (step = currentStep, { silent = false } = {}) => {
    if (!draftId) return null;
    try {
      setSaving(true);
      const res = await saveLicenceV2Draft(draftId, buildPayload(step));
      const data = res.data.data;
      setAppendixDocs(data.appendixDocuments || []);
      if (!silent) showToast({ message: "Draft saved", variant: "success" });
      return data;
    } catch {
      showToast({ message: "Failed to save draft", variant: "danger" });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const goTo = async (step) => {
    await persist(step, { silent: true });
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };
  const next = () => goTo(Math.min(currentStep + 1, 8));
  const back = () => goTo(Math.max(currentStep - 1, 1));

  const saveAndExit = async () => {
    await persist(currentStep);
    navigate("/business/licence");
  };

  const refreshFee = async () => {
    try {
      const res = await previewLicenceV2Fee({
        routes: form.routes,
        sponsorSize: form.sponsorSize,
        charityStatus: !!form.organisationInfo.charityStatus,
        cosRequirements: form.cosRequirements.map((c) => ({ sponsorshipDurationMonths: Number(c.sponsorshipDurationMonths) || 0 })),
      });
      setFee(res.data.data);
    } catch { /* preview is best-effort */ }
  };

  useEffect(() => {
    if (currentStep === 8 && draftId) refreshFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, draftId]);

  const onUploadAppendix = async (docId, file) => {
    if (!file) return;
    try {
      const res = await uploadAppendixDocument(draftId, docId, file);
      const updated = res.data.data;
      setAppendixDocs((docs) => docs.map((d) => (d.id === updated.id ? updated : d)));
      showToast({ message: "Document uploaded", variant: "success" });
    } catch {
      showToast({ message: "Upload failed", variant: "danger" });
    }
  };

  const submit = async () => {
    await persist(8, { silent: true });
    setSubmitErrors([]);
    try {
      setSaving(true);
      await submitLicenceV2Application(draftId);
      showToast({ message: "Licence application submitted!", variant: "success" });
      navigate("/business/licence");
    } catch (err) {
      const errors = err?.response?.data?.errors || [];
      if (errors.length) {
        setSubmitErrors(errors);
        showToast({ message: "Please complete the highlighted items before submitting.", variant: "danger" });
      } else {
        showToast({ message: "Submission failed. Please try again.", variant: "danger" });
      }
    } finally {
      setSaving(false);
    }
  };

  const moneyFmt = useMemo(
    () => new Intl.NumberFormat("en-GB", { style: "currency", currency: fee?.currency || "GBP", maximumFractionDigits: 0 }),
    [fee]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-secondary">Sponsor Licence Application</h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          Complete all 8 steps. Your progress is saved as a draft automatically.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Stepper */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Progress</h3>
            <div className="space-y-5">
              {STEPS.map((step, index) => (
                <button key={step.id} onClick={() => goTo(step.id)} className="flex items-start gap-3 group w-full text-left">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${
                      currentStep === step.id ? "bg-primary text-white border-primary"
                        : currentStep > step.id ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-300 border-gray-100"}`}>
                      {currentStep > step.id ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                    </div>
                    {index < STEPS.length - 1 && <div className={`w-0.5 h-8 mt-1 ${currentStep > step.id ? "bg-emerald-500" : "bg-gray-100"}`} />}
                  </div>
                  <p className={`text-xs font-black pt-1.5 ${currentStep === step.id ? "text-secondary" : "text-gray-400"}`}>{step.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[460px]">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {submitErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="flex items-center gap-2 text-sm font-black text-red-700 mb-2"><AlertTriangle size={16} /> Application incomplete</p>
              <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                {submitErrors.map((e, i) => <li key={i}>{e.message}</li>)}
              </ul>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between">
            <button onClick={back} disabled={currentStep === 1 || saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3">
              <button onClick={saveAndExit} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-primary border border-primary/30 hover:bg-primary/5 disabled:opacity-40">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save &amp; Exit
              </button>
              {currentStep < 8 ? (
                <button onClick={next} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-40">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={submit} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- step renderers -----------------------------------------------------
  function StepHeading({ n, title, subtitle }) {
    return (
      <div className="mb-6">
        <p className="text-[11px] font-black text-primary uppercase tracking-widest">Step {n} of 8</p>
        <h2 className="text-xl font-black text-secondary">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
      </div>
    );
  }

  function renderStep() {
    const org = form.organisationInfo;
    const ao = form.authorisingOfficer;
    const kc = form.keyContact;
    const dec = form.declarations;

    switch (currentStep) {
      case 1:
        return (
          <div>
            <StepHeading n={1} title="Licence Routes" subtitle="Select every route you want to be licensed for." />
            <div className="grid sm:grid-cols-2 gap-3">
              {ROUTE_OPTIONS.map((r) => {
                const active = form.routes.includes(r.code);
                return (
                  <button key={r.code} onClick={() => toggleRoute(r.code)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <span className="text-sm font-bold text-secondary">{r.label}</span>
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${active ? "bg-primary border-primary" : "border-gray-300"}`}>
                      {active && <CheckCircle2 size={14} className="text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <StepHeading n={2} title="Organisation Information" subtitle="Details of the sponsoring organisation." />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Organisation type" name="organisationType" value={org.organisationType} onChange={(e) => setField("organisationInfo", "organisationType", e.target.value)} options={[{ value: "", label: "Select…" }, ...["Limited company", "PLC", "Charity", "Partnership", "Sole trader", "Public body", "Other"].map((v) => ({ value: v, label: v }))]} required />
              <Input label="Sponsor size (for fee)" name="sponsorSize" value={form.sponsorSize} onChange={(e) => setForm((f) => ({ ...f, sponsorSize: e.target.value }))} options={[{ value: "large", label: "Medium or large" }, { value: "small", label: "Small or charity" }]} />
              <Input label="Companies House number" name="companiesHouseNumber" value={org.companiesHouseNumber} onChange={(e) => setField("organisationInfo", "companiesHouseNumber", e.target.value)} required />
              <Input label="PAYE reference" name="payeReference" value={org.payeReference} onChange={(e) => setField("organisationInfo", "payeReference", e.target.value)} />
              <Input label="Accounts Office reference" name="accountsOfficeReference" value={org.accountsOfficeReference} onChange={(e) => setField("organisationInfo", "accountsOfficeReference", e.target.value)} />
              <Input label="VAT number" name="vatNumber" value={org.vatNumber} onChange={(e) => setField("organisationInfo", "vatNumber", e.target.value)} />
              <Input label="Trading start date" name="tradingStartDate" type="date" value={org.tradingStartDate || ""} onChange={(e) => setField("organisationInfo", "tradingStartDate", e.target.value)} required />
              <Input label="SIC code(s) (comma separated)" name="sicCodes" value={(org.sicCodes || []).join(", ")} onChange={(e) => setField("organisationInfo", "sicCodes", toList(e.target.value))} />
              <Input label="Regions (comma separated)" name="regions" value={(org.regions || []).join(", ")} onChange={(e) => setField("organisationInfo", "regions", toList(e.target.value))} />
              <Input label="Accreditations (comma separated)" name="accreditations" value={(org.accreditations || []).join(", ")} onChange={(e) => setField("organisationInfo", "accreditations", toList(e.target.value))} />
              <Input label="Previous trading names (comma separated)" name="previousTradingNames" value={(org.previousTradingNames || []).join(", ")} onChange={(e) => setField("organisationInfo", "previousTradingNames", toList(e.target.value))} className="sm:col-span-2" />
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-bold text-secondary">
              <input type="checkbox" checked={!!org.charityStatus} onChange={(e) => setField("organisationInfo", "charityStatus", e.target.checked)} /> Registered charity
            </label>
            {org.charityStatus && (
              <Input label="Charity number" name="charityNumber" value={org.charityNumber} onChange={(e) => setField("organisationInfo", "charityNumber", e.target.value)} className="mt-3 max-w-xs" />
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <StepHeading n={3} title="Structured CoS Requirements" subtitle="Add each role you intend to sponsor." />
            <div className="space-y-4">
              {form.cosRequirements.map((c, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Role {i + 1}</p>
                    <button onClick={() => removeRow("cosRequirements", i)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="SOC code" name={`soc-${i}`} value={c.socCode} onChange={(e) => updateRow("cosRequirements", i, "socCode", e.target.value)} />
                    <Input label="Role title" name={`role-${i}`} value={c.roleTitle} onChange={(e) => updateRow("cosRequirements", i, "roleTitle", e.target.value)} />
                    <Input label="Salary (£/yr)" name={`sal-${i}`} type="number" value={c.salary} onChange={(e) => updateRow("cosRequirements", i, "salary", e.target.value)} />
                    <Input label="Sponsorship duration (months)" name={`dur-${i}`} type="number" value={c.sponsorshipDurationMonths} onChange={(e) => updateRow("cosRequirements", i, "sponsorshipDurationMonths", e.target.value)} />
                    <Input label="Candidate name" name={`cn-${i}`} value={c.candidateName} onChange={(e) => updateRow("cosRequirements", i, "candidateName", e.target.value)} />
                    <Input label="Candidate nationality" name={`cnat-${i}`} value={c.candidateNationality} onChange={(e) => updateRow("cosRequirements", i, "candidateNationality", e.target.value)} />
                    <Input label="Candidate DOB" name={`cdob-${i}`} type="date" value={c.candidateDob || ""} onChange={(e) => updateRow("cosRequirements", i, "candidateDob", e.target.value)} />
                    <Input label="Candidate email" name={`cem-${i}`} type="email" value={c.candidateEmail} onChange={(e) => updateRow("cosRequirements", i, "candidateEmail", e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={() => addRow("cosRequirements", emptyCos)} className="flex items-center gap-2 text-sm font-black text-primary"><Plus size={16} /> Add role</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <StepHeading n={4} title="Appendix A Checklist" subtitle="Upload each required supporting document." />
            <div className="space-y-3">
              {appendixDocs.length === 0 && <p className="text-sm text-gray-500">Select your licence routes in Step 1 to populate the required document list.</p>}
              {appendixDocs.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-secondary truncate">{d.documentName}{d.required && <span className="text-red-500"> *</span>}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.receivedStatus === "Received" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{d.receivedStatus}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.verificationStatus === "Verified" ? "bg-emerald-100 text-emerald-700" : d.verificationStatus === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{d.verificationStatus}</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-primary border border-primary/30 hover:bg-primary/5 cursor-pointer shrink-0">
                    <Upload size={14} /> {d.filePath ? "Replace" : "Upload"}
                    <input type="file" className="hidden" onChange={(e) => onUploadAppendix(d.id, e.target.files?.[0])} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <StepHeading n={5} title="Authorising Officer" subtitle="The most senior person responsible for sponsorship." />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Title" name="aoTitle" value={ao.title} onChange={(e) => setField("authorisingOfficer", "title", e.target.value)} />
              <Input label="First name" name="aoFirst" value={ao.firstName} onChange={(e) => setField("authorisingOfficer", "firstName", e.target.value)} required />
              <Input label="Last name" name="aoLast" value={ao.lastName} onChange={(e) => setField("authorisingOfficer", "lastName", e.target.value)} required />
              <Input label="Date of birth" name="aoDob" type="date" value={ao.dob || ""} onChange={(e) => setField("authorisingOfficer", "dob", e.target.value)} required />
              <Input label="Nationality" name="aoNat" value={ao.nationality} onChange={(e) => setField("authorisingOfficer", "nationality", e.target.value)} required />
              <Input label="National Insurance number" name="aoNi" value={ao.niNumber} onChange={(e) => setField("authorisingOfficer", "niNumber", e.target.value)} required />
              <Input label="Immigration status" name="aoImm" value={ao.immigrationStatus} onChange={(e) => setField("authorisingOfficer", "immigrationStatus", e.target.value)} required />
              <Input label="Email" name="aoEmail" type="email" value={ao.email} onChange={(e) => setField("authorisingOfficer", "email", e.target.value)} />
              <Input label="Phone" name="aoPhone" value={ao.phone} onChange={(e) => setField("authorisingOfficer", "phone", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-bold text-secondary">
              <input type="checkbox" checked={!!ao.hasConvictions} onChange={(e) => setField("authorisingOfficer", "hasConvictions", e.target.checked)} /> Has unspent criminal convictions to declare
            </label>
            {ao.hasConvictions && (
              <Input label="Convictions details" name="aoConv" rows={3} value={ao.convictionsDetails} onChange={(e) => setField("authorisingOfficer", "convictionsDetails", e.target.value)} className="mt-3" />
            )}
          </div>
        );
      case 6:
        return (
          <div>
            <StepHeading n={6} title="Key Contact" subtitle="The main point of contact with the Home Office." />
            <label className="flex items-center gap-2 mb-4 text-sm font-bold text-secondary">
              <input type="checkbox" checked={!!kc.sameAsAuthorisingOfficer} onChange={(e) => setField("keyContact", "sameAsAuthorisingOfficer", e.target.checked)} /> Same as Authorising Officer
            </label>
            {!kc.sameAsAuthorisingOfficer && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Title" name="kcTitle" value={kc.title} onChange={(e) => setField("keyContact", "title", e.target.value)} />
                <Input label="Job title" name="kcJob" value={kc.jobTitle} onChange={(e) => setField("keyContact", "jobTitle", e.target.value)} />
                <Input label="First name" name="kcFirst" value={kc.firstName} onChange={(e) => setField("keyContact", "firstName", e.target.value)} required />
                <Input label="Last name" name="kcLast" value={kc.lastName} onChange={(e) => setField("keyContact", "lastName", e.target.value)} required />
                <Input label="Email" name="kcEmail" type="email" value={kc.email} onChange={(e) => setField("keyContact", "email", e.target.value)} required />
                <Input label="Phone" name="kcPhone" value={kc.phone} onChange={(e) => setField("keyContact", "phone", e.target.value)} required />
              </div>
            )}
          </div>
        );
      case 7:
        return (
          <div>
            <StepHeading n={7} title="Level 1 Users" subtitle="Day-to-day users of the Sponsorship Management System (SMS)." />
            <div className="space-y-4">
              {form.level1Users.map((u, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">User {i + 1}</p>
                    <button onClick={() => removeRow("level1Users", i)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="First name" name={`l1f-${i}`} value={u.firstName} onChange={(e) => updateRow("level1Users", i, "firstName", e.target.value)} />
                    <Input label="Last name" name={`l1l-${i}`} value={u.lastName} onChange={(e) => updateRow("level1Users", i, "lastName", e.target.value)} />
                    <Input label="Email" name={`l1e-${i}`} type="email" value={u.email} onChange={(e) => updateRow("level1Users", i, "email", e.target.value)} />
                    <Input label="Phone" name={`l1p-${i}`} value={u.phone} onChange={(e) => updateRow("level1Users", i, "phone", e.target.value)} />
                    <Input label="Job title" name={`l1j-${i}`} value={u.jobTitle} onChange={(e) => updateRow("level1Users", i, "jobTitle", e.target.value)} />
                  </div>
                  <label className="flex items-center gap-2 mt-3 text-xs font-bold text-secondary">
                    <input type="checkbox" checked={!!u.isAuthorisingOfficer} onChange={(e) => updateRow("level1Users", i, "isAuthorisingOfficer", e.target.checked)} /> Also the Authorising Officer
                  </label>
                </div>
              ))}
              <button onClick={() => addRow("level1Users", emptyL1)} className="flex items-center gap-2 text-sm font-black text-primary"><Plus size={16} /> Add Level 1 user</button>
            </div>
          </div>
        );
      case 8:
        return (
          <div>
            <StepHeading n={8} title="Declarations & Fee" subtitle="Confirm the declarations and review your fee." />
            {fee && (
              <div className="rounded-2xl border border-gray-100 p-5 mb-6 bg-gray-50/50">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Estimated fee</p>
                <div className="space-y-1.5">
                  {fee.lineItems.map((li) => (
                    <div key={li.key} className="flex justify-between text-sm"><span className="text-gray-600">{li.label}</span><span className="font-bold text-secondary">{moneyFmt.format(li.amount)}</span></div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2"><span className="font-black text-secondary">Application fee total</span><span className="font-black text-secondary">{moneyFmt.format(fee.applicationFeeTotal)}</span></div>
                  {fee.immigrationSkillsChargeEstimate > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 pt-1"><span>Immigration Skills Charge (estimate, paid per CoS)</span><span>{moneyFmt.format(fee.immigrationSkillsChargeEstimate)}</span></div>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {[
                ["accuracyConfirmed", "I confirm the information provided is accurate and complete."],
                ["dutiesUnderstood", "I understand the duties and responsibilities of a licensed sponsor."],
                ["dataConsent", "I consent to the processing of this data for the purpose of this application."],
              ].map(([key, label]) => (
                <label key={key} className="flex items-start gap-3 text-sm font-medium text-secondary">
                  <input type="checkbox" className="mt-0.5" checked={!!dec[key]} onChange={(e) => setField("declarations", key, e.target.checked)} /> {label}
                </label>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-5">
              <Input label="Signatory name" name="sigName" value={dec.signatoryName} onChange={(e) => setField("declarations", "signatoryName", e.target.value)} required />
              <Input label="Signatory role" name="sigRole" value={dec.signatoryRole} onChange={(e) => setField("declarations", "signatoryRole", e.target.value)} />
              <Input label="Signed date" name="sigDate" type="date" value={dec.signedDate || ""} onChange={(e) => setField("declarations", "signedDate", e.target.value)} required />
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}
