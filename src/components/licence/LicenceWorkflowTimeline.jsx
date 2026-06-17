import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2, XCircle, FileCheck2, HelpCircle, MessageSquareReply, Search,
  Award, FilePlus2, BadgeCheck, UserPlus, Stamp, Circle, RefreshCw,
} from "lucide-react";
import { getLicenceWorkflowTimeline } from "../../services/licenceStageApi";

/**
 * LicenceWorkflowTimeline — reusable, read-only chronological timeline of the
 * whole sponsor licence journey (application + CoS + sponsored workers).
 *
 * Events are grouped visually by the responsible actor: Sponsor, Caseworker,
 * Admin, Compliance. Each row shows the actor name, timestamp, status and any
 * comment. Used by the sponsor (Licence Tracking + detail), and by admin /
 * caseworker application views.
 *
 * Props:
 *   applicationId — licence application id (required to fetch)
 *   viewerRole    — "sponsor" | "caseworker" | "admin" (selects the API route)
 *   data          — optional pre-fetched timeline array (skips the fetch)
 */

const ACTOR_META = {
  Sponsor:    { chip: "bg-blue-50 text-blue-700 border-blue-100" },
  Caseworker: { chip: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  Admin:      { chip: "bg-primary/5 text-primary border-primary/10" },
  Compliance: { chip: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

const EVENT_META = {
  application_submitted: { Icon: FileCheck2,        tone: "bg-blue-500" },
  information_requested: { Icon: HelpCircle,        tone: "bg-amber-500" },
  information_received:  { Icon: MessageSquareReply, tone: "bg-blue-500" },
  under_review:          { Icon: Search,            tone: "bg-indigo-500" },
  licence_granted:       { Icon: Award,             tone: "bg-emerald-500" },
  cos_requested:         { Icon: FilePlus2,         tone: "bg-blue-500" },
  cos_allocated:         { Icon: BadgeCheck,        tone: "bg-primary" },
  worker_created:        { Icon: UserPlus,          tone: "bg-primary" },
  visa_granted:          { Icon: Stamp,             tone: "bg-emerald-500" },
};

const ACTORS = ["Sponsor", "Caseworker", "Admin", "Compliance"];

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function ActorChip({ role }) {
  const m = ACTOR_META[role] || { chip: "bg-gray-50 text-gray-600 border-gray-100" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${m.chip}`}>
      {role}
    </span>
  );
}

function TimelineRow({ ev, last }) {
  const meta = EVENT_META[ev.eventKey] || { Icon: Circle, tone: "bg-gray-400" };
  const { Icon } = meta;
  return (
    <li className="relative pl-10 pb-4">
      {!last && <span className="absolute left-[14px] top-6 bottom-0 w-0.5 bg-gray-200" />}
      <span className={`absolute left-0 top-0.5 h-7 w-7 rounded-full ${meta.tone} flex items-center justify-center text-white shadow-sm`}>
        <Icon size={14} />
      </span>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-black text-secondary leading-tight">{ev.event}</p>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">
            {ev.actorName || "System"} · {fmt(ev.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ActorChip role={ev.actorRole} />
          {ev.status && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-600">
              {ev.status}
            </span>
          )}
        </div>
      </div>
      {ev.comment && (
        <p className="mt-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
          {ev.comment}
        </p>
      )}
    </li>
  );
}

export default function LicenceWorkflowTimeline({ applicationId, viewerRole = "sponsor", data = null }) {
  const [timeline, setTimeline] = useState(data || null);
  const [loading, setLoading] = useState(!data && !!applicationId);
  const [error, setError] = useState(null);
  const [activeActor, setActiveActor] = useState("All");

  const load = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLicenceWorkflowTimeline(viewerRole, applicationId);
      setTimeline(res.data?.data?.timeline || []);
    } catch (err) {
      // A 404 (e.g. a legacy V1 application with no V2 timeline) is not an error
      // to surface — just show the friendly empty state.
      if (err?.response?.status === 404) setTimeline([]);
      else setError(err?.response?.data?.message || "Couldn't load the workflow timeline.");
    } finally {
      setLoading(false);
    }
  }, [applicationId, viewerRole]);

  useEffect(() => { if (data) { setTimeline(data); setLoading(false); } }, [data]);
  useEffect(() => { if (!data) load(); }, [load, data]);

  // Which actor swim-lanes actually appear, for the filter chips.
  const presentActors = useMemo(() => {
    const set = new Set((timeline || []).map((e) => e.actorRole));
    return ACTORS.filter((a) => set.has(a));
  }, [timeline]);

  const filtered = useMemo(() => {
    if (!timeline) return [];
    return activeActor === "All" ? timeline : timeline.filter((e) => e.actorRole === activeActor);
  }, [timeline, activeActor]);

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
            <p className="text-sm font-black">Unable to load workflow timeline</p>
            <p className="text-xs font-bold text-gray-500 mt-0.5">{error}</p>
            <button onClick={load} className="mt-2 inline-flex items-center gap-1 text-xs font-black text-primary hover:underline">
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-sm font-black text-secondary">Workflow Timeline</h3>
          <p className="text-xs font-bold text-gray-400 mt-0.5">Chronological history across the licence, CoS and workers.</p>
        </div>
        {/* Actor filter — only shows lanes that have events */}
        {presentActors.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", ...presentActors].map((a) => (
              <button
                key={a}
                onClick={() => setActiveActor(a)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
                  activeActor === a ? "bg-secondary text-white border-secondary" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Circle className="w-7 h-7 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-bold">No workflow events yet.</p>
          <p className="text-xs font-medium mt-0.5">Events appear here as the application progresses.</p>
        </div>
      ) : (
        <ol className="relative">
          {filtered.map((ev, i) => (
            <TimelineRow key={ev.id} ev={ev} last={i === filtered.length - 1} />
          ))}
        </ol>
      )}
    </div>
  );
}
