import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Check, TrendingUp, Bell, Plus } from "lucide-react";

const STAT_CARDS = [
  {
    key: "assigned",
    label: "Assigned cases",
    value: "24",
    trend: "+3 since last week",
    trendPositive: true,
    borderClass: "border-t-secondary",
    valueClass: "text-secondary",
  },
  {
    key: "active",
    label: "Active cases",
    value: "18",
    trend: "+2 new this week",
    trendPositive: true,
    borderClass: "border-t-emerald-500",
    valueClass: "text-emerald-600",
  },
  {
    key: "overdue",
    label: "Overdue cases",
    value: "4",
    trend: "Requires immediate attention",
    trendPositive: false,
    trendWarn: true,
    borderClass: "border-t-red-500",
    valueClass: "text-red-600",
  },
  {
    key: "tasksToday",
    label: "Tasks due today",
    value: "7",
    trend: "3 completed so far",
    trendPositive: null,
    borderClass: "border-t-amber-500",
    valueClass: "text-amber-600",
  },
  {
    key: "completedMonth",
    label: "Completed (month)",
    value: "11",
    trend: "+4 vs last month",
    trendPositive: true,
    borderClass: "border-t-teal-500",
    valueClass: "text-teal-600",
  },
  {
    key: "score",
    label: "Performance score",
    value: "87",
    valueSuffix: "%",
    trend: "+5% improvement",
    trendPositive: true,
    borderClass: "border-t-indigo-500",
    valueClass: "text-indigo-600",
  },
];

const RECENT_CASES = [
  {
    id: "#C-2401",
    candidate: "Ahmed Al-Rashid",
    business: "TechCorp Ltd",
    visa: "Tier 2",
    status: "On Track",
    statusTone: "green",
    target: "18 Apr 2026",
    priority: "High",
    priorityTone: "red",
  },
  {
    id: "#C-2398",
    candidate: "Priya Sharma",
    business: "Nexus Group",
    visa: "Skilled Worker",
    status: "Due soon",
    statusTone: "yellow",
    target: "12 Apr 2026",
    priority: "Medium",
    priorityTone: "yellow",
  },
  {
    id: "#C-2391",
    candidate: "Carlos Mendes",
    business: "BuildRight Inc",
    visa: "Intra-Co",
    status: "Overdue",
    statusTone: "red",
    target: "3 Apr 2026",
    priority: "Critical",
    priorityTone: "red",
  },
  {
    id: "#C-2389",
    candidate: "Mei Lin Chen",
    business: "Global Finance",
    visa: "Graduate",
    status: "On track",
    statusTone: "green",
    target: "2 May 2026",
    priority: "Low",
    priorityTone: "gray",
  },
  {
    id: "#C-2385",
    candidate: "Ivan Petrov",
    business: "EnviroTech",
    visa: "Tier 2",
    status: "On track",
    statusTone: "green",
    target: "15 May 2026",
    priority: "Low",
    priorityTone: "gray",
  },
];

const TASKS_INITIAL = [
  {
    id: "t1",
    done: true,
    name: "Request passport copy",
    caseRef: "#C-2401 · Ahmed Al-Rashid",
    due: "Done",
    dueTone: "muted",
  },
  {
    id: "t2",
    done: false,
    name: "Draft application form",
    caseRef: "#C-2398 · Priya Sharma",
    due: "Due 3pm",
    dueTone: "amber",
  },
  {
    id: "t3",
    done: false,
    name: "Submit visa application",
    caseRef: "#C-2391 · Carlos Mendes",
    due: "Overdue",
    dueTone: "red",
  },
  {
    id: "t4",
    done: false,
    name: "Follow up with client",
    caseRef: "#C-2389 · Mei Lin Chen",
    due: "Due 5pm",
    dueTone: "amber",
  },
  {
    id: "t5",
    done: false,
    name: "Review sponsor documents",
    caseRef: "#C-2385 · Ivan Petrov",
    due: "Due EOD",
    dueTone: "amber",
  },
];

