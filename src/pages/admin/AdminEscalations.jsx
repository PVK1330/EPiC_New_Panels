import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiDownload, FiPlus } from "react-icons/fi";
import { RiAlarmWarningLine } from "react-icons/ri";
import { Loader2, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getEscalations, createEscalation } from "../../services/escalationApi";

const SEVERITY_FILTER = ["All", "Critical", "High", "Medium", "Low"];
const TYPE_FILTER = ["All", "Deadline Breach", "Missing Docs", "Stuck Case"];

const AdminEscalations = () => {
  const { showToast } = useToast();
  const [sev, setSev] = useState("All");
  const [typ, setTyp] = useState("All");
  const [loading, setLoading] = useState(false);
  const [escalations, setEscalations] = useState([]);
  const [kpi, setKpi] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    resolvedToday: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    caseId: "",
    candidate: "",
    severity: "Medium",
    trigger: "",
    triggerType: "Other",
    assignedAdminId: "",
    relatedCaseId: "",
    notes: "",
  });

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const res = await getEscalations();
      console.log("Escalations API response:", res);
      if (res.data?.status === "success") {
        const data = res.data.data;
        setEscalations(data.escalations || []);
        setKpi(data.kpi || { critical: 0, high: 0, medium: 0, resolvedToday: 0 });
      }
    } catch (e) {
      console.error("Failed to fetch escalations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEscalation = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createEscalation(formData);
      if (res.data?.status === "success") {
        showToast({
          message: "Escalation created successfully",
          variant: "success",
        });
        setShowModal(false);
        setFormData({
          caseId: "",
          candidate: "",
          severity: "Medium",
          trigger: "",
          triggerType: "Other",
          assignedAdminId: "",
          relatedCaseId: "",
          notes: "",
        });
        fetchEscalations();
      }
    } catch (e) {
      console.error("Failed to create escalation:", e);
      showToast({
        message: "Failed to create escalation",
        variant: "danger",
      });
    } finally {
      setCreating(false);
    }
  };

  // Map API data to UI format
  const mappedKPI = [
    { label: "Critical", value: kpi.critical, sub: "Immediate action", bg: "bg-red-50", border: "border-red-100", valueClass: "text-red-600" },
    { label: "High Severity", value: kpi.high, sub: "This week", bg: "bg-amber-50", border: "border-amber-100", valueClass: "text-amber-600" },
    { label: "Medium", value: kpi.medium, sub: "Monitor closely", bg: "bg-blue-50", border: "border-blue-100", valueClass: "text-blue-600" },
    { label: "Resolved Today", value: kpi.resolvedToday, sub: "Good progress", bg: "bg-green-50", border: "border-green-100", valueClass: "text-green-600" },
  ];

  const mappedRows = escalations.map((esc) => {
    const severityClass = esc.severity === "Critical" ? "bg-red-100 text-red-700" : esc.severity === "High" ? "bg-amber-100 text-amber-800" : esc.severity === "Medium" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600";
    const statusClass = esc.status === "Resolved" ? "bg-green-100 text-green-800" : esc.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700";
    const daysClass = esc.daysOpen > 10 ? "text-red-500 font-bold" : esc.daysOpen > 5 ? "text-amber-600 font-bold" : "text-gray-500";
    
    return {
      id: esc.id,
      caseId: esc.caseId || `VF-${esc.relatedCaseId}`,
      candidate: esc.candidate || "Unknown",
      severity: esc.severity,
      severityClass: severityClass,
      trigger: esc.trigger,
      admin: esc.assignedAdmin ? `${esc.assignedAdmin.first_name} ${esc.assignedAdmin.last_name}` : "Unassigned",
      daysOpen: `${esc.daysOpen} days`,
      daysClass: daysClass,
      status: esc.status,
      statusClass: statusClass,
    };
  });

  const filtered = useMemo(() => {
    return mappedRows.filter((r) => {
      const matchSev = sev === "All" || r.severity === sev || (sev === "Critical" && r.severity === "Critical");
      const matchType =
        typ === "All" ||
        (typ === "Deadline Breach" && r.trigger.includes("Deadline")) ||
        (typ === "Missing Docs" && r.trigger.includes("BRP")) ||
        (typ === "Stuck Case" && r.trigger.includes("stuck"));
      return matchSev && matchType;
    });
  }, [sev, typ, mappedRows]);

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
            <p className="text-sm text-gray-500 mt-0.5">{escalations.length} active cases requiring urgent attention</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-secondary border border-secondary rounded-xl hover:bg-secondary/90 transition-colors shadow-sm shrink-0 self-start"
          >
            <FiPlus size={14} />
            Create Escalation
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0 self-start"
          >
            <FiDownload size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mappedKPI.map((k) => (
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

        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
          )}
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
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    No escalations match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-secondary">Create New Escalation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEscalation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Case ID</label>
                <input
                  type="text"
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm"
                  placeholder="e.g., VF-2835"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={formData.candidate}
                  onChange={(e) => setFormData({ ...formData, candidate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Trigger Reason</label>
                <textarea
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm resize-none"
                  rows={3}
                  placeholder="Describe the escalation reason..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Trigger Type</label>
                <select
                  value={formData.triggerType}
                  onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm bg-white"
                >
                  <option value="Deadline Breach">Deadline Breach</option>
                  <option value="Missing Docs">Missing Docs</option>
                  <option value="Stuck Case">Stuck Case</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Related Case ID</label>
                <input
                  type="text"
                  value={formData.relatedCaseId}
                  onChange={(e) => setFormData({ ...formData, relatedCaseId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm"
                  placeholder="Related case ID (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm resize-none"
                  rows={2}
                  placeholder="Additional notes (optional)"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-secondary border border-secondary rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Escalation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminEscalations;
