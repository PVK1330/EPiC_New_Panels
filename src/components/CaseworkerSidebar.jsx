import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { LogOut, HelpCircle, X } from "lucide-react";
import eliteLogo from "../assets/elitepic_logo.png";
import { caseworkerNavSections } from "./caseworkerNavSections";
import { useState, useEffect } from "react";
import api from "../services/api";

const CaseworkerSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [taskCount, setTaskCount] = useState(0);

  // Fetch task count
  useEffect(() => {
    const fetchTaskCount = async () => {
      try {
        const response = await api.get("/api/tasks/assign?filter=overdue&limit=1");
        if (response.data.status === "success") {
          setTaskCount(response.data.data.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Error fetching task count:", error);
      }
    };

    fetchTaskCount();
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
          fixed top-0 left-0 h-full w-72 z-50 flex flex-col
          bg-white border-r border-gray-200
          shadow-[4px_0_24px_rgba(0,0,0,0.06)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:h-screen lg:z-40 lg:shadow-[4px_0_24px_rgba(0,0,0,0.03)]
        `}
      >
        <div className="flex items-center justify-between shrink-0 border-b border-gray-100 p-6 lg:p-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner shrink-0">
              <img
                src={eliteLogo}
                alt="ElitePic Logo"
                className="h-8 w-auto"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-gray-900 leading-none tracking-tight truncate">
                ElitePic
              </h2>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-1.5">
                Caseworker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 min-h-0">
          <div className="px-4 py-3 overflow-y-auto">
            {caseworkerNavSections(taskCount).map((section, sectionIdx) => (
              <div key={`${section.title}-${sectionIdx}`} className="mb-1">
                {!section.standalone && section.title && (
                  <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-gray-400 px-3 pt-3 pb-1.5">
                    {section.title}
                  </p>
                )}

                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      end={item.to === "/caseworker/dashboard"}
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
                          {item.badge != null && (
                            <span
                              className={`ml-auto shrink-0 min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-black ${isActive
                                  ? "bg-white/25 text-white"
                                  : "bg-red-500 text-white"
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
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
          </div>
        </nav>

        <div className="mt-auto border-t border-gray-100 shrink-0 p-6">
          <div className="flex items-center gap-3 p-3.5 rounded-3xl bg-gray-100 border border-gray-200 transition-all hover:bg-white hover:shadow-md">
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                navigate("/caseworker/my-account");
                onClose();
              }}
            >
              <div className="w-11 h-11 bg-white shadow-sm border border-gray-200 text-primary rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] font-bold text-gray-600 truncate uppercase tracking-wider">
                  Profile
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
          {/* <div className="mt-4 px-4 flex items-center justify-between">
            <button
              type="button"
              className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <HelpCircle size={14} />
              Support
            </button>
            <span className="text-[10px] font-bold text-gray-500">v1.0.2</span>
          </div> */}
        </div>
      </aside>
    </>
  );
};

export default CaseworkerSidebar;
