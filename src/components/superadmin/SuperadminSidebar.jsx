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
    label: "Management",
    items: [
      { name: "Plans", path: "/superadmin/plans", icon: RiFileSettingsLine },
      { name: "Subscriptions", path: "/superadmin/billing", icon: RiBillLine },
      { name: "Payments", path: "/superadmin/payments", icon: RiMoneyPoundCircleLine },
    ],
  },
  {
    label: "Security",
    items: [
      { name: "Activity", path: "/superadmin/audit-log", icon: RiHistoryLine },
      { name: "Team", path: "/superadmin/team", icon: RiShieldUserLine },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Global Settings", path: "/superadmin/settings", icon: RiSettings4Line },
      { name: "My Account", path: "/superadmin/profile", icon: RiShieldKeyholeLine },
    ],
  },
];

const SuperadminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-sm">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-gray-50 shrink-0 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center p-1">
            <img
              src={eliteLogo}
              alt="ElitePic"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-black text-secondary uppercase tracking-widest leading-none">
              ElitePic
            </h1>
            <p className="text-[7px] font-bold text-primary uppercase tracking-[0.2em] mt-1 opacity-60">
              Admin Portal
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-2 text-gray-400 hover:text-primary transition-colors"
        >
          <RiCloseLine size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className={idx !== 0 ? "mt-4" : ""}>
            {section.label && (
              <p className="px-3 mb-1.5 text-[8px] font-bold uppercase tracking-widest text-gray-400">
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
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all group relative ${isActive
                      ? "bg-secondary text-white shadow-md shadow-secondary/10"
                      : "text-gray-400 hover:text-primary hover:bg-primary/5"
                    }`
                  }
                >
                  <item.icon
                    size={16}
                    className={`shrink-0 ${location.pathname === item.path ? "text-primary" : ""}`}
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <NavLink to="/superadmin/profile" className="p-3 border-t border-gray-50 bg-gray-50/10 block group">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-100 transition-all group-hover:border-primary/20 group-hover:shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-[10px] shrink-0">
            SA
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[10px] font-bold text-secondary truncate uppercase tracking-widest">Administrator</p>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-1 h-1 rounded-full bg-green-500" />
               <p className="text-[7px] font-bold text-gray-400 truncate uppercase tracking-widest">Active Session</p>
            </div>
          </div>
          <button onClick={(e) => { e.preventDefault(); /* Handle logout */ }} className="p-1.5 text-gray-500 hover:text-red-500 rounded-md transition-all">
            <RiLogoutBoxRLine size={16} />
          </button>
        </div>
      </NavLink>
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
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-xl"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default SuperadminSidebar;
