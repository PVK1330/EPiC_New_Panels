import { motion } from "framer-motion";
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
  Eye,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const BusinessCompliance = () => {
  const stats = [
    {
      label: "Total Sponsored Workers",
      value: 45,
      icon: Users,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      label: "Expiring Visas (<60 days)",
      value: 12,
      icon: Bell,
      bg: "bg-amber-100",
      color: "text-amber-600",
    },
    {
      label: "Missing Documents",
      value: 5,
      icon: File,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      label: "Compliance Score",
      value: "94%",
      icon: CheckCircle,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    },
  ];

  const riskByWorkers = [
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

  const getStatusIcon = (status) => {
    if (status === "Completed" || status === "Safe")
      return <CheckCircle size={16} className="text-emerald-600" />;
    if (status === "In Progress" || status === "Pending")
      return <Clock size={16} className="text-amber-600" />;
    if (status === "Urgent" || status === "Critical" || status === "Expired")
      return <AlertCircle size={16} className="text-red-600" />;
    return <AlertTriangle size={16} className="text-amber-600" />;
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red-700 bg-red-100";
    if (priority === "Medium") return "text-amber-700 bg-amber-100";
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
    <div className="space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Compliance Dashboard
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Track your business compliance and worker visa status.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 ${bg} rounded-xl`}>
              <Icon className={`${color} h-6 w-6`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-secondary flex items-center gap-2">
              <UserRoundCog size={24} className="text-primary" />
              Flag by Worker
            </h3>
          </div>

          <div className="space-y-4">
            {riskByWorkers.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-secondary">
                      {item.name} - {item.visaType}
                    </h4>
                    <p className="text-xs font-bold text-gray-600 mt-1">
                      {item.issue}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">
                      Due: {item.expiryDate}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded ${getPriorityColor(
                        item.riskLevel
                      )}`}
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
        </motion.div>

        <motion.div
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-secondary flex items-center gap-2">
              <Calendar size={24} className="text-primary" />
              Upcoming Reporting Deadlines
            </h3>
          </div>

          <div className="space-y-4">
            {reportingDeadlines.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-secondary">
                      {item.workerName}
                    </h4>
                    <p className="text-xs font-bold text-gray-600 mt-1">
                      {item.reportType}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">
                      Deadline: {item.dueDate}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.daysLeft} days left
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
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessCompliance;