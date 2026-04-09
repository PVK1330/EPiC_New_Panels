import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("cos-utilization");
  const [dateRange, setDateRange] = useState("last-30-days");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const reports = [
    { id: "cos-utilization", label: "CoS Utilisation", icon: PieChart, description: "Track CoS allocation and usage patterns" },
    { id: "worker", label: "Worker Reports", icon: Users, description: "Sponsored worker statistics and trends" },
    { id: "compliance", label: "Compliance Reports", icon: FileText, description: "Compliance score and risk analysis" },
    { id: "financial", label: "Financial Reports", icon: DollarSign, description: "Invoices, payments, and costs" },
  ];

  const mockData = {
    "cos-utilization": {
      total: 50,
      used: 35,
      remaining: 15,
      utilizationRate: 70,
      monthlyUsage: [28, 32, 35, 30, 35, 35],
    },
    worker: {
      total: 25,
      active: 20,
      onLeave: 3,
      expiringSoon: 2,
      byVisaType: { "Skilled Worker": 20, "Global Talent": 3, "Scale-up": 2 },
    },
    compliance: {
      score: 85,
      riskLevel: "Low",
      missingDocs: 3,
      overdueReports: 1,
      upcomingDeadlines: 5,
    },
    financial: {
      totalRevenue: 15000,
      pendingPayments: 2500,
      paidThisMonth: 8000,
      avgProcessingTime: 5,
    },
  };

  const currentData = mockData[selectedReport];

  const handleDownloadReport = () => {
    alert(`Downloading ${selectedReport} report...`);
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Reports
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          View and generate comprehensive business reports.
        </p>
      </motion.div>

      {/* Report Type Selection */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              variants={cardVariants}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedReport === report.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <report.icon size={20} />
                <span className="text-sm font-black">{report.label}</span>
              </div>
              <p className="text-[10px] font-bold opacity-80">{report.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filter Options */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
            >
              <Download size={16} />
              Download Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-secondary flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            {reports.find((r) => r.id === selectedReport)?.label}
          </h2>
          <span className="text-xs font-bold text-gray-500">Last updated: Today</span>
        </div>

        {/* CoS Utilisation Report */}
        {selectedReport === "cos-utilization" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total CoS</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.total}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Used</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.used}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Remaining</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.remaining}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Utilisation Rate</p>
                <p className="text-2xl font-black text-primary mt-1">{currentData.utilizationRate}%</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-black text-secondary mb-4">Monthly CoS Usage</h3>
              <div className="flex items-end gap-4 h-40">
                {currentData.monthlyUsage.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: `${(value / 40) * 100}%` }}
                    ></div>
                    <p className="text-[10px] font-bold text-gray-500 mt-2">Month {index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Worker Reports */}
        {selectedReport === "worker" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Workers</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.total}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Active</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.active}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">On Leave</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.onLeave}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Expiring Soon</p>
                <p className="text-2xl font-black text-amber-700 mt-1">{currentData.expiringSoon}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-black text-secondary mb-4">Workers by Visa Type</h3>
              <div className="space-y-3">
                {Object.entries(currentData.byVisaType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{type}</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(count / currentData.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-secondary w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Reports */}
        {selectedReport === "compliance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Compliance Score</p>
                <p className="text-2xl font-black text-primary mt-1">{currentData.score}/100</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Risk Level</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">{currentData.riskLevel}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Missing Docs</p>
                <p className="text-2xl font-black text-amber-700 mt-1">{currentData.missingDocs}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Overdue Reports</p>
                <p className="text-2xl font-black text-red-700 mt-1">{currentData.overdueReports}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-black text-secondary mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-xs font-bold text-gray-700">Worker Event Report</span>
                    </div>
                    <span className="text-xs font-black text-gray-500">Due in {i * 3 + 5} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Financial Reports */}
        {selectedReport === "financial" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Revenue</p>
                <p className="text-2xl font-black text-secondary mt-1">£{currentData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Paid This Month</p>
                <p className="text-2xl font-black text-secondary mt-1">£{currentData.paidThisMonth.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Pending Payments</p>
                <p className="text-2xl font-black text-amber-700 mt-1">£{currentData.pendingPayments.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Avg Processing</p>
                <p className="text-2xl font-black text-secondary mt-1">{currentData.avgProcessingTime} days</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-black text-secondary mb-4">Revenue Trend</h3>
              <div className="flex items-end gap-4 h-40">
                {[30, 45, 35, 50, 40, 55, 60].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-secondary rounded-t-lg transition-all"
                      style={{ height: `${(value / 70) * 100}%` }}
                    ></div>
                    <p className="text-[10px] font-bold text-gray-500 mt-2">Week {index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reports;
