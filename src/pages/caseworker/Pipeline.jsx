import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus } from "lucide-react";

const STAGES = [
  { id: "lead", title: "Lead", header: "bg-slate-100 border-slate-200", titleClass: "text-slate-600", countClass: "bg-slate-200/80 text-slate-700" },
  { id: "onboarded", title: "Onboarded", header: "bg-sky-50 border-sky-100", titleClass: "text-sky-700", countClass: "bg-sky-100 text-sky-800" },
  { id: "docs", title: "Docs pending", header: "bg-amber-50 border-amber-100", titleClass: "text-amber-700", countClass: "bg-amber-100 text-amber-800" },
  { id: "draft", title: "Drafting", header: "bg-violet-50 border-violet-100", titleClass: "text-violet-700", countClass: "bg-violet-100 text-violet-800" },
  { id: "review", title: "Review", header: "bg-teal-50 border-teal-100", titleClass: "text-teal-700", countClass: "bg-teal-100 text-teal-800" },
  { id: "submitted", title: "Submitted", header: "bg-indigo-50 border-indigo-100", titleClass: "text-indigo-700", countClass: "bg-indigo-100 text-indigo-800" },
  { id: "decision", title: "Decision", header: "bg-amber-50 border-amber-100", titleClass: "text-amber-800", countClass: "bg-amber-100 text-amber-900" },
  { id: "closed", title: "Closed", header: "bg-emerald-50 border-emerald-100", titleClass: "text-emerald-700", countClass: "bg-emerald-100 text-emerald-800" },
];

const INITIAL_CARDS = [
  { stage: "lead", caseId: "#C-2412", candidate: "Sofia Rossi", sponsor: "Artisan Foods Ltd", badge: "Low", tone: "gray", date: "2026-04-20" },
  { stage: "lead", caseId: "#C-2411", candidate: "Kwame Asante", sponsor: "Lagos Finance", badge: "Medium", tone: "yellow", date: "2026-05-01" },
  { stage: "onboarded", caseId: "#C-2410", candidate: "Yuki Tanaka", sponsor: "Osaka Digital", badge: "Tier 2", tone: "blue", date: "2026-04-25" },
  { stage: "onboarded", caseId: "#C-2407", candidate: "Elena Vasquez", sponsor: "SpainTech", badge: "Skilled", tone: "blue", date: "2026-05-05" },
  { stage: "onboarded", caseId: "#C-2405", candidate: "Omar Farouk", sponsor: "Cairo Group", badge: "Medium", tone: "yellow", date: "2026-05-08" },
  { stage: "docs", caseId: "#C-2401", candidate: "Ahmed Al-Rashid", sponsor: "TechCorp Ltd", badge: "High", tone: "red", date: "2026-04-18", dateHighlight: "due" },
  { stage: "docs", caseId: "#C-2400", candidate: "Fatima Al-Zahra", sponsor: "MediCare Group", badge: "Medium", tone: "yellow", date: "2026-04-20" },
  { stage: "docs", caseId: "#C-2399", candidate: "Hiroshi Kobayashi", sponsor: "Toyota UK", badge: "Low", tone: "gray", date: "2026-05-12" },
  { stage: "docs", caseId: "#C-2398", candidate: "Priya Sharma", sponsor: "Nexus Group", badge: "Medium", tone: "yellow", date: "2026-04-12", dateHighlight: "due" },
  { stage: "draft", caseId: "#C-2395", candidate: "Lena Müller", sponsor: "BerlinTech GmbH", badge: "Graduate", tone: "blue", date: "2026-04-28" },
  { stage: "draft", caseId: "#C-2393", candidate: "Alejandro Garcia", sponsor: "Madrid Finance", badge: "High", tone: "red", date: "2026-04-16" },
  { stage: "draft", caseId: "#C-2390", candidate: "Nadia Okonkwo", sponsor: "Lagos Media", badge: "Low", tone: "gray", date: "2026-05-20" },
  { stage: "draft", caseId: "#C-2389", candidate: "Mei Lin Chen", sponsor: "Global Finance", badge: "Low", tone: "gray", date: "2026-05-02" },
  { stage: "review", caseId: "#C-2388", candidate: "Viktor Kovalev", sponsor: "Kiev Digital", badge: "Medium", tone: "yellow", date: "2026-04-22" },
  { stage: "review", caseId: "#C-2386", candidate: "Amara Diallo", sponsor: "Dakar Group", badge: "High", tone: "red", date: "2026-04-14" },
  { stage: "review", caseId: "#C-2385", candidate: "Ivan Petrov", sponsor: "EnviroTech", badge: "Low", tone: "gray", date: "2026-05-15" },
  { stage: "submitted", caseId: "#C-2382", candidate: "Rajesh Patel", sponsor: "Innovate Corp", badge: "Tier 2", tone: "blue", date: "2026-06-01" },
  { stage: "submitted", caseId: "#C-2378", candidate: "Chioma Eze", sponsor: "Abuja Tech", badge: "Skilled", tone: "blue", date: "2026-05-28" },
  { stage: "submitted", caseId: "#C-2374", candidate: "Jae-Won Kim", sponsor: "Seoul Digital", badge: "Low", tone: "gray", date: "2026-06-10" },
  { stage: "decision", caseId: "#C-2370", candidate: "Ana Andrade", sponsor: "Lisbon Finance", badge: "Awaiting", tone: "yellow", date: "2026-04-09" },
  { stage: "decision", caseId: "#C-2365", candidate: "Liu Wei", sponsor: "Shanghai Corp", badge: "Awaiting", tone: "yellow", date: "2026-04-11" },
  { stage: "closed", caseId: "#C-2360", candidate: "James Okafor", sponsor: "Lagos Oil Co", badge: "Approved", tone: "green", date: "2026-03-28" },
  { stage: "closed", caseId: "#C-2355", candidate: "Anya Kozlov", sponsor: "Moscow Tech", badge: "Approved", tone: "green", date: "2026-03-20" },
  { stage: "closed", caseId: "#C-2348", candidate: "Tariq Hassan", sponsor: "Dubai Corp", badge: "Approved", tone: "green", date: "2026-03-10" },
];

