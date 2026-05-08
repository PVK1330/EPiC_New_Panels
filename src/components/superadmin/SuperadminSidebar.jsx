import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardLine,
  RiOrganizationChart,
  RiShieldUserLine,
  RiSettings4Line,
  RiHistoryLine,
  RiBillLine,
  RiFileSettingsLine,
  RiLogoutBoxRLine,
  RiMoneyPoundCircleLine,
  RiLayoutTopLine,
  RiCloseLine,
  RiShieldKeyholeLine,
} from "react-icons/ri";
import eliteLogo from "../../assets/elitepic_logo.png";

const sidebarVariants = {
  open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const navSections = [
  {
    items: [
      { name: "Dashboard", path: "/superadmin/dashboard", icon: RiDashboardLine },
      { name: "Organizations", path: "/superadmin/organisations", icon: RiOrganizationChart },
    ],
  },
  {
    label: "Billing",
    items: [
      { name: "Plans", path: "/superadmin/plans", icon: RiFileSettingsLine },
      { name: "Subscriptions", path: "/superadmin/billing", icon: RiBillLine },
      { name: "Payments", path: "/superadmin/payments", icon: RiMoneyPoundCircleLine },
    ],
  },
  {
    label: "Audit",
    items: [
      { name: "Logs", path: "/superadmin/audit-log", icon: RiHistoryLine },
      { name: "Team", path: "/superadmin/team", icon: RiShieldUserLine },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", path: "/superadmin/settings", icon: RiSettings4Line },
    ],
  },
];

const SuperadminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-50/50 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-primary/5 rounded-2xl border border-primary/10 shadow-inner flex items-center justify-center p-1.5 transition-transform hover:rotate-3 group cursor-pointer">
            <img
              src={eliteLogo}
              alt="ElitePic"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-black text-secondary uppercase tracking-widest leading-none">
              ElitePic
            </h1>
            <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mt-1 opacity-60">
              Super Engine
            </p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-2 text-gray-400 hover:text-primary transition-colors"
        >
          <RiCloseLine size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className={idx !== 0 ? "mt-5" : ""}>
            {section.label && (
              <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-all group relative ${isActive
                      ? "bg-secondary text-white shadow-xl shadow-secondary/20"
                      : "text-gray-400 hover:text-primary hover:bg-primary/5"
                    }`
                  }
                >
                  <item.icon
                    size={18}
                    className={`transition-transform group-hover:scale-110 ${location.pathname === item.path ? "text-primary" : ""}`}
                  />
                  <span className="truncate">{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white/25 rounded-l-full" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-gray-50/50 bg-gray-50/20">
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-100 transition-all hover:shadow-xl hover:border-transparent group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
             <RiShieldKeyholeLine size={36} className="-rotate-12" />
          </div>
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-inner">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-secondary truncate uppercase tracking-widest">Super Admin</p>
            <p className="text-[8px] font-bold text-gray-400 truncate uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5">
               <div className="w-1 h-1 rounded-full bg-green-500" /> System Root
            </p>
          </div>
          <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all relative z-10">
            <RiLogoutBoxRLine size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-72 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default SuperadminSidebar;
