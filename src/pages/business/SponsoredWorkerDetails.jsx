import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Eye,
  Download,
  Upload,
  Hash,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  CreditCard,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const SponsoredWorkerDetails = () => {
  const [activeTab, setActiveTab] = useState("details");

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";

  const labelStyle = "text-xs font-bold text-gray-700 mb-2";

  const dummyData = {
    firstName: "John",
    lastName: "Doe",
    dob: "1995-06-15",
    gender: "Male",
    nationality: "Indian",
    passport: "A1234567",
    passportExpiry: "2030-06-15",
    email: "john@example.com",
    phone: "+91 9876543210",
    address: "123 Main Street, London",
    job: "Software Developer",
    salary: "45000",
    startDate: "2024-01-15",
    visaType: "Skilled Worker Visa",
    visaNumber: "VISA-2024-12345",
    visaExpiry: "2025-12-31",
    cosNumber: "COS-2024-67890",
    cosExpiry: "2025-06-30",
    status: "Active",
  };

  const documents = [
    { name: "Passport Copy", status: "uploaded", uploadDate: "2024-01-10" },
    { name: "Visa Approval Letter", status: "uploaded", uploadDate: "2024-01-12" },
    { name: "Employment Contract", status: "uploaded", uploadDate: "2024-01-15" },
    { name: "Address Proof", status: "pending", uploadDate: null },
    { name: "Right to Work Document", status: "uploaded", uploadDate: "2024-01-20" },
  ];

  const workHistory = [
    { company: "Previous Company Ltd", position: "Junior Developer", startDate: "2022-01-01", endDate: "2023-12-31" },
    { company: "Tech Solutions Inc", position: "Intern", startDate: "2021-06-01", endDate: "2021-12-31" },
  ];

  const complianceStatus = [
    { item: "Right to Work Check", status: "Compliant", date: "2024-01-15" },
    { item: "DBS Check", status: "Compliant", date: "2024-01-10" },
    { item: "Visa Validity", status: "Compliant", date: "2024-01-12" },
    { item: "CoS Assignment", status: "Compliant", date: "2024-01-15" },
  ];

  return (
    <div className="space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Sponsored Worker Details
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          View and manage sponsored worker information and compliance status.
        </p>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-3 text-sm font-black border-b-2 transition ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Personal Details
          </button>

          <button
            onClick={() => setActiveTab("visa")}
            className={`px-6 py-3 text-sm font-black border-b-2 transition ${
              activeTab === "visa"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Visa & CoS
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-3 text-sm font-black border-b-2 transition ${
              activeTab === "documents"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-6 py-3 text-sm font-black border-b-2 transition ${
              activeTab === "compliance"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Compliance
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 text-sm font-black border-b-2 transition ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Work History
          </button>
        </div>

        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* PERSONAL */}
            <section>
              <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
                <User size={24} className="text-primary" />
                Personal Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>First Name</label>
                  <input value={dummyData.firstName} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Last Name</label>
                  <input value={dummyData.lastName} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Date of Birth</label>
                  <input value={dummyData.dob} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Gender</label>
                  <input value={dummyData.gender} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Nationality</label>
                  <input value={dummyData.nationality} readOnly className={inputStyle} />
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
                <div>
                  <label className={labelStyle}>Passport Number</label>
                  <input value={dummyData.passport} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Passport Expiry</label>
                  <input value={dummyData.passportExpiry} readOnly className={inputStyle} />
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
                <div>
                  <label className={labelStyle}>Email</label>
                  <input value={dummyData.email} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Phone</label>
                  <input value={dummyData.phone} readOnly className={inputStyle} />
                </div>

                <div className="md:col-span-2">
                  <label className={labelStyle}>Address</label>
                  <input value={dummyData.address} readOnly className={inputStyle} />
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
                <div>
                  <label className={labelStyle}>Job Title</label>
                  <input value={dummyData.job} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Salary</label>
                  <input value={`£${dummyData.salary}`} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Start Date</label>
                  <input value={dummyData.startDate} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Status</label>
                  <input value={dummyData.status} readOnly className={inputStyle} />
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* VISA TAB */}
        {activeTab === "visa" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <section>
              <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
                <Hash size={24} className="text-primary" />
                Visa Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Visa Type</label>
                  <input value={dummyData.visaType} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Visa Number</label>
                  <input value={dummyData.visaNumber} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>Visa Expiry</label>
                  <input value={dummyData.visaExpiry} readOnly className={inputStyle} />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
                <ShieldCheck size={24} className="text-primary" />
                CoS Assignment
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>CoS Number</label>
                  <input value={dummyData.cosNumber} readOnly className={inputStyle} />
                </div>

                <div>
                  <label className={labelStyle}>CoS Expiry</label>
                  <input value={dummyData.cosExpiry} readOnly className={inputStyle} />
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {doc.status === "uploaded" ? (
                    <CheckCircle size={20} className="text-emerald-600" />
                  ) : (
                    <Upload size={20} className="text-amber-600" />
                  )}
                  <div>
                    <p className="text-sm font-black text-secondary">{doc.name}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${
                      doc.status === "uploaded" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {doc.status === "uploaded" ? "Uploaded" : "Pending"}
                    </span>
                    {doc.uploadDate && (
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Uploaded: {doc.uploadDate}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {doc.status === "uploaded" ? (
                    <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark">
                      <Eye size={14} />
                      View
                    </button>
                  ) : (
                    <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark">
                      <Upload size={14} />
                      Upload
                    </button>
                  )}
                  <button className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-300">
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === "compliance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {complianceStatus.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-black text-secondary">{item.item}</p>
                    <p className="text-[10px] font-bold text-gray-500">Checked: {item.date}</p>
                  </div>
                </div>

                <span className="inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-700">
                  {item.status}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {workHistory.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <Briefcase size={20} className="text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-black text-secondary">{item.position}</p>
                    <p className="text-xs font-bold text-gray-600">{item.company}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {item.startDate} - {item.endDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SponsoredWorkerDetails;