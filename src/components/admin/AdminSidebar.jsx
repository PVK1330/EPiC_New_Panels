import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { logout } from "../../store/slices/authSlice";
import {
  RiDashboardLine,
  RiShieldUserLine,
  RiUserSettingsLine,
  RiTeamLine,
  RiBuildingLine,
  RiLockLine,
  RiFolderOpenLine,
  RiFileTextLine,
  RiGitBranchLine,
  RiUserAddLine,
  RiAlarmWarningLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiLineChartLine,
  RiFileList3Line,
  RiNotification2Line,
  RiMessage2Line,
  RiShieldCheckLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiQuestionLine,
  RiCloseLine,
} from "react-icons/ri";
import eliteLogo from "../../assets/elitepic_logo.png";

const navSections = [
  {
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: RiDashboardLine },
    ],
  },
  {
    label: "User Management",
    items: [
      { to: "/admin/admin-users",  label: "Admin Users",          icon: RiShieldUserLine   },
      { to: "/admin/caseworkers",  label: "Case Workers",         icon: RiUserSettingsLine },
      { to: "/admin/candidates",   label: "Clients / Candidates", icon: RiTeamLine         },
      { to: "/admin/businesses",   label: "Sponsors / Businesses",icon: RiBuildingLine     },
    ],
  },
  {
    label: "Access Control",
    items: [
      { to: "/admin/permissions", label: "Permissions & RBAC", icon: RiLockLine },
    ],
  },
  {
    label: "Case Management",
    items: [
      { to: "/admin/cases",       label: "All Cases",        icon: RiFolderOpenLine  },
      { to: "/admin/case-detail", label: "Case Detail",      icon: RiFileTextLine    },
      { to: "/admin/pipeline",    label: "Pipeline",         icon: RiGitBranchLine   },
      { to: "/admin/assign",      label: "Assign / Reassign",icon: RiUserAddLine     },
      { to: "/admin/escalations", label: "Escalations",      icon: RiAlarmWarningLine},
    ],
  },
  {
    label: "Team",
    items: [
      { to: "/admin/workload", label: "Workload Monitoring", icon: RiBarChartLine },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/admin/finance", label: "Finance & Payments", icon: RiMoneyDollarCircleLine },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/admin/reports", label: "Reporting & Analytics", icon: RiLineChartLine },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/admin/documents",   label: "Document Management", icon: RiFileList3Line    },
      { to: "/admin/notifications",label: "Notifications",      icon: RiNotification2Line},
      { to: "/admin/messages",    label: "Messages",            icon: RiMessage2Line     },
      { to: "/admin/audit-logs",  label: "Compliance & Audits", icon: RiShieldCheckLine  },
      { to: "/admin/settings",    label: "Settings",            icon: RiSettings3Line    },
    ],
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" },
  }),
};

const AdminSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50
          bg-white border-r border-gray-100 flex flex-col
          shadow-[4px_0_24px_rgba(0,0,0,0.08)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:h-screen lg:z-40
          lg:shadow-[4px_0_24px_rgba(0,0,0,0.03)]
        `}
      >
        {/* Brand */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group transition-all hover:bg-white hover:shadow-md">
              <img
                src={eliteLogo}
                alt="ElitePic"
                className="h-8 w-auto transition-transform group-hover:scale-110"
              />
            </div>
            <div>
              <h2 className="text-base font-black text-secondary leading-none tracking-tight">
                ElitePic
              </h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">
                Admin Panel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-gray-100 transition-all"
            aria-label="Close menu"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-3 overflow-y-auto">
          {navSections.map((section, sectionIdx) => (
            <motion.div
              key={sectionIdx}
              custom={sectionIdx}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mb-1"
            >
              {section.label && (
                <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-gray-400 px-3 pt-3 pb-1.5">
                  {section.label}
                </p>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        // Let React Router commit navigation first; closing the drawer in the same tick
                        // can race with Outlet remount and cause a blank main area (esp. on mobile).
                        queueMicrotask(() => onClose());
                      }}
                      end={item.to === "/admin/dashboard"}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 relative ${
                          isActive
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            size={17}
                            className={`shrink-0 transition-colors ${
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-primary"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                          {isActive && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white/25 rounded-l-full" />
                          )}
                        </>
                      )}
                    </NavLink>
                  ),
                )}
              </div>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 transition-all hover:bg-white hover:shadow-md hover:border-transparent group">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-secondary truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-wider">
                Super Admin
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all shrink-0"
              title="Logout"
            >
              <RiLogoutBoxRLine size={17} />
            </button>
          </div>

          {/* <div className="mt-3 px-1 flex items-center justify-between">
            <button
              type="button"
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <RiQuestionLine size={13} />
              Support
            </button>
            <span className="text-[10px] font-bold text-gray-300">v1.0.2</span>
          </div> */}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
