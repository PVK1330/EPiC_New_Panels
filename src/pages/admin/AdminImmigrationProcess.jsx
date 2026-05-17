import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBookOpen,
  FiColumns,
  FiFileText,
  FiInfo,
  FiChevronRight,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import CaseWorkflowProgress from "../../components/case/CaseWorkflowProgress";
import CaseWorkflowBadge from "../../components/case/CaseWorkflowBadge";
import {
  buildStaticPipelineStages,
  MOCK_PROCESS_STATS,
  MOCK_SAMPLE_CASE,
  PROCESS_STEP_DETAILS,
} from "../../data/immigrationProcessMock";

const TABS = [
  { id: "guide", label: "Process guide", icon: FiBookOpen },
  { id: "pipeline", label: "Pipeline preview", icon: FiColumns },
  { id: "sample", label: "Sample case", icon: FiFileText },
];

const STAT_TONE = {
  primary: "border-primary/20 bg-primary/5 text-primary",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function StaticPipelineCard({ card, onSelect, selected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(card)}
      className={`w-full text-left rounded-xl bg-white border p-3.5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
        selected ? "border-primary ring-2 ring-primary/20" : "border-gray-100"
      }`}
    >
      <p className="text-[11px] font-mono font-bold text-primary">{card.caseId}</p>
      <p className="text-sm font-bold text-secondary mt-1 leading-snug">{card.name}</p>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.meta}</p>
      <motion.div className="mt-2.5 pt-2 border-t border-gray-50">
        <span
          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${card.badgeClass}`}
        >
          {card.badge}
        </span>
      </motion.div>
    </button>
  );
}

function ProcessGuide() {
  const [expanded, setExpanded] = useState("draft_application_review");

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-blue-50/80 px-5 py-4 flex gap-3"
      >
        <FiInfo className="text-primary shrink-0 mt-0.5" size={20} />
        <motion.div className="text-sm text-blue-900/90 leading-relaxed">
          <p className="font-bold text-primary mb-1">Standard Immigration Case Process</p>
          <p>
            This guide mirrors your firm&apos;s 16-step workflow document. Preview only — stage
            changes and emails are not wired yet.
          </p>
        </motion.div>
      </motion.div>

      <ol className="space-y-2">
        {PROCESS_STEP_DETAILS.map((step, idx) => {
          const isOpen = expanded === step.id;
          const isPast = MOCK_SAMPLE_CASE.caseStage === step.id
            ? false
            : PROCESS_STEP_DETAILS.findIndex((s) => s.id === MOCK_SAMPLE_CASE.caseStage) > idx;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : step.id)}
                className={`w-full flex items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  isOpen
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    step.id === MOCK_SAMPLE_CASE.caseStage
                      ? "bg-primary text-white"
                      : isPast
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isPast ? <FiCheck size={16} /> : step.order}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-secondary">{step.title}</p>
                    <FiChevronRight
                      className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.description}</p>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-12 mr-1 mb-3 mt-1 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 space-y-3">
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                      {step.actions?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                            Typical actions
                          </p>
                          <ul className="flex flex-wrap gap-2">
                            {step.actions.map((a) => (
                              <li
                                key={a}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700"
                              >
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.docs?.length > 0 && (
                        <motion.div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                            Documents
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {step.docs.map((d) => (
                              <li key={d} className="flex items-center gap-2">
                                <FiFileText className="text-primary shrink-0" size={14} />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PipelinePreview({ selectedCard, onSelectCard }) {
  const stages = buildStaticPipelineStages();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <p className="text-sm text-gray-500 mb-4 shrink-0">
        Read-only preview of the 16-column Kanban. Cards are sample data — drag &amp; drop disabled.
      </p>
      <div className="flex flex-1 min-h-0 gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {stages.map((stage) => (
          <section
            key={stage.id}
            className={`shrink-0 w-56 flex flex-col rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 shadow-sm overflow-hidden max-h-[520px] ${stage.accent} border-t-[3px]`}
          >
            <header className="px-3.5 pt-3.5 pb-2 flex items-center justify-between gap-2 border-b border-gray-100/80 bg-white/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${stage.dot}`} />
                <h2 className="text-xs font-black text-secondary truncate">{stage.title}</h2>
              </div>
              <span className="text-xs font-black tabular-nums text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                {stage.count}
              </span>
            </header>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 [scrollbar-width:thin]">
              {stage.cards.map((card) => (
                <StaticPipelineCard
                  key={card.id}
                  card={card}
                  onSelect={onSelectCard}
                  selected={selectedCard?.id === card.id}
                />
              ))}
              {stage.cards.length === 0 && (
                <motion.div className="flex items-center justify-center h-14 rounded-xl border-2 border-dashed border-gray-200 text-[10px] text-gray-400 text-center px-2">
                  No demo cases
                </motion.div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SampleCasePanel({ caseRecord }) {
  const c = caseRecord || MOCK_SAMPLE_CASE;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <motion.div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[11px] font-mono font-bold text-primary">{c.caseId}</p>
              <h2 className="text-xl font-black text-secondary mt-1">{c.candidate}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {c.visaType} · {c.sponsor}
              </p>
            </div>
            <CaseWorkflowBadge caseRecord={{ caseStage: c.caseStage, status: c.status }} />
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Caseworker</p>
              <p className="font-semibold text-secondary">{c.caseworker}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Priority</p>
              <p className="font-semibold text-orange-600">{c.priority}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Target date</p>
              <p className="font-semibold text-secondary">{c.targetDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Legacy status</p>
              <p className="font-semibold text-secondary">{c.status}</p>
            </div>
          </div>
        </div>
        <CaseWorkflowProgress caseRecord={{ caseStage: c.caseStage, status: c.status }} />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
            Stage controls (preview)
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              disabled
              value={c.caseStage}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed"
            >
              <option>7. Draft Application Review</option>
            </select>
            <button
              type="button"
              disabled
              className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold cursor-not-allowed"
            >
              Update stage
            </button>
          </div>
          <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5">
            <FiClock size={14} />
            Functional updates will connect to the API in a later phase.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3">
          At this stage
        </h3>
        {PROCESS_STEP_DETAILS.filter((s) => s.id === c.caseStage).map((step) => (
          <div key={step.id} className="space-y-3 text-sm">
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
            <ul className="space-y-2">
              {step.actions?.map((a) => (
                <li key={a} className="flex items-center gap-2 text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminImmigrationProcess() {
  const [tab, setTab] = useState("guide");
  const [selectedCard, setSelectedCard] = useState(null);

  const sampleCase = selectedCard
    ? {
        ...MOCK_SAMPLE_CASE,
        caseId: selectedCard.caseId,
        candidate: selectedCard.name,
        caseStage: selectedCard.caseStage,
        visaType: selectedCard.meta.split(" · ")[0] || "—",
        sponsor: selectedCard.meta.split(" · ")[1] || "—",
      }
    : MOCK_SAMPLE_CASE;

  return (
    <motion.div
      className="flex flex-col h-full min-h-0 p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="shrink-0 mb-5">
        <motion.div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
              Cases &amp; workflow
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
              Immigration case process
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Static preview of the standard 16-step UK immigration workflow from your process
              document.
            </p>
          </div>
          <Link
            to="/admin/pipeline"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/15 transition-colors shrink-0"
          >
            Live pipeline
            <FiChevronRight />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {MOCK_PROCESS_STATS.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl border px-4 py-3 ${STAT_TONE[stat.tone] || STAT_TONE.primary}`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80">
                {stat.label}
              </p>
              <p className="text-2xl font-black tabular-nums mt-0.5">{stat.value}</p>
              <p className="text-xs opacity-70 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-5 border-b border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-secondary"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === "guide" && (
            <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessGuide />
            </motion.div>
          )}
          {tab === "pipeline" && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-[560px]"
            >
              <PipelinePreview selectedCard={selectedCard} onSelectCard={setSelectedCard} />
            </motion.div>
          )}
          {tab === "sample" && (
            <motion.div key="sample" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SampleCasePanel caseRecord={sampleCase} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
