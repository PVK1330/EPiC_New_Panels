import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { performLogout } from "../../utils/performLogout";
import { getIdentitySettings } from "../../services/platformSettingsApi";
import {
  RiDashboardLine,
  RiBuilding4Line,
  RiMegaphoneLine,
  RiFileSettingsLine,
  RiBillLine,
  RiMoneyPoundCircleLine,
  RiHistoryLine,
  RiShieldUserLine,
  RiNotification3Line,
  RiSettings4Line,
  RiShieldKeyholeLine,
  RiLogoutBoxRLine,
  RiCloseLine,
} from "react-icons/ri";
import eliteLogo from "../../assets/elitepic-logo.png";
import {
  setBranding,
  selectPlatformName,
  selectLogoUrl,
  selectBrandingLoaded,
} from "../../store/slices/platformBrandingSlice";
import useModuleAccess from "../../hooks/useModuleAccess";
import { resolveAssetUrl } from "../../utils/assetUrl";

// `moduleKey` gates an item against the staff member's allowedModules
// (superadmin sees everything). `alwaysShow` marks personal account pages that
// every authenticated staff member must reach regardless of granted modules.
// NOTE: "announcements"/"notifications" are platform-admin features — they are
// not in the 8 grantable modules, so restricted staff don't see them until/unless
// those are added as modules; superadmin always does.
const navSections = [
  {
    items: [
      { label: "Dashboard", to: "/superadmin/dashboard", icon: RiDashboardLine, moduleKey: "dashboard" },
      { label: "Organizations", to: "/superadmin/organisations", icon: RiBuilding4Line, moduleKey: "organizations" },
      { label: "Announcements", to: "/superadmin/announcements", icon: RiMegaphoneLine, moduleKey: "announcements" },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Plans", to: "/superadmin/plans", icon: RiFileSettingsLine, moduleKey: "plans" },
      { label: "Subscriptions", to: "/superadmin/billing", icon: RiBillLine, moduleKey: "billing" },
      { label: "Payments", to: "/superadmin/payments", icon: RiMoneyPoundCircleLine, moduleKey: "payments" },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Audit Log", to: "/superadmin/audit-log", icon: RiHistoryLine, moduleKey: "audit-logs" },
      { label: "Staff", to: "/superadmin/team", icon: RiShieldUserLine, moduleKey: "team" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Notifications", to: "/superadmin/notifications", icon: RiNotification3Line, moduleKey: "notifications" },
      { label: "Settings", to: "/superadmin/settings", icon: RiSettings4Line, moduleKey: "settings" },
      { label: "My Profile", to: "/superadmin/profile", icon: RiShieldKeyholeLine, alwaysShow: true },
    ],
  },
];

const SuperadminSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const fullName = user?.first_name 
    ? `${user?.first_name} ${user?.last_name || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "User";
  const profilePicUrl = user?.profile_pic || user?.avatar_url ? resolveAssetUrl(user?.profile_pic || user?.avatar_url) : null;

  // Live branding from Redux — updated instantly when IdentityTab saves/uploads
  const platformName  = useSelector(selectPlatformName);
  const logoUrl       = useSelector(selectLogoUrl);
  const brandingLoaded = useSelector(selectBrandingLoaded);

  // Self-heal: if branding hasn't been hydrated yet (e.g. this session loaded
  // before the logo was uploaded, or Redux was reset), fetch it once so the
  // sidebar shows the configured logo instead of the bundled default.
  useEffect(() => {
    if (brandingLoaded) return;
    let cancelled = false;
    getIdentitySettings()
      .then((res) => {
        const s = res.data?.data?.settings;
        if (s && !cancelled) {
          dispatch(
            setBranding({
              platform_name: s.platform_name,
              logo_url: s.logo_url ?? null,
              favicon_url: s.favicon_url ?? null,
            }),
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [brandingLoaded, dispatch]);

  const logoSrc = resolveAssetUrl(logoUrl) || eliteLogo;
  const { canAccess } = useModuleAccess();

  const handleLogout = () => {
    performLogout(dispatch, navigate);
  };

  const SidebarContent = () => {
    const visibleSections = navSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => item.alwaysShow || canAccess(item.moduleKey),
        ),
      }))
      .filter((section) => section.items.length > 0);

    return (
      <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
        {/* Brand */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group transition-all hover:bg-white hover:shadow-md">
              <img
                src={logoSrc}
                alt={platformName}
                className="h-8 w-auto transition-transform group-hover:scale-110"
                onError={(e) => { e.currentTarget.src = eliteLogo; }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-secondary leading-none tracking-tight truncate">
                {platformName}
              </h2>
              <p className="text-[10px] font-black text-primary tracking-wide mt-1.5 opacity-80">
                Super Admin
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
        <nav className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
          {visibleSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-1">
              {section.label && (
                <p className="text-[10px] font-black tracking-wide text-slate-500 px-3 pt-3 pb-1.5">
                  {section.label}
                </p>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      queueMicrotask(() => onClose());
                    }}
                    end={item.to === "/superadmin/dashboard"}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-700 hover:bg-gray-50 hover:text-primary"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={17}
                          className={`shrink-0 transition-colors ${isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-primary"
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
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-slate-200 transition-all hover:bg-white hover:shadow-md hover:border-transparent group">
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
                Super Admin
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all shrink-0 cursor-pointer"
              title="Logout"
            >
              <RiLogoutBoxRLine size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Desktop */}
      <aside className="hidden lg:block w-72 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

export default SuperadminSidebar;
