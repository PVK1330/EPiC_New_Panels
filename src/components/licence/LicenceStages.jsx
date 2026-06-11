import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, XCircle, ChevronDown, Check, User, AlertCircle, ArrowRight } from "lucide-react";
import { LICENCE_STAGES, STAGE_ROLES, deriveStageStatuses, getSponsorStageAction } from "../../constants/licenceStages";
import { getLicenceStages, completeLicenceStageTask } from "../../services/licenceStageApi";
import { useToast } from "../../context/ToastContext";

const ROLE_META = Object.fromEntries(STAGE_ROLES.map((r) => [r.key, r]));

/** Normalize a static (read-only) `app` into the same shape the API returns. */
function buildStaticModel(app) {
  const statuses = deriveStageStatuses(app);
  const map = { done: "completed", current: "in_progress", upcoming: "pending", rejected: "rejected" };
  const stages = LICENCE_STAGES.map((s) => ({
    key: s.key,
    order: s.order,
    title: s.title,
    govSection: s.govSection,
    status: map[statuses[s.key]] || "pending",
    tasks: STAGE_ROLES.map((r) => (s.tasks[r.key] ? { role: r.key, title: s.tasks[r.key], status: null, assigneeName: null, completedAt: null } : null)).filter(Boolean),
  }));
  const current = stages.find((s) => s.status === "in_progress");
  return { stages, currentStageKey: current?.key || null };
}

/**
 * Sponsor Licence stages tracker.
 *
 * When `applicationId` is provided it fetches the live per-stage, per-role task
 * assignments from the API and lets the responsible role mark their task
 * complete (which fires in-app + email notifications server-side). Without an
 * application id it renders a read-only view inferred from `app`.
 *
 * If `data` (a pre-fetched stages model) is supplied, the component renders it
 * directly and skips the initial fetch — used by the Licence Tracking page which
 * already loaded the stages. It still re-fetches after a task is completed.
 *
 * @param {{ applicationId?: number, app?: object, data?: object, viewerRole?: 'sponsor'|'caseworker'|'admin'|'candidate' }} props
 */
