import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBarChart2, FiDownload } from "react-icons/fi";
import { RiBarChartLine } from "react-icons/ri";
import { Loader2 } from "lucide-react";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const WORKLOAD_PATH = "/api/workload";

const TABS = [
  { id: "team", label: "Team Workload" },
  { id: "tasks", label: "Pending Tasks" },
  { id: "deadlines", label: "Deadline Monitor" },
];

function WorkloadMeter({ pct, barClass, warn, pctTextClass }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden max-w-[120px]">
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
  const { showToast } = useToast();
  const [tab, setTab] = useState("team");
  const [loading, setLoading] = useState(false);
  const [workloadData, setWorkloadData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [cases, setCases] = useState([]);

  // Map API data to UI format
 const mappedTeamRows = (workloadData || []).map((item, index) => {
  const name = item.caseworker_name || "Unknown";

  return {
    id: item.caseworker_id || index,
    name,
    initials: name.split(" ").map(n => n[0]).join("").toUpperCase(),
    avatarBg: "bg-green-500",
    activeCases: item.active_cases || 0,
    overdue: item.overdue || 0,
    overdueChip:
      item.overdue > 5
        ? "bg-red-100 text-red-700"
        : item.overdue > 0
        ? "bg-amber-100 text-amber-800"
        : "bg-green-100 text-green-700",
    tasksPending: item.tasks_pending || 0,
    avgCompletion: `${((item.avg_completion_time_days || 0) / 20 * 5).toFixed(1)} days`,
    workloadPct: item.workload_percentage || 0,
    barClass: "bg-green-500",
    warn: false,
    pctTextClass: "text-gray-700",
  };
});

  // Map pending tasks data to UI format
  const mappedTaskRows = pendingTasks.map((task) => {
    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const isOverdue = dueDate && dueDate < now;
    const isDueSoon = dueDate && !isOverdue && (dueDate - now) < (3 * 24 * 60 * 60 * 1000);
    
    return {
      id: task.id,
      task: task.title || task.description || 'Untitled Task',
      caseId: task.case_id ? `VF-${task.case_id}` : 'N/A',
      assigned: task.assigned_caseworker_name || 'Unassigned',
      due: dueDate ? dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date',
      dueClass: isOverdue ? 'text-red-600 font-bold' : isDueSoon ? 'text-amber-600 font-semibold' : 'text-gray-500',
      status: task.status || 'pending',
      statusClass: task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600',
    };
  });

  // Map cases data to deadline monitor format
  const mappedDeadlineRows = cases.map((caseItem) => {
    const now = new Date();
    
    // Handle different possible deadline field names from API
    let deadline = caseItem.deadline 
      ? new Date(caseItem.deadline) 
      : caseItem.target_submission_date
      ? new Date(caseItem.target_submission_date)
      : null;
    
    const daysRemaining = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null;
    
    let risk, riskClass, daysClass, deadlineClass;
    if (!deadline) {
      risk = 'No Deadline';
      riskClass = 'bg-gray-100 text-gray-600';
      daysClass = 'text-gray-500';
      deadlineClass = 'text-gray-500';
    } else if (daysRemaining < 0) {
      risk = 'Breached';
      riskClass = 'bg-red-100 text-red-700';
      daysClass = 'text-red-600 font-bold';
      deadlineClass = 'text-red-600 font-semibold';
    } else if (daysRemaining < 14) {
      risk = 'At Risk';
      riskClass = 'bg-amber-100 text-amber-800';
      daysClass = 'text-amber-600 font-bold';
      deadlineClass = 'text-amber-600 font-semibold';
    } else {
      risk = 'On Track';
      riskClass = 'bg-green-100 text-green-800';
      daysClass = 'text-green-600 font-bold';
      deadlineClass = 'text-green-600 font-semibold';
    }
    
    return {
      id: caseItem.id,
      caseId: caseItem.case_number || caseItem.caseId || `VF-${caseItem.id}`,
      candidate: caseItem.candidate_name || caseItem.candidate || 'Unknown',
      caseworker: caseItem.assigned_caseworker_name || caseItem.caseworker || 'Unassigned',
      deadline: deadline ? deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline',
      deadlineClass: deadlineClass,
      daysRemaining: daysRemaining !== null ? daysRemaining.toString() : 'N/A',
      daysClass: daysClass,
      risk: risk,
      riskClass: riskClass,
    };
  });

  

  useEffect(() => {
    if (tab === "tasks") {
      fetchPendingTasks();
    } else if (tab === "deadlines") {
      fetchCases();
    }
  }, [tab]);

  const fetchWorkloadData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${WORKLOAD_PATH}/team-workload`);
     const {caseworkers}= response.data.data
     setWorkloadData(caseworkers || []);     
    } catch (e) {
      console.error("Failed to fetch workload data:", e);
      setWorkloadData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkloadData();
  }, []);

  const fetchAlerts = async () => {
    // Function kept for potential future use
    try {
      // Can be implemented if needed
    } catch (e) {
      console.error("Failed to fetch alerts:", e);
    }
  };

  const fetchPendingTasks = async () => {
    try {
      const response = await api.get(`${WORKLOAD_PATH}/pending-tasks`);
      
      console.log("Pending tasks API response:", response.data);
      
      if (response.data?.status === "success") {
        const tasks = response.data.data?.tasks || response.data.data || [];
        setPendingTasks(Array.isArray(tasks) ? tasks : []);
      } else {
        console.log("API response status:", response.data?.status);
        setPendingTasks([]);
      }
    } catch (e) {
      console.error("Failed to fetch pending tasks:", e);
      setPendingTasks([]);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await api.get(`${WORKLOAD_PATH}/deadline-monitor`);
      
      console.log("Deadline monitor API response:", response.data);
      
      if (response.data?.status === "success") {
        const caseData = response.data.data?.cases || response.data.data || [];
        setCases(Array.isArray(caseData) ? caseData : []);
      } else {
        console.log("API response status:", response.data?.status);
        setCases([]);
      }
    } catch (e) {
      console.error("Failed to fetch deadline monitor:", e);
      setCases([]);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get(`${WORKLOAD_PATH}/export-report`, {
        responseType: "blob",
      });
      
      // Get filename from response header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `workload_report_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // Create and trigger download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast({ message: "Workload report exported successfully", variant: "success" });
      console.log("Report exported successfully:", filename);
    } catch (e) {
      console.error("Failed to export report:", e);
      showToast({ message: "Failed to export report", variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div className="space-y-6 pb-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
        <button type="button" onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0 self-start disabled:opacity-50 disabled:cursor-not-allowed">
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <FiDownload size={14} />} Export Report
        </button>
      </div>

      <SegmentedTabBar tabs={TABS} activeId={tab} onChange={setTab} layoutId="workload-tab-pill" />

      {tab === "team" && (
        <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiBarChart2 className="text-primary" size={18} />
            <h2 className="text-sm font-black text-secondary">Team workload</h2>
          </div>
          <div className="overflow-x-auto relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <Loader2 className="w-10 h-10 animate-spin text-secondary" />
              </div>
            )}
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {[
                    "Caseworker",
                    "Active Cases",
                    "Overdue",
                    "Tasks Pending",
                    "Avg Completion",
                    "Workload",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && mappedTeamRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No workload data available.</td>
                  </tr>
                ) : (
                  mappedTeamRows?.map((row) => (
                       <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${row.avatarBg}`}>{row.initials}</div>
                          <span className="text-sm font-bold text-secondary whitespace-nowrap">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 tabular-nums">{row.activeCases}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${row.overdueChip}`}>{row.overdue}</span></td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 tabular-nums">{row.tasksPending}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{row.avgCompletion}</td>
                      <td className="px-4 py-3"><WorkloadMeter pct={row.workloadPct} barClass={row.barClass} warn={row.warn} pctTextClass={row.pctTextClass} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "tasks" && (
        <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-secondary">Pending tasks</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tasks across open cases</p>
          </div>
          <div className="overflow-x-auto relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>
            )}
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Task", "Case", "Assigned To", "Due Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && mappedTaskRows.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No pending tasks found.</td></tr>
                ) : (
                  mappedTaskRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-secondary max-w-xs">{r.task}</td>
                      <td className="px-4 py-3"><Link to={`/admin/case-detail/${r.caseId}`} className="font-mono text-sm font-bold text-primary hover:underline">#{r.caseId}</Link></td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.assigned}</td>
                      <td className={`px-4 py-3 text-sm whitespace-nowrap ${r.dueClass}`}>{r.due}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.statusClass}`}>{r.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "deadlines" && (
        <motion.div key="deadlines" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-secondary">Deadline monitor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Case deadlines and risk</p>
          </div>
          <div className="overflow-x-auto relative min-h-[200px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>
            )}
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Case ID", "Candidate", "Caseworker", "Case Deadline", "Days Remaining", "Risk"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!loading && mappedDeadlineRows.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No deadline data available.</td></tr>
                ) : (
                  mappedDeadlineRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3"><Link to={`/admin/case-detail/${r.caseId}`} className="font-mono text-sm font-bold text-primary hover:underline">#{r.caseId}</Link></td>
                      <td className="px-4 py-3 text-sm font-semibold text-secondary whitespace-nowrap">{r.candidate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.caseworker}</td>
                      <td className={`px-4 py-3 text-sm whitespace-nowrap ${r.deadlineClass}`}>{r.deadline}</td>
                      <td className={`px-4 py-3 text-sm tabular-nums ${r.daysClass}`}>{r.daysRemaining}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.riskClass}`}>{r.risk}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminWorkload;
