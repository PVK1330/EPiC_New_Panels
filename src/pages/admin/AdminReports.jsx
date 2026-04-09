import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiDownload, FiSearch } from "react-icons/fi";
import { RiBarChartLine } from "react-icons/ri";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";
import Button from "../../components/Button";
import Input from "../../components/Input";

const TABS = [
  { id: "cases", label: "Case Reports" },
  { id: "workload", label: "Workload Reports" },
  { id: "finance", label: "Financial Reports" },
];

const PERIOD_OPTIONS = [
  { value: "2026-04", label: "Apr 2026" },
  { value: "2026-03", label: "Mar 2026" },
  { value: "2026-02", label: "Feb 2026" },
  { value: "2026-q1", label: "Q1 2026" },
  { value: "2025-fy", label: "FY 2025–26" },
];

const CASE_KPIS = [
  {
    id: "opened",
    label: "Cases Opened (Month)",
    value: "84",
    sub: "↑ 14% vs last month",
    bg: "bg-blue-50",
    border: "border-blue-100",
    valueClass: "text-blue-600",
  },
  {
    id: "closed",
    label: "Cases Closed (Month)",
    value: "218",
    sub: "↑ 18% vs last month",
    bg: "bg-green-50",
    border: "border-green-100",
    valueClass: "text-green-600",
  },
  {
    id: "avg",
    label: "Avg Completion Time",
    value: "4.8d",
    sub: "↓ 0.4 days improvement",
    bg: "bg-amber-50",
    border: "border-amber-100",
    valueClass: "text-amber-700",
  },
];

const CASES_BY_VISA = [
  { id: "sw", name: "Skilled Worker", cases: 412, pct: 32, bar: "bg-blue-500" },
  { id: "ilr", name: "ILR", cases: 284, pct: 22, bar: "bg-purple-500" },
  { id: "stu", name: "Student Visa", cases: 218, pct: 17, bar: "bg-green-500" },
  { id: "grad", name: "Graduate Visa", cases: 192, pct: 15, bar: "bg-amber-400" },
  { id: "spon", name: "Sponsor Licence", cases: 178, pct: 14, bar: "bg-red-500" },
];

const VISA_FILTER_OPTIONS = [
  { value: "all", label: "All visa types" },
  ...CASES_BY_VISA.map((v) => ({ value: v.id, label: v.name })),
];

const WORKLOAD_ROWS = [
  {
    id: "ap",
    name: "Alice Patel",
    initials: "AP",
    avatarBg: "bg-blue-500",
    active: 21,
    completed: 84,
    sla: "78/84",
    slaPct: "92.8%",
    slaChip: "bg-green-100 text-green-700",
  },
  {
    id: "mg",
    name: "Marcus Green",
    initials: "MG",
    avatarBg: "bg-green-500",
    active: 16,
    completed: 61,
    sla: "48/61",
    slaPct: "78.7%",
    slaChip: "bg-amber-100 text-amber-800",
  },
  {
    id: "jo",
    name: "James Osei",
    initials: "JO",
    avatarBg: "bg-red-500",
    active: 23,
    completed: 42,
    sla: "26/42",
    slaPct: "61.9%",
    slaChip: "bg-red-100 text-red-700",
  },
];

const FINANCE_BY_VISA = [
  { id: "sw", label: "Skilled Worker", amount: "£112,400" },
  { id: "ilr", label: "ILR", amount: "£68,200" },
  { id: "spon", label: "Sponsor Licence", amount: "£54,800" },
  { id: "stu", label: "Student Visa", amount: "£28,400" },
  { id: "grad", label: "Graduate Visa", amount: "£20,400" },
];

const FINANCE_BY_SPONSOR = [
  { id: "tn", label: "TechNova Ltd", amount: "£48,200" },
  { id: "gh", label: "GlobalHire Inc", amount: "£34,100" },
  { id: "ac", label: "Apex Consulting", amount: "£22,800" },
  { id: "bs", label: "BlueSky Co", amount: "£18,200" },
];

const OUTSTANDING = "£61,400";

