import { motion } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Hash,
  ShieldCheck,
  Star,
  Calendar,
  FileText,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LicenceStatus = () => {
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [renewalData, setRenewalData] = useState({
    renewalType: '',
    requestedAllocation: '',
    reason: '',
    contactEmail: '',
    contactPhone: '',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const navigate = useNavigate();

  const historyData = [
    {
        id:1,
      event: "Licence renewed",
      date: "2025-04-10",
      details: "Sponsor licence renewed for 12 months",
      status: "Pending",

    },

    {
      id: 2,
      event: "Licence renewed",
      date: "2025-06-12",
      details: "Sponsor licence renewed for 12 months",
      status: "Completed",
    },
    {
      id: 3,
      event: "Compliance review",
      date: "2025-03-24",
      details: "Review completed with no issues",
      status: "Passed",
    },
    {
      id: 4,
      event: "Licence warning issued",
      date: "2024-12-05",
      details: "Minor documentation missing on renewal",
      status: "Resolved",
    },
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
          Licence Status
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Track your licence status and renewals with ease. Stay informed, stay compliant.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Hash size={20} className="text-primary" />
            <span className="font-black">Licence No.</span>
          </div>
          <p className="text-xl font-black text-secondary">LIC-2024-0987</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span className="font-black">Status</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
            Active
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Star size={20} className="text-amber-500" />
            <span className="font-black">Rating</span>
          </div>
          <p className="text-3xl font-black text-secondary">A+</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Calendar size={20} className="text-primary" />
            <span className="font-black">Expiry Date</span>
          </div>
          <p className="text-3xl font-black text-secondary">12 Jul 2026</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-gray-900">
            <ShieldAlert size={20} className="text-primary" />
            <div>
              <h2 className="text-xl font-black text-secondary">Licence Details</h2>
              <p className="text-sm font-bold text-gray-500">Overview of your sponsor licence information.</p>
            </div>
          </div>
          <div className="space-y-4 text-sm font-bold text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <span className="font-black">Sponsor Licence No.</span>
              <span>LIC-2024-0987</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-black">Licence Type</span>
              <span>Standard</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-black">Assigned CoS</span>
              <span>18</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-black">Last Renewal</span>
              <span>12 Jul 2025</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-gray-900">
            <FileText size={20} className="text-primary" />
            <div>
              <h2 className="text-xl font-black text-secondary">Licence Health</h2>
              <p className="text-sm font-bold text-gray-500">Compliance and renewal readiness summary.</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Compliance Score</span>
                <span className="font-black text-secondary">92%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-[92%] rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Active Alerts</span>
                <span className="font-black text-amber-700">2 open</span>
              </div>
              <p className="mt-3 text-xs font-bold text-gray-500">Minor documentation action required before next renewal.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm font-bold text-gray-600">
                <span>Renewal Readiness</span>
                <span className="font-black text-emerald-700">Good</span>
              </div>
              <p className="mt-3 text-xs font-bold text-gray-500">Licence is ready for renewal planning.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowRenewalForm(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <RefreshCw size={18} />
            Renew Licence
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
      >
        <div className="flex items-center gap-3 mb-6 text-gray-900">
          <Clock size={20} className="text-primary" />
          <div>
            <h2 className="text-xl font-black text-secondary">Licence History</h2>
            <p className="text-sm font-bold text-gray-500">Recent events associated with your licence.</p>
          </div>
        </div>
        <div className="space-y-4">
          {historyData.map((item) => (
            <div key={item.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-black text-secondary">{item.event}</p>
                  <p className="text-xs font-bold text-gray-500">{item.details}</p>
                </div>
                <div className="text-xs font-bold text-gray-600">
                  <span className="font-black">{item.date}</span>
                </div>  
              </div>
              
              <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-black text-gray-700 shadow-sm">
                {item.status}
              </div>
              {item.status === "Pending" && (
                  <>
                  <button onClick={()=>navigate("/business/licenceprocess")} className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700 hover:bg-amber-200">
                    View Application
                  </button>
                  </>
                )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* CoS Allocation Details */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
      >
        <div className="flex items-center gap-3 mb-6 text-gray-900">
          <Hash size={20} className="text-primary" />
          <div>
            <h2 className="text-xl font-black text-secondary">CoS Allocation</h2>
            <p className="text-sm font-bold text-gray-500">Certificate of Sponsorship allocation and usage.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-600 mb-2">Total Allocated</p>
            <p className="text-3xl font-black text-secondary">18</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-600 mb-2">Used</p>
            <p className="text-3xl font-black text-primary">12</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-600 mb-2">Available</p>
            <p className="text-3xl font-black text-emerald-600">6</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
            <span>Allocation Usage</span>
            <span>12/18 (67%)</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-[67%] rounded-full bg-primary"></div>
          </div>
        </div>
      </motion.div>

      {/* Compliance Requirements Checklist */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
      >
        <div className="flex items-center gap-3 mb-6 text-gray-900">
          <CheckCircle2 size={20} className="text-primary" />
          <div>
            <h2 className="text-xl font-black text-secondary">Compliance Requirements</h2>
            <p className="text-sm font-bold text-gray-500">UKVI sponsor licence compliance checklist.</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { requirement: "Maintain accurate worker records", status: "compliant" },
            { requirement: "Report worker absences within 10 days", status: "compliant" },
            { requirement: "Keep CoS allocation records", status: "compliant" },
            { requirement: "Update HR information quarterly", status: "pending" },
            { requirement: "Conduct annual compliance review", status: "pending" },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              {item.status === "compliant" ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <AlertCircle size={18} className="text-amber-600" />
              )}
              <span className="text-sm font-bold text-gray-700">{item.requirement}</span>
              <span className={`ml-auto text-[10px] font-black px-2 py-1 rounded-full ${
                item.status === "compliant" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {item.status === "compliant" ? "Compliant" : "Action Required"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Documents Section */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
      >
        <div className="flex items-center gap-3 mb-6 text-gray-900">
          <FileText size={20} className="text-primary" />
          <div>
            <h2 className="text-xl font-black text-secondary">Required Documents</h2>
            <p className="text-sm font-bold text-gray-500">Documents required for your sponsor licence.</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { name: "Sponsor Licence Certificate", status: "uploaded", date: "2025-01-15" },
            { name: "HR Policy Document", status: "uploaded", date: "2025-02-20" },
            { name: "Right to Work Policy", status: "uploaded", date: "2025-02-20" },
            { name: "Worker Monitoring Records", status: "pending", date: null },
            { name: "CoS Allocation Records", status: "pending", date: null },
          ].map((doc, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              {doc.status === "uploaded" ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <Upload size={18} className="text-amber-600" />
              )}
              <div className="flex-1">
                <span className="text-sm font-black text-secondary">{doc.name}</span>
                {doc.date && (
                  <p className="text-[10px] font-bold text-gray-500">Uploaded: {doc.date}</p>
                )}
              </div>
              {doc.status === "uploaded" ? (
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Uploaded
                </span>
              ) : (
                <button className="text-[10px] font-black px-3 py-1 rounded-full bg-primary text-white hover:bg-primary-dark">
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Licence Renewal Modal */}
      {showRenewalForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-secondary">Licence Renewal Application</h2>
                <button
                  onClick={() => setShowRenewalForm(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2">Renewal Type *</label>
                  <select
                    value={renewalData.renewalType}
                    onChange={(e) => setRenewalData({ ...renewalData, renewalType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  >
                    <option value="">Select renewal type</option>
                    <option>Standard Renewal</option>
                    <option>Allocation Increase</option>
                    <option>Licence Type Change</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2">Requested CoS Allocation *</label>
                  <input
                    type="number"
                    value={renewalData.requestedAllocation}
                    onChange={(e) => setRenewalData({ ...renewalData, requestedAllocation: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="Enter requested allocation"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2">Reason for Renewal *</label>
                  <textarea
                    value={renewalData.reason}
                    onChange={(e) => setRenewalData({ ...renewalData, reason: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                    placeholder="Explain why you need to renew your licence"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Contact Email *</label>
                    <input
                      type="email"
                      value={renewalData.contactEmail}
                      onChange={(e) => setRenewalData({ ...renewalData, contactEmail: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Contact Phone *</label>
                    <input
                      type="tel"
                      value={renewalData.contactPhone}
                      onChange={(e) => setRenewalData({ ...renewalData, contactPhone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      console.log('Submitting renewal application:', renewalData);
                      setShowRenewalForm(false);
                    }}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                  >
                    Submit Application
                  </button>
                  <button
                    onClick={() => setShowRenewalForm(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LicenceStatus;