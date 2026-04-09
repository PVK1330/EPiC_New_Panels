import { motion } from "framer-motion";

const PermissionsTabBar = ({ tabs, activeId, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              active ? "text-white" : "text-gray-500 hover:text-secondary"
            }`}
          >
            {active && (
              <motion.span
                layoutId="perm-tab-pill"
                className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PermissionsTabBar;
