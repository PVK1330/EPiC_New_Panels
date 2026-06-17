import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";
import { getCosSummary, getComplianceSummary } from "../../services/licenceApi";
import { getBusinessPayments } from "../../services/businessProfileApi";
import { getSponsoredWorkers } from "../../services/sponsoredWorkerApi";
import { useToast } from "../../context/ToastContext";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const PERIOD_MAP = {
  "last-7-days":   "7d",
  "last-30-days":  "30d",
  "last-90-days":  "90d",
  "this-year":     "1y",
};

const StatCard = ({ label, value, color = "gray" }) => {
  const bg = {
    gray:    "bg-gray-50 border-gray-100",
    primary: "bg-primary/8 border-primary/15",
    amber:   "bg-amber-50 border-amber-100",
    red:     "bg-red-50 border-red-100",
    green:   "bg-emerald-50 border-emerald-100",
  }[color];

  const text = {
    gray:    "text-secondary",
    primary: "text-primary",
    amber:   "text-amber-700",
    red:     "text-red-700",
    green:   "text-emerald-700",
  }[color];

  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-xl font-black mt-1 ${text}`}>{value}</p>
    </div>
  );
};

const Reports = () => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState("cos-utilization");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [loading, setLoading] = useState(true);
  const [cosData, setCosData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [payments, setPayments] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const period = PERIOD_MAP[dateRange] || "30d";
        const [cosRes, workerRes, compRes, payRes] = await Promise.all([
          getCosSummary({ period }).catch(() => null),
          getSponsoredWorkers({ period }).catch(() => null),
          getComplianceSummary({ period }).catch(() => null),
          getBusinessPayments({ period }).catch(() => null),
        ]);
        setCosData(cosRes?.data?.data || null);
        setWorkers(workerRes?.data?.data || []);
        setCompliance(compRes?.data?.data || null);
        setPayments(payRes?.data?.data?.payments || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [dateRange]);

  const workerStats = useMemo(() => {
    const total = workers.length;
    const active = workers.filter((w) =>
      ["Active", "Approved", "Completed", "In Progress"].includes(w.status)
    ).length;
    const expiringSoon = workers.filter((w) => w.status === "Overdue").length;
    const byVisaType = workers.reduce((acc, w) => {
      const key = w.visaType || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { total, active, expiringSoon, byVisaType };
  }, [workers]);

  const financial = useMemo(() => {
    const completed = payments.filter((p) => p.paymentStatus === "completed");
    const totalRevenue      = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const pendingPayments   = payments.filter((p) => p.paymentStatus === "pending").reduce((s, p) => s + Number(p.amount || 0), 0);
    const paidThisMonth     = completed.reduce((s, p) => s + Number(p.amount || 0), 0);

    const avgProcessingTime = completed.length > 0
      ? Math.round(
          completed
            .filter((p) => p.paymentDate && p.dueDate)
            .reduce((sum, p) => {
              const diffMs = new Date(p.paymentDate) - new Date(p.dueDate);
              return sum + Math.abs(diffMs / (1000 * 60 * 60 * 24));
            }, 0) / (completed.filter((p) => p.paymentDate && p.dueDate).length || 1)
        )
      : null;

    return { totalRevenue, pendingPayments, paidThisMonth, avgProcessingTime };
  }, [payments]);

  const complianceStats = useMemo(
    () => ({
      score:              compliance?.complianceScore   || 0,
      riskLevel:          compliance?.riskLevel         || "Unknown",
      overdueReports:     compliance?.highRiskCount     || 0,
      upcomingDeadlines:  compliance?.mediumRiskCount   || 0,
    }),
    [compliance]
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { downloadCosSummaryExcel } = await import("../../services/downloadApi");
      const res = await downloadCosSummaryExcel();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${selectedReport}-${dateRange}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast({ message: "Export not available for this report", variant: "warning" });
    } finally {
      setDownloading(false);
    }
  };

  const tabs = [
    { id: "cos-utilization", label: "CoS Utilisation", icon: PieChart },
    { id: "worker",          label: "Workers",          icon: Users },
    { id: "compliance",      label: "Compliance",       icon: FileText },
    { id: "financial",       label: "Financial",        icon: DollarSign },
  ];

  const activeTab = tabs.find((t) => t.id === selectedReport);

  if (loading) {
    return (
      <div className="min-h-[360px] flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-500">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <BarChart3 className="text-primary shrink-0" size={26} />
          Reports
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          CoS, worker, compliance, and financial analytics.
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />

        <div className="p-5 space-y-4">
          {/* Report type tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  selectedReport === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter row + download */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="last-90-days">Last 90 days</option>
              <option value="this-year">This year</option>
            </select>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm disabled:opacity-60"
            >
              <Download size={13} className={downloading ? "animate-pulse" : ""} />
              {downloading ? "Exporting…" : "Download"}
            </button>
          </div>

          {/* Section heading */}
          <div className="flex items-center gap-2">
            {activeTab && <activeTab.icon size={16} className="text-primary" />}
            <h2 className="text-sm font-black text-secondary">{activeTab?.label}</h2>
          </div>

          {/* Stats grid */}
          {selectedReport === "cos-utilization" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total CoS"        value={cosData?.summary?.total     ?? 0} />
              <StatCard label="Used"             value={cosData?.summary?.used      ?? 0} />
              <StatCard label="Remaining"        value={cosData?.summary?.remaining ?? 0} />
              <StatCard
                label="Utilisation Rate"
                value={
                  cosData?.summary?.total
                    ? `${Math.round((cosData.summary.used / cosData.summary.total) * 100)}%`
                    : "0%"
                }
                color="primary"
              />
            </div>
          )}

          {selectedReport === "worker" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Workers"        value={workerStats.total}          />
                <StatCard label="Active"               value={workerStats.active}         color="green" />
                <StatCard label="Expiring / Overdue"   value={workerStats.expiringSoon}   color="amber" />
                <StatCard label="Visa Categories"      value={Object.keys(workerStats.byVisaType).length} />
              </div>
              {Object.keys(workerStats.byVisaType).length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Visa type breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(workerStats.byVisaType).map(([type, count]) => (
                      <span key={type} className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-black text-secondary">
                        {type} <span className="text-primary ml-1">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {selectedReport === "compliance" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Compliance Score"   value={`${complianceStats.score}/100`}       color="primary" />
              <StatCard label="Risk Level"         value={complianceStats.riskLevel}             color="green" />
              <StatCard label="Upcoming Checks"    value={complianceStats.upcomingDeadlines}     color="amber" />
              <StatCard label="High Risk Workers"  value={complianceStats.overdueReports}        color="red" />
            </div>
          )}

          {selectedReport === "financial" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Revenue"   value={`£${financial.totalRevenue.toLocaleString("en-GB")}`} />
              <StatCard label="Paid This Period" value={`£${financial.paidThisMonth.toLocaleString("en-GB")}`} color="green" />
              <StatCard label="Pending"          value={`£${financial.pendingPayments.toLocaleString("en-GB")}`} color="amber" />
              <StatCard
                label="Avg Processing"
                value={financial.avgProcessingTime != null ? `${financial.avgProcessingTime} days` : "N/A"}
              />
            </div>
          )}

          {/* Recent payments table (financial only) */}
          {selectedReport === "financial" && payments.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Recent transactions</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Reference</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Amount</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2 font-bold text-secondary truncate max-w-[140px]">
                          {p.transactionId || p.reference || `TXN-${i + 1}`}
                        </td>
                        <td className="px-3 py-2 font-black text-secondary">
                          £{Number(p.amount || 0).toLocaleString("en-GB")}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            p.paymentStatus === "completed" ? "bg-emerald-50 text-emerald-700"
                            : p.paymentStatus === "pending" ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                          }`}>
                            {p.paymentStatus || "unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
