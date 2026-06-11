import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Clock3,
  CircleCheck,
  ClipboardList,
  Loader2,
  ArrowRight,
  FileText,
} from "lucide-react";
import LicenceStages from "../../components/licence/LicenceStages";
import { listLicenceV2Applications, getLicenceV2Application } from "../../services/licenceV2Api";
import { getLicenceStages } from "../../services/licenceStageApi";
import { LICENCE_STAGES, STAGE_ROLES, getSponsorStageAction } from "../../constants/licenceStages";
import { formatDateTime } from "../../utils/datetime";

const TABS = [
  { id: "status", label: "Status", icon: BarChart3 },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "actions", label: "Pending actions", icon: CircleCheck },
];

const STAGE_DESC = Object.fromEntries(LICENCE_STAGES.map((s) => [s.key, s.description]));
const ROLE_LABEL = Object.fromEntries(STAGE_ROLES.map((r) => [r.key, r.label]));

/**
 * Sponsor "Licence Tracking" page — the sponsor equivalent of the candidate's
 * Case Tracking. Three tabs: Status (current step + full stage timeline),
 * Timeline (what has happened), and Pending actions (deep-linked next steps).
 */
const LicenceProcess = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [app, setApp] = useState(null);
  const [stagesData, setStagesData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the sponsor's latest V2 application, then its stages.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const list = await listLicenceV2Applications();
        const apps = list?.data?.data || [];
        if (!apps.length) { if (active) setLoading(false); return; }
        const latest = apps.reduce((a, b) => (Number(b.id) > Number(a.id) ? b : a), apps[0]);
        const [full, stages] = await Promise.all([
          getLicenceV2Application(latest.id).catch(() => null),
          getLicenceStages("sponsor", latest.id).catch(() => null),
        ]);
        if (!active) return;
        setApp(full?.data?.data || latest);
        setStagesData(stages?.data?.data || null);
      } catch {
        /* falls through to the empty state */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return t === "timeline" || t === "actions" ? t : "status";
  }, [searchParams]);

  const setTab = useCallback(
    (id) => setSearchParams(id === "status" ? {} : { tab: id }, { replace: true }),
    [setSearchParams],
  );

  const stages = useMemo(() => stagesData?.stages || [], [stagesData]);
  const currentStage = stages.find((s) => s.key === stagesData?.currentStageKey) || null;
  const doneCount = stages.filter((s) => s.status === "completed").length;

  // Timeline — completed tasks (most recent first) plus the submission milestone.
  const timeline = useMemo(() => {
    const entries = [];
    for (const s of stages) {
      for (const t of s.tasks || []) {
        if (t.status === "completed" && t.completedAt) {
          entries.push({
            title: `${ROLE_LABEL[t.role] || t.role}: ${t.title}`,
            stage: s.title,
            time: t.completedAt,
            tone: "bg-emerald-500",
          });
        }
      }
    }
    if (app?.submittedAt) {
      entries.push({ title: "Application submitted", stage: "Submission", time: app.submittedAt, tone: "bg-secondary" });
    }
    return entries.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [stages, app?.submittedAt]);

  // Pending actions — the sponsor's incomplete tasks, with a deep-link to act.
  const pendingActions = useMemo(() => {
    const out = [];
    for (const s of stages) {
      if (s.status === "completed") continue;
      const task = (s.tasks || []).find((t) => t.role === "sponsor" && t.status !== "completed");
      const cta = getSponsorStageAction(s.key, app?.id);
      if (task && cta) {
        out.push({ title: task.title, stage: s.title, current: s.key === stagesData?.currentStageKey, cta });
      }
    }
    return out;
  }, [stages, stagesData?.currentStageKey, app?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400">Loading your licence tracking…</p>
      </div>
    );
  }

  // No V2 application yet — guide the sponsor to start one.
  if (!app) {
    return (
      <div className="space-y-8 pb-10">
        <Header />
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <FileText className="mx-auto text-gray-300 mb-4" size={40} />
          <h2 className="text-lg font-black text-secondary">No licence application yet</h2>
          <p className="text-sm font-bold text-gray-500 mt-1 max-w-md mx-auto">
            Start your sponsor licence application to begin tracking its stages, tasks and progress here.
          </p>
          <button
            onClick={() => navigate("/business/apply-licence-v2")}
            className="mt-5 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Start application <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Header
        subtitle={
          <>
            Reference: <span className="text-secondary font-black">#LIC-{app.id}</span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="capitalize">{app.status}</span>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-gray-200 bg-gray-50/80 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tab.id === "actions" ? pendingActions.length : 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
                isActive ? "bg-secondary text-white shadow-md shadow-secondary/20" : "text-gray-500 hover:text-primary hover:bg-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {count > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Status ── */}
      {activeTab === "status" && (
        <div className="space-y-6">
          {currentStage && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 border border-gray-100">
                  <ClipboardList className="text-primary" size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Step {currentStage.order} of {stages.length} · {doneCount} complete
                  </p>
                  <h2 className="text-xl font-black text-secondary tracking-tight">{currentStage.title}</h2>
                  <p className="text-sm font-bold text-gray-500 mt-0.5">{STAGE_DESC[currentStage.key]}</p>
                </div>
              </div>
            </div>
          )}

          <LicenceStages
            applicationId={app.id}
            data={stagesData}
            viewerRole="sponsor"
            onChange={setStagesData}
          />
        </div>
      )}

      {/* ── Timeline ── */}
      {activeTab === "timeline" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8 shadow-sm max-w-3xl">
          {timeline.length > 0 ? (
            timeline.map((e, i) => (
              <div key={`${e.title}-${e.time}-${i}`} className="flex gap-4">
                <div className="flex flex-col items-center w-6 shrink-0">
                  <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${e.tone}`} />
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] bg-gray-200" />}
                </div>
                <div className="pb-6 flex-1 min-w-0">
                  <p className="text-sm font-black text-secondary">{e.title}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                    {e.stage} · {formatDateTime(e.time)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Clock3 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-400">No activity yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Pending actions ── */}
      {activeTab === "actions" && (
        <div className="max-w-3xl space-y-3">
          {pendingActions.length > 0 ? (
            pendingActions.map((a, idx) => (
              <div
                key={`${a.title}-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm"
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${a.current ? "bg-primary" : "bg-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-secondary">
                    {a.title}
                    {a.current && (
                      <span className="text-[10px] font-black text-primary border border-primary/20 bg-primary/5 rounded-full px-2 py-0.5 ml-2 uppercase">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{a.stage}</p>
                </div>
                <Link
                  to={a.cta.to}
                  className="shrink-0 inline-flex items-center gap-1.5 justify-center rounded-lg bg-secondary px-4 py-2.5 text-xs font-black text-white hover:bg-secondary-dark shadow-md shadow-secondary/20 transition-all"
                >
                  {a.cta.label} <ArrowRight size={14} />
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <CircleCheck className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-gray-400">No pending actions — you&apos;re all caught up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ subtitle }) => (
  <div>
    <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
      <LayoutDashboard className="text-primary" size={30} />
      Licence Tracking
    </h1>
    <p className="text-gray-500 font-bold text-sm mt-1">
      {subtitle || "Track your sponsor licence application through every stage."}
    </p>
  </div>
);

export default LicenceProcess;
