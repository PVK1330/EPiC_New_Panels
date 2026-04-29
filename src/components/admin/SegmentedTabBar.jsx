import { motion } from "framer-motion";

const SegmentedTabBar = ({ tabs, activeId, onChange, layoutId = "segmented-tab-pill", vertical = false }) => {
  return (
    <div className={`flex ${vertical ? 'flex-col gap-1' : 'flex-wrap gap-2'} p-1 bg-gray-100 rounded-xl border border-gray-200`}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative ${vertical ? 'px-4 py-3 text-left' : 'px-4 py-2.5'} rounded-lg text-sm font-bold transition-colors ${
              active ? "text-white" : "text-gray-500 hover:text-secondary"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center justify-center gap-2 min-w-0">
              {tab.icon != null && (
                <span className="shrink-0 flex items-center [&>svg]:shrink-0" aria-hidden>
                  {tab.icon}
                </span>
              )}
              <span className="truncate">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabBar;
