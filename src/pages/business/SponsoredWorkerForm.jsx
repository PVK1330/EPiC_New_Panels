import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Building2,
  PoundSterling,
  CreditCard,
  FileText,
  LayoutDashboard,
  Loader2,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Globe,
  Clock,
} from "lucide-react";
import { addSponsoredWorker } from "../../services/sponsoredWorkerApi";
import { getCosAllocations, getCosSummary } from "../../services/licenceApi";
import { useToast } from "../../context/ToastContext";
import { fetchVisaTypeOptions } from "../../services/visaTypeApi";
import DatePicker from "../../components/DatePicker";
import PhoneInput from "../../components/PhoneInput";
import NationalitySelect from "../../components/NationalitySelect";
import CountrySelect from "../../components/CountrySelect";
import useSponsorLicence from "../../hooks/useSponsorLicence";
import LicenceGateBanner from "../../components/business/LicenceGateBanner";

const Req = () => <span className="text-red-500 ml-0.5">*</span>;

const SectionHeader = ({ icon: Icon, color = "primary", title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`h-10 w-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <h3 className="text-base font-black text-secondary">{title}</h3>
      {subtitle && <p className="text-xs font-bold text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const SponsoredWorkerForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [visaTypeOptions, setVisaTypeOptions] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [allocationsLoading, setAllocationsLoading] = useState(true);
  const [cosSummary, setCosSummary] = useState(null); // { total, used, remaining }
  const [phoneValid, setPhoneValid] = useState(false);
  const { ready: licenceReady, licenceStatus, canSponsorWorkers } = useSponsorLicence();
  const workerBlocked = licenceReady && !canSponsorWorkers;
  const cosExhausted = !allocationsLoading && cosSummary !== null && cosSummary.remaining === 0;

  const [formData, setFormData] = useState({
    // Identity
    workerFirstName: "",
    workerLastName: "",
    dob: "",
    gender: "Male",
    workerNationality: "",
    maritalStatus: "Single",
    // Passport
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportCountry: "",
    // Contact
    workerEmail: "",
    phone: "",
    address: "",
    city: "",
    // Employment
    jobTitle: "",
    department: "",
    socCode: "",
    startDate: "",
    salary: "",
    weeklyHours: "37.5",
    // Visa / CoS
    visaType: "",
    previousUkVisa: "no",
    notes: "",
    // CoS assignment (set from allocation picker)
    cosRequestId: null,
    cosAllocationRecordId: null,
    useGeneralPool: false,
  });

  useEffect(() => {
    fetchVisaTypeOptions()
      .then((opts) => setVisaTypeOptions(opts))
      .catch(() => {});

    Promise.all([
      getCosAllocations().catch(() => null),
      getCosSummary().catch(() => null),
    ]).then(([allocRes, summaryRes]) => {
      if (allocRes?.data?.status === "success") {
        // Only show Active allocations that still have remaining slots
        const list = (allocRes.data.data || []).filter(
          (a) => a.status === "Active" && (a.remainingSlots ?? a.allocatedAmount) > 0
        );
        setAllocations(list);
      }
      if (summaryRes?.data?.status === "success") {
        setCosSummary(summaryRes.data.data?.summary ?? null);
      }
    }).finally(() => setAllocationsLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAllocationSelect = (e) => {
    const allocationId = e.target.value;
    if (!allocationId) {
      setSelectedAllocation(null);
      setFormData((prev) => ({
        ...prev,
        cosAllocationRecordId: null,
        cosRequestId: null,
        useGeneralPool: false,
        visaType: "",
      }));
      return;
    }
    // "general" is the sentinel value for the virtual licence-grant pool entry
    if (allocationId === "general") {
      const alloc = allocations.find((a) => a.isLicenceGrant);
      setSelectedAllocation(alloc || null);
      setFormData((prev) => ({
        ...prev,
        cosAllocationRecordId: null,
        cosRequestId: null,
        useGeneralPool: true,
        visaType: "",
      }));
      return;
    }
    const alloc = allocations.find((a) => String(a.id) === String(allocationId));
    setSelectedAllocation(alloc || null);
    const visaType = alloc?.visaType || alloc?.cosRequest?.visaType || "";
    setFormData((prev) => ({
      ...prev,
      cosAllocationRecordId: alloc?.id || null,
      cosRequestId: alloc?.cosRequest?.id || null,
      useGeneralPool: false,
      visaType,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (workerBlocked) {
      showToast("Your Sponsorship Licence is not active.", "error");
      return;
    }
    if (cosExhausted) {
      showToast("No CoS slots remaining. Please request additional CoS allocations.", "error");
      return;
    }
    if (!phoneValid) {
      showToast("Please enter a valid phone number.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        workerFirstName: formData.workerFirstName,
        workerLastName: formData.workerLastName,
        dob: formData.dob || null,
        gender: formData.gender,
        workerNationality: formData.workerNationality,
        maritalStatus: formData.maritalStatus,
        passportNumber: formData.passportNumber,
        passportIssueDate: formData.passportIssueDate || null,
        passportExpiryDate: formData.passportExpiryDate || null,
        passportCountry: formData.passportCountry,
        workerEmail: formData.workerEmail,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        jobTitle: formData.jobTitle,
        department: formData.department || null,
        socCode: formData.socCode || null,
        startDate: formData.startDate || null,
        salary: formData.salary ? Number(formData.salary) : null,
        weeklyHours: formData.weeklyHours ? Number(formData.weeklyHours) : null,
        visaType: formData.visaType,
        previousUkVisa: formData.previousUkVisa,
        notes: formData.notes || null,
        ...(formData.cosRequestId ? { cosRequestId: formData.cosRequestId } : {}),
        ...(formData.cosAllocationRecordId ? { cosAllocationRecordId: formData.cosAllocationRecordId } : {}),
        ...(formData.useGeneralPool ? { useGeneralPool: true } : {}),
      };

      const response = await addSponsoredWorker(payload);
      if (response.data.status === "success") {
        const cosNum = response.data.data?.workerCosNumber;
        showToast(
          cosNum
            ? `Worker registered. CoS reference: ${cosNum}`
            : "Sponsored worker registered successfully.",
          "success"
        );
        navigate("/business/workers");
      } else {
        showToast(response.data.message || "Failed to register worker", "error");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "An error occurred while registering the worker",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";
  const iconInputCls =
    "w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";
  const labelCls = "block text-xs font-black text-gray-600 mb-1.5";
  const sectionCls = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Register Sponsored Worker
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Complete all required UKVI information and optionally assign a Certificate of Sponsorship.
        </p>
      </motion.div>

      {workerBlocked && <LicenceGateBanner status={licenceStatus} />}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── CoS ASSIGNMENT (optional) ─────────────────────────────────────── */}
        <motion.div
          className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <SectionHeader
            icon={ShieldCheck}
            title="Assign Certificate of Sponsorship (Optional)"
            subtitle="Link this worker to an approved CoS allocation. A unique CoS reference number will be auto-generated."
          />

          {allocationsLoading ? (
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading CoS allocations…
            </div>
          ) : cosSummary && cosSummary.remaining === 0 ? (
            /* ── No CoS slots remaining at all — block worker registration ── */
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-red-800 mb-0.5">No CoS slots remaining</p>
                <p className="text-sm font-bold text-red-700">
                  You have used all {cosSummary.total} allocated CoS slots. Please request additional CoS allocations before registering new workers.
                </p>
              </div>
            </div>
          ) : allocations.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-amber-800">
                No approved CoS allocations yet. You can still register the worker and assign a CoS later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall CoS summary bar */}
              {cosSummary && (
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-600">
                  <span>Total: <span className="text-secondary font-black">{cosSummary.total}</span></span>
                  <span className="text-gray-300">|</span>
                  <span>Used: <span className="text-amber-600 font-black">{cosSummary.used}</span></span>
                  <span className="text-gray-300">|</span>
                  <span>Remaining: <span className={`font-black ${cosSummary.remaining > 0 ? "text-emerald-600" : "text-red-600"}`}>{cosSummary.remaining}</span></span>
                </div>
              )}

              <div>
                <label className={labelCls}>CoS Allocation</label>
                <div className="relative">
                  <select
                    value={selectedAllocation?.isLicenceGrant ? "general" : (selectedAllocation?.id || "")}
                    onChange={handleAllocationSelect}
                    className={`${iconInputCls} appearance-none`}
                  >
                    <option value="">— No CoS assignment —</option>
                    {allocations.map((alloc) => {
                      const remaining = alloc.remainingSlots ?? alloc.allocatedAmount;
                      const label = alloc.visaType || alloc.cosRequest?.visaType || "Any Visa Type";
                      // Virtual licence-grant entry has id: null — use sentinel "general"
                      const optValue = alloc.isLicenceGrant ? "general" : alloc.id;
                      const optKey = alloc.isLicenceGrant ? "general" : alloc.id;
                      return (
                        <option key={optKey} value={optValue}>
                          {alloc.allocationNumber} — {label} ({remaining} of {alloc.allocatedAmount} remaining)
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedAllocation && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-4 gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Allocation Ref</p>
                    <p className="text-sm font-black text-secondary flex items-center gap-1.5">
                      <Hash size={12} className="text-emerald-600" />
                      {selectedAllocation.allocationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Visa Type</p>
                    <p className="text-sm font-black text-secondary">
                      {selectedAllocation.visaType || selectedAllocation.cosRequest?.visaType || (selectedAllocation.isLicenceGrant ? "Any Visa Type" : "—")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Total Slots</p>
                    <p className="text-sm font-black text-secondary">{selectedAllocation.allocatedAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Remaining</p>
                    <p className="text-sm font-black text-secondary flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      {selectedAllocation.remainingSlots ?? selectedAllocation.allocatedAmount}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── PERSONAL DETAILS ──────────────────────────────────────────────── */}
        <motion.div
          className={sectionCls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <SectionHeader icon={User} title="Personal Details" subtitle="Worker's personal information as per their travel document." />
          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>First Name <Req /></label>
              <div className="relative">
                <input type="text" name="workerFirstName" value={formData.workerFirstName}
                  onChange={handleInputChange} className={iconInputCls} placeholder="Enter first name" required />
                <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Last Name <Req /></label>
              <div className="relative">
                <input type="text" name="workerLastName" value={formData.workerLastName}
                  onChange={handleInputChange} className={iconInputCls} placeholder="Enter last name" required />
                <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Date of Birth <Req /></label>
              <DatePicker name="dob" value={formData.dob} onChange={handleInputChange}
                placeholder="Select date of birth" required max={new Date().toISOString().split("T")[0]} />
            </div>

            <div>
              <label className={labelCls}>Gender <Req /></label>
              <div className="relative">
                <select name="gender" value={formData.gender} onChange={handleInputChange}
                  className={`${iconInputCls} appearance-none`}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <NationalitySelect name="workerNationality" value={formData.workerNationality}
                onChange={handleInputChange} label="Nationality" required placeholder="Select nationality" />
            </div>

            <div>
              <label className={labelCls}>Marital Status</label>
              <div className="relative">
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}
                  className={`${iconInputCls} appearance-none`}>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── PASSPORT DETAILS ──────────────────────────────────────────────── */}
        <motion.div
          className={sectionCls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <SectionHeader icon={CreditCard} title="Passport / Travel Document" subtitle="Required by UKVI for Right to Work checks." />
          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Passport Number <Req /></label>
              <div className="relative">
                <input type="text" name="passportNumber" value={formData.passportNumber}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. 123456789" required />
                <CreditCard size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <CountrySelect name="passportCountry" value={formData.passportCountry}
                onChange={handleInputChange} label="Country of Issue" required placeholder="Select country" />
            </div>

            <div>
              <label className={labelCls}>Issue Date <Req /></label>
              <DatePicker name="passportIssueDate" value={formData.passportIssueDate}
                onChange={handleInputChange} placeholder="Select issue date" required />
            </div>

            <div>
              <label className={labelCls}>Expiry Date <Req /></label>
              <DatePicker name="passportExpiryDate" value={formData.passportExpiryDate}
                onChange={handleInputChange} placeholder="Select expiry date" required />
            </div>

          </div>
        </motion.div>

        {/* ── CONTACT INFORMATION ───────────────────────────────────────────── */}
        <motion.div
          className={sectionCls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <SectionHeader icon={Phone} title="Contact Information" />
          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Email Address <Req /></label>
              <div className="relative">
                <input type="email" name="workerEmail" value={formData.workerEmail}
                  onChange={handleInputChange} className={iconInputCls} placeholder="worker@example.com" required />
                <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <PhoneInput name="phone" value={formData.phone} onChange={handleInputChange}
                onValidityChange={setPhoneValid} label="Phone Number" required placeholder="Phone number" />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Address <Req /></label>
              <div className="relative">
                <input type="text" name="address" value={formData.address}
                  onChange={handleInputChange} className={iconInputCls} placeholder="Street address" required />
                <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>City <Req /></label>
              <div className="relative">
                <input type="text" name="city" value={formData.city}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. London" required />
                <Building size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── EMPLOYMENT DETAILS ────────────────────────────────────────────── */}
        <motion.div
          className={sectionCls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <SectionHeader icon={Briefcase} title="Employment Details" subtitle="Required for CoS assignment and UKVI compliance." />
          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Job Title <Req /></label>
              <div className="relative">
                <input type="text" name="jobTitle" value={formData.jobTitle}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. Software Engineer" required />
                <Briefcase size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>SOC Code</label>
              <div className="relative">
                <input type="text" name="socCode" value={formData.socCode}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. 2135" />
                <Hash size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Department</label>
              <div className="relative">
                <input type="text" name="department" value={formData.department}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. Engineering" />
                <Building2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Start Date <Req /></label>
              <DatePicker name="startDate" value={formData.startDate}
                onChange={handleInputChange} placeholder="Select start date" required />
            </div>

            <div>
              <label className={labelCls}>Annual Salary (£) <Req /></label>
              <div className="relative">
                <input type="number" name="salary" value={formData.salary}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. 35000" min="0" required />
                <PoundSterling size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Weekly Hours <Req /></label>
              <div className="relative">
                <input type="number" name="weeklyHours" value={formData.weeklyHours}
                  onChange={handleInputChange} className={iconInputCls} placeholder="e.g. 37.5" min="1" max="168" step="0.5" required />
                <Clock size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── VISA & IMMIGRATION ────────────────────────────────────────────── */}
        <motion.div
          className={sectionCls}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <SectionHeader icon={Globe} title="Visa & Immigration" />
          <div className="space-y-5">

            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelCls}>
                  Visa Type <Req />
                  {selectedAllocation && (
                    <span className="ml-2 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      Pre-filled from CoS allocation
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select name="visaType" value={formData.visaType} onChange={handleInputChange}
                    disabled={!!selectedAllocation}
                    className={`${iconInputCls} appearance-none disabled:opacity-70 disabled:cursor-not-allowed`} required>
                    <option value="">Select visa type</option>
                    {visaTypeOptions.map((visa) => (
                      <option key={visa.id} value={visa.name}>{visa.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <fieldset>
              <legend className="text-xs font-black text-gray-600 mb-3">
                Has the worker previously held a UK visa?
              </legend>
              <div className="flex gap-6">
                {["yes", "no"].map((val) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="previousUkVisa" value={val}
                      checked={formData.previousUkVisa === val} onChange={handleInputChange}
                      className="accent-primary" />
                    <span className="text-sm font-bold text-secondary capitalize">{val}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className={labelCls}>Additional Notes</label>
              <div className="relative">
                <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                  rows={3} placeholder="Any additional notes or UKVI comments" />
                <FileText size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── ACTIONS ───────────────────────────────────────────────────────── */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || workerBlocked || cosExhausted}
            title={
              workerBlocked
                ? "Your Sponsorship Licence is not active."
                : cosExhausted
                ? "No CoS slots remaining. Request additional CoS allocations first."
                : undefined
            }
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-xl px-6 py-3 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Registering…</>
            ) : (
              <><ShieldCheck size={18} /> Register Worker{selectedAllocation ? " & Assign CoS" : ""}</>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/business/workers")}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default SponsoredWorkerForm;
