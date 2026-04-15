import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar, FiDownload, FiSearch, FiChevronLeft, FiChevronRight,
  FiX, FiEye, FiUser, FiCheckCircle, FiAlertCircle, FiClock,
  FiTrendingUp, FiTrendingDown, FiStar, FiFileText, FiArrowLeft,
  FiFilter,
} from "react-icons/fi";
import { RiBarChartLine } from "react-icons/ri";
import SegmentedTabBar from "../../components/admin/SegmentedTabBar";
import Button from "../../components/Button";
import Input from "../../components/Input";

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "cases", label: "Case Reports" },
  { id: "workload", label: "Workload Reports" },
  { id: "finance", label: "Financial Reports" },
  { id: "performance", label: "Performance Reports" },
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

// ─── Performance Data ─────────────────────────────────────────────────────────

const PERFORMANCE_CASEWORKERS = [
  {
    id: "CW-001",
    name: "Alice Patel",
    initials: "AP",
    avatarBg: "bg-blue-500",
    department: "Immigration",
    email: "alice.patel@firm.co.uk",
    joinDate: "Mar 2021",
    totalCases: 412,
    activeCases: 21,
    completedCases: 391,
    slaMetPct: 92.8,
    avgCompletionDays: 3.9,
    clientSatisfaction: 4.8,
    escalations: 3,
    visaBreakdown: [
      { type: "Skilled Worker", count: 180 },
      { type: "ILR", count: 110 },
      { type: "Student Visa", count: 72 },
      { type: "Graduate Visa", count: 50 },
    ],
    recentCases: [
      { id: "CS-4412", client: "TechNova Ltd", type: "Skilled Worker", status: "Completed", date: "12 Jun 2025", sla: "Met" },
      { id: "CS-4389", client: "GlobalHire Inc", type: "ILR", status: "Completed", date: "10 Jun 2025", sla: "Met" },
      { id: "CS-4401", client: "Apex Consulting", type: "Student Visa", status: "In Progress", date: "14 Jun 2025", sla: "On Track" },
      { id: "CS-4377", client: "BlueSky Co", type: "Graduate Visa", status: "Completed", date: "08 Jun 2025", sla: "Met" },
      { id: "CS-4355", client: "TechNova Ltd", type: "Sponsor Licence", status: "Completed", date: "04 Jun 2025", sla: "Breached" },
    ],
    monthlyTrend: [62, 68, 71, 75, 80, 78, 84, 91, 88, 95, 84, 91],
  },
  {
    id: "CW-002",
    name: "Marcus Green",
    initials: "MG",
    avatarBg: "bg-green-500",
    department: "Immigration",
    email: "marcus.green@firm.co.uk",
    joinDate: "Jul 2022",
    totalCases: 284,
    activeCases: 16,
    completedCases: 268,
    slaMetPct: 78.7,
    avgCompletionDays: 5.2,
    clientSatisfaction: 4.2,
    escalations: 9,
    visaBreakdown: [
      { type: "Skilled Worker", count: 95 },
      { type: "Sponsor Licence", count: 88 },
      { type: "ILR", count: 61 },
      { type: "Student Visa", count: 40 },
    ],
    recentCases: [
      { id: "CS-4410", client: "BlueSky Co", type: "Sponsor Licence", status: "Completed", date: "13 Jun 2025", sla: "Breached" },
      { id: "CS-4398", client: "TechNova Ltd", type: "Skilled Worker", status: "In Progress", date: "11 Jun 2025", sla: "At Risk" },
      { id: "CS-4382", client: "GlobalHire Inc", type: "ILR", status: "Completed", date: "09 Jun 2025", sla: "Met" },
      { id: "CS-4370", client: "Apex Consulting", type: "Student Visa", status: "Completed", date: "06 Jun 2025", sla: "Met" },
      { id: "CS-4351", client: "BlueSky Co", type: "Skilled Worker", status: "Completed", date: "02 Jun 2025", sla: "Breached" },
    ],
    monthlyTrend: [40, 45, 48, 52, 55, 50, 58, 61, 65, 60, 62, 68],
  },
  {
    id: "CW-003",
    name: "James Osei",
    initials: "JO",
    avatarBg: "bg-red-500",
    department: "Compliance",
    email: "james.osei@firm.co.uk",
    joinDate: "Jan 2023",
    totalCases: 198,
    activeCases: 23,
    completedCases: 175,
    slaMetPct: 61.9,
    avgCompletionDays: 6.8,
    clientSatisfaction: 3.6,
    escalations: 18,
    visaBreakdown: [
      { type: "Sponsor Licence", count: 90 },
      { type: "Skilled Worker", count: 55 },
      { type: "ILR", count: 35 },
      { type: "Graduate Visa", count: 18 },
    ],
    recentCases: [
      { id: "CS-4415", client: "Apex Consulting", type: "Sponsor Licence", status: "In Progress", date: "14 Jun 2025", sla: "At Risk" },
      { id: "CS-4405", client: "TechNova Ltd", type: "Skilled Worker", status: "Completed", date: "12 Jun 2025", sla: "Breached" },
      { id: "CS-4390", client: "GlobalHire Inc", type: "ILR", status: "In Progress", date: "10 Jun 2025", sla: "At Risk" },
      { id: "CS-4372", client: "BlueSky Co", type: "Graduate Visa", status: "Completed", date: "07 Jun 2025", sla: "Met" },
      { id: "CS-4348", client: "TechNova Ltd", type: "Sponsor Licence", status: "Completed", date: "01 Jun 2025", sla: "Breached" },
    ],
    monthlyTrend: [28, 30, 26, 32, 35, 31, 38, 42, 40, 44, 42, 48],
  },
  {
    id: "CW-004",
    name: "Sophie Turner",
    initials: "ST",
    avatarBg: "bg-purple-500",
    department: "Immigration",
    email: "sophie.turner@firm.co.uk",
    joinDate: "Sep 2020",
    totalCases: 531,
    activeCases: 14,
    completedCases: 517,
    slaMetPct: 96.1,
    avgCompletionDays: 3.2,
    clientSatisfaction: 4.9,
    escalations: 1,
    visaBreakdown: [
      { type: "Skilled Worker", count: 220 },
      { type: "ILR", count: 160 },
      { type: "Graduate Visa", count: 90 },
      { type: "Student Visa", count: 61 },
    ],
    recentCases: [
      { id: "CS-4416", client: "GlobalHire Inc", type: "Skilled Worker", status: "In Progress", date: "14 Jun 2025", sla: "On Track" },
      { id: "CS-4407", client: "TechNova Ltd", type: "ILR", status: "Completed", date: "12 Jun 2025", sla: "Met" },
      { id: "CS-4393", client: "Apex Consulting", type: "Graduate Visa", status: "Completed", date: "10 Jun 2025", sla: "Met" },
      { id: "CS-4380", client: "BlueSky Co", type: "Student Visa", status: "Completed", date: "08 Jun 2025", sla: "Met" },
      { id: "CS-4362", client: "GlobalHire Inc", type: "Skilled Worker", status: "Completed", date: "05 Jun 2025", sla: "Met" },
    ],
    monthlyTrend: [75, 80, 82, 88, 90, 88, 95, 98, 102, 108, 104, 110],
  },
  {
    id: "CW-005",
    name: "David Nwosu",
    initials: "DN",
    avatarBg: "bg-amber-500",
    department: "Compliance",
    email: "david.nwosu@firm.co.uk",
    joinDate: "May 2022",
    totalCases: 319,
    activeCases: 18,
    completedCases: 301,
    slaMetPct: 85.4,
    avgCompletionDays: 4.5,
    clientSatisfaction: 4.5,
    escalations: 6,
    visaBreakdown: [
      { type: "ILR", count: 120 },
      { type: "Skilled Worker", count: 95 },
      { type: "Sponsor Licence", count: 62 },
      { type: "Student Visa", count: 42 },
    ],
    recentCases: [
      { id: "CS-4414", client: "BlueSky Co", type: "ILR", status: "Completed", date: "13 Jun 2025", sla: "Met" },
      { id: "CS-4402", client: "Apex Consulting", type: "Skilled Worker", status: "In Progress", date: "11 Jun 2025", sla: "On Track" },
      { id: "CS-4388", client: "TechNova Ltd", type: "Sponsor Licence", status: "Completed", date: "09 Jun 2025", sla: "Met" },
      { id: "CS-4375", client: "GlobalHire Inc", type: "ILR", status: "Completed", date: "07 Jun 2025", sla: "Breached" },
      { id: "CS-4358", client: "BlueSky Co", type: "Student Visa", status: "Completed", date: "03 Jun 2025", sla: "Met" },
    ],
    monthlyTrend: [48, 52, 55, 58, 60, 57, 65, 68, 70, 74, 72, 78],
  },
];

