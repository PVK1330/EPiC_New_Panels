import { motion } from "framer-motion";
import {
  RiBarChartBoxLine,
  RiGridLine,
  RiShieldLine,
  RiLockLine,
  RiTeamLine,
} from "react-icons/ri";

const ICON_MAP = {
  chart:   RiBarChartBoxLine,
  grid:    RiGridLine,
  shield:  RiShieldLine,
  lock:    RiLockLine,
  users:   RiTeamLine,
};

const PermissionsTabBar = ({ tabs, activeId, onChange }) => {
  return (
    <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-100 rounded-xl border border-gray-200">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const Icon = ICON_MAP[tab.icon] || RiLockLine;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              active ? "text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            {active && (
              <motion.span
                layoutId="perm-tab-pill"
                className="absolute inset-0 bg-primary rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={15} className="relative z-10 shrink-0" />
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            <span className="relative z-10 sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PermissionsTabBar;
