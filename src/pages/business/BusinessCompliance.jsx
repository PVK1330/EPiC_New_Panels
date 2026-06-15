import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  File,
  UserRoundCog,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { getComplianceSummary, getReportingObligations } from "../../services/licenceApi";
import { formatDate } from "../../utils/datetime";

const DEFAULT_RISK_ROWS = [
  {
    id: 1,
    name: "John Doe",
    visaType: "Skilled Worker Visa",
    riskLevel: "High",
    issue: "Visa expiring in 5 days",
    expiryDate: "2026-04-15",
    status: "Critical",
  },
  {
    id: 2,
    name: "Priya Sharma",
    visaType: "Student Visa",
    riskLevel: "Medium",
    issue: "Passport expiring soon",
    expiryDate: "2026-05-10",
    status: "Warning",
  },
  {
    id: 3,
    name: "Michael Lee",
    visaType: "Health Care Visa",
    riskLevel: "Low",
    issue: "All documents valid",
    expiryDate: "2027-01-20",
    status: "Safe",
  },
  {
    id: 4,
    name: "Amit Patel",
    visaType: "Skilled Worker Visa",
    riskLevel: "High",
    issue: "Missing employment contract",
    expiryDate: "N/A",
    status: "Critical",
  },
  {
    id: 5,
    name: "Sara Khan",
    visaType: "Dependent Visa",
    riskLevel: "Medium",
    issue: "Visa renewal pending",
    expiryDate: "2026-06-01",
    status: "Pending",
  },
  {
    id: 6,
    name: "David Brown",
    visaType: "Work Permit Visa",
    riskLevel: "High",
    issue: "Visa already expired",
    expiryDate: "2026-03-30",
    status: "Expired",
  },
];

const reportingDeadlines = [
  {
    id: 1,
    workerName: "John Doe",
    reportType: "Visa Renewal Report",
    dueDate: "2026-04-15",
    daysLeft: 6,
    priority: "High",
    status: "Pending",
  },
  {
    id: 2,
    workerName: "Priya Sharma",
    reportType: "Document Verification",
    dueDate: "2026-04-20",
    daysLeft: 11,
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: 3,
    workerName: "Michael Lee",
    reportType: "Annual Compliance Report",
    dueDate: "2026-05-01",
    daysLeft: 22,
    priority: "Low",
    status: "Not Started",
  },
  {
    id: 4,
    workerName: "Amit Patel",
    reportType: "Work Permit Renewal",
    dueDate: "2026-04-12",
    daysLeft: 3,
    priority: "High",
    status: "Urgent",
  },
  {
    id: 5,
    workerName: "Sara Khan",
    reportType: "Address Verification",
    dueDate: "2026-04-25",
    daysLeft: 16,
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 6,
    workerName: "David Brown",
    reportType: "Visa Expiry Submission",
    dueDate: "2026-04-10",
    daysLeft: 1,
    priority: "High",
    status: "Critical",
  },
];

