import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBarChart2, FiDownload } from "react-icons/fi";
import { RiBarChartLine } from "react-icons/ri";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";

const TABS = [
  { id: "team", label: "Team Workload" },
  { id: "tasks", label: "Pending Tasks" },
  { id: "deadlines", label: "Deadline Monitor" },
];

const TEAM_ROWS = [
  {
    id: "ap",
    name: "Alice Patel",
    initials: "AP",
    avatarBg: "bg-blue-500",
    activeCases: 21,
    overdue: 2,
    overdueChip: "bg-red-100 text-red-700",
    tasksPending: 8,
    avgCompletion: "4.2 days",
    workloadPct: 87,
    barClass: "bg-blue-500",
    warn: false,
    pctTextClass: "text-gray-700",
  },
  {
    id: "mg",
    name: "Marcus Green",
    initials: "MG",
    avatarBg: "bg-green-500",
    activeCases: 16,
    overdue: 5,
    overdueChip: "bg-amber-100 text-amber-800",
    tasksPending: 12,
    avgCompletion: "5.8 days",
    workloadPct: 65,
    barClass: "bg-amber-400",
    warn: false,
    pctTextClass: "text-gray-700",
  },
  {
    id: "fk",
    name: "Fatima Khan",
    initials: "FK",
    avatarBg: "bg-amber-500",
    activeCases: 18,
    overdue: 3,
    overdueChip: "bg-amber-100 text-amber-800",
    tasksPending: 6,
    avgCompletion: "3.9 days",
    workloadPct: 72,
    barClass: "bg-amber-400",
    warn: false,
    pctTextClass: "text-gray-700",
  },
  {
    id: "jo",
    name: "James Osei",
    initials: "JO",
    avatarBg: "bg-red-500",
    activeCases: 23,
    overdue: 8,
    overdueChip: "bg-red-100 text-red-700",
    tasksPending: 15,
    avgCompletion: "7.1 days",
    workloadPct: 92,
    barClass: "bg-red-500",
    warn: true,
    pctTextClass: "text-red-600 font-bold",
  },
  {
    id: "rm",
    name: "Rina Mehta",
    initials: "RM",
    avatarBg: "bg-purple-500",
    activeCases: 13,
    overdue: 0,
    overdueChip: "bg-green-100 text-green-700",
    tasksPending: 4,
    avgCompletion: "3.4 days",
    workloadPct: 50,
    barClass: "bg-green-500",
    warn: false,
    pctTextClass: "text-green-600 font-bold",
  },
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

const AdminWorkload = () => {
  const [tab, setTab] = useState("team");

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
                {TEAM_ROWS.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${row.avatarBg}`}>
                          {row.initials}
                        </div>
                        <span className="text-sm font-bold text-secondary whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 tabular-nums">{row.activeCases}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${row.overdueChip}`}>{row.overdue}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 tabular-nums">{row.tasksPending}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{row.avgCompletion}</td>
                    <td className="px-4 py-3">
                      <WorkloadMeter pct={row.workloadPct} barClass={row.barClass} warn={row.warn} pctTextClass={row.pctTextClass} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "tasks" && (
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
                {TASK_ROWS.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-secondary max-w-xs">{r.task}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/case-detail/${r.caseId}`} className="font-mono text-sm font-bold text-primary hover:underline">
                        #{r.caseId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.assigned}</td>
                    <td className={`px-4 py-3 text-sm whitespace-nowrap ${r.dueClass}`}>{r.due}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.statusClass}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "deadlines" && (
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
                {DEADLINE_ROWS.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/case-detail/${r.caseId}`} className="font-mono text-sm font-bold text-primary hover:underline">
                        #{r.caseId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-secondary whitespace-nowrap">{r.candidate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.caseworker}</td>
                    <td className={`px-4 py-3 text-sm whitespace-nowrap ${r.deadlineClass}`}>{r.deadline}</td>
                    <td className={`px-4 py-3 text-sm tabular-nums ${r.daysClass}`}>{r.daysRemaining}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.riskClass}`}>{r.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminWorkload;
