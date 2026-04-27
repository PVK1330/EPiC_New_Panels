import { useState } from "react";
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
  DollarSign,
  IdCard,
  FileText,
  LayoutDashboard,
  Hash,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { addSponsoredWorker } from "../../services/sponsoredWorkerApi";
import { useToast } from "../../context/ToastContext";

const SponsoredWorkerForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previousVisa, setPreviousVisa] = useState("no");

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
    notes: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await addSponsoredWorker(formData);
      if (response.data.status === "success") {
        showToast("Worker added successfully! Credentials sent to their email.", "success");
        navigate("/business/workers");
      } else {
        showToast(response.data.message || "Failed to add worker", "error");
      }
    } catch (error) {
      console.error("Error adding worker:", error);
      showToast(error.response?.data?.message || "An error occurred while adding the worker", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";

  const labelStyle = "text-xs font-bold text-gray-700 mb-2";

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

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* PERSONAL DETAILS */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <User size={24} className="text-primary" />
              Personal Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label className={labelStyle}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <User className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <User className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label className={labelStyle}>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={inputStyle}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="relative">
                <label className={labelStyle}>Nationality *</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <Globe className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className={inputStyle}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
                <Heart className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* PASSPORT */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <CreditCard size={24} className="text-primary" />
              Passport Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label className={labelStyle}>Passport Number *</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <CreditCard className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label className={labelStyle}>Issue Date *</label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Expiry Date *</label>
                <input
                  type="date"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Country of Issue *</label>
                <input
                  type="text"
                  name="passportCountry"
                  value={formData.passportCountry}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                  placeholder="Enter country"
                />
              </div>

            </div>
          </section>

          {/* CONTACT */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <Phone size={24} className="text-primary" />
              Contact Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label className={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <Mail className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <Phone className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <MapPin className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <Building className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* JOB */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <Briefcase size={24} className="text-primary" />
              Job Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label className={labelStyle}>Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <Briefcase className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={inputStyle}
                />
                <Building2 className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label className={labelStyle}>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div className="relative">
                <label className={labelStyle}>Salary *</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
                <DollarSign className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* VISA DETAILS */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <Hash size={24} className="text-primary" />
              Visa Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Visa Type *</label>
                <select
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                >
                  <option value="">Select Visa Type</option>
                  <option value="Skilled Worker Visa">Skilled Worker Visa</option>
                  <option value="Student Visa">Student Visa</option>
                  <option value="Health Care Visa">Health Care Visa</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Visa Number</label>
                <input
                  type="text"
                  name="visaNumber"
                  value={formData.visaNumber}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder="Enter visa number"
                />
              </div>

              <div>
                <label className={labelStyle}>Visa Expiry Date *</label>
                <input
                  type="date"
                  name="visaExpiryDate"
                  value={formData.visaExpiryDate}
                  onChange={handleInputChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>CoS Number</label>
                <input
                  type="text"
                  name="cosNumber"
                  value={formData.cosNumber}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder="Enter CoS number"
                />
              </div>
            </div>
          </section>

          {/* IMMIGRATION */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <ShieldCheck size={24} className="text-primary" />
              Immigration Information
            </h3>

            <div className="space-y-4">

              <div className="flex gap-6">
                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="previousVisa"
                    value="yes"
                    checked={formData.previousVisa === "yes"}
                    onChange={handleInputChange}
                  />
                  Yes
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="previousVisa"
                    value="no"
                    checked={formData.previousVisa === "no"}
                    onChange={handleInputChange}
                  />
                  No
                </label>
              </div>

              <div className="relative">
                <label className={labelStyle}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                  rows="3"
                />
                <FileText className="absolute right-3 top-10 text-gray-400" />
              </div>

            </div>
          </section>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                "Submit Form"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/business/workers")}
              className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
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