import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, PieChart, Users, FileText, DollarSign, Calendar, Download, Loader2 } from "lucide-react";
import { getCosSummary, getComplianceSummary } from "../../services/licenceApi";
import { getBusinessPayments } from "../../services/businessProfileApi";
import { getSponsoredWorkers } from "../../services/sponsoredWorkerApi";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("cos-utilization");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [loading, setLoading] = useState(true);
  const [cosData, setCosData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cosRes, workerRes, compRes, payRes] = await Promise.all([
          getCosSummary().catch(() => null),
          getSponsoredWorkers().catch(() => null),
          getComplianceSummary().catch(() => null),
          getBusinessPayments().catch(() => null),
        ]);
        setCosData(cosRes?.data?.data || null);
        setWorkers(workerRes?.data?.data || []);
        setCompliance(compRes?.data?.data || null);
        setPayments(payRes?.data?.data?.payments || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const reports = [
    { id: "cos-utilization", label: "CoS Utilisation", icon: PieChart, description: "Track CoS allocation and usage patterns" },
    { id: "worker", label: "Worker Reports", icon: Users, description: "Sponsored worker statistics and visa mix" },
    { id: "compliance", label: "Compliance Reports", icon: FileText, description: "Compliance score and risk analysis" },
    { id: "financial", label: "Financial Reports", icon: DollarSign, description: "Invoices, payments, and costs" },
  ];

  const workerStats = useMemo(() => {
    const total = workers.length;
    const active = workers.filter((w) => ["Active", "Approved", "Completed", "In Progress"].includes(w.status)).length;
    const expiringSoon = workers.filter((w) => w.status === "Overdue").length;
    const byVisaType = workers.reduce((acc, w) => {
      const key = w.visaType || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { total, active, onLeave: 0, expiringSoon, byVisaType };
  }, [workers]);

  const financial = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingPayments = payments.filter((p) => p.paymentStatus === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paidThisMonth = payments
      .filter((p) => p.paymentStatus === "completed")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { totalRevenue, pendingPayments, paidThisMonth, avgProcessingTime: 5 };
  }, [payments]);

  const complianceStats = useMemo(
    () => ({
      score: compliance?.complianceScore || 0,
      riskLevel: compliance?.riskLevel || "Unknown",
      missingDocs: 0,
      overdueReports: compliance?.highRiskCount || 0,
      upcomingDeadlines: compliance?.mediumRiskCount || 0,
    }),
    [compliance]
  );

  if (loading) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Reports
        </h1>
        <p className="text-primary font-bold text-sm mt-1">Visa case, CoS, compliance, and finance analytics.</p>
      </motion.div>

      <motion.div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm" variants={cardVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reports.map((report) => (
            <motion.div key={report.id} variants={cardVariants} onClick={() => setSelectedReport(report.id)} className={`p-4 rounded-xl cursor-pointer transition-all ${selectedReport === report.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}>
              <div className="flex items-center gap-3 mb-2">
                <report.icon size={20} />
                <span className="text-sm font-black">{report.label}</span>
              </div>
              <p className="text-[10px] font-bold opacity-80">{report.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm" variants={cardVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800">
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="this-year">This Year</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark ml-auto">
            <Download size={16} />
            Download Report
          </button>
        </div>
      </motion.div>

      <motion.div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm" variants={cardVariants} initial="hidden" animate="visible">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-secondary flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            {reports.find((r) => r.id === selectedReport)?.label}
          </h2>
        </div>

        {selectedReport === "cos-utilization" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Total CoS</p><p className="text-2xl font-black text-secondary mt-1">{cosData?.summary?.total || 0}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Used</p><p className="text-2xl font-black text-secondary mt-1">{cosData?.summary?.used || 0}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Remaining</p><p className="text-2xl font-black text-secondary mt-1">{cosData?.summary?.remaining || 0}</p></div>
            <div className="p-4 bg-primary/10 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Utilisation Rate</p><p className="text-2xl font-black text-primary mt-1">{cosData?.summary?.total ? Math.round((cosData.summary.used / cosData.summary.total) * 100) : 0}%</p></div>
          </div>
        )}

        {selectedReport === "worker" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Total Workers</p><p className="text-2xl font-black text-secondary mt-1">{workerStats.total}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Active</p><p className="text-2xl font-black text-secondary mt-1">{workerStats.active}</p></div>
            <div className="p-4 bg-amber-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Expiring / Overdue</p><p className="text-2xl font-black text-amber-700 mt-1">{workerStats.expiringSoon}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Visa Categories</p><p className="text-2xl font-black text-secondary mt-1">{Object.keys(workerStats.byVisaType).length}</p></div>
          </div>
        )}

        {selectedReport === "compliance" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Compliance Score</p><p className="text-2xl font-black text-primary mt-1">{complianceStats.score}/100</p></div>
            <div className="p-4 bg-emerald-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Risk Level</p><p className="text-2xl font-black text-emerald-700 mt-1">{complianceStats.riskLevel}</p></div>
            <div className="p-4 bg-amber-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Upcoming Checks</p><p className="text-2xl font-black text-amber-700 mt-1">{complianceStats.upcomingDeadlines}</p></div>
            <div className="p-4 bg-red-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">High Risk Workers</p><p className="text-2xl font-black text-red-700 mt-1">{complianceStats.overdueReports}</p></div>
          </div>
        )}

        {selectedReport === "financial" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Total Revenue</p><p className="text-2xl font-black text-secondary mt-1">£{financial.totalRevenue.toLocaleString("en-GB")}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Paid This Period</p><p className="text-2xl font-black text-secondary mt-1">£{financial.paidThisMonth.toLocaleString("en-GB")}</p></div>
            <div className="p-4 bg-amber-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Pending Payments</p><p className="text-2xl font-black text-amber-700 mt-1">£{financial.pendingPayments.toLocaleString("en-GB")}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] font-bold text-gray-500 uppercase">Avg Processing</p><p className="text-2xl font-black text-secondary mt-1">{financial.avgProcessingTime} days</p></div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reports;
