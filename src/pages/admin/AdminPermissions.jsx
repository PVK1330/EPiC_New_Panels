import { useState, useEffect } from "react";
import Button from "../../components/Button.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldFlashLine,
  RiTeamLine,
  RiShieldKeyholeLine,
} from "react-icons/ri";

import { TAB_IDS, TABS } from "../../components/permissions/permissionsData";
import RolesAndPermissionsPanel from "../../components/permissions/RolesAndPermissionsPanel";
import UsersAndRolesPanel from "../../components/permissions/UsersAndRolesPanel";

const ICON_MAP = {
  shield: RiShieldFlashLine,
  users: RiTeamLine,
};

const AdminPermissions = () => {
  const [activeTab, setActiveTab] = useState(TAB_IDS.roles);
  const [stats, setStats] = useState({
    totalRoles: 5,
    totalPermissions: 120,
    totalUsers: 48,
    totalRolePermissions: 342,
  });

  useEffect(() => {
    document.title = "Permissions & Roles | EPiC Admin";
  }, []);

  return (
    <div className="space-y-6 pb-8 max-w-[1600px] mx-auto p-4">
      {/* Slim Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-secondary/30 relative group overflow-hidden">
            <RiShieldKeyholeLine size={32} className="relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">Permissions & Roles</h1>
            <p className="text-sm text-gray-400 mt-1 font-semibold flex items-center gap-2">
               Global Governance 
               <span className="w-1 h-1 rounded-full bg-gray-300" />
               <span className="text-secondary/80 italic">RBAC System</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {/* Actions removed for simplicity */}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Platform Roles', value: stats.totalRoles, color: 'border-blue-500' },
          { label: 'Defined Actions', value: stats.totalPermissions, color: 'border-indigo-500' },
          { label: 'Authorized Users', value: stats.totalUsers, color: 'border-emerald-500' },
          { label: 'Active Mappings', value: stats.totalRolePermissions, color: 'border-primary' },
        ].map(stat => (
          <div key={stat.label} className={`px-6 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.color.replace('border-', 'bg-')}`} />
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-secondary tracking-tighter">{stat.value}</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <RiShieldFlashLine size={40} />
            </div>
          </div>
        ))}
      </div>

      {/* 2-Tab Navigation */}
      <div className="flex border-b border-gray-100 gap-0">
        {TABS.map(tab => {
          const Icon = ICON_MAP[tab.icon];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-8 py-4 text-xs font-black transition-all -mb-px border-b-2 ${
                isActive
                  ? 'border-secondary text-secondary bg-secondary/5 rounded-t-2xl'
                  : 'border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50/50'
              }`}
            >
              {Icon && <Icon size={18} className={isActive ? 'text-secondary' : 'text-gray-400'} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === TAB_IDS.roles && <RolesAndPermissionsPanel />}
          {activeTab === TAB_IDS.users && <UsersAndRolesPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminPermissions;
