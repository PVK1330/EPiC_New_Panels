import { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2 } from "react-icons/fi";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";

const PRIORITIES = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Critical", label: "Critical" },
];

const STATUSES = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

const emptyTask = { task: "", assigned: "", due: "", priority: "Medium", status: "Pending" };

const CaseDetailTasks = ({ tasks }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [errors, setErrors] = useState({});

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: "" }));
  };

  const save = () => {
    const e = {};
    if (!form.task.trim()) e.task = "Required";
    if (!form.assigned.trim()) e.assigned = "Required";
    if (!form.due.trim()) e.due = "Required";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setOpen(false);
    setForm(emptyTask);
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-sm font-black text-secondary">Case Tasks</h3>
        <Button type="button" onClick={() => setOpen(true)} className="rounded-xl text-sm shrink-0">
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
                  <button type="button" className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-blue-50 transition-colors" title="Update">
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
        onClose={() => { setOpen(false); setForm(emptyTask); setErrors({}); }}
        title="Add Task"
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={save} className="rounded-xl">
              Save Task
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Task" name="task" value={form.task} onChange={change} placeholder="Task description" required error={errors.task} />
          </div>
          <Input label="Assigned To" name="assigned" value={form.assigned} onChange={change} placeholder="Alice Patel" required error={errors.assigned} />
          <Input label="Due Date" name="due" type="date" value={form.due} onChange={change} required error={errors.due} />
          <Input label="Priority" name="priority" value={form.priority} onChange={change} options={PRIORITIES} />
          <Input label="Status" name="status" value={form.status} onChange={change} options={STATUSES} />
        </div>
      </Modal>
    </motion.div>
  );
};

export default CaseDetailTasks;
