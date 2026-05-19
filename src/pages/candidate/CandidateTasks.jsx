import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { completeCandidateTask, getCandidateTasks } from "../../services/workflowApi";
import Button from "../../components/Button";

function formatDue(dateStr) {
  if (!dateStr) return "No due date";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function taskActionPath(task) {
  if (task.isDataCapture) return "/candidate/document-checklist";
  if (/upload|document/i.test(task.title || "")) return "/candidate/upload-documents";
  if (/checklist/i.test(task.title || "")) return "/candidate/document-checklist";
  if (/client care|ccl|fee|payment/i.test(task.title || "")) return "/candidate/ccl";
  if (/biometric|availability/i.test(task.title || "")) return "/candidate/biometric-availability";
  return "/candidate/application";
}

export default function CandidateTasks() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCandidateTasks();
      setTasks(data?.tasks || []);
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to load your tasks",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (task) => {
    if (task.status === "completed") return;
    setBusyId(task.id);
    try {
      await completeCandidateTask(task.id);
      showToast({ message: "Task marked complete." });
      await load();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Could not update task",
      });
    } finally {
      setBusyId(null);
    }
  };

  const pending = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6 pb-10 max-w-3xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">My Tasks</h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Actions from your caseworker â€” including Data Capture Sheet requests sent to you.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm font-bold">Loading tasksâ€¦</span>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-sm font-black text-secondary">To do ({pending.length})</h2>
            </div>
            {pending.length === 0 ? (
              <p className="px-5 py-8 text-sm font-bold text-gray-400 text-center">
                No pending tasks â€” you are up to date.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {pending.map((task) => (
                  <li
                    key={task.id}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                        <ClipboardList size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-secondary">{task.title}</p>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">
                          {task.caseRef ? `Case ${task.caseRef}` : "Your application"} Â· Due{" "}
                          {formatDue(task.due_date)}
                        </p>
                        {task.isDataCapture && (
                          <p className="text-xs font-bold text-primary mt-1">
                            Complete your document checklist and upload the required files.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Link
                        to={taskActionPath(task)}
                        className="inline-flex items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-black text-primary hover:bg-primary/15"
                      >
                        Open <ArrowRight size={14} />
                      </Link>
                      {!task.isDataCapture && (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl text-xs"
                          disabled={busyId === task.id}
                          onClick={() => handleComplete(task)}
                        >
                          {busyId === task.id ? "Savingâ€¦" : "Mark done"}
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {done.length > 0 && (
            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-black text-gray-500">Completed ({done.length})</h2>
              </div>
              <ul className="divide-y divide-gray-50">
                {done.map((task) => (
                  <li
                    key={task.id}
                    className="px-5 py-3 flex items-center gap-3 text-gray-500"
                  >
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold line-through">{task.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
