import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { performLogout } from "../utils/performLogout";
import SuperadminSidebar from "../components/superadmin/SuperadminSidebar";
import PlatformNotificationDropdown from "../components/superadmin/PlatformNotificationDropdown";
import { getIdentitySettings } from "../services/platformSettingsApi";
import { setBranding, selectFaviconUrl } from "../store/slices/platformBrandingSlice";
import { resolveAssetUrl } from "../utils/assetUrl";
import {
  RiMenuLine,
  RiHome5Line,
  RiArrowRightSLine,
  RiSettings3Line,
  RiUserLine,
  RiLogoutBoxRLine,
  RiSearchLine,
} from "react-icons/ri";

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } },
};

const SuperadminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const faviconUrl = useSelector(selectFaviconUrl);

  // Load platform branding once on mount so the sidebar logo + browser favicon
  // reflect the uploaded assets everywhere — not only after visiting Settings.
  useEffect(() => {
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
  }, [dispatch]);

  // Apply the uploaded favicon to the document <link rel="icon"> at runtime.
  useEffect(() => {
    const href = resolveAssetUrl(faviconUrl);
    if (!href) return;
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [faviconUrl]);

  // Inactivity auto-logout is handled app-wide by <SessionTimeout> in App.jsx
  // (single source of truth — BUG-010). The previous superadmin-only useIdleTimer
  // was removed to avoid two competing timers with a less-secure logout path.

  const handleLogout = () => {
    performLogout(dispatch, navigate);
  };

  const closeAll = () => {
    setProfileOpen(false);
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeAll();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden app-dense">
      <SuperadminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0 shadow-sm">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-4 min-w-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <RiMenuLine size={20} />
            </button>

            <nav className="flex items-center text-sm text-gray-500 overflow-hidden">
              <Link
                to="/superadmin/dashboard"
                className="hover:text-primary transition-colors flex items-center shrink-0"
                aria-label="Home"
              >
                <RiHome5Line size={16} />
              </Link>

              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const name =
                  value.charAt(0).toUpperCase() +
                  value.slice(1).replace(/-/g, " ");

                return (
                  <div key={to} className="flex items-center shrink-0">
                    <RiArrowRightSLine size={14} className="mx-1.5 text-gray-300" />
                    {last ? (
                      <span className="text-secondary font-semibold truncate max-w-[120px] md:max-w-[200px]">
                        {name}
                      </span>
                    ) : (
                      <Link
                        to={to}
                        className="hover:text-primary transition-colors truncate max-w-[80px] md:max-w-[120px] capitalize"
                      >
                        {name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right: action icons */}
          <div
            ref={dropdownRef}
            className="flex items-center gap-3 ml-4 shrink-0"
          >
            {/* Global Search */}
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
              <RiSearchLine size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent border-none focus:ring-0 text-xs font-medium ml-2 w-48 text-secondary"
              />
            </div>

            {/* Notifications */}
            <PlatformNotificationDropdown />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); }}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all ${profileOpen ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
              >
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  {user?.name?.charAt(0) || "S"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-secondary leading-none">
                    {user?.name || "Super Admin"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">
                    Platform Owner
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-secondary">{user?.name || "Super Admin"}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {user?.email || "super@epic.com"}
                      </p>
                    </div>
                    <Link
                      to="/superadmin/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
                    >
                      <RiUserLine size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/superadmin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
                    >
                      <RiSettings3Line size={16} />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <RiLogoutBoxRLine size={16} />
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-surface custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="max-w-7xl mx-auto w-full px-2 md:px-4 lg:px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SuperadminLayout;
