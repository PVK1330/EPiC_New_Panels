import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiDownload } from "react-icons/fi";
import { RiAlarmWarningLine } from "react-icons/ri";

const KPI = [
  { label: "Critical", value: 8, sub: "Immediate action", bg: "bg-red-50", border: "border-red-100", valueClass: "text-red-600" },
  { label: "High Severity", value: 15, sub: "This week", bg: "bg-amber-50", border: "border-amber-100", valueClass: "text-amber-600" },
  { label: "Medium", value: 18, sub: "Monitor closely", bg: "bg-blue-50", border: "border-blue-100", valueClass: "text-blue-600" },
  { label: "Resolved Today", value: 4, sub: "Good progress", bg: "bg-green-50", border: "border-green-100", valueClass: "text-green-600" },
];

const ROWS = [
  {
    id: "1",
    caseId: "VF-2835",
    candidate: "Li Wei",
    severity: "Critical",
    severityClass: "bg-red-100 text-red-700",
    trigger: "Deadline breach — ILR expired",
    admin: "Sarah Anand",
    daysOpen: "10 days",
    daysClass: "text-red-500 font-bold",
    status: "Open",
    statusClass: "bg-red-100 text-red-700",
  },
  {
    id: "2",
    caseId: "VF-2812",
    candidate: "Omar Farouk",
    severity: "High",
    severityClass: "bg-red-100 text-red-700",
    trigger: "Missing BRP — 12 days overdue",
    admin: "Mohamed Rashid",
    daysOpen: "12 days",
    daysClass: "text-red-500 font-bold",
    status: "In Progress",
    statusClass: "bg-amber-100 text-amber-800",
  },
  {
    id: "3",
    caseId: "VF-2801",
    candidate: "Ivan Petrov",
    severity: "High",
    severityClass: "bg-amber-100 text-amber-800",
    trigger: "Case stuck in Drafting 8+ days",
    admin: "Sarah Anand",
    daysOpen: "8 days",
    daysClass: "text-amber-600 font-bold",
    status: "Monitoring",
    statusClass: "bg-amber-100 text-amber-800",
  },
  {
    id: "4",
    caseId: "VF-2798",
    candidate: "Nia Osei",
    severity: "Medium",
    severityClass: "bg-blue-100 text-blue-800",
    trigger: "Payment outstanding 30 days",
    admin: "Janet Nwosu",
    daysOpen: "30 days",
    daysClass: "text-gray-500",
    status: "Chasing",
    statusClass: "bg-blue-100 text-blue-800",
  },
];

const SEVERITY_FILTER = ["All", "Critical", "High", "Medium", "Low"];
const TYPE_FILTER = ["All", "Deadline Breach", "Missing Docs", "Stuck Case"];

const AdminEscalations = () => {
  const [sev, setSev] = useState("All");
  const [typ, setTyp] = useState("All");

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      const matchSev = sev === "All" || r.severity === sev || (sev === "Critical" && r.severity === "Critical");
      const matchType =
        typ === "All" ||
        (typ === "Deadline Breach" && r.trigger.includes("Deadline")) ||
        (typ === "Missing Docs" && r.trigger.includes("BRP")) ||
        (typ === "Stuck Case" && r.trigger.includes("stuck"));
      return matchSev && matchType;
    });
  }, [sev, typ]);

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <RiAlarmWarningLine size={32} className="text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Escalations &amp; Red Flags</h1>
            <p className="text-sm text-gray-500 mt-0.5">41 active cases requiring urgent attention</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0 self-start"
        >
          <FiDownload size={14} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.bg} ${k.border}`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-3xl font-black ${k.valueClass}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">
          <select
            value={sev}
            onChange={(e) => setSev(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
          >
            {SEVERITY_FILTER.map((o) => (
              <option key={o} value={o === "All" ? "All" : o}>
                {o === "All" ? "All Severities" : o}
              </option>
            ))}
          </select>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
          >
            {TYPE_FILTER.map((o) => (
              <option key={o} value={o === "All" ? "All" : o}>
                {o === "All" ? "All Types" : o}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Case ID", "Candidate", "Severity", "Trigger Reason", "Assigned Admin", "Days Open", "Status", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h || " "}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-bold text-primary whitespace-nowrap">#{r.caseId}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-secondary whitespace-nowrap">{r.candidate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.severityClass}`}>{r.severity}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{r.trigger}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.admin}</td>
                  <td className={`px-4 py-3 text-xs font-mono whitespace-nowrap ${r.daysClass}`}>{r.daysOpen}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.statusClass}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/case-detail/${r.caseId}`}
                      className="inline-flex p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-blue-50 transition-colors"
                      title="View"
                    >
                      <FiEye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-gray-400">No escalations match your filters.</p>
        )}
      </div>
    </motion.div>
  );
};

export default AdminEscalations;
