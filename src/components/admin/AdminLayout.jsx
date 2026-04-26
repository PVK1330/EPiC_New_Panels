import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../store/slices/authSlice";
import AdminSidebar from "./AdminSidebar";
import {
  RiMenuLine,
  RiHome5Line,
  RiArrowRightSLine,
  RiSettings3Line,
  RiUserLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";

import NotificationDropdown from "../Notifications/NotificationDropdown";



const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12 } },
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
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
    <div className="flex h-screen bg-surface overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Bar ── */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0 shadow-sm">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <RiMenuLine size={22} />
            </button>

            <nav className="flex items-center text-sm font-medium text-gray-500 overflow-hidden">
              <Link
                to="/admin/dashboard"
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
                    <RiArrowRightSLine size={15} className="mx-1 text-gray-300" />
                    {last ? (
                      <span className="text-secondary font-black truncate max-w-[120px] md:max-w-[200px]">
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
            className="flex items-center gap-1 md:gap-1.5 ml-4 shrink-0"
          >

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${profileOpen ? "bg-gray-100 ring-2 ring-primary/10" : "hover:bg-gray-50"
                  }`}
              >
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-secondary leading-none">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
                    Admin
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
                    className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-black text-secondary">{user?.name || "Admin"}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email || "admin@elitepic.com"}
                      </p>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                      <RiUserLine size={16} />
                      My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                      <RiSettings3Line size={16} />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
                    >
                      <RiLogoutBoxRLine size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface">
          {/* No mode="wait" — wait mode can leave a blank gap until exit finishes (bad on first nav). */}
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
