import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPipelineCases } from "../../services/caseApi";
import { motion } from "framer-motion";
import { logout } from "../../store/slices/authSlice";
import useModuleAccess from "../../hooks/useModuleAccess";
import {
  RiDashboardLine,
  RiShieldUserLine,
  RiUserSettingsLine,
  RiTeamLine,
  RiBuildingLine,
  RiLockLine,
  RiFolderOpenLine,
  RiGitBranchLine,
  RiAlarmWarningLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiLineChartLine,
  RiStackLine,
  RiNotification2Line,
  RiMessage2Line,
  RiShieldCheckLine,
  RiFileShieldLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiCalendarLine,
  RiUserStarLine,
  RiContactsLine,
  RiExchangeLine,
  RiHistoryLine,
  RiInboxLine,
  RiMoneyPoundCircleLine,
} from "react-icons/ri";
import eliteLogo from "../../assets/elitepic_logo.png";

const navSections = [
  {
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: RiDashboardLine, moduleKey: "admin.dashboard" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/admin/admin-users",  label: "Admin Users",          icon: RiShieldUserLine,  moduleKey: "admin.dashboard" },
      { to: "/admin/caseworkers",  label: "Caseworkers",          icon: RiUserStarLine,    moduleKey: "admin.caseworkers" },
      { to: "/admin/candidates",   label: "Clients",              icon: RiContactsLine,    moduleKey: "admin.candidates" },
      { to: "/admin/businesses",   label: "Sponsors",             icon: RiBuildingLine,    moduleKey: "admin.businesses" },
    ],
  },
  {
    label: "Cases & Workflow",
    items: [
      { to: "/admin/enquiries",         label: "Enquiries",         icon: RiInboxLine,             badgeKey: "enquiries", moduleKey: "admin.enquiries" },
      { to: "/admin/ccl-fee-approvals", label: "CCL fee approvals", icon: RiMoneyPoundCircleLine,  badgeKey: "cclFees",   moduleKey: "admin.cases" },
      { to: "/admin/cases",             label: "All Cases",         icon: RiFolderOpenLine,                               moduleKey: "admin.cases" },
      { to: "/admin/pipeline",          label: "Pipeline",          icon: RiExchangeLine,                                 moduleKey: "admin.pipeline" },
      { to: "/admin/case-process",      label: "Case Process",      icon: RiGitBranchLine,                                moduleKey: "admin.cases" },
      { to: "/admin/calendar",          label: "Calendar",          icon: RiCalendarLine,                                 moduleKey: "admin.calendar" },
      { to: "/admin/escalations",       label: "Escalations",       icon: RiAlarmWarningLine,                             moduleKey: "admin.escalations" },
      { to: "/admin/licence-requests",  label: "Licence Requests",  icon: RiShieldCheckLine,                              moduleKey: "admin.licence-requests" },
    ],
  },
  {
    label: "Analytics & Finance",
    items: [
      { to: "/admin/workload",  label: "Workload",   icon: RiBarChartLine,          moduleKey: "admin.workload" },
      { to: "/admin/finance",   label: "Finance",    icon: RiMoneyDollarCircleLine, moduleKey: "admin.finance" },
      { to: "/admin/reports",   label: "Reports",    icon: RiLineChartLine,         moduleKey: "admin.reports" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: RiNotification2Line, moduleKey: "admin.dashboard" },
      { to: "/admin/messages",      label: "Messages",      icon: RiMessage2Line,      moduleKey: "admin.messages" },
      { to: "/admin/audit-logs",    label: "Audit Log",     icon: RiHistoryLine,       moduleKey: "admin.audit-logs" },
      { to: "/admin/settings",      label: "Settings",      icon: RiSettings3Line,     moduleKey: "admin.settings" },
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
  const { canAccess } = useModuleAccess();
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [cclApprovalCount, setCclApprovalCount] = useState(0);

  useEffect(() => {
    getPipelineCases()
      .then((res) => {
        const pipeline = res.data?.data || {};
        setEnquiryCount((pipeline.client_enquiry || []).length);
        setCclApprovalCount((pipeline.ccl_fee_admin_review || []).length);
      })
      .catch(() => {
        setEnquiryCount(0);
        setCclApprovalCount(0);
      });
  }, []);

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
              <p className="text-[10px] font-black text-primary tracking-wide mt-1.5 opacity-80">
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
                <p className="text-[10px] font-black tracking-wide text-gray-400 px-3 pt-3 pb-1.5">
                  {section.label}
                </p>
              )}

              <div className="space-y-0.5">
                {section.items.filter((item) => canAccess(item.moduleKey)).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      queueMicrotask(() => onClose());
                    }}
                    end={item.to === "/admin/dashboard"}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={17}
                          className={`shrink-0 transition-colors ${isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-primary"
                            }`}
                        />
                        <span className="truncate tracking-tight">{item.label}</span>
                        {item.badgeKey === "enquiries" && enquiryCount > 0 && (
                          <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500 shrink-0" title={`${enquiryCount} new enquiries`} />
                        )}
                        {item.badgeKey === "cclFees" && cclApprovalCount > 0 && (
                          <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500 shrink-0" title={`${cclApprovalCount} CCL fees pending`} />
                        )}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
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
              <p className="text-[9px] font-black text-primary tracking-wider">
                Administrator
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
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
