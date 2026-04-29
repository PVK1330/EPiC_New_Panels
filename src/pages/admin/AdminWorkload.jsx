import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBarChart2, FiDownload } from "react-icons/fi";
import { RiBarChartLine } from "react-icons/ri";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";
import axios from "axios"
import { useEffect } from "react";


const TABS = [
  { id: "team", label: "Team Workload" },
  { id: "tasks", label: "Pending Tasks" },
  { id: "deadlines", label: "Deadline Monitor" },
];



const TASK_ROWS = [
  {
    id: "t1",
    task: "Submit online application",
    caseId: "VF-2841",
    assigned: "Alice Patel",
    due: "15 Apr 2026",
    dueClass: "text-amber-600 font-semibold",
    status: "In Progress",
    statusClass: "bg-amber-100 text-amber-800",
  },
  {
    id: "t2",
    task: "Chase missing bank statements",
    caseId: "VF-2841",
    assigned: "Alice Patel",
    due: "10 Apr 2026",
    dueClass: "text-red-600 font-bold",
    status: "Overdue",
    statusClass: "bg-red-100 text-red-700",
  },
  {
    id: "t3",
    task: "Verify sponsor compliance",
    caseId: "VF-2839",
    assigned: "Marcus Green",
    due: "20 Apr 2026",
    dueClass: "text-gray-500",
    status: "Pending",
    statusClass: "bg-gray-100 text-gray-600",
  },
  {
    id: "t4",
    task: "Prepare ILR submission pack",
    caseId: "VF-2830",
    assigned: "Alice Patel",
    due: "22 Apr 2026",
    dueClass: "text-gray-500",
    status: "Pending",
    statusClass: "bg-gray-100 text-gray-600",
  },
];

const DEADLINE_ROWS = [
  {
    id: "d1",
    caseId: "VF-2835",
    candidate: "Li Wei",
    caseworker: "James Osei",
    deadline: "28 Mar 2026",
    deadlineClass: "text-red-600 font-semibold",
    daysRemaining: "-10",
    daysClass: "text-red-600 font-bold",
    risk: "Breached",
    riskClass: "bg-red-100 text-red-700",
  },
  {
    id: "d2",
    caseId: "VF-2839",
    candidate: "James Okoye",
    caseworker: "Marcus Green",
    deadline: "20 Apr 2026",
    deadlineClass: "text-amber-600 font-semibold",
    daysRemaining: "13",
    daysClass: "text-amber-600 font-bold",
    risk: "At Risk",
    riskClass: "bg-amber-100 text-amber-800",
  },
  {
    id: "d3",
    caseId: "VF-2841",
    candidate: "Priya Sharma",
    caseworker: "Alice Patel",
    deadline: "14 May 2026",
    deadlineClass: "text-green-600 font-semibold",
    daysRemaining: "37",
    daysClass: "text-green-600 font-bold",
    risk: "On Track",
    riskClass: "bg-green-100 text-green-800",
  },
  {
    id: "d4",
    caseId: "VF-2828",
    candidate: "Sofia Rossi",
    caseworker: "Fatima Khan",
    deadline: "01 Sep 2026",
    deadlineClass: "text-green-600 font-semibold",
    daysRemaining: "147",
    daysClass: "text-green-600 font-bold",
    risk: "On Track",
    riskClass: "bg-green-100 text-green-800",
  },
];

