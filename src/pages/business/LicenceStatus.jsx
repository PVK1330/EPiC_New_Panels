import { motion } from "framer-motion";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LicenceStatus = () => {
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
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" size={36} />
          Licence Status
        </h1>
        <p className="text-slate-600 font-medium text-sm mt-1">
          Track your licence status and renewals with ease. Stay informed, stay compliant.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-900">
            <Hash size={20} className="text-blue-600" />
            <span className="font-semibold">Licence No.</span>
          </div>
          <p className="text-xl font-black text-slate-900">LIC-2024-0987</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span className="font-semibold">Status</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Active
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-900">
            <Star size={20} className="text-amber-500" />
            <span className="font-semibold">Rating</span>
          </div>
          <p className="text-3xl font-black text-slate-900">A+</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-900">
            <Calendar size={20} className="text-red-600" />
            <span className="font-semibold">Expiry Date</span>
          </div>
          <p className="text-3xl font-black text-slate-900">12 Jul 2026</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-slate-900">
            <ShieldAlert size={20} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Licence Details</h2>
              <p className="text-sm text-slate-500">Overview of your sponsor licence information.</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <span className="font-semibold">Sponsor Licence No.</span>
              <span>LIC-2024-0987</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-semibold">Licence Type</span>
              <span>Standard</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-semibold">Assigned CoS</span>
              <span>18</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-semibold">Last Renewal</span>
              <span>12 Jul 2025</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-slate-900">
            <FileText size={20} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Licence Health</h2>
              <p className="text-sm text-slate-500">Compliance and renewal readiness summary.</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Compliance Score</span>
                <span className="font-semibold text-slate-900">92%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[92%] rounded-full bg-blue-600"></div>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Active Alerts</span>
                <span className="font-semibold text-amber-700">2 open</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Minor documentation action required before next renewal.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Renewal Readiness</span>
                <span className="font-semibold text-emerald-700">Good</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Licence is ready for renewal planning.</p>
            </div>
          </div>
          <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800">
            <RefreshCw size={18} />
            Renew Licence
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
      >
        <div className="flex items-center gap-3 mb-6 text-slate-900">
          <Clock size={20} className="text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Licence History</h2>
            <p className="text-sm text-slate-500">Recent events associated with your licence.</p>
          </div>
        </div>
        <div className="space-y-4">
          {historyData.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.event}</p>
                  <p className="text-sm text-slate-500">{item.details}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">{item.date}</span>
                </div>  
              </div>
              
              <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {item.status}
              </div>
              {item.status === "Pending" && (
                  <>
                  <button onClick={()=>navigate("/business/licenceprocess")} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200">
                    View Application
                  </button>
                  </>
                )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LicenceStatus;