const BusinessCompliance = () => {
  const [data, setData] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getComplianceSummary(),
      getReportingObligations()
    ])
      .then(([summaryRes, obligationsRes]) => {
        setData(summaryRes.data?.data ?? null);
        setDeadlines(obligationsRes.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const riskByWorkers = useMemo(() => {
    const rows = data?.workers;
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map((worker, idx) => {
      const rl =
        worker.riskFlag === "high"
          ? "High"
          : worker.riskFlag === "medium"
            ? "Medium"
            : worker.riskFlag === "low"
              ? "Low"
              : "Unknown";
      const issue =
        worker.daysToExpiry !== null && worker.daysToExpiry !== undefined
          ? `Visa days remaining: ${worker.daysToExpiry}`
          : worker.riskFlag === "unknown"
            ? "Visa expiry not on file"
            : "Review visa dates";
      const expiryDate =
        worker.visaExpiry != null
          ? formatDate(worker.visaExpiry)
          : "N/A";
      const status =
        worker.riskFlag === "high"
          ? "Critical"
          : worker.riskFlag === "medium"
            ? "Warning"
            : worker.riskFlag === "low"
              ? "Safe"
              : "Pending";

      return {
        id: worker.caseId || idx,
        name: worker.candidateName || "Worker",
        visaType: worker.visaType || "Unknown",
        riskLevel: rl,
        issue,
        expiryDate,
        status,
      };
    });
  }, [data]);

  const stats = useMemo(() => {
    const placeholder = loading ? "…" : "—";
    if (!data) {
      return [
        {
          label: "Total Sponsored Workers",
          value: placeholder,
          icon: Users,
          bg: "bg-primary/10",
          color: "text-primary",
        },
        {
          label: "Expiring visas (≤60 days)",
          value: placeholder,
          icon: Bell,
          bg: "bg-amber-100",
          color: "text-amber-600",
        },
        {
          label: "Elevated risk (medium + high)",
          value: placeholder,
          icon: File,
          bg: "bg-red-100",
          color: "text-red-600",
        },
        {
          label: "Compliance score",
          value: placeholder,
          icon: CheckCircle,
          bg: "bg-emerald-100",
          color: "text-emerald-600",
        },
      ];
    }

    const med = data.mediumRiskCount ?? 0;
    const hi = data.highRiskCount ?? 0;
    return [
      {
        label: "Total Sponsored Workers",
        value: data.totalWorkers ?? data.workers?.length ?? 0,
        icon: Users,
        bg: "bg-primary/10",
        color: "text-primary",
      },
      {
        label: "Expiring visas (≤60 days)",
        value: data.expiringSoon ?? 0,
        icon: Bell,
        bg: "bg-amber-100",
        color: "text-amber-600",
      },
      {
        label: "Elevated risk (medium + high)",
        value: hi + med,
        icon: File,
        bg: "bg-red-100",
        color: "text-red-600",
      },
      {
        label: "Compliance score",
        value: `${Number(data.complianceScore ?? 0)}%`,
        icon: CheckCircle,
        bg: "bg-emerald-100",
        color: "text-emerald-600",
      },
    ];
  }, [data, loading]);

  const getStatusIcon = (status) => {
    if (status === "Completed" || status === "Safe")
      return <CheckCircle size={16} className="text-emerald-600" />;
    if (
      status === "In Progress" ||
      status === "Pending" ||
      status === "Not Started" ||
      status === "Warning"
    )
      return <Clock size={16} className="text-amber-600" />;
    if (
      status === "Urgent" ||
      status === "Critical" ||
      status === "Expired" ||
      status === "Overdue"
    )
      return <AlertCircle size={16} className="text-red-600" />;
    return <AlertTriangle size={16} className="text-amber-600" />;
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red-700 bg-red-100";
    if (priority === "Medium") return "text-amber-700 bg-amber-100";
    if (priority === "Unknown") return "text-gray-700 bg-gray-100";
    return "text-emerald-700 bg-emerald-100";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-5 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          Compliance Dashboard
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Track your business compliance and worker visa status.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex items-center gap-3"
          >
            <div className={`p-2 ${bg} rounded-lg`}>
              <Icon className={`${color} h-5 w-5`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</p>
              <p className="text-xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                <UserRoundCog size={15} className="text-primary" />
                Flag by Worker
              </h3>
            </div>

            <div className="space-y-3">
              {riskByWorkers.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-secondary">
                        {item.name} - {item.visaType}
                      </h4>
                      <p className="text-xs font-bold text-gray-600 mt-1">{item.issue}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Due: {item.expiryDate}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 ml-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getPriorityColor(item.riskLevel)}`}
                      >
                        {item.riskLevel}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                Upcoming Reporting Deadlines
              </h3>
            </div>

            <div className="space-y-3">
              {deadlines.length > 0 ? (
                deadlines.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-secondary">{item.worker}</h4>
                        <p className="text-xs font-bold text-gray-600 mt-1">{item.eventType}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-1">Deadline: {item.deadline}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 ml-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getPriorityColor(
                            item.risk === 'high' ? 'High' : item.risk === 'medium' ? 'Medium' : 'Low'
                          )}`}
                        >
                          {item.daysRemaining < 0 ? 'Overdue' : `${item.daysRemaining} days left`}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-gray-400 italic">No upcoming reporting deadlines.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessCompliance;
