import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { LogOut, X } from "lucide-react";
import eliteLogo from "../assets/elitepic_logo.png";
import { useMemo } from "react";
import { candidateNavSections as navSections } from "./candidateNavSections";

function resolveAccountNavMatch(pathname, search) {
  if (pathname !== "/candidate/account") return null;
  const p = new URLSearchParams(search);
  const t = p.get("tab");
  if (t === "feedback") return "feedback";
  if (t === "profile") return "profile";
  if (t === "report") return "report";
  if (t === "downloads") return "downloads-pack";
  if (p.get("section") === "final") return "downloads-final";
  return "downloads-pack";
}

function resolvePaymentsNavMatch(pathname, search) {
  if (pathname !== "/candidate/payments") return null;
  const t = new URLSearchParams(search).get("tab");
  if (t === "history") return "history";
  return "summary";
}

function navLinkMatches(
  pathname,
  search,
  { accountTab, paymentTab },
  isActive,
) {
  let matched = isActive;
  if (accountTab) {
    matched = resolveAccountNavMatch(pathname, search) === accountTab;
  } else if (paymentTab) {
    matched = resolvePaymentsNavMatch(pathname, search) === paymentTab;
  }
  return matched;
}

const CandidateSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  useMemo(() => navSections, []);

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
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group transition-all hover:bg-white hover:shadow-md shrink-0">
              <img
                src={eliteLogo}
                alt="ElitePic"
                className="h-8 w-auto transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-secondary leading-none tracking-tight truncate">
                ElitePic
              </h2>
              <p className="text-[10px] font-black text-primary tracking-wide mt-1.5 opacity-80">
                Candidate
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
            <div key={`${section.title}-${sectionIdx}`} className="mb-1">
              {!section.standalone && section.title && (
                <p className="text-[10px] font-black tracking-wide text-gray-400 px-3 pt-4 pb-1.5">
                  {section.title}
                </p>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const matched = navLinkMatches(
                    location.pathname,
                    location.search,
                    {
                      accountTab: item.accountTab,
                      paymentTab: item.paymentTab,
                    },
                    location.pathname === item.to
                  );

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        queueMicrotask(() => onClose());
                      }}
                      end={item.to === "/candidate/dashboard"}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${matched
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                        }`}
                    >
                      <item.icon
                        size={17}
                        className={`shrink-0 transition-colors ${matched
                          ? "text-white"
                          : "text-gray-400 group-hover:text-primary"
                          }`}
                      />
                      <span className="truncate tracking-tight">{item.label}</span>
                      {matched && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-secondary truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[9px] font-black text-primary tracking-wider">
                Client Portal
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

export default CandidateSidebar;