export default function LicenceStages({ applicationId, app, data, viewerRole, onChange }) {
  const { showToast } = useToast();
  const [model, setModel] = useState(data || null);
  const [loading, setLoading] = useState(!!applicationId && !data);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [busyKey, setBusyKey] = useState(null); // `${stageKey}:${role}` while completing

  const staticModel = useMemo(() => (applicationId ? null : buildStaticModel(app)), [applicationId, app]);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLicenceStages(viewerRole, applicationId);
      setModel(res.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't load the application stages.");
    } finally {
      setLoading(false);
    }
  }, [applicationId, viewerRole]);

  // Adopt parent-provided data when present; otherwise fetch our own.
  useEffect(() => {
    if (data) { setModel(data); setLoading(false); setError(null); }
  }, [data]);
  useEffect(() => { if (!data) load(); }, [load, data]);

  const active = applicationId ? model : staticModel;

  // Default-open the current stage so the active work is visible at a glance.
  useEffect(() => {
    if (active?.currentStageKey) setExpanded((e) => (e[active.currentStageKey] ? e : { ...e, [active.currentStageKey]: true }));
  }, [active?.currentStageKey]);

  const interactive = !!applicationId;

  const handleComplete = async (stageKey, role) => {
    if (busyKey) return;
    setBusyKey(`${stageKey}:${role}`);
    try {
      const res = await completeLicenceStageTask(viewerRole, applicationId, stageKey, role);
      const next = res.data?.data || null;
      setModel(next);
      onChange?.(next);
      showToast({ message: "Task marked complete. The team has been notified.", variant: "success" });
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Couldn't complete this task.", variant: "danger" });
    } finally {
      setBusyKey(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-center min-h-[120px]">
        <Loader2 className="animate-spin text-primary" size={22} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start gap-3 text-red-600">
          <XCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black">Unable to load application stages</p>
            <p className="text-xs font-bold text-gray-500 mt-0.5">{error}</p>
            <button onClick={load} className="mt-2 text-xs font-black text-primary hover:underline">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  // No application at all (e.g. a sponsor who hasn't started one yet).
  if (!applicationId && !app) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center min-h-[140px]">
          <AlertCircle className="text-gray-300 mb-3" size={32} />
          <p className="text-sm font-black text-secondary">No application yet</p>
          <p className="text-xs font-bold text-gray-400 mt-1 max-w-sm">
            Start a sponsor licence application to begin tracking its stages and tasks.
          </p>
        </div>
      </div>
    );
  }

  const stages = active?.stages || [];
  const doneCount = stages.filter((s) => s.status === "completed").length;
  const pct = stages.length ? Math.round((doneCount / stages.length) * 100) : 0;

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  // Whether the viewer may complete a given role's task at this stage.
  // Candidate tasks have no self-service portal user, so only an admin can tick
  // them off on the candidate's behalf.
  const canComplete = (task, stage) =>
    interactive &&
    stage.status !== "completed" &&
    task.status !== "completed" &&
    ((viewerRole === task.role && task.role !== "candidate") || viewerRole === "admin");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-black text-secondary">Application Stages</h3>
          <p className="text-xs font-bold text-gray-400 mt-0.5">
            {doneCount} of {stages.length} stages complete · tasks across all roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-black text-secondary">{pct}%</span>
        </div>
      </div>

      <ol className="relative">
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          const open = !!expanded[stage.key];
          const state = stage.status;

          const dot =
            state === "completed" ? <CheckCircle2 size={20} className="text-emerald-500" />
            : state === "rejected" ? <XCircle size={20} className="text-red-500" />
            : state === "in_progress" ? <Loader2 size={20} className="text-primary animate-spin" />
            : <Circle size={20} className="text-gray-300" />;

          const lineTone = state === "completed" ? "bg-emerald-200" : "bg-gray-100";

          return (
            <li key={stage.key} className="relative pl-10 pb-3">
              {!isLast && <span className={`absolute left-[9px] top-7 bottom-0 w-0.5 ${lineTone}`} />}
              <span className="absolute left-0 top-1.5 bg-white">{dot}</span>

              <button
                type="button"
                onClick={() => toggle(stage.key)}
                className="w-full text-left flex items-start justify-between gap-3 py-1.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-black ${state === "pending" ? "text-gray-400" : "text-secondary"}`}>
                      {stage.order}. {stage.title}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                      {stage.govSection}
                    </span>
                    {state === "in_progress" && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded bg-primary/10 text-primary">
                        In progress
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown size={16} className={`text-gray-300 shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {stage.tasks.map((task) => {
                    const meta = ROLE_META[task.role];
                    if (!meta) return null;
                    const isViewer = viewerRole && viewerRole === task.role;
                    const isDone = task.status === "completed";
                    const showButton = canComplete(task, stage);
                    const busy = busyKey === `${stage.key}:${task.role}`;
                    // Sponsor's own incomplete task → deep-link to the page to do it.
                    const action =
                      viewerRole === "sponsor" && task.role === "sponsor" && !isDone
                        ? getSponsorStageAction(stage.key)
                        : null;
                    return (
                      <div key={task.role} className={`rounded-xl border p-3 ${isViewer ? "ring-2 ring-primary/20" : ""} ${meta.chip}`}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[10px] font-black uppercase tracking-wide">
                            {meta.label}{isViewer ? " · You" : ""}
                          </p>
                          {isDone && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                              <Check size={11} /> Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold leading-snug text-secondary">{task.title}</p>

                        {interactive && (task.assigneeName || task.status || action || showButton) && (
                          <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                            {task.assigneeName ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 truncate">
                                <User size={11} className="shrink-0" /> {task.assigneeName}
                              </span>
                            ) : <span />}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {action && (
                                <Link
                                  to={action.to}
                                  className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white border border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center gap-1"
                                >
                                  {action.label} <ArrowRight size={11} />
                                </Link>
                              )}
                              {showButton && (
                                <button
                                  type="button"
                                  onClick={() => handleComplete(stage.key, task.role)}
                                  disabled={busy}
                                  className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-1"
                                >
                                  {busy ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                  Mark complete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
