import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Clock, AlertCircle, Check, Search, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { getMyLicenceStageTasks } from "../../services/licenceApi";
import { formatDateLong } from "../../utils/datetime";
import { classifyTaskDue } from "../../utils/taskDueStatus";

const todayIso = () => new Date().toISOString().split("T")[0];

function deriveSection(dueIso, isCompleted) {
  if (isCompleted) return "completed";
  return classifyTaskDue(dueIso).section;
}

function sectionLabel(section) {
  if (section === "overdue") return "Overdue";
  if (section === "due_soon") return "Due Soon";
  if (section === "today") return "Due Today";
  return "Upcoming";
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "due_soon", label: "Due Soon" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

export default function BusinessTasks() {
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [stageTasks, setStageTasks] = useState([]);
  const [stageLoading, setStageLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, page, limit: 20 });
      if (search.trim()) params.append("search", search.trim());
      const res = await api.get(`/api/tasks/assign?${params}`);
      if (res.data.status === "success") {
        const raw = res.data.data.tasks || [];
        setPagination(res.data.data.pagination || { total: 0, totalPages: 0 });
        setTasks(raw.map((t) => {
          const dueIso = t.due_date ? t.due_date.split("T")[0] : todayIso();
          const isCompleted = t.status === "completed";
          const section = deriveSection(dueIso, isCompleted);
          return {
            id: t.id,
            title: t.title,
            caseRef: t.case_number || (t.case_id ? `#C-${t.case_id}` : null),
            assignedBy: t.assigned_by_name || "Admin",
            due: dueIso,
            section,
            isCompleted,
            priority: t.priority || "medium",
          };
        }));
      }
    } catch {
      // silently fail — no toast needed on initial load
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    setStageLoading(true);
    getMyLicenceStageTasks()
      .then((res) => setStageTasks(res.data?.data?.tasks || []))
      .catch(() => setStageTasks([]))
      .finally(() => setStageLoading(false));
  }, []);

  const sections = ["overdue", "due_soon", "today", "upcoming", "completed"];
  const grouped = Object.fromEntries(sections.map((s) => [s, tasks.filter((t) => t.section === s)]));

  const priorityBadge = (p) => {
    if (p === "high") return "bg-red-50 text-red-700 border-red-200";
    if (p === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="space-y-5 pb-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <CheckSquare className="text-primary" size={26} />
          My Tasks
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">Actions required from you across your licence applications.</p>
      </motion.div>

      {/* Licence Stage Tasks */}
      {(stageLoading || stageTasks.length > 0) && (
        <div className="relative rounded-2xl border border-violet-200 bg-white shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-violet-700" />
          <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
            <FileText size={15} className="text-violet-600" />
            <span className="text-xs font-black uppercase tracking-wider text-violet-700">Licence Application — Pending Actions</span>
            {!stageLoading && (
              <span className="ml-auto text-[10px] font-black text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">{stageTasks.length}</span>
            )}
          </div>
          {stageLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={22} className="text-violet-400 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-violet-50">
              {stageTasks.map((task) => (
                <div key={task.id} className="px-4 py-3 flex items-start gap-3 hover:bg-violet-50/40 transition-colors relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    task.section === "overdue" ? "bg-red-100" : "bg-violet-100"
                  }`}>
                    {task.section === "overdue"
                      ? <AlertCircle size={13} className="text-red-500" />
                      : <Clock size={13} className="text-violet-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-secondary">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                        Licence Application
                      </span>
                      {task.section === "overdue" && (
                        <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                      {task.section === "due_soon" && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Due soon</span>
                      )}
                    </div>
                  </div>
                  {task.due_date && (
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-black ${task.section === "overdue" ? "text-red-500" : "text-gray-500"}`}>
                        {formatDateLong(task.due_date + "T12:00:00", { month: "short" })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 px-3"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1); }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black border transition ${
                filter === f.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="text-primary animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <CheckSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-black text-secondary">No tasks found</p>
          <p className="text-xs font-bold text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        sections.filter((s) => grouped[s].length > 0).map((s) => (
          <motion.div key={s} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              {s === "overdue" && <AlertCircle size={16} className="text-red-500" />}
              {s === "due_soon" && <Clock size={16} className="text-amber-500" />}
              {s === "completed" && <Check size={16} className="text-emerald-500" />}
              <h2 className={`text-[10px] font-black uppercase tracking-wider ${
                s === "overdue" ? "text-red-500" : s === "due_soon" ? "text-amber-500" : "text-gray-500"
              }`}>{sectionLabel(s)}</h2>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{grouped[s].length}</span>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
              {grouped[s].map((task) => (
                <div key={task.id} className="px-3 py-2 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    task.isCompleted ? "bg-emerald-100" : s === "overdue" ? "bg-red-100" : "bg-primary/10"
                  }`}>
                    {task.isCompleted
                      ? <Check size={13} className="text-emerald-600" />
                      : s === "overdue"
                        ? <AlertCircle size={13} className="text-red-500" />
                        : <Clock size={13} className="text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black ${task.isCompleted ? "text-gray-400 line-through" : "text-secondary"}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {task.caseRef && (
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {task.caseRef}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-gray-400">
                        Assigned by {task.assignedBy}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border capitalize ${priorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-black ${s === "overdue" ? "text-red-500" : "text-gray-500"}`}>
                      {formatDateLong(task.due + "T12:00:00", { month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-black text-gray-600 hover:border-primary/40 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs font-black text-gray-500">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-black text-gray-600 hover:border-primary/40 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
