import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardLine,
  RiDashboardFill,
  RiOrganizationChart,
  RiShieldUserLine,
  RiShieldUserFill,
  RiSettings4Line,
  RiSettings4Fill,
  RiHistoryLine,
  RiBillLine,
  RiBillFill,
  RiFileSettingsLine,
  RiFileSettingsFill,
  RiLogoutBoxRLine,
  RiMoneyPoundCircleLine,
  RiMoneyPoundCircleFill,
  RiCloseLine,
  RiShieldKeyholeLine,
  RiShieldKeyholeFill,
  RiBuilding4Line,
  RiBuilding4Fill,
} from "react-icons/ri";
import eliteLogo from "../../assets/elitepic_logo.png";

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 28 },
  },
  closed: {
    x: "-100%",
    opacity: 0,
    transition: { type: "spring", stiffness: 280, damping: 28 },
  },
};

const navSections = [
  {
    items: [
      {
        name: "Dashboard",
        path: "/superadmin/dashboard",
        icon: RiDashboardLine,
        iconActive: RiDashboardFill,
      },
      {
        name: "Organizations",
        path: "/superadmin/organisations",
        icon: RiBuilding4Line,
        iconActive: RiBuilding4Fill,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Plans",
        path: "/superadmin/plans",
        icon: RiFileSettingsLine,
        iconActive: RiFileSettingsFill,
      },
      {
        name: "Subscriptions",
        path: "/superadmin/billing",
        icon: RiBillLine,
        iconActive: RiBillFill,
      },
      {
        name: "Payments",
        path: "/superadmin/payments",
        icon: RiMoneyPoundCircleLine,
        iconActive: RiMoneyPoundCircleFill,
      },
    ],
  },
  {
    label: "Security",
    items: [
      {
        name: "Activity",
        path: "/superadmin/audit-log",
        icon: RiHistoryLine,
        iconActive: RiHistoryLine,
      },
      {
        name: "Team",
        path: "/superadmin/team",
        icon: RiShieldUserLine,
        iconActive: RiShieldUserFill,
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        name: "Global Settings",
        path: "/superadmin/settings",
        icon: RiSettings4Line,
        iconActive: RiSettings4Fill,
      },
      {
        name: "My Account",
        path: "/superadmin/profile",
        icon: RiShieldKeyholeLine,
        iconActive: RiShieldKeyholeFill,
      },
    ],
  },
];

const NavItem = ({ item, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const IconDefault = item.icon;
  const IconActive = item.iconActive;

  return (
    <NavLink
      to={item.path}
      onClick={() => window.innerWidth < 1024 && onClose()}
      className="block"
    >
      <motion.div
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 group
          ${isActive
            ? "bg-blue-500 text-white shadow-lg shadow-secondary/20"
            : "text-gray-600 hover:text-primary hover:bg-primary/8"
          }
        `}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            layoutId="activeBar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {/* Icon */}
        <span className={`shrink-0 transition-transform duration-200 ${!isActive ? "group-hover:scale-110" : ""}`}>
          {isActive ? <IconActive size={17} className="text-primary" /> : <IconDefault size={17} />}
        </span>

        {/* Label */}
        <span className="text-gray-900">{item.name}</span>

        {/* Hover glow */}
        {!isActive && (
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        )}
      </motion.div>
    </NavLink>
  );
};

const SuperadminSidebar = ({ isOpen, onClose }) => {
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100/80 shadow-[2px_0_24px_rgba(0,0,0,0.04)]">

      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100/80 shrink-0 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/6 rounded-xl border border-primary/12 flex items-center justify-center p-1.5 shadow-sm">
            <img
              src={eliteLogo}
              alt="ElitePic"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[13px] font-black text-secondary uppercase tracking-widest leading-none">
              ElitePic
            </h1>
            <p className="text-[8px] font-bold text-primary uppercase tracking-[0.18em] opacity-55">
              Admin Portal
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-2 text-gray-400 hover:text-primary hover:bg-primary/8 rounded-lg transition-all duration-200"
        >
          <RiCloseLine size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {section.label && (
              <div className="flex items-center gap-2.5 px-3 mb-2">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-300">
                  {section.label}
                </p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.path} item={item} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-100/80 bg-gray-50/30">
        <NavLink to="/superadmin/profile" className="block group">
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 transition-all duration-200 group-hover:border-primary/20 group-hover:shadow-md group-hover:shadow-primary/5 relative overflow-hidden"
          >
            {/* Avatar */}
            <div className="w-9 h-9 bg-secondary text-white rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 shadow-sm shadow-secondary/20">
              SA
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-bold text-secondary truncate uppercase tracking-widest">
                Administrator
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <p className="text-[8px] font-bold text-gray-400 truncate uppercase tracking-widest">
                  Active Session
                </p>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              onClick={(e) => {
                e.preventDefault();
                /* Handle logout */
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <RiLogoutBoxRLine size={16} />
            </motion.button>

            {/* Subtle hover shimmer */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/3 to-transparent pointer-events-none rounded-xl" />
          </motion.div>
        </NavLink>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — Desktop */}
      <aside className="hidden lg:block w-64 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar — Mobile */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default SuperadminSidebar;
