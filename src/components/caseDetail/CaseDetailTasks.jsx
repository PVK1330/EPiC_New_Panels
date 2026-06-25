import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../Modal";
import Input from "../Input";
import DatePicker from "../DatePicker";
import Button from "../Button";
import { getCaseworkers } from "../../services/caseApi";
import { useToast } from "../../context/ToastContext";

// Values MUST match the backend enums in task.controller.js
// (PRIORITIES = low/medium/high, STATUSES = pending/in-progress/completed).
const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const emptyForm = { title: "", assignedTo: "", due: "", priority: "medium", status: "pending" };

// Normalise a raw priority/status coming from the mapped task back to a value
// the <select> can match (lowercased, "in progress" → "in-progress").
const normalise = (v, allowed, fallback) => {
  const k = String(v || "").trim().toLowerCase().replace(/\s+/g, "-");
  return allowed.some((o) => o.value === k) ? k : fallback;
};

const CaseDetailTasks = ({ tasks = [], loading = false, onAdd, onEdit, onDelete }) => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [caseworkers, setCaseworkers] = useState([]);

  // Load assignable caseworkers once (backend needs assigned_to as a user id).
  useEffect(() => {
    let active = true;
    getCaseworkers({ limit: 999 })
      .then((res) => {
        if (!active) return;
        const data = res?.data?.data;
        const list = data?.caseworker || data?.caseworkers || (Array.isArray(data) ? data : []);
        setCaseworkers(
          list.filter((u) => u.status !== "inactive" && u.status !== "suspended")
        );
      })
      .catch(() => active && setCaseworkers([]));
    return () => {
      active = false;
    };
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: "" }));
  };

  const closeModal = () => {
    setOpen(false);
    setForm(emptyForm);
    setErrors({});
    setEditingTask(null);
  };

  const openAdd = () => {
    setMode("add");
    setEditingTask(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (task) => {
    setMode("edit");
    setEditingTask(task);
    setForm({
      title: task.task || "",
      assignedTo: "", // empty = keep current assignee
      due: task.due && task.due !== "N/A" ? task.due : "",
      priority: normalise(task.priority, PRIORITIES, "medium"),
      status: normalise(task.status, STATUSES, "pending"),
    });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.due.trim()) e.due = "Required";
    // On add the backend requires an assignee; on edit it is optional (blank = keep current).
    if (mode === "add" && !form.assignedTo) e.assignedTo = "Required";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSaving(true);
    try {
      if (mode === "add") {
        await onAdd?.({
          title: form.title.trim(),
          assigned_to: Number(form.assignedTo),
          due_date: form.due,
          priority: form.priority,
          status: form.status,
        });
        showToast({ message: "Task created", variant: "success" });
      } else {
        const payload = {
          title: form.title.trim(),
          due_date: form.due,
          priority: form.priority,
          status: form.status,
        };
        // Only reassign when the admin explicitly picks someone.
        if (form.assignedTo) payload.assigned_to = Number(form.assignedTo);
        await onEdit?.(editingTask.id, payload);
        showToast({ message: "Task updated", variant: "success" });
      }
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save task";
      showToast({ message: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    setDeleting(true);
    try {
      await onDelete?.(editingTask.id);
      showToast({ message: "Task deleted", variant: "success" });
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete task";
      showToast({ message: msg, variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const assigneeOptions = [
    {
      value: "",
      label:
        mode === "edit"
          ? `Keep current${editingTask?.assigned ? ` (${editingTask.assigned})` : ""}`
          : "Select assignee…",
    },
    ...caseworkers.map((cw) => ({
      value: String(cw.id),
      label: `${cw.first_name || ""} ${cw.last_name || ""}`.trim() || cw.email || `User #${cw.id}`,
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-sm font-black text-secondary">Case Tasks</h3>
        <Button type="button" onClick={openAdd} className="rounded-xl text-sm shrink-0">
          Add Task
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              {["Task", "Assigned To", "Due Date", "Priority", "Status", " "].map((h, idx) => (
                <th key={idx} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h.trim() || ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Loading tasks…
                </td>
              </tr>
            )}
            {!loading && tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  No tasks yet. Click “Add Task” to create one.
                </td>
              </tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 text-sm font-semibold text-secondary max-w-[200px]">{t.task}</td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{t.assigned}</td>
                <td className={`px-4 py-3 text-xs font-mono whitespace-nowrap ${t.dueClass}`}>{t.due}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${t.priorityClass}`}>{t.priority}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${t.statusClass}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-blue-50 transition-colors"
                    title="Edit task"
                  >
                    <FiEdit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        title={mode === "edit" ? "Edit Task" : "Add Task"}
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            {mode === "edit" && (
              <Button
                variant="danger"
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="rounded-xl mr-auto"
              >
                <FiTrash2 size={14} />
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            )}
            <Button variant="ghost" type="button" onClick={closeModal} disabled={saving || deleting} className="rounded-xl">
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={save} disabled={saving || deleting} className="rounded-xl">
              {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Save Task"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Task" name="title" value={form.title} onChange={change} placeholder="Task description" required error={errors.title} />
          </div>
          <Input
            label="Assigned To"
            name="assignedTo"
            value={form.assignedTo}
            onChange={change}
            options={assigneeOptions}
            required={mode === "add"}
            error={errors.assignedTo}
          />
          <DatePicker
            label="Due Date"
            name="due"
            value={form.due}
            onChange={change}
            required
            error={errors.due}
            min={mode === "add" ? new Date().toISOString().split("T")[0] : undefined}
          />
          <Input label="Priority" name="priority" value={form.priority} onChange={change} options={PRIORITIES} />
          <Input label="Status" name="status" value={form.status} onChange={change} options={STATUSES} />
        </div>
      </Modal>
    </motion.div>
  );
};

export default CaseDetailTasks;
