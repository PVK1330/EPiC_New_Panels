import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiShieldKeyholeLine } from "react-icons/ri";

import PermissionsTabBar from "../../components/permissions/PermissionsTabBar";
import { TAB_IDS, TABS } from "../../components/permissions/permissionsData";

import RbacOverviewPanel from "../../components/permissions/SegregationPanel";
import ModuleMatrixPanel from "../../components/permissions/ModuleMatrixPanel";
import RoleAssignmentPanel from "../../components/permissions/RoleAssignmentPanel";
import PermissionManagementPanel from "../../components/permissions/PermissionManagementPanel";
import UserRolePanel from "../../components/permissions/VisibilityControlsPanel";

const AdminPermissions = () => {
  const [activeTab, setActiveTab] = useState(TAB_IDS.overview);

  useEffect(() => {
    document.title = "Permissions & RBAC | EPiC Admin";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 pt-2 sm:pt-4 lg:pt-6 max-w-[1600px] mx-auto min-h-screen space-y-6"
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight flex items-center gap-2">
            <RiShieldKeyholeLine className="text-primary" />
            Permissions & Access
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Configure system roles, granular module permissions, and manage user access levels.
          </p>
        </div>
      </div>

      {/* ── Navigation Tabs (Sticky) ─────────────────────────────────────────── */}
      <div className="sticky top-[-1px] z-40 bg-[#fafafa] pt-2 pb-3 border-b border-gray-100 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-shadow">
        <PermissionsTabBar
          tabs={TABS}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* ── Active Panel ────────────────────────────────────────────────────── */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === TAB_IDS.overview && <RbacOverviewPanel />}
            {activeTab === TAB_IDS.matrix && <ModuleMatrixPanel />}
            {activeTab === TAB_IDS.roles && <RoleAssignmentPanel />}
            {activeTab === TAB_IDS.permissions && <PermissionManagementPanel />}
            {activeTab === TAB_IDS.userRoles && <UserRolePanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminPermissions;