function WorkloadMeter({ pct, barClass, warn, pctTextClass }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums whitespace-nowrap ${pctTextClass}`}>
        {pct}%{warn ? " ⚠" : ""}
      </span>
    </div>
  );
}

const getInitials = (name) => {
  return name
    ?.split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();
};

const getAvatarBg = (pct) => {
  if (pct >= 85) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-500";
  return "bg-green-500";
};

const getOverdueChip = (overdue) => {
  if (overdue === 0) return "bg-green-100 text-green-700";
  if (overdue <= 3) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const AdminWorkload = () => {
  const [tab, setTab] = useState("team");
  const [teamworkload, setteamworkload] = useState();
  const [pendingtasks, setpendingtasks] = useState();
  const [deadlinemonitor, setdeadlinemonitor] = useState();

  async function fetchWorkloadData() {
    const token = localStorage.getItem("token"); // Adjust if you store the token differently
    try {
      const response = await axios.get("http://localhost:5000/api/workload/team-workload", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { caseworkers } = response.data.data;
      setteamworkload(caseworkers);

    } catch (error) {
      console.error("Error fetching workload data:", error);
    }
  }
  async function fetchpendingtaskData() {
    const token = localStorage.getItem("token"); // Adjust if you store the token differently
    try {
      const response = await axios.get("http://localhost:5000/api/workload/pending-tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { tasks } = response.data.data
      setpendingtasks(tasks);
    } catch (error) {
      console.error("Error fetching workload data:", error);
    }
  }

  async function fetchdeadlineData() {
    const token = localStorage.getItem("token"); // Adjust if you store the token differently
    try {
      const response = await axios.get("http://localhost:5000/api/workload/deadline-monitor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { cases } = response.data.data
      setdeadlinemonitor(cases);
    } catch (error) {
      console.error("Error fetching workload data:", error);
    }
  }
async function fetchexportreportdata() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      "http://localhost:5000/api/workload/export-report",
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   // Create file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "workload-report.csv"); // change name if needed

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
    

    console.log("Downloaded successfully ✅");
  } catch (error) {
    console.error("Download error:", error);
  }
}

  useEffect(() => {
    fetchWorkloadData();
  }, []); // Empty dependency array means this runs once on mount



  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <RiBarChartLine className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Team Workload Monitoring</h1>
            <p className="text-sm text-gray-500 mt-0.5">Caseworker capacity, tasks and deadlines</p>
          </div>
        </div>
        <button
          type="button"
          onClick={()=> fetchexportreportdata()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0 self-start"
        >
          <FiDownload size={14} />
          Export Report
        </button>
      </div>

      <SegmentedTabBar tabs={TABS} activeId={tab} onChange={setTab} layoutId="workload-tab-pill" />

      {tab === "team" && (
        <motion.div
          key="team"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiBarChart2 className="text-primary" size={18} />
            <h2 className="text-sm font-black text-secondary">Team workload</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Caseworker", "Active Cases", "Overdue", "Tasks Pending", "Avg Completion", "Workload"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teamworkload?.map((item, index) => {
                  const row = {
                    id: item.caseworker_id || index,

                    name: item.caseworker_name,
                    initials: getInitials(item.caseworker_name),
                    avatarBg: getAvatarBg(item.workload_percentage),

                    activeCases: item.active_cases,
                    overdue: item.overdue,
                    overdueChip: getOverdueChip(item.overdue),

                    tasksPending: item.tasks_pending,
                    avgCompletion: `${item.avg_completion_time_days} days`,

                    workloadPct: item.workload_percentage,
                    barClass:
                      item.workload_percentage >= 85
                        ? "bg-red-500"
                        : item.workload_percentage >= 70
                          ? "bg-yellow-500"
                          : "bg-green-500",

                    warn: item.workload_percentage >= 90,
                    pctTextClass:
                      item.workload_percentage >= 85
                        ? "text-red-600"
                        : "text-gray-700",
                  };

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black ${row.avatarBg}`}>
                            {row.initials}
                          </div>
                          <span className="text-sm font-bold text-secondary">
                            {row.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">{row.activeCases}</td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${row.overdueChip}`}>
                          {row.overdue}
                        </span>
                      </td>

                      <td className="px-4 py-3">{row.tasksPending}</td>

                      <td className="px-4 py-3">{row.avgCompletion}</td>

                      <td className="px-4 py-3">
                        <WorkloadMeter
                          pct={row.workloadPct}
                          barClass={row.barClass}
                          warn={row.warn}
                          pctTextClass={row.pctTextClass}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "tasks" && fetchpendingtaskData()&& (
        <motion.div
          key="tasks"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-secondary">Pending tasks</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tasks across open cases</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Task", "Case", "Assigned To", "Due Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingtasks?.map((item, index) => {
                  const isOverdue = item.days_remaining < 0;

                  const formattedDate = new Date(item.due_date).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                  );

                  const statusConfig = {
                    pending: "bg-gray-100 text-gray-600",
                    "in progress": "bg-yellow-100 text-yellow-700",
                    completed: "bg-green-100 text-green-700",
                    overdue: "bg-red-100 text-red-600",
                  };

                  const statusText = isOverdue
                    ? "Overdue"
                    : item.status === "pending"
                      ? "Pending"
                      : item.status === "in_progress"
                        ? "In Progress"
                        : item.status;

                  const statusClass = isOverdue
                    ? statusConfig.overdue
                    : statusConfig[item.status] || "bg-gray-100 text-gray-600";

                  return (
                    <tr key={item.task_id || index} className="hover:bg-gray-50/80">

                      {/* TASK */}
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {item.title}
                      </td>

                      {/* CASE */}
                      <td className="px-4 py-3 text-sm font-bold text-red-500">
                        #{item.case_code}
                      </td>

                      {/* ASSIGNED TO */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.assigned_to}
                      </td>

                      {/* DUE DATE */}
                      <td
                        className={`px-4 py-3 text-sm font-semibold ${isOverdue ? "text-red-600" : "text-gray-600"
                          }`}
                      >
                        {formattedDate}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}
                        >
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div> 
      )}

      {tab === "deadlines" && fetchdeadlineData() && (
        <motion.div
          key="deadlines"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-secondary">Deadline monitor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Case deadlines and risk</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Case ID", "Candidate", "Caseworker", "Case Deadline", "Days Remaining", "Risk"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deadlinemonitor?.map((item, index) => {
                  const days = item.days_remaining;

                  // Format date like "28 Mar 2026"
                  const formattedDate = new Date(item.deadline).toLocaleDateString(
                    "en-GB",
                    { day: "2-digit", month: "short", year: "numeric" }
                  );

                  // Risk logic
                  let riskText = "On Track";
                  let riskClass = "bg-green-100 text-green-700";
                  let daysClass = "text-green-600";

                  if (days < 0) {
                    riskText = "Breached";
                    riskClass = "bg-red-100 text-red-600";
                    daysClass = "text-red-600";
                  } else if (days <= 15) {
                    riskText = "At Risk";
                    riskClass = "bg-yellow-100 text-yellow-700";
                    daysClass = "text-yellow-600";
                  }

                  return (
                    <tr key={item.case_id || index} className="hover:bg-gray-50/80">

                      {/* CASE ID */}
                      <td className="px-4 py-3 text-sm font-bold text-red-500">
                        #{item.case_code}
                      </td>

                      {/* CANDIDATE */}
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {item.candidate_name}
                      </td>

                      {/* CASEWORKER */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.caseworker_name || "N/A"}
                      </td>

                      {/* DEADLINE */}
                      <td className={`px-4 py-3 text-sm font-semibold ${daysClass}`}>
                        {formattedDate}
                      </td>

                      {/* DAYS REMAINING */}
                      <td className={`px-4 py-3 text-sm font-bold ${daysClass}`}>
                        {days}
                      </td>

                      {/* RISK */}
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskClass}`}>
                          {riskText}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminWorkload;