const DEPT_OPTIONS = [
  { value: "all", label: "All departments" },
  { value: "Immigration", label: "Immigration" },
  { value: "Compliance", label: "Compliance" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const tableHead =
  "px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function sameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}

function inRange(day, start, end) {
  if (!start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

function isBefore(a, b) {
  return a.getTime() < b.getTime();
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getSlaColor(pct) {
  if (pct >= 90) return "bg-green-100 text-green-700";
  if (pct >= 75) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

function getSlaStatusChip(status) {
  const map = {
    Met: "bg-green-100 text-green-700",
    "On Track": "bg-blue-100 text-blue-700",
    "At Risk": "bg-amber-100 text-amber-800",
    Breached: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function getCaseStatusChip(status) {
  const map = {
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Pending: "bg-gray-100 text-gray-500",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={11}
          className={s <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-gray-200"}
          style={s <= Math.round(value) ? { fill: "currentColor" } : {}}
        />
      ))}
      <span className="ml-1 text-[11px] font-bold text-gray-600">{value.toFixed(1)}</span>
    </div>
  );
}

// Mini sparkline using SVG
function Sparkline({ data, color = "#6366f1" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

function DateRangePicker({ startDate, endDate, onChange }) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [rightYear, setRightYear] = useState(
    today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear()
  );
  const [rightMonth, setRightMonth] = useState(
    today.getMonth() === 11 ? 0 : today.getMonth() + 1
  );
  const ref = useRef(null);

  useEffect(() => {
    let ry = viewYear;
    let rm = viewMonth + 1;
    if (rm > 11) { rm = 0; ry += 1; }
    setRightYear(ry);
    setRightMonth(rm);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(date) {
    if (!selecting) {
      setSelecting(date);
      onChange({ start: date, end: null });
    } else {
      const start = isBefore(selecting, date) ? selecting : date;
      const end = isBefore(selecting, date) ? date : selecting;
      onChange({ start, end });
      setSelecting(null);
      setOpen(false);
    }
  }

  const effectiveStart = selecting || startDate;
  const effectiveEnd = selecting
    ? hovered && !sameDay(hovered, selecting)
      ? isBefore(selecting, hovered) ? hovered : selecting
      : null
    : endDate;
  const effectiveStartFinal =
    selecting && hovered && isBefore(hovered, selecting) ? hovered : effectiveStart;

  function renderMonth(year, month) {
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

    return (
      <div className="w-full">
        <p className="text-center text-sm font-black text-gray-700 mb-3">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />;
            const isStart = sameDay(date, effectiveStart) || sameDay(date, effectiveStartFinal);
            const isEnd = sameDay(date, effectiveEnd);
            const isInRange = inRange(date, effectiveStartFinal || effectiveStart, effectiveEnd);
            const isToday = sameDay(date, today);

            let bg = "";
            let text = "text-gray-700 hover:bg-gray-100";
            let rounded = "rounded-lg";

            if (isStart || isEnd) {
              bg = "bg-secondary";
              text = "text-white";
              rounded = isStart && isEnd
                ? "rounded-lg"
                : isStart
                ? "rounded-l-lg rounded-r-none"
                : "rounded-r-lg rounded-l-none";
            } else if (isInRange) {
              bg = "bg-secondary/10";
              text = "text-secondary font-semibold";
              rounded = "rounded-none";
            }

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDayClick(date)}
                onMouseEnter={() => setHovered(date)}
                onMouseLeave={() => setHovered(null)}
                className={`relative text-center text-xs py-1.5 transition-all cursor-pointer w-full ${bg} ${text} ${rounded} ${isToday && !isStart && !isEnd ? "font-black underline" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const hasRange = startDate && endDate;

  return (
    <div className="relative" ref={ref}>
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
        Date Range
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-xl bg-white transition-all w-full sm:w-auto sm:min-w-[260px] ${
          open ? "border-secondary/50 ring-2 ring-secondary/20 shadow-sm" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <FiCalendar size={14} className="text-gray-400 shrink-0" />
        {hasRange ? (
          <span className="font-semibold text-gray-700 flex-1 text-left">
            {formatDate(startDate)} → {formatDate(endDate)}
          </span>
        ) : (
          <span className="text-gray-400 flex-1 text-left">Select your date</span>
        )}
        {hasRange && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange({ start: null, end: null });
              setSelecting(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && onChange({ start: null, end: null })}
            className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
          >
            <FiX size={13} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 min-w-[340px] sm:min-w-[600px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {selecting ? "Now pick an end date" : "Pick a start date"}
              </span>
              {selecting && (
                <button
                  type="button"
                  onClick={() => { setSelecting(null); onChange({ start: null, end: null }); }}
                  className="text-[11px] text-gray-400 hover:text-gray-600 underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <FiChevronLeft size={15} />
                  </button>
                  <span />
                  <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 sm:invisible">
                    <FiChevronRight size={15} />
                  </button>
                </div>
                {renderMonth(viewYear, viewMonth)}
              </div>
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <div className="flex-1 hidden sm:block">
                <div className="flex items-center justify-between mb-2">
                  <span />
                  <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <FiChevronRight size={15} />
                  </button>
                </div>
                {renderMonth(rightYear, rightMonth)}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
              {[
                {
                  label: "This month",
                  fn: () => {
                    const n = new Date();
                    onChange({ start: new Date(n.getFullYear(), n.getMonth(), 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0) });
                    setSelecting(null); setOpen(false);
                  },
                },
                {
                  label: "Last 30 days",
                  fn: () => {
                    const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29);
                    onChange({ start: s, end: e }); setSelecting(null); setOpen(false);
                  },
                },
                {
                  label: "Last 90 days",
                  fn: () => {
                    const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 89);
                    onChange({ start: s, end: e }); setSelecting(null); setOpen(false);
                  },
                },
                {
                  label: "This year",
                  fn: () => {
                    const n = new Date();
                    onChange({ start: new Date(n.getFullYear(), 0, 1), end: new Date(n.getFullYear(), 11, 31) });
                    setSelecting(null); setOpen(false);
                  },
                },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={p.fn}
                  className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── DateRangeBadge ───────────────────────────────────────────────────────────

function DateRangeBadge({ startDate, endDate }) {
  if (!startDate && !endDate) return null;
  const label =
    startDate && endDate
      ? `${formatDate(startDate)} → ${formatDate(endDate)}`
      : startDate
      ? `From ${formatDate(startDate)}`
      : `Until ${formatDate(endDate)}`;
  let days = null;
  if (startDate && endDate) {
    const diff = endDate.getTime() - startDate.getTime();
    days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  }
  return (
    <AnimatePresence>
      <motion.div
        key="badge"
        initial={{ opacity: 0, scale: 0.92, x: 8 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary/5 border border-secondary/20 rounded-xl text-sm font-bold text-secondary shadow-sm"
      >
        <FiCalendar size={13} className="shrink-0 opacity-70" />
        <span>{label}</span>
        {days !== null && (
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-secondary/15 text-[10px] font-black text-secondary">
            {days}d
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Performance Detail Modal ─────────────────────────────────────────────────

function PerformanceDetailModal({ caseworker, onClose }) {
  if (!caseworker) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.22 }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 ${caseworker.avatarBg}`}>
                {caseworker.initials}
              </div>
              <div>
                <h2 className="text-base font-black text-secondary">{caseworker.name}</h2>
                <p className="text-xs text-gray-400">{caseworker.id} · {caseworker.department} · Joined {caseworker.joinDate}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Cases", value: caseworker.totalCases, icon: <FiFileText size={14} />, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "SLA Met", value: `${caseworker.slaMetPct}%`, icon: <FiCheckCircle size={14} />, color: "text-green-600", bg: "bg-green-50" },
                { label: "Avg Days", value: `${caseworker.avgCompletionDays}d`, icon: <FiClock size={14} />, color: "text-amber-700", bg: "bg-amber-50" },
                { label: "Escalations", value: caseworker.escalations, icon: <FiAlertCircle size={14} />, color: "text-red-600", bg: "bg-red-50" },
              ].map((k) => (
                <div key={k.label} className={`rounded-xl p-3.5 ${k.bg} border border-white`}>
                  <div className={`flex items-center gap-1.5 mb-1 ${k.color}`}>
                    {k.icon}
                    <span className="text-[10px] font-black uppercase tracking-wide">{k.label}</span>
                  </div>
                  <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Satisfaction + Trend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Client Satisfaction</p>
                <StarRating value={caseworker.clientSatisfaction} />
                <p className="text-xs text-gray-400 mt-1.5">{caseworker.completedCases} completed cases reviewed</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">12-Month Case Trend</p>
                <Sparkline data={caseworker.monthlyTrend} color="#6366f1" />
                <p className="text-xs text-gray-400 mt-1">
                  {caseworker.monthlyTrend[11] > caseworker.monthlyTrend[0]
                    ? <span className="text-green-600 font-bold">↑ Improving</span>
                    : <span className="text-red-500 font-bold">↓ Declining</span>}
                </p>
              </div>
            </div>

            {/* Visa Breakdown */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Cases by Visa Type</p>
              <div className="space-y-2">
                {caseworker.visaBreakdown.map((v) => {
                  const pct = Math.round((v.count / caseworker.totalCases) * 100);
                  return (
                    <div key={v.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{v.type}</span>
                        <span className="text-gray-500 font-mono">{v.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Cases */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Recent Cases</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["Case ID", "Client", "Visa Type", "Status", "Date", "SLA"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {caseworker.recentCases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-secondary font-bold">{c.id}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap">{c.client}</td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{c.type}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getCaseStatusChip(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{c.date}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getSlaStatusChip(c.sla)}`}>{c.sla}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              className="rounded-xl inline-flex items-center gap-2"
              onClick={() => {
                alert(`Performance report for ${caseworker.name} (${caseworker.id}) would be downloaded.`);
              }}
            >
              <FiDownload size={14} />
              Download Report
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Performance Tab ──────────────────────────────────────────────────────────

function PerformanceTab({ dateRange }) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [selectedCW, setSelectedCW] = useState(null);

  const SLA_OPTIONS = [
    { value: "all", label: "All SLA levels" },
    { value: "high", label: "High (≥90%)" },
    { value: "mid", label: "Medium (75–89%)" },
    { value: "low", label: "Low (<75%)" },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PERFORMANCE_CASEWORKERS.filter((cw) => {
      const matchSearch =
        !q ||
        cw.name.toLowerCase().includes(q) ||
        cw.id.toLowerCase().includes(q) ||
        cw.department.toLowerCase().includes(q);
      const matchDept = deptFilter === "all" || cw.department === deptFilter;
      const matchSla =
        slaFilter === "all" ||
        (slaFilter === "high" && cw.slaMetPct >= 90) ||
        (slaFilter === "mid" && cw.slaMetPct >= 75 && cw.slaMetPct < 90) ||
        (slaFilter === "low" && cw.slaMetPct < 75);
      return matchSearch && matchDept && matchSla;
    });
  }, [search, deptFilter, slaFilter]);

  // Summary KPIs
  const avgSla = (
    PERFORMANCE_CASEWORKERS.reduce((s, c) => s + c.slaMetPct, 0) /
    PERFORMANCE_CASEWORKERS.length
  ).toFixed(1);
  const totalCases = PERFORMANCE_CASEWORKERS.reduce((s, c) => s + c.totalCases, 0);
  const topPerformer = [...PERFORMANCE_CASEWORKERS].sort((a, b) => b.slaMetPct - a.slaMetPct)[0];

  return (
    <>
      {selectedCW && (
        <PerformanceDetailModal
          caseworker={selectedCW}
          onClose={() => setSelectedCW(null)}
        />
      )}

      <motion.div
        key="performance"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-5"
      >
        {/* Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-100 p-4 bg-blue-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Cases (All Staff)</p>
            <p className="text-3xl font-black text-blue-600">{totalCases.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">across {PERFORMANCE_CASEWORKERS.length} caseworkers</p>
          </div>
          <div className="rounded-xl border border-green-100 p-4 bg-green-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Avg SLA Performance</p>
            <p className="text-3xl font-black text-green-600">{avgSla}%</p>
            <p className="text-xs text-gray-500 mt-1">team average this period</p>
          </div>
          <div className="rounded-xl border border-amber-100 p-4 bg-amber-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Top Performer</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${topPerformer.avatarBg}`}>
                {topPerformer.initials}
              </div>
              <p className="text-lg font-black text-amber-700">{topPerformer.name}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{topPerformer.slaMetPct}% SLA · {topPerformer.totalCases} cases</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter size={13} className="text-gray-400" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Filter Caseworkers</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end">
            {/* Search */}
            <div className="flex-1 min-w-[220px] max-w-sm">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">
                Search by name or ID
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Alice or CW-001"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-white"
                />
              </div>
            </div>

            {/* Department filter */}
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <Input
                label="Department"
                name="deptFilter"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={DEPT_OPTIONS}
              />
            </div>

            {/* SLA filter */}
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <Input
                label="SLA level"
                name="slaFilter"
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value)}
                options={SLA_OPTIONS}
              />
            </div>

            {/* Reset */}
            {(search || deptFilter !== "all" || slaFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setDeptFilter("all"); setSlaFilter("all"); }}
                className="self-end px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
              >
                <FiX size={12} /> Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-secondary">Caseworker Performance Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing {filtered.length} of {PERFORMANCE_CASEWORKERS.length} caseworkers
                {dateRange.start && dateRange.end
                  ? ` · ${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              className="rounded-xl inline-flex items-center gap-2 self-start sm:self-auto"
              onClick={() => alert("Full team performance report export initiated.")}
            >
              <FiDownload size={14} />
              Export All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {[
                    "Caseworker",
                    "ID",
                    "Department",
                    "Active",
                    "Completed",
                    "SLA Met",
                    "Avg Days",
                    "Satisfaction",
                    "Escalations",
                    "Trend",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className={tableHead}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FiUser size={28} className="text-gray-200" />
                        <span>No caseworkers match your filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((cw) => (
                    <motion.tr
                      key={cw.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* Caseworker */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0 ${cw.avatarBg}`}>
                            {cw.initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-secondary whitespace-nowrap">{cw.name}</p>
                            <p className="text-[10px] text-gray-400">{cw.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* ID */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{cw.id}</span>
                      </td>
                      {/* Dept */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">{cw.department}</span>
                      </td>
                      {/* Active */}
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 tabular-nums">{cw.activeCases}</td>
                      {/* Completed */}
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 tabular-nums">{cw.completedCases}</td>
                      {/* SLA */}
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${getSlaColor(cw.slaMetPct)}`}>
                          {cw.slaMetPct}%
                        </span>
                      </td>
                      {/* Avg Days */}
                      <td className="px-4 py-3.5 text-sm font-mono text-gray-700 tabular-nums">{cw.avgCompletionDays}d</td>
                      {/* Satisfaction */}
                      <td className="px-4 py-3.5">
                        <StarRating value={cw.clientSatisfaction} />
                      </td>
                      {/* Escalations */}
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-bold tabular-nums ${cw.escalations <= 3 ? "text-green-600" : cw.escalations <= 8 ? "text-amber-600" : "text-red-600"}`}>
                          {cw.escalations}
                        </span>
                      </td>
                      {/* Trend sparkline */}
                      <td className="px-4 py-3.5">
                        <Sparkline
                          data={cw.monthlyTrend}
                          color={
                            cw.monthlyTrend[11] > cw.monthlyTrend[0] ? "#22c55e" : "#ef4444"
                          }
                        />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCW(cw)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-secondary/30 text-secondary bg-secondary/5 hover:bg-secondary/10 transition-colors whitespace-nowrap"
                          >
                            <FiEye size={12} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`Downloading report for ${cw.name} (${cw.id})...`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors whitespace-nowrap"
                          >
                            <FiDownload size={12} />
                            Report
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
              <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              <span className="font-mono">
                Team avg SLA: <span className="font-black text-secondary">{avgSla}%</span>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("cases");
  const [visaFilter, setVisaFilter] = useState("all");
  const [workloadSearch, setWorkloadSearch] = useState("");
  const [financeSearch, setFinanceSearch] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  function handleDateRangeChange({ start, end }) {
    setDateRange({ start, end });
  }

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
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm shrink-0">
            <RiBarChartLine className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">
              Reporting &amp; Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Performance metrics and business intelligence
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <DateRangeBadge startDate={dateRange.start} endDate={dateRange.end} />
          <Button
            type="button"
            variant="primary"
            className="rounded-xl shadow-sm inline-flex items-center gap-2"
          >
            <FiDownload size={14} />
            Export PDF
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Filters</p>
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 lg:items-end">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={handleDateRangeChange}
          />

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
              <label
                htmlFor="workload-search"
                className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1"
              >
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
              <label
                htmlFor="finance-search"
                className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1"
              >
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

      <SegmentedTabBar
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
        layoutId="admin-reports-tab"
      />

      {/* ── Cases Tab ── */}
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
            <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">
              Cases by Visa Type
            </h2>
            {filteredVisaBars.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No visa types match this filter.</p>
            ) : (
              <div className="space-y-4">
                {filteredVisaBars.map((row) => (
                  <div key={row.id}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                      <span className="font-semibold text-gray-700">{row.name}</span>
                      <span className="font-mono text-gray-500">{row.cases} cases ({row.pct}%)</span>
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

      {/* ── Workload Tab ── */}
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
            <p className="text-xs text-gray-500 mt-0.5">
              Active load, completions, and SLA
              {dateRange.start && dateRange.end
                ? ` · ${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`
                : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Caseworker", "Active", "Completed", "SLA Met", "SLA Performance"].map((h) => (
                    <th key={h} className={tableHead}>{h}</th>
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
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${r.avatarBg}`}>
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

      {/* ── Finance Tab ── */}
      {activeTab === "finance" && (
        <motion.div
          key="finance"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">
              Revenue by Visa Type
            </h2>
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
            <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">
              Revenue by Sponsor
            </h2>
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

      {/* ── Performance Tab ── */}
      {activeTab === "performance" && (
        <PerformanceTab dateRange={dateRange} />
      )}
    </motion.div>
  );
}
