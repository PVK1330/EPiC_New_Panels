import { motion } from "framer-motion";
import { IMMIGRATION_CASE_STEPS, getWorkflowProgress } from "../../constants/immigrationCaseProcess";

function CompactBar({ order, total, percent, currentStep }) {
  return (
    <motion.div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-secondary">
          Step {order} of {total}: {currentStep?.title}
        </span>
        <span className="text-gray-500 tabular-nums">{percent}%</span>
      </div>
      <motion.div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </motion.div>
      {currentStep?.description && (
        <p className="text-xs text-gray-500 leading-relaxed">{currentStep.description}</p>
      )}
    </motion.div>
  );
}

/**
 * Visual 16-step progress tracker for a case.
 */
export default function CaseWorkflowProgress({ caseRecord, compact = false }) {
  const { stageId, currentStep, order, total, percent } = getWorkflowProgress(caseRecord);

  if (compact) {
    return <CompactBar order={order} total={total} percent={percent} currentStep={currentStep} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <motion.div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary">
          Immigration workflow
        </h3>
        <span className="text-xs font-bold text-gray-500">
          {order} / {total}
        </span>
      </motion.div>
      <CompactBar order={order} total={total} percent={percent} currentStep={currentStep} />
      <ol className="mt-4 space-y-1 max-h-48 overflow-y-auto [scrollbar-width:thin]">
        {IMMIGRATION_CASE_STEPS.map((step) => {
          const active = step.id === stageId;
          const done = step.order < order;
          return (
            <li
              key={step.id}
              className={`flex gap-2 text-xs py-1 px-2 rounded-lg ${
                active ? "bg-primary/10 text-primary font-bold step-current" : done ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span
                className={`tabular-nums w-5 shrink-0 ${active ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] step-current" : ""}`}
              >
                {step.order}.
              </span>
              <span className="truncate">{step.title}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
