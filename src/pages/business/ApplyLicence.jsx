import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  X,
  Building2,
  User,
  ShieldCheck,
  Wallet,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { submitLicenceApplication } from "../../services/licenceApi";
import { useToast } from "../../context/ToastContext";
import DatePicker from "../../components/DatePicker";

// Routes aligned with the UK Home Office sponsor licence application.
const LICENCE_ROUTES = [
  "Skilled Worker",
  "Scale-up",
  "Global Business Mobility (GBM)",
  "Student",
  "Minister of Religion",
  "International Sportsperson",
  "Temporary Worker — Creative Worker",
  "Temporary Worker — Charity Worker",
  "Temporary Worker — Religious Worker",
  "Temporary Worker — Government Authorised Exchange",
  "Temporary Worker — International Agreement",
  "Temporary Worker — Seasonal Worker",
];

const SECTORS = [
  "Information Technology",
  "Healthcare & Social Care",
  "Engineering & Manufacturing",
  "Construction",
  "Education",
  "Financial & Professional Services",
  "Hospitality & Catering",
  "Retail & Wholesale",
  "Logistics & Transport",
  "Creative & Media",
  "Agriculture",
  "Other",
];

const FUNDING_SOURCES = [
  "Operational profit",
  "Investment / venture capital",
  "Bank financing",
  "Government grant",
  "Other",
];

const REQUIRED = [
  "companyName",
  "registrationNumber",
  "industry",
  "licenceType",
  "cosAllocation",
  "reason",
  "contactName",
  "contactEmail",
  "contactPhone",
];

