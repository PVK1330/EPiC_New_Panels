import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/Modal";
import DatePicker from "../../../components/DatePicker";
import useCaseDetail from "../../../hooks/useCaseDetail";
import { updateTask } from "../../../services/caseApi";
import { formatDate } from "../../../utils/datetime";

function CasesTasksTab({ caseId }) {
  const { tasks, tasksLoading: loading, fetchTasks, addTask } = useCaseDetail();
  const [togglingId, setTogglingId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    due: new Date().toISOString().split("T")[0],
    priority: "medium",
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    if (!caseId) return;
    fetchTasks(caseId);
  }, [caseId, fetchTasks]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-50 text-red-700";
      case "medium": return "bg-amber-50 text-amber-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  const toggleComplete = useCallback(async (task) => {
    if (!task?.id) return;
    setTogglingId(task.id);
    const next = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask(task.id, { status: next });
    } catch (e) {
      console.error("Failed to update task status:", e);
    } finally {
      await fetchTasks(caseId);
      setTogglingId(null);
    }
  }, [caseId, fetchTasks]);

  const openCreateModal = useCallback(() => {
    setCreateErrors({});
    setCreateForm({ name: "", due: new Date().toISOString().split("T")[0], priority: "medium" });
    setCreateOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateOpen(false);
    setCreateErrors({});
    setCreateForm({ name: "", due: new Date().toISOString().split("T")[0], priority: "medium" });
  }, []);

  const submitCreateTask = useCallback(async () => {
    const err = {};
    if (!createForm.name.trim()) err.name = "Please enter a task name";
    if (!createForm.due) {
      err.due = "Please choose a due date";
    } else {
      const picked = new Date(`${createForm.due}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(picked.getTime())) err.due = "Enter a valid date";
      else if (picked < today) err.due = "Due date cannot be in the past";
    }
    setCreateErrors(err);
    if (Object.keys(err).length) return;
    try {
      const data = { title: createForm.name.trim(), due_date: createForm.due, priority: createForm.priority, case_id: Number(caseId) };
      const response = await addTask(data);
      if (response.data.status === "success") {
        await fetchTasks(caseId);
        closeCreateModal();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setCreateErrors({ api: error.response?.data?.message || "Failed to create task" });
    }
  }, [createForm, caseId, closeCreateModal, addTask, fetchTasks]);

  return (
    <div className="space-y-3">
      <button type="button" onClick={openCreateModal}
        className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white">
        Create task
      </button>
      {loading ? (
        <p className="text-sm text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks created yet.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100">
            <button type="button" onClick={() => toggleComplete(task)} disabled={togglingId === task.id}
              aria-label={task.status === "completed" ? "Mark as not done" : "Mark as completed"}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${task.status === "completed" ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 hover:border-emerald-400"} ${togglingId === task.id ? "opacity-50" : "cursor-pointer"}`}>
              {task.status === "completed" ? <Check size={10} strokeWidth={3} /> : null}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{task.title}</p>
              <p className="text-[11px] text-gray-500">
                {task.status === "completed" ? "Completed" : `Due ${formatDate(task.due_date)}`}
              </p>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        ))
      )}

      <Modal open={createOpen} onClose={closeCreateModal} title="Create task"
        titleId="create-task-modal-title" maxWidthClass="max-w-lg" bodyClassName="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Task name</label>
            <input type="text" value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${createErrors.name ? "border-red-300" : "border-gray-200"}`}
              placeholder="e.g. Request English certificate" />
            {createErrors.name && <p className="text-xs font-bold text-red-600 mt-1">{createErrors.name}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Due date</label>
              <DatePicker name="due" value={createForm.due}
                onChange={(e) => setCreateForm((f) => ({ ...f, due: e.target.value }))}
                error={createErrors.due} min={new Date().toISOString().split("T")[0]} placeholder="Select due date" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Priority</label>
              <select value={createForm.priority}
                onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {createErrors.api && <p className="text-xs font-bold text-red-600 mt-1">{createErrors.api}</p>}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={closeCreateModal}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={submitCreateTask}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90">
              Create task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CasesTasksTab;
