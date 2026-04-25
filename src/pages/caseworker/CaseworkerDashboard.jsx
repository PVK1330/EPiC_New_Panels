import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Check, TrendingUp, Bell, Plus, Send, MessageSquareMore } from "lucide-react";
import api from "../../services/api";




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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentCases, setRecentCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/caseworker/cases/dashboard/stats");
        const { stats, recentCases, tasksToday } = response.data.data;
        setStats(stats);
        setRecentCases(recentCases || []);
        setTasks(tasksToday || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentMessages = async () => {
      try {
        const response = await api.get("/api/messages/conversations");
        const conversations = response.data.data.conversations || [];
        const formattedMessages = conversations.slice(0, 4).map(conv => ({
          from: conv.user.first_name + " " + conv.user.last_name,
          initials: (conv.user.first_name[0] + conv.user.last_name[0]).toUpperCase(),
          text: conv.lastMessage?.content || "No message",
          time: new Date(conv.lastMessage?.createdAt).toLocaleString(),
          unread: conv.unreadCount > 0,
        }));
        setRecentMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchDashboardData();
    fetchRecentMessages();
  }, []);

  const toggleTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        await api.put(`/api/tasks/${id}`, { status: task.status === 'completed' ? 'pending' : 'completed' });
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const STAT_CARDS = [
    {
      key: "assigned",
      label: "Assigned cases",
      value: stats.assigned?.toString() || "0",
      borderClass: "border-t-secondary",
      valueClass: "text-secondary",
    },
    {
      key: "active",
      label: "Active cases",
      value: stats.active?.toString() || "0",
      borderClass: "border-t-emerald-500",
      valueClass: "text-emerald-600",
    },
    {
      key: "overdue",
      label: "Overdue cases",
      value: stats.overdue?.toString() || "0",
      borderClass: "border-t-red-500",
      valueClass: "text-red-600",
    },
    {
      key: "tasksToday",
      label: "Tasks due today",
      value: stats.tasksToday?.toString() || "0",
      borderClass: "border-t-amber-500",
      valueClass: "text-amber-600",
    },
    {
      key: "completedMonth",
      label: "Completed (month)",
      value: stats.completedMonth?.toString() || "0",
      borderClass: "border-t-teal-500",
      valueClass: "text-teal-600",
    },
    {
      key: "score",
      label: "Performance score",
      value: stats.performanceScore?.toString() || "0",
      valueSuffix: "%",
      borderClass: "border-t-indigo-500",
      valueClass: "text-indigo-600",
    },
  ];

  const mapStatusTone = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("overdue")) return "red";
    if (statusLower.includes("pending") || statusLower.includes("due")) return "yellow";
    if (statusLower.includes("approved") || statusLower.includes("completed") || statusLower.includes("on track")) return "green";
    return "gray";
  };

  const mapPriorityTone = (priority) => {
    const priorityLower = priority?.toLowerCase() || "";
    if (priorityLower.includes("critical") || priorityLower.includes("high")) return "red";
    if (priorityLower.includes("medium")) return "yellow";
    return "gray";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTaskDue = (dueDate) => {
    if (!dueDate) return "Due";
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMs < 0) return "Overdue";
    if (diffHours < 1) return "Due now";
    if (diffHours < 24) return `Due ${diffHours}h`;
    return formatDate(dueDate);
  };

  const formatTaskDueTone = (dueDate) => {
    if (!dueDate) return "amber";
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    if (diffMs < 0) return "red";
    if (diffMs < 24 * 60 * 60 * 1000) return "amber";
    return "muted";
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
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          STAT_CARDS.map((s) => (
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
            </div>
          ))
        )}
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </td>
                </tr>
              ) : recentCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-sm font-bold text-gray-500">
                    No recent cases
                  </td>
                </tr>
              ) : (
                recentCases.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/caseworker/cases`)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-black text-secondary">
                        {row.caseId || `#C-${row.id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-900">
                      {row.candidate ? `${row.candidate.first_name} ${row.candidate.last_name}` : "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-600">
                      {row.sponsor?.sponsorProfile?.companyName || row.sponsor?.sponsorProfile?.tradingName || `${row.sponsor?.first_name || ""} ${row.sponsor?.last_name || ""}`.trim() || "Unknown"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeClass("blue")}`}
                      >
                        {row.visaType?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeClass(mapStatusTone(row.status))}`}
                      >
                        {row.status || "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-600 tabular-nums">
                      {formatDate(row.targetSubmissionDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeClass(mapPriorityTone(row.priority))}`}
                      >
                        {row.priority || "Medium"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
            {loading ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-sm font-bold text-gray-500">
                No tasks due today
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${t.status === 'completed'
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-300 hover:border-secondary"
                      }`}
                    aria-pressed={t.status === 'completed'}
                    aria-label={t.status === 'completed' ? "Mark incomplete" : "Mark done"}
                  >
                    {t.status === 'completed' ? <Check size={10} strokeWidth={3} /> : null}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold ${t.status === 'completed' ? "text-gray-400 line-through" : "text-gray-900"}`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-gray-500 mt-0.5">
                      {t.case ? `${t.case.caseId} · ${t.case.candidate?.first_name} ${t.case.candidate?.last_name}` : "No case"}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-black shrink-0 ${formatTaskDueTone(t.due_date) === "red"
                      ? "text-red-600"
                      : formatTaskDueTone(t.due_date) === "amber"
                        ? "text-amber-600"
                        : "text-gray-500"
                      }`}
                  >
                    {formatTaskDue(t.due_date)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

            {/* Recent Messages Section */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <MessageSquareMore size={18} className="text-secondary" />
            Recent Messages
          </h2>
          <Link
            to="/caseworker/messages"
            className="text-xs font-black text-secondary hover:text-primary"
          >
            View all →
          </Link>
        </div>
        <div className="p-5 space-y-3 flex-1">
          {recentMessages.length === 0 ? (
            <div className="py-8 text-center text-sm font-bold text-gray-500">
              No recent messages
            </div>
          ) : (
            recentMessages.map((m) => (
              <div
                key={`${m.from}-${m.time}`}
                className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary text-white text-xs font-black flex items-center justify-center shrink-0">
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-800 truncate">{m.from}</p>
                      <span className="ml-auto text-[11px] font-bold text-gray-400 shrink-0">
                        {m.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{m.text}</p>
                  </div>
                  {m.unread && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              className="rounded-xl bg-primary p-3 text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
        {/* <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
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
        </div> */}
      </div>

      
    </div>
  );
};

export default CaseworkerDashboard;