// Defined at module scope so it is a stable component type (otherwise the form
// inputs would remount and lose focus on every keystroke).
const Section = ({ icon: Icon, title, subtitle, children, tone = "primary" }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2.5 rounded-xl ${tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"}`}>
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-lg font-black text-secondary">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </motion.div>
);

const ApplyLicence = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    companyName: "",
    tradingName: "",
    registrationNumber: "",
    industry: "",
    licenceType: "",
    cosAllocation: "",
    proposedStartDate: "",
    reason: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    fundingSource: "",
    estimatedAnnualCost: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleFileUpload = (e) => setUploadedFiles((p) => [...p, ...Array.from(e.target.files)]);
  const handleRemoveFile = (i) => setUploadedFiles((p) => p.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    REQUIRED.forEach((k) => {
      if (!String(formData[k] || "").trim()) e[k] = "Required";
    });
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      e.contactEmail = "Enter a valid email";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      showToast({ message: "Please complete all required fields.", variant: "warning" });
      return;
    }
    if (!declared) {
      showToast({ message: "Please confirm the declaration before submitting.", variant: "warning" });
      return;
    }
    try {
      setLoading(true);
      const res = await submitLicenceApplication({ ...formData, documents: uploadedFiles, type: "New" });
      if (res.data.status === "success") {
        showToast({ message: "Licence application submitted successfully!", variant: "success" });
        navigate("/business/licence");
      }
    } catch (err) {
      showToast({ message: err.response?.data?.message || "Failed to submit application", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full border rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-gray-50/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-gray-300 placeholder:font-medium";
  const cls = (name) => `${input} ${errors[name] ? "border-red-400" : "border-gray-200"}`;
  const label = "block text-xs font-bold text-gray-700 mb-2";
  const errText = (name) => errors[name] && errors[name] !== "Required" ? <p className="text-[11px] text-red-500 mt-1 font-bold">{errors[name]}</p> : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-primary shrink-0" size={28} />
          Apply for a Sponsor Licence
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          A simple application aligned with UK Home Office sponsor licence requirements.
        </p>
      </motion.div>

      {/* Licence & CoS */}
      <Section
        icon={FileText}
        title="Licence & Certificates of Sponsorship"
        subtitle="The route you want to sponsor under and your expected need."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Licence route *</label>
            <select name="licenceType" value={formData.licenceType} onChange={handleInputChange} className={cls("licenceType")}>
              <option value="">Select a route…</option>
              {LICENCE_ROUTES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Estimated CoS needed (first year) *</label>
            <input
              type="number"
              min="0"
              name="cosAllocation"
              value={formData.cosAllocation}
              onChange={handleInputChange}
              className={cls("cosAllocation")}
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <label className={label}>Proposed start date</label>
            <DatePicker
              name="proposedStartDate"
              value={formData.proposedStartDate}
              onChange={handleInputChange}
              placeholder="Select date"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Why do you need this licence? *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className={`${cls("reason")} resize-none`}
              placeholder="Briefly describe the roles you need to fill and why you need to sponsor overseas workers…"
            />
          </div>
        </div>
      </Section>

      {/* Organisation */}
      <Section icon={Building2} title="Organisation details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Organisation name *</label>
            <input name="companyName" value={formData.companyName} onChange={handleInputChange} className={cls("companyName")} placeholder="TechNova Ltd" />
          </div>
          <div>
            <label className={label}>Trading name</label>
            <input name="tradingName" value={formData.tradingName} onChange={handleInputChange} className={cls("tradingName")} placeholder="If different from above" />
          </div>
          <div>
            <label className={label}>Companies House number *</label>
            <input name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className={cls("registrationNumber")} placeholder="08472931" />
          </div>
          <div>
            <label className={label}>Sector *</label>
            <select name="industry" value={formData.industry} onChange={handleInputChange} className={cls("industry")}>
              <option value="">Select a sector…</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section icon={User} title="Authorising officer / main contact" subtitle="The senior person responsible for the sponsor licence.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={label}>Full name *</label>
            <input name="contactName" value={formData.contactName} onChange={handleInputChange} className={cls("contactName")} placeholder="Jane Smith" />
          </div>
          <div>
            <label className={label}>Email *</label>
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={cls("contactEmail")} placeholder="name@company.com" />
            {errText("contactEmail")}
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className={cls("contactPhone")} placeholder="+44 20 7946 0000" />
          </div>
        </div>
      </Section>

      {/* Financial (optional) */}
      <Section icon={Wallet} title="Financial information" subtitle="Optional — helps us understand your sponsorship capacity." tone="emerald">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Primary funding source</label>
            <select name="fundingSource" value={formData.fundingSource} onChange={handleInputChange} className={cls("fundingSource")}>
              <option value="">Select a source…</option>
              {FUNDING_SOURCES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Estimated annual sponsorship budget (£)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">£</span>
              <input
                type="number"
                min="0"
                name="estimatedAnnualCost"
                value={formData.estimatedAnnualCost}
                onChange={handleInputChange}
                className={`${cls("estimatedAnnualCost")} pl-8`}
                placeholder="50000"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Documents */}
      <Section icon={Upload} title="Supporting documents" subtitle="Certificate of incorporation, bank statements, PAYE evidence, etc.">
        <label
          htmlFor="apply-licence-files"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/40 p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
            <Upload size={22} className="text-primary" />
          </div>
          <p className="text-sm font-black text-secondary">Click to upload, or drag &amp; drop</p>
          <p className="text-xs font-medium text-gray-400">PDF, JPG or PNG — multiple files allowed</p>
          <input id="apply-licence-files" type="file" multiple onChange={handleFileUpload} className="hidden" />
        </label>

        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 mt-4">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                      <FileText size={16} className="text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-secondary truncate">{file.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveFile(index)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Declaration */}
      <Section icon={ShieldCheck} title="Declaration">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)} className="mt-1 shrink-0" />
          <span className="text-sm font-medium text-gray-600">
            I confirm that the information provided is true and complete to the best of my knowledge, and I
            understand the duties and responsibilities of a licensed sponsor under the UK Home Office sponsor guidance.
          </span>
        </label>
      </Section>

      {/* Submit */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/business/licence")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-black text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-black text-white transition hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-70 w-full sm:w-auto"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          Submit Application
        </button>
      </div>
    </div>
  );
};

export default ApplyLicence;
