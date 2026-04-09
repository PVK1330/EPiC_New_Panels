import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

const SponsoredWorkerForm = () => {
  const [previousVisa, setPreviousVisa] = useState("");

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";

  const labelStyle = "text-xs font-bold text-gray-700 mb-2";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

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
        <form className="space-y-10">

          {/* PERSONAL DETAILS */}
          <section>
            <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
              <User size={24} className="text-primary" />
              Personal Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="relative">
                <label className={labelStyle}>First Name *</label>
                <input type="text" className={inputStyle} />
                <User className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Last Name *</label>
                <input type="text" className={inputStyle} />
                <User className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label className={labelStyle}>Date of Birth *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label className={labelStyle}>Gender *</label>
                <select className={inputStyle}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="relative">
                <label className={labelStyle}>Nationality *</label>
                <input type="text" className={inputStyle} />
                <Globe className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Marital Status</label>
                <select className={inputStyle}>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
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
                <input type="text" className={inputStyle} />
                <CreditCard className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label className={labelStyle}>Issue Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label className={labelStyle}>Expiry Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label className={labelStyle}>Country of Issue *</label>
                <select className={inputStyle}>
                  <option>Select Country</option>
                  <option>India</option>
                  <option>UK</option>
                  <option>USA</option>
                </select>
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
                <input type="email" className={inputStyle} />
                <Mail className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Phone *</label>
                <input type="text" className={inputStyle} />
                <Phone className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Address *</label>
                <input type="text" className={inputStyle} />
                <MapPin className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>City *</label>
                <input type="text" className={inputStyle} />
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
                <input type="text" className={inputStyle} />
                <Briefcase className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div className="relative">
                <label className={labelStyle}>Department</label>
                <input type="text" className={inputStyle} />
                <Building2 className="absolute right-3 top-10 text-gray-400" />
              </div>

              <div>
                <label className={labelStyle}>Start Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div className="relative">
                <label className={labelStyle}>Salary *</label>
                <input type="number" className={inputStyle} />
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
                <select className={inputStyle}>
                  <option>Select Visa Type</option>
                  <option>Skilled Worker Visa</option>
                  <option>Student Visa</option>
                  <option>Health Care Visa</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Visa Number</label>
                <input type="text" className={inputStyle} placeholder="Enter visa number" />
              </div>

              <div>
                <label className={labelStyle}>Visa Expiry Date *</label>
                <input type="date" className={inputStyle} />
              </div>

              <div>
                <label className={labelStyle}>CoS Number</label>
                <input type="text" className={inputStyle} placeholder="Enter CoS number" />
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
                    onChange={(e) => setPreviousVisa(e.target.value)}
                  />
                  Yes
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    name="previousVisa"
                    value="no"
                    onChange={(e) => setPreviousVisa(e.target.value)}
                  />
                  No
                </label>
              </div>

              {previousVisa === "yes" && (
                <div className="grid md:grid-cols-3 gap-6">

                  <div className="relative">
                    <input placeholder="Visa Type" className={inputStyle} />
                    <IdCard className="absolute right-3 top-3 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input placeholder="Year" className={inputStyle} />
                    <Calendar className="absolute right-3 top-3 text-gray-400" />
                  </div>

                  <select className={inputStyle}>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>

                </div>
              )}

              <div className="relative">
                <label className={labelStyle}>Notes</label>
                <textarea
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
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
            >
              Submit Form
            </button>
            <button
              type="button"
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