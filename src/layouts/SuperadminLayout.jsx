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
  RiDashboardLine,
  RiBuilding4Line,
  RiMegaphoneLine,
  RiFileSettingsLine,
  RiBillLine,
  RiMoneyPoundCircleLine,
  RiHistoryLine,
  RiFileShieldLine,
  RiShieldUserLine,
  RiNotification3Line,
  RiSettings4Line,
  RiShieldKeyholeLine,
  RiCornerDownLeftLine,
} from "react-icons/ri";

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } },
};

// Quick-search destinations — mirrors the sidebar so the topbar search can jump
// straight to any platform page. `keywords` widens what each entry matches on.
const SEARCH_TARGETS = [
  { label: "Dashboard", to: "/superadmin/dashboard", icon: RiDashboardLine, group: "Overview", keywords: "home overview kpi stats analytics" },
  { label: "Organisations", to: "/superadmin/organisations", icon: RiBuilding4Line, group: "Overview", keywords: "tenants orgs companies businesses clients" },
  { label: "Announcements", to: "/superadmin/announcements", icon: RiMegaphoneLine, group: "Overview", keywords: "broadcast message notice" },
  { label: "Plans", to: "/superadmin/plans", icon: RiFileSettingsLine, group: "Management", keywords: "pricing tiers packages products" },
  { label: "Subscriptions", to: "/superadmin/billing", icon: RiBillLine, group: "Management", keywords: "billing invoices recurring revenue" },
  { label: "Payments", to: "/superadmin/payments", icon: RiMoneyPoundCircleLine, group: "Management", keywords: "transactions stripe money payouts" },
  { label: "Audit Log", to: "/superadmin/audit-log", icon: RiHistoryLine, group: "Security", keywords: "history events activity trail" },
  { label: "GDPR & Privacy", to: "/superadmin/gdpr", icon: RiFileShieldLine, group: "Security", keywords: "data protection privacy compliance" },
  { label: "Staff", to: "/superadmin/team", icon: RiShieldUserLine, group: "Security", keywords: "team members admins users people" },
  { label: "Notifications", to: "/superadmin/notifications", icon: RiNotification3Line, group: "Platform", keywords: "alerts messages bell" },
  { label: "Settings", to: "/superadmin/settings", icon: RiSettings4Line, group: "Platform", keywords: "config preferences identity branding" },
  { label: "My Profile", to: "/superadmin/profile", icon: RiShieldKeyholeLine, group: "Platform", keywords: "account me security password 2fa" },
];

const SuperadminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const faviconUrl = useSelector(selectFaviconUrl);
  const fullName = user?.first_name 
    ? `${user?.first_name} ${user?.last_name || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "User";
  const profilePicUrl = user?.profile_pic || user?.avatar_url ? resolveAssetUrl(user?.profile_pic || user?.avatar_url) : null;

  // Load platform branding on mount — and again whenever the tab regains focus —
  // so the sidebar logo + browser favicon reflect the uploaded assets everywhere,
  // not only after visiting Settings. The focus refresh means that if the logo is
  // changed in another tab/session, switching back here picks it up without a
  // hard reload (fixes the "still showing the default logo" inconsistency).
  useEffect(() => {
    let cancelled = false;

    const refreshBranding = () => {
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
    };

    refreshBranding();

    const onVisible = () => {
      if (document.visibilityState === "visible") refreshBranding();
    };
    window.addEventListener("focus", refreshBranding);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshBranding);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dispatch]);

  // Apply the uploaded favicon to the document <link rel="icon"> at runtime.
  // index.html ships multiple size-specific icon <link> tags; browsers prefer
  // those over the unsized one, so we must replace ALL of them — not just the
  // first — to guarantee the uploaded favicon is actually shown in the tab.
  useEffect(() => {
    const href = resolveAssetUrl(faviconUrl);
    if (!href) return;
    document.querySelectorAll('link[rel~="icon"]').forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
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

  // Live-filtered quick-search results. An empty query shows everything so the
  // dropdown doubles as a "jump to page" menu the moment it's focused.
  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? SEARCH_TARGETS.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.group.toLowerCase().includes(q) ||
          t.keywords.includes(q),
      )
    : SEARCH_TARGETS;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchIndex(0);
    searchInputRef.current?.blur();
  };

  const goToResult = (target) => {
    if (!target) return;
    navigate(target.to);
    closeSearch();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchOpen(true);
      setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToResult(searchResults[searchIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeAll();
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global shortcut: "/" or ⌘K / Ctrl+K focuses the quick-search (ignored while
  // typing in another field so it never steals a real keystroke).
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const typing =
        tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the highlighted result in range as the filtered list shrinks/grows.
  useEffect(() => {
    setSearchIndex(0);
  }, [searchQuery]);

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

            <nav className="flex items-center text-sm text-slate-600 overflow-hidden">
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
                    <RiArrowRightSLine size={14} className="mx-1.5 text-slate-400" />
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
            <div ref={searchRef} className="relative hidden sm:block">
              <div
                className={`group flex items-center gap-2 pl-3 pr-2 h-10 rounded-xl border transition-all duration-200 ${
                  searchOpen
                    ? "bg-white border-primary/40 ring-2 ring-primary/15 shadow-md shadow-primary/5 w-72"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white w-60"
                }`}
              >
                <RiSearchLine
                  size={16}
                  className={`shrink-0 transition-colors ${
                    searchOpen ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search pages…"
                  aria-label="Quick search"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs font-semibold text-secondary placeholder:text-slate-400 placeholder:font-medium"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="shrink-0 text-[10px] font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                ) : (
                  <kbd className="shrink-0 hidden md:inline-flex items-center gap-0.5 px-1.5 h-5 rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-400 leading-none select-none">
                    <span className="text-[11px] leading-none">⌘</span>K
                  </kbd>
                )}
              </div>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 origin-top-right"
                  >
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          No pages match “{searchQuery}”
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="px-4 pt-1 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {searchQuery ? "Results" : "Jump to"}
                        </p>
                        {searchResults.map((target, idx) => {
                          const Icon = target.icon;
                          const active = idx === searchIndex;
                          return (
                            <button
                              key={target.to}
                              type="button"
                              onMouseEnter={() => setSearchIndex(idx)}
                              onClick={() => goToResult(target)}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                                active ? "bg-primary/5" : "hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                                  active
                                    ? "bg-primary/10 text-primary border-primary/15"
                                    : "bg-slate-50 text-slate-400 border-slate-100"
                                }`}
                              >
                                <Icon size={16} />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-bold text-secondary truncate">
                                  {target.label}
                                </span>
                                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                  {target.group}
                                </span>
                              </span>
                              {active && (
                                <RiCornerDownLeftLine
                                  size={14}
                                  className="shrink-0 text-primary/70"
                                />
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-sm overflow-hidden">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-secondary leading-none">
                    {fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold">
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
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-secondary">{fullName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user?.email || "super@epic.com"}
                      </p>
                    </div>
                    <Link
                      to="/superadmin/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 hover:text-primary transition-colors text-left"
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
