import {
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Home,
  Menu,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { logout } from "../store/slices/authSlice";

const Header = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const roleLabel =
    user?.role === "caseworker"
      ? "Caseworker"
      : user?.role === "candidate"
        ? "Candidate"
        : user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : "";

  const notificationsPath = useMemo(() => {
    if (!user?.role) return null;
    if (user.role === "candidate") {
      return "/candidate/communication?tab=notifications";
    }
    if (user.role === "admin") return "/admin/notifications";
    if (user.role === "business") return "/business/notifications";
    return null;
  }, [user?.role]);

  const profileSettingsPath = useMemo(() => {
    if (!user?.role) return null;
    if (user.role === "candidate") return "/candidate/account?tab=profile";
    if (user.role === "admin") return "/admin/settings";
    if (user.role === "caseworker") return "/caseworker/my-account";
    if (user.role === "business") return "/business/settings";
    return null;
  }, [user?.role]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
      {/* Left: hamburger (mobile) + breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        )}

        <nav className="flex items-center text-sm font-medium text-gray-500 overflow-hidden">
          <Link
            to="/"
            className="hover:text-primary transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Home size={16} />
          </Link>

          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const name =
              value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

            return (
              <div key={to} className="flex items-center shrink-0">
                <ChevronRight size={14} className="mx-1.5 text-gray-300" />
                {last ? (
                  <span className="text-secondary font-black truncate max-w-[120px] md:max-w-[200px]">
                    {name}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-primary transition-colors truncate max-w-[80px] md:max-w-[150px]"
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
      <div className="flex items-center gap-2 md:gap-4 ml-4 shrink-0" ref={dropdownRef}>
        {/* Help — hidden on very small screens */}
        <button className="hidden sm:flex p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative group">
          <HelpCircle size={20} />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Help Center
          </span>
        </button>

        {/* Notifications — opens full notifications page when route exists */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (notificationsPath) {
                navigate(notificationsPath);
                setIsNotificationOpen(false);
                setIsProfileOpen(false);
                return;
              }
              setIsNotificationOpen(!isNotificationOpen);
            }}
            className={`p-2 rounded-full transition-colors relative group ${isNotificationOpen
                ? "bg-gray-100 text-primary"
                : "text-gray-500 hover:bg-gray-100"
              }`}
            aria-label={
              notificationsPath ? "Open notifications page" : "Notifications"
            }
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary border-2 border-white rounded-full" />
          </button>

          {!notificationsPath && isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">System</span>{" "}
                    updated your application status.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-600">
                    New message from{" "}
                    <span className="font-bold text-gray-900">Admin Support</span>.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 text-center">
                <span className="text-sm text-gray-400 font-medium">
                  Quick preview — open your portal for full history
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 ${isProfileOpen
                ? "bg-gray-100 ring-2 ring-primary/10"
                : "hover:bg-gray-50"
              }`}
          >
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm shadow-inner">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 mt-1">{roleLabel}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-100 mb-2">
                <p className="text-sm font-bold text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              {profileSettingsPath ? (
                <button
                  type="button"
                  onClick={() => {
                    navigate(profileSettingsPath);
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                >
                  <Settings size={18} />
                  <span>Profile &amp; settings</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <User size={18} />
                    <span>My profile</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                </>
              )}
              <div className="border-t border-gray-100 my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
