import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Eye } from "lucide-react";

const SponsoredWorkerDetails = () => {
  const [activeTab, setActiveTab] = useState("details");

  const inputStyle =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900";

  const dummyData = {
    firstName: "John",
    lastName: "Doe",
    dob: "1995-06-15",
    gender: "Male",
    nationality: "Indian",
    passport: "A1234567",
    email: "john@example.com",
    phone: "+91 9876543210",
    job: "Software Developer",
    salary: "45000",
  };

  const documents = [
    { name: "Passport Copy" },
    { name: "Visa Approval Letter" },
    { name: "Employment Contract" },
    { name: "Address Proof" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      className="p-6 bg-gray-100 min-h-screen"
    >
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          Sponsored Worker Details
        </h2>

        {/* Tabs */}
        <div className="flex border-b mb-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-2 font-medium ${
              activeTab === "details"
                ? " border-red-800 text-red-800"
                : "text-gray-500"
            }`}
          >
            Details
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-2 font-medium ${
              activeTab === "documents"
                ? " border-red-800 text-red-800"
                : "text-gray-500"
            }`}
          >
            Documents
          </button>
        </div>

        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {/* PERSONAL */}
            <section>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Personal Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>First Name</label>
                  <input value={dummyData.firstName} readOnly className={inputStyle} />
                </div>

                <div>
                  <label>Last Name</label>
                  <input value={dummyData.lastName} readOnly className={inputStyle} />
                </div>

                <div>
                  <label>Date of Birth</label>
                  <input value={dummyData.dob} readOnly className={inputStyle} />
                </div>

                <div>
                  <label>Gender</label>
                  <input value={dummyData.gender} readOnly className={inputStyle} />
                </div>

                <div>
                  <label>Nationality</label>
                  <input value={dummyData.nationality} readOnly className={inputStyle} />
                </div>
              </div>
            </section>

            {/* PASSPORT */}
            <section>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Passport Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Passport Number</label>
                  <input value={dummyData.passport} readOnly className={inputStyle} />
                </div>
              </div>
            </section>

            {/* CONTACT */}
            <section>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Contact Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Email</label>
                  <input value={dummyData.email} readOnly className={inputStyle} />
                </div>

                <div>
                  <label>Phone</label>
                  <input value={dummyData.phone} readOnly className={inputStyle} />
                </div>
              </div>
            </section>

            {/* JOB */}
            <section>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Job Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label>Job Title</label>
                  <input value={dummyData.job} readOnly className={inputStyle} />
                </div>

                <div>
                  <label>Salary</label>
                  <input value={`£${dummyData.salary}`} readOnly className={inputStyle} />
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
                className="flex items-center justify-between mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-500" />
                  <span className="font-medium">{doc.name}</span>
                </div>

                <button className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition">
                  <Eye size={16} />
                  View
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SponsoredWorkerDetails;