const tableHead = "px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("cases");
  const [period, setPeriod] = useState("2026-04");
  const [visaFilter, setVisaFilter] = useState("all");
  const [workloadSearch, setWorkloadSearch] = useState("");
  const [financeSearch, setFinanceSearch] = useState("");

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "Apr 2026";

  const filteredVisaBars = useMemo(() => {
    if (visaFilter === "all") return CASES_BY_VISA;
    return CASES_BY_VISA.filter((v) => v.id === visaFilter);
  }, [visaFilter]);

  const filteredWorkload = useMemo(() => {
    const q = workloadSearch.trim().toLowerCase();
    if (!q) return WORKLOAD_ROWS;
    return WORKLOAD_ROWS.filter((r) => r.name.toLowerCase().includes(q));
  }, [workloadSearch]);

  const filteredFinanceVisa = useMemo(() => {
    const q = financeSearch.trim().toLowerCase();
    if (!q) return FINANCE_BY_VISA;
    return FINANCE_BY_VISA.filter((r) => r.label.toLowerCase().includes(q));
  }, [financeSearch]);

  const filteredFinanceSponsor = useMemo(() => {
    const q = financeSearch.trim().toLowerCase();
    if (!q) return FINANCE_BY_SPONSOR;
    return FINANCE_BY_SPONSOR.filter((r) => r.label.toLowerCase().includes(q));
  }, [financeSearch]);

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm shrink-0">
            <RiBarChartLine className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Reporting &amp; Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Performance metrics and business intelligence</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm">
            <FiCalendar size={14} className="text-gray-400" aria-hidden />
            {periodLabel}
          </span>
          <Button type="button" variant="primary" className="rounded-xl shadow-sm inline-flex items-center gap-2">
            <FiDownload size={14} />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Filters</p>
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 lg:items-end">
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Input
              label="Reporting period"
              name="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={PERIOD_OPTIONS}
            />
          </div>

          {activeTab === "cases" && (
            <div className="w-full sm:w-auto sm:min-w-[220px]">
              <Input
                label="Visa type"
                name="visaFilter"
                value={visaFilter}
                onChange={(e) => setVisaFilter(e.target.value)}
                options={VISA_FILTER_OPTIONS}
              />
            </div>
          )}

          {activeTab === "workload" && (
            <div className="w-full sm:flex-1 sm:min-w-[240px] max-w-md">
              <label htmlFor="workload-search" className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
                Search caseworker
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="workload-search"
                  type="search"
                  value={workloadSearch}
                  onChange={(e) => setWorkloadSearch(e.target.value)}
                  placeholder="Filter by name…"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="w-full sm:flex-1 sm:min-w-[240px] max-w-md">
              <label htmlFor="finance-search" className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
                Search revenue lines
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="finance-search"
                  type="search"
                  value={financeSearch}
                  onChange={(e) => setFinanceSearch(e.target.value)}
                  placeholder="Filter visa type or sponsor…"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SegmentedTabBar tabs={TABS} activeId={activeTab} onChange={setActiveTab} layoutId="admin-reports-tab" />

      {activeTab === "cases" && (
        <motion.div
          key="cases"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CASE_KPIS.map((k) => (
              <div key={k.id} className={`rounded-xl border p-4 ${k.bg} ${k.border}`}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
                <p className={`text-3xl font-black ${k.valueClass}`}>{k.value}</p>
                <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Cases by Visa Type</h2>
            {filteredVisaBars.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No visa types match this filter.</p>
            ) : (
              <div className="space-y-4">
                {filteredVisaBars.map((row) => (
                  <div key={row.id}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                      <span className="font-semibold text-gray-700">{row.name}</span>
                      <span className="font-mono text-gray-500">
                        {row.cases} cases ({row.pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${row.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "workload" && (
        <motion.div
          key="workload"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-secondary">Cases per Caseworker</h2>
            <p className="text-xs text-gray-500 mt-0.5">Active load, completions, and SLA — {periodLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Caseworker", "Active", "Completed", "SLA Met", "SLA Performance"].map((h) => (
                    <th key={h} className={tableHead}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredWorkload.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                      No caseworkers match your search.
                    </td>
                  </tr>
                ) : (
                  filteredWorkload.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${r.avatarBg}`}
                          >
                            {r.initials}
                          </div>
                          <span className="text-sm font-bold text-secondary whitespace-nowrap">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 tabular-nums">{r.active}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 tabular-nums">{r.completed}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{r.sla}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.slaChip}`}>{r.slaPct}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "finance" && (
        <motion.div
          key="finance"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Revenue by Visa Type</h2>
            {filteredFinanceVisa.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No lines match your search.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredFinanceVisa.map((row) => (
                  <div key={row.id} className="flex justify-between items-center text-sm gap-4">
                    <span className="text-gray-700 font-medium">{row.label}</span>
                    <span className="font-mono font-bold text-green-600 tabular-nums shrink-0">{row.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Revenue by Sponsor</h2>
            {filteredFinanceSponsor.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No sponsors match your search.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredFinanceSponsor.map((row) => (
                  <div key={row.id} className="flex justify-between items-center text-sm gap-4">
                    <span className="text-gray-700 font-medium">{row.label}</span>
                    <span className="font-mono font-bold text-green-600 tabular-nums shrink-0">{row.amount}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center gap-4">
              <span className="text-sm text-gray-500">Outstanding Payments</span>
              <span className="font-mono font-bold text-red-600 tabular-nums">{OUTSTANDING}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
