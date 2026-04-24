import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldKeyholeLine,
  RiBarChartBoxLine,
  RiGridLine,
  RiShieldLine,
  RiLockLine,
  RiTeamLine,
} from "react-icons/ri";

import { TAB_IDS, TABS } from "../../components/permissions/permissionsData";

import RbacOverviewPanel from "../../components/permissions/SegregationPanel";
import ModuleMatrixPanel from "../../components/permissions/ModuleMatrixPanel";
import RoleAssignmentPanel from "../../components/permissions/RoleAssignmentPanel";
import PermissionManagementPanel from "../../components/permissions/PermissionManagementPanel";
import UserRolePanel from "../../components/permissions/VisibilityControlsPanel";

const ICON_MAP = {
  chart: RiBarChartBoxLine,
  grid: RiGridLine,
  shield: RiShieldLine,
  lock: RiLockLine,
  users: RiTeamLine,
};

const AdminPermissions = () => {
  const [activeTab, setActiveTab] = useState(TAB_IDS.overview);

  useEffect(() => {
    document.title = "Permissions & RBAC | EPiC Admin";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen"
    >
      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-secondary">
        {/* Decorative blobs using primary/secondary */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none bg-primary"
        />
        <div
          className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10 blur-2xl pointer-events-none bg-primary"
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,0.4) 30px,rgba(255,255,255,0.4) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,0.4) 30px,rgba(255,255,255,0.4) 31px)",
          }}
        />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
              <RiShieldKeyholeLine size={26} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">
                Access Control
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Permissions & RBAC
              </h1>
              <p className="text-sm text-white/60 mt-1 max-w-md">
                Configure roles, module permissions, and control who can access what across the system.
              </p>
            </div>
          </div>

          {/* Quick stats chips using project colors */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            {[
              { label: "Roles", value: "5" },
              { label: "Modules", value: "11" },
              { label: "Users", value: "—" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{chip.label}</p>
                <p className="text-base font-black text-white">{chip.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs — NOT sticky (avoids overlap issue) ──────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-1.5">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            const Icon = ICON_MAP[tab.icon] || RiLockLine;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${active
                    ? "bg-secondary text-white shadow-md"
                    : "text-gray-500 hover:text-secondary hover:bg-secondary/5"
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="perm-tab-pill"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={15} className="relative z-10 shrink-0" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                <span className="relative z-10 sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Panel ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {activeTab === TAB_IDS.overview && <RbacOverviewPanel />}
          {activeTab === TAB_IDS.matrix && <ModuleMatrixPanel />}
          {activeTab === TAB_IDS.roles && <RoleAssignmentPanel />}
          {activeTab === TAB_IDS.permissions && <PermissionManagementPanel />}
          {activeTab === TAB_IDS.userRoles && <UserRolePanel />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPermissions;
