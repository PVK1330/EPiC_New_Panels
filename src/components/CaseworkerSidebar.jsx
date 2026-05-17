import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { LogOut, X } from "lucide-react";
import eliteLogo from "../assets/elitepic_logo.png";
import { caseworkerNavSections } from "./caseworkerNavSections";
import { useState, useEffect } from "react";
import api from "../services/api";

const CaseworkerSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [taskCount, setTaskCount] = useState(0);

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
          bg-white border-r border-gray-100
          shadow-[4px_0_24px_rgba(0,0,0,0.06)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:h-screen lg:z-40 lg:shadow-[4px_0_24px_rgba(0,0,0,0.03)]
        `}
      >
        <div className="flex items-center justify-between shrink-0 border-b border-gray-100 p-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner shrink-0 group transition-all hover:bg-white hover:shadow-md">
              <img
                src={eliteLogo}
                alt="ElitePic Logo"
                className="h-8 w-auto transition-transform group-hover:scale-110"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-secondary leading-none tracking-tight truncate">
                ElitePic
              </h2>
              <p className="text-[10px] font-black text-primary tracking-wide mt-1.5 opacity-80">
                Caseworker
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

        <nav className="flex-1 overflow-y-auto py-3 px-4 custom-scrollbar">
          {caseworkerNavSections(taskCount).map((section, sectionIdx) => (
            <div key={`${section.title}-${sectionIdx}`} className="mb-1">
              {!section.standalone && section.title && (
                <p className="text-[10px] font-black tracking-wide text-gray-400 px-3 pt-4 pb-1.5">
                  {section.title}
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
                    end={item.to === "/caseworker/dashboard"}
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
                        {item.badge != null && (
                          <span
                            className={`ml-auto shrink-0 min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[9px] font-black ${isActive
                              ? "bg-white/20 text-white"
                              : "bg-red-500 text-white"
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
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

        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                navigate("/caseworker/my-account");
                onClose();
              }}
            >
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                {user?.name?.charAt(0) || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-secondary truncate">
                  {user?.name || "Caseworker"}
                </p>
                <p className="text-[9px] font-black text-primary tracking-wider">
                  Case Officer
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all shrink-0"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CaseworkerSidebar;