const PERF_ROWS = [
  { label: "SLA compliance", width: 92, barClass: "bg-emerald-500", val: "92%" },
  { label: "Cases completed", width: 78, barClass: "bg-secondary", val: "78%" },
  { label: "Avg completion", width: 65, barClass: "bg-indigo-500", val: "65%" },
  { label: "Overdue rate", width: 16, barClass: "bg-red-500", val: "16%", valClass: "text-red-600" },
  { label: "Doc accuracy", width: 88, barClass: "bg-amber-500", val: "88%" },
];

function badgeClass(tone) {
  const map = {
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-800 border-red-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return map[tone] || map.gray;
}

const CaseworkerDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(TASKS_INITIAL);

  const greetingLine = useMemo(() => {
    const d = new Date();
    const line = d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${line} · Good morning, ${user?.name?.split(" ")[0] || "there"}`;
  }, [user?.name]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm font-bold text-gray-600 mt-1">{greetingLine}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">


        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAT_CARDS.map((s) => (
          <div
            key={s.key}
            className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-gray-200 border-t-4 ${s.borderClass}`}
          >
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
              {s.label}
            </p>
            <p
              className={`text-3xl md:text-4xl font-black tabular-nums leading-none tracking-tight ${s.valueClass}`}
            >
              {s.value}
              {s.valueSuffix ? (
                <span className="text-lg font-black text-gray-500 ml-0.5">
                  {s.valueSuffix}
                </span>
              ) : null}
            </p>
            <p
              className={`text-xs font-bold mt-2 ${s.trendWarn
                ? "text-red-600"
                : s.trendPositive === false
                  ? "text-red-600"
                  : "text-gray-600"
                }`}
            >
              {s.trendPositive === true ? (
                <>
                  <span className="text-emerald-600 font-black">
                    {s.trend.split(/\s+/).slice(0, 1).join(" ")}
                  </span>{" "}
                  {s.trend.split(/\s+/).slice(1).join(" ")}
                </>
              ) : (
                s.trend
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
            Recent cases
          </h2>
          <Link
            to="/caseworker/cases"
            className="text-xs font-black text-secondary hover:text-primary transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {[
                  "Case ID",
                  "Candidate",
                  "Business",
                  "Visa type",
                  "Status",
                  "Target date",
                  "Priority",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_CASES.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-black text-secondary">
                      {row.id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">
                    {row.candidate}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-600">
                    {row.business}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeClass("blue")}`}
                    >
                      {row.visa}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeClass(row.statusTone)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-600 tabular-nums">
                    {row.target}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeClass(row.priorityTone)}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <CalendarDays size={18} className="text-secondary" />
              Tasks due today
            </h2>
            <Link
              to="/caseworker/cases"
              className="text-xs font-black text-secondary hover:text-primary"
            >
              View all →
            </Link>
          </div>
          <div className="p-5 space-y-0 divide-y divide-gray-100">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${t.done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-300 hover:border-secondary"
                    }`}
                  aria-pressed={t.done}
                  aria-label={t.done ? "Mark incomplete" : "Mark done"}
                >
                  {t.done ? <Check size={10} strokeWidth={3} /> : null}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${t.done ? "text-gray-400 line-through" : "text-gray-900"}`}
                  >
                    {t.name}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-gray-500 mt-0.5">
                    {t.caseRef}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-black shrink-0 ${t.dueTone === "red"
                    ? "text-red-600"
                    : t.dueTone === "amber"
                      ? "text-amber-600"
                      : "text-gray-500"
                    }`}
                >
                  {t.due}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp size={18} className="text-secondary" />
              Performance overview
            </h2>
            <span className="text-xs font-black text-gray-400">Demo metrics</span>
          </div>
          <div className="p-5 space-y-4">
            {PERF_ROWS.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600 w-32 sm:w-36 shrink-0">
                  {p.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.barClass}`}
                    style={{ width: `${p.width}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-mono font-black text-gray-900 w-10 text-right shrink-0 ${p.valClass || ""}`}
                >
                  {p.val}
                </span>
              </div>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-1">Overall score</p>
              <p className="text-3xl font-black text-indigo-600">
                87
                <span className="text-base font-black text-gray-500">/ 100</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseworkerDashboard;
