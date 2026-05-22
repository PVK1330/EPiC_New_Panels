import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  Building2,
  Users,
  FileText,
  Package,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  X,
  UserCheck,
  DollarSign,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Files,
  Activity,
  ClipboardCheck,
  FileWarning,
  Receipt,
  UserCog,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import eliteLogo from "../../assets/elitepic_logo.png";
import useModuleAccess from "../../hooks/useModuleAccess";
import { resolveAssetUrl } from "../../utils/assetUrl";

const BusinessSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const fullName = user?.first_name 
    ? `${user?.first_name} ${user?.last_name || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "User";
  const profilePicUrl = user?.profile_pic || user?.avatar_url ? resolveAssetUrl(user?.profile_pic || user?.avatar_url) : null;
  const { canAccess } = useModuleAccess();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navSections = [
    {
      items: [
        { to: "/business/dashboard", label: "Dashboard", icon: BarChart3, moduleKey: "business.dashboard" },
      ],
    },
    {
      label: "Organisation",
      items: [
        { to: "/business/profile",    label: "Business Profile", icon: Building2, moduleKey: "business.profile" },
        { to: "/business/personnel",  label: "Key Personnel",    icon: Users,     moduleKey: "business.profile" },
      ],
    },
    {
      label: "Sponsorship & HR",
      items: [
        { to: "/business/licence",           label: "Licence Management",  icon: ShieldCheck, moduleKey: "business.licence" },
        { to: "/business/licence-documents", label: "Licence Documents",   icon: Files,       moduleKey: "business.licence" },
        { to: "/business/cosallocation",     label: "CoS Allocation",      icon: Package,     moduleKey: "business.licence" },
        { to: "/business/workers",           label: "Sponsored Workers",   icon: UserCog,     moduleKey: "business.workers" },
        { to: "/business/employee-records",  label: "Employee Records",    icon: UserCheck,   moduleKey: "business.workers" },
      ],
    },
    {
      label: "Compliance",
      items: [
        { to: "/business/compliance",             label: "Compliance Dashboard",  icon: Activity,      moduleKey: "business.compliance" },
        { to: "/business/compliance-documents",   label: "Compliance Documents",  icon: ClipboardCheck, moduleKey: "business.compliance" },
        { to: "/business/reporting-obligations",  label: "Reporting Obligations", icon: FileWarning,   moduleKey: "business.reporting-obligations" },
      ],
    },
    {
      label: "Finance",
      items: [
        { to: "/business/invoices", label: "Invoices", icon: Receipt,    moduleKey: "business.payment" },
        { to: "/business/payment",  label: "Payments", icon: DollarSign, moduleKey: "business.payment" },
      ],
    },
    {
      label: "Communication",
      items: [
        { to: "/business/messages",      label: "Messages",      icon: MessageSquare, moduleKey: "business.messages" },
        { to: "/business/calendar",      label: "Calendar",      icon: Calendar,      moduleKey: "business.calendar" },
        { to: "/business/notifications", label: "Notifications", icon: Bell,          moduleKey: "business.dashboard" },
      ],
    },
    {
      label: "System",
      items: [
        { to: "/business/reports",   label: "Reports",   icon: TrendingUp, moduleKey: "business.dashboard" },
        { to: "/business/settings",  label: "Settings",  icon: Settings,   moduleKey: "business.settings" },
      ],
    },
  ];

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
          lg:static lg:translate-x-0 lg:h-screen lg:z-40 lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        `}
      >
        {/* Brand */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group transition-all hover:bg-white hover:shadow-md shrink-0">
              <img
                src={eliteLogo}
                alt="ElitePic Logo"
                className="h-8 w-auto transition-transform group-hover:scale-110"
              />
            </div>
            <div>
              <h2 className="text-base font-black text-secondary leading-none tracking-tight">
                ElitePic
              </h2>
              <p className="text-[10px] font-black text-primary tracking-wide mt-1.5 opacity-80">
                Business Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-gray-100 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-1">
              {section.label && (
                <p className="text-[10px] font-black tracking-wide text-gray-400 px-3 pt-4 pb-1.5">
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
                    end={item.to === "/business/dashboard"}
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
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0 overflow-hidden">
              {profilePicUrl ? (
                <img src={profilePicUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-secondary truncate">
                {fullName}
              </p>
              <p className="text-[9px] font-black text-primary tracking-wider">
                Sponsor Admin
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all shrink-0"
              title="Logout"
              type="button"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default BusinessSidebar;
