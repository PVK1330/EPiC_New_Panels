import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiFolderOpenLine,
  RiSettings3Line,
  RiAlarmWarningLine,
  RiCheckLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiErrorWarningLine,
  RiBuildingLine,
  RiCalendarLine,
  RiDownloadLine,
} from "react-icons/ri";

// ─── Static Data (from index.html dashboard) ──────────────────────────────────

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const kpiCards = [
  {
    label: "Total Cases",
    value: "1,284",
    sub: "↑ 12% from last month",
    icon: RiFolderOpenLine,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    to: "/admin/cases",
  },
  {
    label: "Cases In Progress",
    value: "347",
    sub: "27% of total",
    icon: RiSettings3Line,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
  {
    label: "Delayed Cases",
    value: "41",
    sub: "↑ 8 since last week",
    icon: RiAlarmWarningLine,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    to: "/admin/cases",
  },
  {
    label: "Completed This Month",
    value: "218",
    sub: "↑ 18% vs prior month",
    icon: RiCheckLine,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
  {
    label: "Active Caseworkers",
    value: "24",
    sub: "3 on leave today",
    icon: RiUserLine,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    to: "/admin/caseworkers",
  },
  {
    label: "Fees Collected",
    value: "£284k",
    sub: "£61k outstanding",
    icon: RiMoneyDollarCircleLine,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-50",
  },
  {
    label: "Visa Expiry Alerts",
    value: "18",
    sub: "Next 30 days",
    icon: RiErrorWarningLine,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  {
    label: "Sponsor Licence Expiry",
    value: "5",
    sub: "Requiring renewal",
    icon: RiBuildingLine,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
];

const recentCases = [
  { id: "#VF-2841", candidate: "Priya Sharma",  visaType: "Skilled Worker",   status: "On Track",  chip: "green"  },
  { id: "#VF-2839", candidate: "James Okoye",   visaType: "Sponsor Licence",  status: "Due",       chip: "yellow" },
  { id: "#VF-2835", candidate: "Li Wei",         visaType: "Graduate Visa",    status: "Overdue",   chip: "red"    },
  { id: "#VF-2830", candidate: "Amara Diallo",  visaType: "ILR",              status: "In Review", chip: "blue"   },
  { id: "#VF-2828", candidate: "Sofia Rossi",   visaType: "Student Visa",     status: "On Track",  chip: "green"  },
];

const escalations = [
  {
    level: "red",
    title: "Case #VF-2801 — Critical Deadline",
    text: "Li Wei's ILR deadline breached. Immediate action required.",
  },
  {
    level: "yellow",
    title: "Case #VF-2812 — Missing Documents",
    text: "BioMetric Residence Permit not received. 12 days overdue.",
  },
  {
    level: "yellow",
    title: "Sponsor TechNova Ltd — Licence Expiry",
    text: "Sponsor licence expires in 18 days. Renewal pending.",
  },
];

const teamWorkload = [
  { name: "Alice Patel",   pct: 87, cases: 21, bar: "bg-blue-500"   },
  { name: "Marcus Green",  pct: 65, cases: 16, bar: "bg-green-500"  },
  { name: "Fatima Khan",   pct: 72, cases: 18, bar: "bg-yellow-500" },
  { name: "James Osei",    pct: 92, cases: 23, bar: "bg-red-500"    },
  { name: "Rina Mehta",    pct: 50, cases: 13, bar: "bg-blue-400"   },
];

const outstandingClients = [
  { name: "TechNova Ltd",    amount: "£12,400", color: "text-red-500"    },
  { name: "GlobalHire Inc",  amount: "£8,200",  color: "text-red-500"    },
  { name: "Apex Consulting", amount: "£5,800",  color: "text-yellow-600" },
];

const recentActivity = [
  { title: "New case created",  detail: "Tech Solutions Ltd - H-1B Visa", time: "2 hours ago" },
  { title: "Payment received",  detail: "Global Corp - £5,000",           time: "5 hours ago" },
  { title: "Case approved",     detail: "John Smith - Work Permit",        time: "1 day ago"   },
];

// ─── Chip colour map ───────────────────────────────────────────────────────────
const chipCls = {
  green:  "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red:    "bg-red-100 text-red-600",
  blue:   "bg-blue-100 text-blue-700",
  gray:   "bg-gray-100 text-gray-500",
  purple: "bg-purple-100 text-purple-700",
};

// ─── Motion helpers ────────────────────────────────────────────────────────────
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        {...fade(0)}
      >
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {today} — Overview of all active operations
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <RiCalendarLine size={15} />
            This Month
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
            <RiDownloadLine size={15} />
            Export Snapshot
          </button>
        </div>
      </motion.div>

      {/* ── KPI Grid (8 cards) ───────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            variants={cardItem}
            onClick={() => card.to && navigate(card.to)}
            className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group ${
              card.to
                ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                : ""
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl ${card.iconBg}`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 pr-10 leading-tight">
              {card.label}
            </p>
            <p className="text-3xl font-black text-secondary leading-none">{card.value}</p>
            <p className="text-xs text-gray-400 mt-2">{card.sub}</p>
            {card.to && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Row: Recent Cases + Active Escalations ────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        {...fade(0.2)}
      >
        {/* Recent Cases */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-secondary">Recent Cases</h3>
            <button
              onClick={() => navigate("/admin/cases")}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Case ID", "Candidate", "Visa Type", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentCases.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-secondary whitespace-nowrap">
                      {row.id}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {row.candidate}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {row.visaType}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${chipCls[row.chip]}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Escalations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-black text-secondary mb-4">🚩 Active Escalations</h3>
          <div className="space-y-3 flex-1">
            {escalations.map((esc, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl ${
                  esc.level === "red"
                    ? "bg-red-50 border border-red-100"
                    : "bg-yellow-50 border border-yellow-100"
                }`}
              >
                <div
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    esc.level === "red" ? "bg-red-500" : "bg-yellow-500"
                  }`}
                />
                <div>
                  <p
                    className={`text-xs font-black leading-snug ${
                      esc.level === "red" ? "text-red-700" : "text-yellow-700"
                    }`}
                  >
                    {esc.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{esc.text}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/admin/cases")}
            className="mt-4 text-xs font-bold text-gray-500 hover:text-secondary transition-colors self-start"
          >
            View All Escalations →
          </button>
        </div>
      </motion.div>

      {/* ── Row: Team Workload + Financial Overview ──────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        {...fade(0.3)}
      >
        {/* Team Workload */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-black text-secondary mb-5">👥 Team Workload</h3>
          <div className="space-y-4 flex-1">
            {teamWorkload.map((member, i) => (
              <div key={member.name} className="flex items-center gap-3">
                <p className="text-xs font-semibold text-gray-600 w-28 shrink-0 truncate">
                  {member.name}
                </p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${member.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${member.pct}%` }}
                    transition={{ duration: 0.7, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs font-black text-secondary w-6 text-right shrink-0">
                  {member.cases}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/admin/caseworkers")}
            className="mt-5 text-xs font-bold text-gray-500 hover:text-secondary transition-colors self-start"
          >
            Full Workload Report →
          </button>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-black text-secondary mb-4">💳 Financial Overview</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-[11px] font-bold text-gray-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-black text-green-600">£284,200</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-[11px] font-bold text-gray-400 mb-1">Outstanding</p>
              <p className="text-2xl font-black text-red-500">£61,400</p>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Top Outstanding Clients
          </p>
          <div className="flex-1">
            {outstandingClients.map((c, i) => (
              <div
                key={c.name}
                className={`flex items-center justify-between py-2.5 ${
                  i < outstandingClients.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <p className="text-xs font-semibold text-gray-700">{c.name}</p>
                <p className={`text-xs font-black font-mono ${c.color}`}>{c.amount}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/admin/finance")}
            className="mt-4 text-xs font-bold text-gray-500 hover:text-secondary transition-colors self-start"
          >
            View Finance Panel →
          </button>
        </div>
      </motion.div>

      {/* ── Recent Activity (existing section — kept) ────────────────────────── */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        {...fade(0.4)}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-black text-secondary">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentActivity.map(({ title, detail, time }, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-secondary">{title}</p>
                <p className="text-xs text-gray-400">{detail}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{time}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
