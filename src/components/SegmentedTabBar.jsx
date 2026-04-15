import { motion } from "framer-motion";

export default function SegmentedTabBar({ tabs, activeId, onChange, layoutId = "seg-tab" }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-150 focus:outline-none whitespace-nowrap
            ${activeId === tab.id ? "text-secondary" : "text-gray-500 hover:text-gray-700"}`}
        >
          {activeId === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
