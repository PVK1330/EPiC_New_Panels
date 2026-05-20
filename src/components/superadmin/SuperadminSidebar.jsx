import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardLine,
  RiDashboardFill,
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
  RiNotification3Line,
  RiNotification3Fill,
  RiMegaphoneLine,
  RiMegaphoneFill,
} from "react-icons/ri";
import eliteLogo from "../../assets/elitepic_logo.png";
import {
  selectPlatformName,
  selectLogoUrl,
} from "../../store/slices/platformBrandingSlice";

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
      { name: "Dashboard",     path: "/superadmin/dashboard",     icon: RiDashboardLine,         iconActive: RiDashboardFill         },
      { name: "Organisations", path: "/superadmin/organisations", icon: RiBuilding4Line,          iconActive: RiBuilding4Fill          },
      { name: "Announcements", path: "/superadmin/announcements", icon: RiMegaphoneLine,          iconActive: RiMegaphoneFill          },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "Plans",         path: "/superadmin/plans",         icon: RiFileSettingsLine,       iconActive: RiFileSettingsFill       },
      { name: "Subscriptions", path: "/superadmin/billing",       icon: RiBillLine,               iconActive: RiBillFill               },
      { name: "Payments",      path: "/superadmin/payments",      icon: RiMoneyPoundCircleLine,   iconActive: RiMoneyPoundCircleFill   },
    ],
  },
  {
    label: "Security",
    items: [
      { name: "Activity",      path: "/superadmin/audit-log",     icon: RiHistoryLine,            iconActive: RiHistoryLine            },
      { name: "Team",          path: "/superadmin/team",          icon: RiShieldUserLine,         iconActive: RiShieldUserFill         },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Notifications", path: "/superadmin/notifications", icon: RiNotification3Line,      iconActive: RiNotification3Fill      },
      { name: "Global Settings",path: "/superadmin/settings",     icon: RiSettings4Line,          iconActive: RiSettings4Fill          },
      { name: "My Account",    path: "/superadmin/profile",       icon: RiShieldKeyholeLine,      iconActive: RiShieldKeyholeFill      },
    ],
  },
];

const NavItem = ({ item, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const IconDefault = item.icon;
  const IconActive  = item.iconActive;

  return (
    <NavLink
      to={item.path}
      onClick={() => window.innerWidth < 1024 && onClose()}
      className="block"
    >
      <motion.div
        whileHover={{ x: 4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 group
          ${isActive ? "bg-primary/10 text-primary border-l-4 border-primary" : "text-gray-700"}
        `}
      >
        {isActive && (
          <motion.div
            layoutId="activeBar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-lg"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <span className={`shrink-0 transition-transform duration-300 text-xl ${!isActive ? "group-hover:scale-125 group-hover:rotate-6" : ""}`}>
          {isActive
            ? <IconActive  size={22} className="text-primary" />
            : <IconDefault size={22} className="text-gray-400 group-hover:text-primary" />}
        </span>

        <span className={`transition-colors duration-300 ${isActive ? "text-primary" : "text-gray-800 group-hover:text-primary"}`}>
          {item.name}
        </span>

        {!isActive && (
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent pointer-events-none" />
        )}
      </motion.div>
    </NavLink>
  );
};

const SuperadminSidebar = ({ isOpen, onClose }) => {
  // Live branding from Redux — updated instantly when IdentityTab saves/uploads
  const platformName = useSelector(selectPlatformName);
  const logoUrl      = useSelector(selectLogoUrl);

  // Use the uploaded logo if available, otherwise fall back to the bundled asset
  const logoSrc = logoUrl || eliteLogo;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-blue-50/30 to-white border-r border-blue-100/50 shadow-[2px_0_24px_rgba(59,130,246,0.08)]">

      {/* ── Brand Header ─────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-4 border-b border-blue-100/50 shrink-0 bg-gradient-to-r from-white to-blue-50/50 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-10 rounded-xl border-2 border-blue-300/50 flex items-center justify-center p-2 shadow-lg shadow-blue-500/25 cursor-pointer overflow-hidden bg-white"
          >
            <img
              src={logoSrc}
              alt={platformName}
              className="w-full h-full object-contain"
              /* If the remote logo fails to load, fall back to the bundled asset */
              onError={(e) => { e.currentTarget.src = eliteLogo; }}
            />
          </motion.div>

          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-lg font-black text-primary leading-none truncate max-w-[120px]">
              {platformName}
            </h1>
            <p className="text-xs font-semibold text-secondary opacity-75">
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

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {section.label && (
              <div className="flex items-center gap-2.5 px-4 mb-3">
                <p className="text-xs font-semibold text-gray-400">{section.label}</p>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
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

      {/* ── User Footer ──────────────────────────────────────────────── */}
      <div className="p-3 border-t border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-white">
        <NavLink to="/superadmin/profile" className="block group">
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-white to-blue-50 border border-blue-200 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/15 relative overflow-hidden"
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-black text-[12px] shrink-0 shadow-lg shadow-blue-500/30"
            >
              SA
            </motion.div>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-blue-700 truncate">Administrator</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-lg shadow-green-500/40" />
                </span>
                <p className="text-xs font-bold text-blue-500 truncate">Active Session</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); /* Handle logout */ }}
              className="p-2 text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 shadow-md shadow-blue-500/10 group-hover:shadow-red-500/20"
            >
              <RiLogoutBoxRLine size={18} />
            </motion.button>

            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent pointer-events-none rounded-xl" />
          </motion.div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
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

      {/* Desktop */}
      <aside className="hidden lg:block w-64 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile */}
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
