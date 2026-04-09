import { motion } from "framer-motion";

const CaseDetailTabBar = ({ tabs, activeId, onChange }) => {
  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
      {tabs.map((t) => {
        const active = t.id === activeId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`relative px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              active ? "text-white" : "text-gray-500 hover:text-secondary"
            }`}
          >
            {active && (
              <motion.span
                layoutId="case-detail-tab"
                className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CaseDetailTabBar;
