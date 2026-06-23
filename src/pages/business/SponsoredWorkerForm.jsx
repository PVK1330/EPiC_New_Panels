import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Globe,
  Heart,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Building2,
  PoundSterling,
  FileText,
  LayoutDashboard,
  Hash,
  ShieldCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { addSponsoredWorker } from "../../services/sponsoredWorkerApi";
import { getCosSummary } from "../../services/licenceApi";
import { useToast } from "../../context/ToastContext";
import { fetchVisaTypeOptions } from "../../services/visaTypeApi";
import DatePicker from "../../components/DatePicker";
import PhoneInput from "../../components/PhoneInput";
import NationalitySelect from "../../components/NationalitySelect";
import CountrySelect from "../../components/CountrySelect";
import useSponsorLicence from "../../hooks/useSponsorLicence";
import LicenceGateBanner from "../../components/business/LicenceGateBanner";

// Required asterisk
const Req = () => <span className="text-red-500 ml-0.5">*</span>;

const SponsoredWorkerForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [visaTypeOptions, setVisaTypeOptions] = useState([]);
  const [phoneValid, setPhoneValid] = useState(false);
  const { ready: licenceReady, licenceStatus, canSponsorWorkers } = useSponsorLicence();
  const workerBlocked = licenceReady && !canSponsorWorkers;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    nationality: "",
    maritalStatus: "Single",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportCountry: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    jobTitle: "",
    department: "",
    startDate: "",
    salary: "",
    visaType: "",
    visaNumber: "",
    visaExpiryDate: "",
    cosNumber: "",
    previousVisa: "no",
    notes: "",
  });

  useEffect(() => {
    fetchVisaTypeOptions()
      .then((opts) => setVisaTypeOptions(opts))
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (workerBlocked) {
      showToast(
        "Your Sponsorship Licence is not active. Approval is required before sponsorship actions can be performed.",
        "error"
      );
      return;
    }

    if (!phoneValid) {
      showToast("Please enter a valid phone number.", "error");
      return;
    }

    setLoading(true);

    try {
      const summaryRes = await getCosSummary();
      const summary = summaryRes?.data?.data?.summary || {};
      const remaining = Number(summary.remaining);
      if (Number.isFinite(remaining) && remaining <= 0) {
        showToast(
          "You have no Certificates of Sponsorship (CoS) remaining. Request more CoS before adding a worker.",
          "error"
        );
        setLoading(false);
        return;
      }
    } catch {
      // backend enforces quota — proceed and let server reject if over-allocated
    }

    try {
      const response = await addSponsoredWorker(formData);
      if (response.data.status === "success") {
        showToast("Worker added successfully! Credentials sent to their email.", "success");
        navigate("/business/workers");
      } else {
        showToast(response.data.message || "Failed to add worker", "error");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "An error occurred while adding the worker",
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Sponsored Worker Form
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Register a new sponsored worker with all required information.
        </p>
      </motion.div>

      {workerBlocked && <LicenceGateBanner status={licenceStatus} />}

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ── PERSONAL DETAILS ──────────────────────────────────────── */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <User size={22} className="text-primary" />
              Personal Details
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>First Name <Req /></label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="Enter first name"
                    required
                  />
                  <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Last Name <Req /></label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="Enter last name"
                    required
                  />
                  <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Date of Birth <Req /></label>
                <DatePicker
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  placeholder="Select date of birth"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className={labelCls}>Gender <Req /></label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`${iconInputCls} appearance-none`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <NationalitySelect
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  label="Nationality"
                  required
                  placeholder="Select nationality"
                />
              </div>

              <div>
                <label className={labelCls}>Marital Status</label>
                <div className="relative">
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className={`${iconInputCls} appearance-none`}
                  >
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
          </section>

          {/* ── PASSPORT DETAILS ──────────────────────────────────────── */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <CreditCard size={22} className="text-primary" />
              Passport Details
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Passport Number <Req /></label>
                <div className="relative">
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="e.g. 123456789"
                    required
                  />
                  <CreditCard size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Issue Date <Req /></label>
                <DatePicker
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleInputChange}
                  placeholder="Select issue date"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Expiry Date <Req /></label>
                <DatePicker
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleInputChange}
                  placeholder="Select expiry date"
                  required
                />
              </div>

              <div>
                <CountrySelect
                  name="passportCountry"
                  value={formData.passportCountry}
                  onChange={handleInputChange}
                  label="Country of Issue"
                  required
                  placeholder="Select country"
                />
              </div>

            </div>
          </section>

          {/* ── CONTACT INFORMATION ───────────────────────────────────── */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <Phone size={22} className="text-primary" />
              Contact Information
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Email Address <Req /></label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="worker@example.com"
                    required
                  />
                  <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <PhoneInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onValidityChange={setPhoneValid}
                  label="Phone Number"
                  required
                  placeholder="Phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Address <Req /></label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="Street address"
                    required
                  />
                  <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>City <Req /></label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="e.g. London"
                    required
                  />
                  <Building size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </section>

          {/* ── JOB DETAILS ───────────────────────────────────────────── */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <Briefcase size={22} className="text-primary" />
              Job Details
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Job Title <Req /></label>
                <div className="relative">
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                  <Briefcase size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Department</label>
                <div className="relative">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="e.g. Engineering"
                  />
                  <Building2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Start Date <Req /></label>
                <DatePicker
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  placeholder="Select start date"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Annual Salary (£) <Req /></label>
                <div className="relative">
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="e.g. 35000"
                    min="0"
                    required
                  />
                  <PoundSterling size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </section>

          {/* ── VISA DETAILS ──────────────────────────────────────────── */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <Hash size={22} className="text-primary" />
              Visa Details
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelCls}>Visa Type <Req /></label>
                <div className="relative">
                  <select
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleInputChange}
                    className={`${iconInputCls} appearance-none`}
                    required
                  >
                    <option value="">Select visa type</option>
                    {visaTypeOptions.map((visa) => (
                      <option key={visa.id} value={visa.name}>
                        {visa.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Visa Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="visaNumber"
                    value={formData.visaNumber}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="Enter visa number"
                  />
                  <Hash size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Visa Expiry Date <Req /></label>
                <DatePicker
                  name="visaExpiryDate"
                  value={formData.visaExpiryDate}
                  onChange={handleInputChange}
                  placeholder="Select expiry date"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>CoS Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cosNumber"
                    value={formData.cosNumber}
                    onChange={handleInputChange}
                    className={iconInputCls}
                    placeholder="Certificate of Sponsorship number"
                  />
                  <ShieldCheck size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </section>

          {/* ── IMMIGRATION INFORMATION ───────────────────────────────── */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <ShieldCheck size={22} className="text-primary" />
              Immigration Information
            </h3>

            <div className="space-y-5">

              <fieldset>
                <legend className="text-xs font-black text-gray-600 mb-3">
                  Has the applicant previously held a UK visa?
                </legend>
                <div className="flex gap-6">
                  {["yes", "no"].map((val) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="previousVisa"
                        value={val}
                        checked={formData.previousVisa === val}
                        onChange={handleInputChange}
                        className="accent-primary"
                      />
                      <span className="text-sm font-bold text-secondary capitalize">{val}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className={labelCls}>Notes</label>
                <div className="relative">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                    rows={3}
                    placeholder="Any additional notes or comments"
                  />
                  <FileText size={15} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </section>

          {/* ── ACTIONS ───────────────────────────────────────────────── */}
          <div className="flex gap-4 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || workerBlocked}
              title={workerBlocked ? "Your Sponsorship Licence is not active." : undefined}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-xl px-6 py-3 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing…
                </>
              ) : (
                "Submit Form"
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
      </motion.div>
    </div>
  );
};

export default SponsoredWorkerForm;
