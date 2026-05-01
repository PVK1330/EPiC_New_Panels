import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  CheckCircle,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  Briefcase,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { getBusinessDashboard, getBusinessCases } from "../../services/businessProfileApi";
import { getSponsoredWorkers } from "../../services/sponsoredWorkerApi";
import { getNotifications } from "../../services/notificationApi";

const getStatusIcon = (status) => {
  if (status === "Completed") return <CheckCircle size={16} className="text-green-600" />;
  if (status === "In Progress") return <Clock size={16} className="text-blue-600" />;
  return <AlertTriangle size={16} className="text-yellow-600" />;
};

const getPriorityColor = (priority) => {
  if (priority === "High") return "text-red-600 bg-red-100";
  if (priority === "Medium") return "text-yellow-600 bg-yellow-100";
  return "text-green-600 bg-green-100";
};

export default function BusinessDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [cases, setCases] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dRes, cRes, wRes, nRes] = await Promise.all([
          getBusinessDashboard().catch(() => null),
          getBusinessCases({ limit: 5 }).catch(() => null),
          getSponsoredWorkers().catch(() => null),
          getNotifications({ limit: 6 }).catch(() => null),
        ]);
        setDashboard(dRes?.data?.data || null);
        setCases(cRes?.data?.data?.cases || []);
        setWorkers(wRes?.data?.data || []);
        setNotifications(nRes?.data?.data?.notifications || nRes?.data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Active Workers",
        value: dashboard?.stats?.activeCases ?? workers.length,
        icon: Users,
        bg: "bg-blue-100",
        color: "text-blue-600",
      },
      {
        label: "Pending Licence Cases",
        value: dashboard?.stats?.pendingLicenceApplications ?? 0,
        icon: Inbox,
        bg: "bg-orange-100",
        color: "text-orange-600",
      },
      {
        label: "Total Cases",
        value: dashboard?.stats?.totalWorkers ?? cases.length,
        icon: CheckCircle,
        bg: "bg-green-100",
        color: "text-green-600",
      },
      {
        label: "Overdue Cases",
        value: dashboard?.stats?.overdueCount ?? 0,
        icon: Clock,
        bg: "bg-yellow-100",
        color: "text-yellow-600",
      },
      {
        label: "Licence Status",
        value: dashboard?.licenceStatus || "Pending",
        icon: ShieldCheck,
        bg: "bg-purple-100",
        color: "text-purple-600",
      },
    ],
    [dashboard, workers.length, cases.length]
  );

  const remindersData = useMemo(() => {
    const items = [];
    if (dashboard?.licenceExpiry?.date) {
      const days = dashboard.licenceExpiry.daysRemaining ?? 999;
      items.push({
        id: "licence-expiry",
        title: "Sponsor Licence Expiry",
        description: `${days} day(s) remaining`,
        dueDate: new Date(dashboard.licenceExpiry.date).toLocaleDateString("en-GB"),
        priority: days < 30 ? "High" : "Medium",
        status: dashboard.licenceExpiry.renewalDue ? "Pending" : "In Progress",
      });
    }
    if ((dashboard?.stats?.overdueCount ?? 0) > 0) {
      items.push({
        id: "overdue",
        title: "Caseworker Follow-up Required",
        description: `${dashboard.stats.overdueCount} case(s) overdue`,
        dueDate: "Immediate",
        priority: "High",
        status: "Overdue",
      });
    }
    return items;
  }, [dashboard]);

  const workerRows = useMemo(
    () =>
      workers.slice(0, 6).map((w) => ({
        id: w.id,
        name: `${w.candidate?.first_name || ""} ${w.candidate?.last_name || ""}`.trim() || "Worker",
        visaType: w.visaType || "Unknown",
        cosNumber: w.caseId || "N/A",
        jobTitle: w.jobTitle || "Not assigned",
        visaExpiry: w.created_at ? new Date(w.created_at).toLocaleDateString("en-GB") : "N/A",
        status: w.status || "Pending",
      })),
    [workers]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-600">Loading sponsor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-red-600" size={36} />
          Business Dashboard
        </h1>
        <p className="text-primary font-bold text-sm mt-1">Manage your business operations and workers.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants} initial="hidden" animate="visible">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <motion.div key={label} variants={cardVariants} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-secondary flex items-center gap-2">
              <Bell size={25} className="text-primary" /> Compliance Reminders
            </h3>
          </div>
          <div className="space-y-4">
            {remindersData.length === 0 && <p className="text-xs font-bold text-gray-500 px-4 py-6">No urgent compliance reminders.</p>}
            {remindersData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-secondary">{item.title}</h4>
                    <p className="text-xs font-bold text-gray-500">{item.description}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">Due: {item.dueDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${getPriorityColor(item.priority)}`}>{item.priority}</span>
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

        <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white p-5 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-secondary flex items-center gap-2">
                <Briefcase size={25} className="text-primary" /> Active Cases
              </h3>
            </div>
            <div className="space-y-4">
              {cases.length === 0 && <p className="text-xs font-bold text-gray-500 px-4 py-6">No active cases yet.</p>}
              {cases.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-secondary">
                        {`${item.candidate?.first_name || ""} ${item.candidate?.last_name || ""}`.trim() || "Candidate"}
                      </h4>
                      <p className="text-xs font-bold text-gray-500">{item.jobTitle || "Case in progress"}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Case ID: {item.caseId || "N/A"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${getPriorityColor(item.status === "Overdue" ? "High" : "Medium")}`}>
                        {item.status === "Overdue" ? "High" : "Medium"}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        {getStatusIcon(item.status || "Pending")}
                        {item.status || "Pending"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-secondary flex items-center gap-2">
            <Users size={25} className="text-primary" /> Recent Sponsored Workers
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Worker Name</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Case Ref</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Job Title</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Added On</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workerRows.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-black text-secondary">{worker.name}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.visaType}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.cosNumber}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.jobTitle}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.visaExpiry}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${worker.status === "Active" ? "bg-green-100 text-green-700" : worker.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
              {workerRows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-xs font-bold text-gray-500" colSpan={6}>
                    No sponsored workers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-secondary flex items-center gap-2">
            <Bell size={25} className="text-primary" /> New Updates and Notifications
          </h3>
        </div>
        <div className="space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-secondary">{item.title}</h4>
                  <p className="text-xs font-bold text-gray-500">{item.message}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("en-GB") : "Recent update"}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${getPriorityColor(item.priority === "high" ? "High" : item.priority === "medium" ? "Medium" : "Low")}`}>
                  {item.priority === "high" ? "High" : item.priority === "medium" ? "Medium" : "Low"}
                </span>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-xs font-bold text-gray-500 px-4 py-6">No notifications yet.</p>}
        </div>
      </motion.div>
    </div>
  );
}
