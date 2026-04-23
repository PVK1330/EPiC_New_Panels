import { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { Plus, Check, Search } from "lucide-react";
import Modal from "../../components/Modal";
import { INITIAL_CASES } from "../../data/casesData";
import api from "../../services/api";

const TODAY_ISO = "2026-04-07";

// Default case options (will be filtered by current caseworker)
const DEFAULT_CASE_OPTIONS = [
  { caseId: "#C-2401", candidate: "Ahmed Al-Rashid" },
  { caseId: "#C-2398", candidate: "Priya Sharma" },
  { caseId: "#C-2391", candidate: "Carlos Mendes" },
  { caseId: "#C-2389", candidate: "Mei Lin Chen" },
  { caseId: "#C-2385", candidate: "Ivan Petrov" },
  { caseId: "#C-2405", candidate: "Omar Farouk" },
];

const emptyCreateForm = (caseOptions) => ({
  name: "",
  caseId: caseOptions?.[0]?.caseId || DEFAULT_CASE_OPTIONS[0].caseId,
  due: TODAY_ISO,
  priority: "medium",
});

function deriveSection(dueIso) {
  if (dueIso < TODAY_ISO) return "overdue";
  if (dueIso === TODAY_ISO) return "today";
  return "upcoming";
}

function priorityToDisplay(p) {
  const m = { high: "High", medium: "Medium", low: "Low" };
  return m[p] || p;
}

function displayPriorityToKey(label) {
  const m = { High: "high", Medium: "medium", Low: "low" };
  return m[label] || "medium";
}

function priorityToPrioTone(p) {
  if (p === "high") return "red";
  if (p === "medium") return "yellow";
  return "gray";
}

function buildNewTask(form, caseOptions) {
  const c = caseOptions.find((x) => x.caseId === form.caseId) || DEFAULT_CASE_OPTIONS[0];
  const section = deriveSection(form.due);
  const overdue = section === "overdue";
  return {
    id: `t-${Date.now()}`,
    name: form.name.trim(),
    caseId: c.caseId,
    candidate: c.candidate,
    due: form.due,
    status: overdue ? "Overdue" : "Pending",
    statusTone: overdue ? "red" : "yellow",
    priority: priorityToDisplay(form.priority),
    prioTone: priorityToPrioTone(form.priority),
    section,
    mine: true,
    done: false,
    action: overdue ? "Escalate" : "Update",
  };
}

const TASK_FILTERS = [
  { id: "all", label: "All tasks" },
  { id: "today_due", label: "Due today" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

const INITIAL_TASKS = [
  { id: "t1", name: "Submit visa application", caseId: "#C-2391", candidate: "Carlos Mendes", due: "2026-04-03", status: "Overdue", statusTone: "red", priority: "Critical", prioTone: "red", section: "overdue", mine: true, done: false, action: "Escalate" },
  { id: "t2", name: "Review bank statements", caseId: "#C-2391", candidate: "Carlos Mendes", due: "2026-04-02", status: "Overdue", statusTone: "red", priority: "High", prioTone: "red", section: "overdue", mine: true, done: false, action: "Escalate" },
  { id: "t3", name: "Follow up sponsor payment", caseId: "#C-2380", candidate: "Fatima Al-Zahra", due: "2026-04-01", status: "Overdue", statusTone: "red", priority: "Medium", prioTone: "yellow", section: "overdue", mine: true, done: false, action: "Escalate" },
  { id: "t4", name: "Request passport copy", caseId: "#C-2401", candidate: "Ahmed Al-Rashid", due: TODAY_ISO, status: "Done", statusTone: "green", priority: "High", prioTone: "red", section: "today", mine: true, done: true, action: "View" },
  { id: "t5", name: "Draft application form", caseId: "#C-2398", candidate: "Priya Sharma", due: TODAY_ISO, status: "In progress", statusTone: "blue", priority: "Medium", prioTone: "yellow", section: "today", mine: true, done: false, action: "Update" },
  { id: "t6", name: "Follow up with candidate", caseId: "#C-2389", candidate: "Mei Lin Chen", due: TODAY_ISO, status: "Pending", statusTone: "yellow", priority: "Low", prioTone: "gray", section: "today", mine: true, done: false, action: "Update" },
  { id: "t7", name: "Review sponsor documents", caseId: "#C-2385", candidate: "Ivan Petrov", due: TODAY_ISO, status: "Pending", statusTone: "yellow", priority: "Low", prioTone: "gray", section: "today", mine: true, done: false, action: "Update" },
  { id: "t8", name: "Send checklist to candidate", caseId: "#C-2405", candidate: "Omar Farouk", due: TODAY_ISO, status: "Pending", statusTone: "yellow", priority: "Medium", prioTone: "yellow", section: "today", mine: true, done: false, action: "Update" },
  { id: "t9", name: "Request English language cert", caseId: "#C-2401", candidate: "Ahmed Al-Rashid", due: "2026-04-10", status: "Pending", statusTone: "yellow", priority: "High", prioTone: "red", section: "upcoming", mine: true, done: false, action: "Update" },
  { id: "t10", name: "Complete application draft", caseId: "#C-2398", candidate: "Priya Sharma", due: "2026-04-11", status: "In progress", statusTone: "blue", priority: "Medium", prioTone: "yellow", section: "upcoming", mine: true, done: false, action: "Update" },
  { id: "t11", name: "Submit visa application", caseId: "#C-2401", candidate: "Ahmed Al-Rashid", due: "2026-04-18", status: "Pending", statusTone: "yellow", priority: "High", prioTone: "red", section: "upcoming", mine: true, done: false, action: "Update" },
  { id: "t12", name: "Compliance briefing call", caseId: "#C-2376", candidate: "Rajesh Patel", due: "2026-04-14", status: "Pending", statusTone: "yellow", priority: "Low", prioTone: "gray", section: "upcoming", mine: false, done: false, action: "Update" },
  { id: "t13", name: "Archive closed file", caseId: "#C-2350", candidate: "Marcus Webb", due: "2026-04-08", status: "Done", statusTone: "green", priority: "Low", prioTone: "gray", section: "upcoming", mine: true, done: true, action: "View" },
  { id: "t14", name: "Verify employment contract", caseId: "#C-2370", candidate: "Sofia Nielsen", due: "2026-04-15", status: "Pending", statusTone: "yellow", priority: "Medium", prioTone: "yellow", section: "upcoming", mine: false, done: false, action: "Update" },
  { id: "t15", name: "Schedule biometrics reminder", caseId: "#C-2365", candidate: "James O'Connor", due: "2026-04-16", status: "Pending", statusTone: "yellow", priority: "High", prioTone: "red", section: "upcoming", mine: true, done: false, action: "Update" },
  { id: "t16", name: "Upload COS to case file", caseId: "#C-2328", candidate: "David Mensah", due: "2026-04-19", status: "In progress", statusTone: "blue", priority: "Medium", prioTone: "yellow", section: "upcoming", mine: true, done: false, action: "Update" },
  { id: "t17", name: "Final QC before submit", caseId: "#C-2315", candidate: "Omar Farouk", due: "2026-04-21", status: "Pending", statusTone: "yellow", priority: "Critical", prioTone: "red", section: "upcoming", mine: true, done: false, action: "Update" },
  { id: "t18", name: "Notify candidate of outcome", caseId: "#C-2304", candidate: "Diego Silva", due: "2026-04-22", status: "Pending", statusTone: "yellow", priority: "Low", prioTone: "gray", section: "upcoming", mine: false, done: false, action: "Update" },
];

function formatDue(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function badgeStatus(tone) {
  const m = {
    red: "bg-red-50 text-red-800 border-red-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
  };
  return m[tone] || m.yellow;
}

function badgePriority(tone) {
  const m = {
    red: "bg-red-50 text-red-800 border-red-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return m[tone] || m.gray;
}

export default function Tasks() {
  const user = useSelector((state) => state.auth.user);
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState(() => INITIAL_TASKS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [caseOptions, setCaseOptions] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState({});
  const [viewTask, setViewTask] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    caseId: DEFAULT_CASE_OPTIONS[0].caseId,
    due: TODAY_ISO,
    priority: "medium",
  });
  const [editErrors, setEditErrors] = useState({});

  // Fetch case options from API
  useEffect(() => {
    const fetchCaseOptions = async () => {
      try {
        const response = await api.get("/api/cases/dropdown");
        if (response.data.status === "success") {
          const options = response.data.data.map(c => ({
            id: c.id,
            caseId: c.caseId || `#C-${c.id}`,
            candidate: c.candidateName || "Unknown"
          }));
          setCaseOptions(options);
        }
      } catch (error) {
        console.error("Error fetching case options:", error);
        setCaseOptions(DEFAULT_CASE_OPTIONS);
      }
    };

    fetchCaseOptions();
  }, []);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("filter", filter);
        if (search.trim()) params.append("search", search.trim());
        params.append("page", page);
        params.append("limit", 10);

        const response = await api.get(`/api/tasks/assign?${params.toString()}`);
        
        if (response.data.status === "success") {
          const apiTasks = response.data.data.tasks || [];
          setPagination(response.data.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
          
          // Map API response to local task structure
          const mappedTasks = apiTasks.map((task) => {
            const dueIso = task.due_date ? task.due_date.split('T')[0] : TODAY_ISO;
            const section = deriveSection(dueIso);
            const isCompleted = task.status === "completed";
            const overdue = section === "overdue" && !isCompleted;
            
            return {
              id: task.id.toString(),
              name: task.title,
              caseId: task.case_number || (task.case_id ? `#C-${task.case_id}` : "#C-0000"),
              candidate: task.candidate_name || task.assignee_name || "Unknown",
              assignedBy: task.assigned_by_name || "Unknown",
              due: dueIso,
              status: isCompleted ? "Done" : overdue ? "Overdue" : task.status === "in-progress" ? "In progress" : "Pending",
              statusTone: isCompleted ? "green" : overdue ? "red" : task.status === "in-progress" ? "blue" : "yellow",
              priority: priorityToDisplay(task.priority),
              prioTone: priorityToPrioTone(task.priority),
              section,
              mine: true,
              done: isCompleted,
              action: isCompleted ? "View" : overdue ? "Escalate" : "Update",
            };
          });
          
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filter, search, page]);

  // Filter case options to show only cases assigned to current caseworker
  const taskCaseOptions = useMemo(() => {
    if (!user) return caseOptions.length > 0 ? caseOptions : DEFAULT_CASE_OPTIONS;

    // Filter cases to show only those assigned to the current caseworker
    // In a real implementation, this would check the user's ID against case.caseworkerIds
    // For demo purposes, we'll show all cases but in production this would filter
    const filteredCases = caseOptions.filter(option => {
      // In production: check if user's ID is in the case's caseworkerIds array
      // For now, return all for demo
      return true;
    });

    return filteredCases.length > 0 ? filteredCases : caseOptions.length > 0 ? caseOptions : DEFAULT_CASE_OPTIONS;
  }, [user, caseOptions]);

  const caseOptionsForEdit = useMemo(() => {
    const map = new Map();
    taskCaseOptions.forEach((o) => map.set(o.caseId, o));
    tasks.forEach((t) => {
      if (!map.has(t.caseId)) map.set(t.caseId, { caseId: t.caseId, candidate: t.candidate });
    });
    return [...map.values()];
  }, [tasks, taskCaseOptions]);

  const openCreateModal = useCallback(() => {
    setViewTask(null);
    setEditTaskId(null);
    setCreateErrors({});
    setCreateForm(emptyCreateForm(taskCaseOptions));
    setCreateOpen(true);
  }, [taskCaseOptions]);

  const closeCreateModal = useCallback(() => {
    setCreateOpen(false);
    setCreateErrors({});
    setCreateForm(emptyCreateForm(taskCaseOptions));
  }, [taskCaseOptions]);

  const submitCreateTask = useCallback(async () => {
    const err = {};
    if (!createForm.name.trim()) err.name = "Required";
    if (!createForm.due) err.due = "Required";
    setCreateErrors(err);
    if (Object.keys(err).length) return;

    try {
      const selectedCase = taskCaseOptions.find(opt => opt.caseId === createForm.caseId);
      const caseId = selectedCase?.id || null;

      const data = {
        title: createForm.name.trim(),
        due_date: createForm.due,
        priority: createForm.priority,
        case_id: caseId,
      };

      const response = await api.post("/api/tasks", data);
      
      if (response.data.status === "success") {
        // Refresh tasks to get the new task
        setPage(1);
        closeCreateModal();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response?.data?.message) {
        setCreateErrors({ api: error.response.data.message });
      } else {
        setCreateErrors({ api: "Failed to create task" });
      }
    }
  }, [createForm, closeCreateModal, taskCaseOptions]);

  const openTaskView = useCallback((t) => {
    setViewTask(t);
    setEditTaskId(null);
  }, []);

  const closeTaskView = useCallback(() => setViewTask(null), []);

  const openTaskEdit = useCallback((t) => {
    setViewTask(null);
    setEditTaskId(t.id);
    setEditErrors({});
    setEditForm({
      name: t.name,
      caseId: t.caseId,
      due: t.due,
      priority: displayPriorityToKey(t.priority),
    });
  }, []);

  const closeTaskEdit = useCallback(() => {
    setEditTaskId(null);
    setEditErrors({});
  }, []);

  const submitTaskEdit = useCallback(async () => {
    if (!editTaskId) return;
    const err = {};
    if (!editForm.name.trim()) err.name = "Required";
    if (!editForm.due) err.due = "Required";
    setEditErrors(err);
    if (Object.keys(err).length) return;

    try {
      const selectedCase = caseOptionsForEdit.find(opt => opt.caseId === editForm.caseId);
      const caseId = selectedCase?.id || null;

      const data = {
        title: editForm.name.trim(),
        due_date: editForm.due,
        priority: editForm.priority,
        case_id: caseId,
      };

      const response = await api.put(`/api/tasks/${editTaskId}`, data);
      
      if (response.data.status === "success") {
        // Refresh tasks to get the updated task
        setPage(1);
        closeTaskEdit();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      if (error.response?.data?.message) {
        setEditErrors({ api: error.response.data.message });
      } else {
        setEditErrors({ api: "Failed to update task" });
      }
    }
  }, [editTaskId, editForm, caseOptionsForEdit, closeTaskEdit]);

  const toggleDone = useCallback(async (id) => {
    // Optimistically update local state
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, status: !t.done ? "Done" : "Pending", statusTone: !t.done ? "green" : "yellow" }
          : t,
      ),
    );

    try {
      const task = tasks.find(t => t.id === id);
      const newStatus = task?.done ? "pending" : "completed";
      
      const response = await api.put(`/api/tasks/${id}`, { status: newStatus });
      
      if (response.data.status === "success") {
        // Refresh tasks to ensure sync with server
        setPage(1);
      } else {
        // Revert optimistic update on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, done: t.done, status: t.status, statusTone: t.statusTone }
              : t,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert optimistic update on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, done: t.done, status: t.status, statusTone: t.statusTone }
            : t,
        ),
      );
    }
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "my" && !t.mine) return false;
      if (filter === "today" && t.due !== TODAY_ISO) return false;
      if (filter === "overdue" && t.section !== "overdue") return false;
      if (filter === "completed" && !t.done) return false;
      return true;
    });
  }, [tasks, filter]);

  const grouped = useMemo(() => {
    const overdue = filtered.filter((t) => t.section === "overdue");
    const today = filtered.filter((t) => t.section === "today");
    const upcoming = filtered.filter((t) => t.section === "upcoming");
    return { overdue, today, upcoming };
  }, [filtered]);

  const stats = useMemo(() => {
    const dueTodayAll = tasks.filter((t) => t.due === TODAY_ISO).length;
    const overdueN = tasks.filter((t) => t.section === "overdue" && !t.done).length;
    return { total: tasks.length, dueTodayAll, overdueN };
  }, [tasks]);

  const renderTable = (list) => (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 py-3 px-2" />
              {["Task name", "Case", "Due date", "Status", "Priority", "Actions"].map((h) => (
                <th
                  key={h}
                  className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/80">
                <td className="py-3 px-2 pl-4">
                  <button
                    type="button"
                    onClick={() => toggleDone(t.id)}
                    className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                      t.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300 hover:border-secondary"
                    }`}
                    aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {t.done ? <Check size={10} strokeWidth={3} /> : null}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-sm font-bold ${t.done ? "text-gray-400 line-through" : "text-gray-900"}`}
                  >
                    {t.name}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-[11px] font-black text-secondary">{t.caseId}</span>{" "}
                  <span className="text-sm font-bold text-gray-700">{t.candidate}</span>
                </td>
                <td
                  className={`py-3 px-4 text-sm font-bold tabular-nums ${
                    t.section === "overdue"
                      ? "text-red-600"
                      : t.due === TODAY_ISO
                        ? "text-amber-600"
                        : "text-gray-600"
                  }`}
                >
                  {formatDue(t.due)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${badgeStatus(t.statusTone)}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${badgePriority(t.prioTone)}`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => openTaskView(t)}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-black text-gray-600 hover:border-secondary/40 hover:text-secondary"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openTaskEdit(t)}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-black text-secondary hover:bg-secondary/5"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            Tasks
          </h1>
          <p className="text-sm font-bold text-gray-600 mt-1">
            {stats.total} tasks · {stats.dueTodayAll} due today · {stats.overdueN} overdue
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 self-start"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create task
        </button>
      </div>

      <Modal
        open={createOpen}
        onClose={closeCreateModal}
        title="Create task"
        titleId="create-task-modal-title"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-4">
          {/* <p className="text-sm font-bold text-gray-600">
            Add a task for a case. Dates are saved locally in this demo until workflows are connected to the API.
          </p> */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Task name
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                createErrors.name ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. Request English certificate"
            />
            {createErrors.name && (
              <p className="text-xs font-bold text-red-600 mt-1">{createErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Case
            </label>
            <select
              value={createForm.caseId}
              onChange={(e) => setCreateForm((f) => ({ ...f, caseId: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
            >
              {taskCaseOptions.map((o) => (
                <option key={o.caseId} value={o.caseId}>
                  {o.caseId} — {o.candidate}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={createForm.due}
                onChange={(e) => setCreateForm((f) => ({ ...f, due: e.target.value }))}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                  createErrors.due ? "border-red-300" : "border-gray-200"
                }`}
              />
              {createErrors.due && (
                <p className="text-xs font-bold text-red-600 mt-1">{createErrors.due}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Priority
              </label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitCreateTask}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
            >
              Create task
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewTask}
        onClose={closeTaskView}
        title={viewTask ? `Task · ${viewTask.caseId}` : ""}
        titleId="task-view-modal-title"
        maxWidthClass="max-w-md"
        bodyClassName="p-4 sm:p-6"
      >
        {viewTask && (
          <dl className="space-y-4">
            {[
              ["Task name", viewTask.name],
              ["Case", `${viewTask.caseId} — ${viewTask.candidate}`],
              ["Due date", formatDue(viewTask.due)],
              ["Status", viewTask.status],
              ["Priority", viewTask.priority],
              ["Assigned to", viewTask.mine ? "You" : "Team member"],
              ["Assigned by", viewTask.assignedBy || "Unknown"],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  {label}
                </dt>
                <dd className="text-sm font-bold text-gray-900">{val}</dd>
              </div>
            ))}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const t = viewTask;
                  closeTaskView();
                  openTaskEdit(t);
                }}
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
              >
                Edit task
              </button>
            </div>
          </dl>
        )}
      </Modal>

      <Modal
        open={!!editTaskId}
        onClose={closeTaskEdit}
        title="Edit task"
        titleId="task-edit-modal-title"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Task name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                editErrors.name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {editErrors.name && (
              <p className="text-xs font-bold text-red-600 mt-1">{editErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Case
            </label>
            <select
              value={editForm.caseId}
              onChange={(e) => setEditForm((f) => ({ ...f, caseId: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
            >
              {caseOptionsForEdit.map((o) => (
                <option key={o.caseId} value={o.caseId}>
                  {o.caseId} — {o.candidate}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={editForm.due}
                onChange={(e) => setEditForm((f) => ({ ...f, due: e.target.value }))}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                  editErrors.due ? "border-red-300" : "border-gray-200"
                }`}
              />
              {editErrors.due && (
                <p className="text-xs font-bold text-red-600 mt-1">{editErrors.due}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Priority
              </label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={closeTaskEdit}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitTaskEdit}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
            >
              Save changes
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TASK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-black transition-colors ${
                filter === f.id
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
          />
        </div>
      </div>

      {filter === "all" && (
        <>
          {grouped.overdue.length > 0 && (
            <section>
              <p className="text-[11px] font-black uppercase tracking-wider text-red-600 mb-2">
                Overdue ({grouped.overdue.length})
              </p>
              {renderTable(grouped.overdue)}
            </section>
          )}
          {grouped.today.length > 0 && (
            <section>
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 mb-2">
                Due today ({grouped.today.length})
              </p>
              {renderTable(grouped.today)}
            </section>
          )}
          {grouped.upcoming.length > 0 && (
            <section>
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                Upcoming ({grouped.upcoming.length})
              </p>
              {renderTable(grouped.upcoming)}
            </section>
          )}
        </>
      )}

      {filter !== "all" && (
        <section>
          {filtered.length === 0 ? (
            <p className="text-sm font-bold text-gray-500 py-12 text-center border border-dashed border-gray-200 rounded-2xl">
              No tasks match this filter.
            </p>
          ) : (
            renderTable(filtered)
          )}
        </section>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-xs font-bold text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} tasks
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-gray-600 py-1.5">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
