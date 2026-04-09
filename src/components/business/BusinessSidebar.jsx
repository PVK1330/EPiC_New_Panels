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
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import eliteLogo from "../../assets/elitepic_logo.png";

const BusinessSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navSections = [
    {
      items: [
        {
          to: "/business/dashboard",
          label: "Dashboard",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Organisation",
      items: [
        { to: "/business/profile", label: "Business Profile", icon: Building2 },
        { to: "/business/personnel", label: "Key Personnel", icon: Users },
      ],
    },
    {
      label: "Sponsorship",
      items: [
        { to: "/business/licence", label: "Licence Status", icon: FileText },
        { to: "/business/apply-licence", label: "Apply / Renew Licence", icon: FileText },
        { to: "/business/licence-documents", label: "Licence Documents", icon: FileText },
        { to: "/business/cosallocation", label: "CoS Allocation", icon: Package },
        { to: "/business/workers", label: "Sponsored Workers", icon: Users },
      ],
    },
    {
      label: "Candidates",
      items: [
        { to: "/business/my-candidates", label: "My Candidates", icon: Briefcase },
      ],
    },
    {
      label: "Compliance",
      items: [
        {
          to: "/business/compliance",
          label: "Compliance Dashboard",
          icon: BarChart3,
        },
        { to: "/business/compliacedocument", label: "Compliance Documents", icon: FileText },
        { to: "/business/reporting-obligations", label: "Reporting Obligations", icon: UserCheck },
      ],
    },
    {
      label: "HR File Management",
      items: [
        { to: "/business/employee-records", label: "Employee Records", icon: Users },
      ],
    },
    {
      label: "Finance",
      items: [
        { to: "/business/invoices", label: "Invoices", icon: DollarSign },
        { to: "/business/payment", label: "Payments", icon: DollarSign },
      ],
    },
    {
      label: "Communication",
      items: [
        { to: "/business/messages", label: "Messages", icon: MessageSquare },
        {
          to: "/business/notifications",
          label: "Notifications",
          icon: Bell,
        },
      ],
    },
    {
      label: "Reports",
      items: [
        { to: "/business/reports", label: "Reports", icon: TrendingUp },
      ],
    },
    {
      items: [{ to: "/business/settings", label: "Settings", icon: Settings }],
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
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group transition-all hover:bg-white hover:shadow-md">
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
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">
                Business
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
        <nav className="flex-1 px-4 py-3 overflow-y-auto">
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-1">
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
                    onClick={onClose}
                    end={item.to === "/business/dashboard"}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 relative ${isActive
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
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white/25 rounded-l-full" />
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
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 transition-all hover:bg-white hover:shadow-md hover:border-transparent group">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
              {user?.name?.charAt(0) || "B"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-secondary truncate">
                {user?.name || "Business Account"}
              </p>
              <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-wider">
                Business Portal
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

          {/* <div className="mt-3 px-1 flex items-center justify-between">
            <button
              type="button"
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5"
            >
              Support
            </button>
            <span className="text-[10px] font-bold text-gray-300">v1.0.2</span>
          </div> */}
        </div>
      </aside>
    </>
  );
};

export default BusinessSidebar;

