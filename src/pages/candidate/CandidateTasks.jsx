import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  completeCandidateTask,
  getCandidateTasks,
  markBiometricAttended,
} from "../../services/workflowApi";
import Button from "../../components/Button";
import { formatDateLong } from "../../utils/datetime";

function formatDue(dateStr) {
  if (!dateStr) return "No due date";
  return formatDateLong(dateStr, { month: "short" });
}

function isBiometricAvailabilityTask(task) {
  return task.isBiometricAvailability || /biometric.*availability/i.test(task.title || "");
}

function isBiometricAttendTask(task) {
  return task.isBiometricAttend || /attend biometrics/i.test(task.title || "");
}

function taskActionPath(task) {
  const title = task.title || "";
  if (task.isDataCapture) return "/candidate/document-checklist";
  if (isBiometricAvailabilityTask(task)) return "/candidate/biometric-availability";
  if (/draft application|review draft/i.test(title)) return "/candidate/application";
  if (/upload|document/i.test(title)) return "/candidate/upload-documents";
  if (/checklist/i.test(title)) return "/candidate/document-checklist";
  if (task.isCclPayment || /pay ccl fee/i.test(title)) return "/candidate/ccl";
  if (/client care|ccl|fee|payment/i.test(title)) return "/candidate/ccl";
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
      if (isBiometricAttendTask(task)) {
        await markBiometricAttended();
        showToast({
          message: "Thank you — your caseworker and admin have been notified.",
        });
      } else {
        await completeCandidateTask(task.id);
        showToast({ message: "Task marked complete." });
      }
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
          Actions from your caseworker  including Data Capture Sheet requests sent to you.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm font-bold">Loading tasks</span>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <h2 className="text-sm font-black text-secondary">To do ({pending.length})</h2>
            </div>
            {pending.length === 0 ? (
              <p className="px-5 py-8 text-sm font-bold text-gray-400 text-center">
                No pending tasks  you are up to date.
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
                        {task.isCclPayment && task.cclFeeAmount > 0 && (
                          <p className="text-xs font-bold text-emerald-800 mt-1">
                            Amount due: £
                            {Number(task.cclFeeAmount).toLocaleString("en-GB", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            — review your Client Care Letter, then pay from Payments.
                          </p>
                        )}
                        {isBiometricAttendTask(task) && task.biometricDetails && (
                          <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold text-secondary space-y-0.5">
                            <p>
                              <span className="text-primary">Location:</span>{" "}
                              {task.biometricDetails.location || "—"}
                            </p>
                            <p>
                              <span className="text-primary">Date:</span>{" "}
                              {task.biometricDetails.day
                                ? `${task.biometricDetails.day}, `
                                : ""}
                              {task.biometricDetails.date
                                ? formatDue(task.biometricDetails.date)
                                : "—"}
                            </p>
                            <p>
                              <span className="text-primary">Time:</span>{" "}
                              {task.biometricDetails.time || "—"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {!isBiometricAttendTask(task) && (
                        <Link
                          to={taskActionPath(task)}
                          className="inline-flex items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-black text-primary hover:bg-primary/15"
                        >
                          Open <ArrowRight size={14} />
                        </Link>
                      )}
                      <Button
                        type="button"
                        variant={isBiometricAttendTask(task) ? "primary" : "outline"}
                        className="rounded-xl text-xs"
                        disabled={busyId === task.id}
                        onClick={() => handleComplete(task)}
                      >
                        {busyId === task.id
                          ? "Saving…"
                          : isBiometricAttendTask(task)
                            ? "Mark as attended"
                            : "Mark done"}
                      </Button>
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