function formatShort(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function badgeToneClass(tone) {
  const m = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-800 border-red-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return m[tone] || m.gray;
}

export default function Pipeline() {
  const navigate = useNavigate();
  const [cards] = useState(() => INITIAL_CARDS);
  const [filterOpen, setFilterOpen] = useState(false);

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.id, []]));
    cards.forEach((c) => {
      if (map[c.stage]) map[c.stage].push(c);
    });
    return map;
  }, [cards]);

  const total = cards.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] -mx-4 md:-mx-8 animate-in fade-in duration-500">
      <div className="shrink-0 px-4 md:px-8 pb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 bg-white/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            Pipeline view
          </h1>
          <p className="text-sm font-bold text-gray-600 mt-1">
            {total} cases across {STAGES.length} stages
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Filter size={18} />
            Filter
          </button>
          {filterOpen && (
            <p className="w-full sm:w-auto text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Demo: connect filters to case tags and visa type when the API is ready.
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate("/caseworker/cases")}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add case
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 md:px-8 py-6">
        <div className="flex gap-4 items-start min-w-min pb-4">
          {STAGES.map((col) => {
            const list = byStage[col.id] || [];
            return (
              <div
                key={col.id}
                className="w-[230px] shrink-0 flex flex-col"
              >
                <div
                  className={`rounded-t-xl border px-3 py-2.5 flex items-center justify-between ${col.header}`}
                >
                  <span className={`text-[11px] font-black uppercase tracking-wider ${col.titleClass}`}>
                    {col.title}
                  </span>
                  <span className={`text-[11px] font-black tabular-nums rounded-full px-2 py-0.5 ${col.countClass}`}>
                    {list.length}
                  </span>
                </div>
                <div className="rounded-b-xl border border-t-0 border-gray-200 bg-gray-50/90 p-2 flex flex-col gap-2 min-h-[200px]">
                  {list.map((c) => (
                    <div
                      key={c.caseId}
                      className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-secondary/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                    >
                      <p className="font-mono text-[10px] font-bold text-gray-500 mb-1">
                        {c.caseId}
                      </p>
                      <p className="text-sm font-bold text-gray-900 leading-snug">
                        {c.candidate}
                      </p>
                      <p className="text-[11px] font-bold text-gray-500 mt-1 mb-2">
                        {c.sponsor}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${badgeToneClass(c.tone)}`}
                        >
                          {c.badge}
                        </span>
                        <span
                          className={`text-[10px] font-bold tabular-nums ${
                            c.dateHighlight === "due"
                              ? "text-amber-600"
                              : "text-gray-500"
                          }`}
                        >
                          {formatShort(c.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate("/caseworker/cases")}
                    className="mt-1 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-bold text-gray-500 hover:border-secondary/50 hover:text-secondary hover:bg-secondary/5 transition-colors"
                  >
                    + Add card
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
