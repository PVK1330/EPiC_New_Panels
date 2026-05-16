import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiCheckLine,
  RiShieldFlashLine,
  RiDashboardLine,
  RiFolderLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiLineChartLine,
  RiShieldLine,
  RiLockLine,
  RiFileListLine,
  RiLayoutGridLine,
} from 'react-icons/ri';
import Button from '../Button';
import { DEFAULT_MODULES } from './permissionsData';

const PermissionRow = ({ module, permissions, onChange }) => {
  const actions = ['View', 'Add', 'Edit', 'Delete'];
  const Icon = {
    "Dashboard": RiDashboardLine,
    "Cases": RiFolderLine,
    "Contacts": RiUserLine,
    "Finance": RiMoneyDollarCircleLine,
    "Reports": RiLineChartLine,
    "Infrastructure": RiShieldLine,
    "Security": RiLockLine,
    "Audit Log": RiFileListLine
  }[module.name] || RiLayoutGridLine;
  
  return (
    <tr className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50/50">
      <td className="py-3 px-6">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-gray-400 group-hover:text-secondary transition-colors" />
          <span className="text-sm font-bold text-secondary tracking-tight">{module.name}</span>
        </div>
      </td>
      {actions.map(action => {
        const perm = permissions.find(p => p.action.toLowerCase() === action.toLowerCase());
        const exists = !!perm;
        const granted = perm?.hasPermission;

        return (
          <td key={action} className="py-4 px-2 text-center align-middle">
            {exists ? (
              <button
                onClick={() => onChange(module.name, 'custom', perm.id)}
                className={`w-7 h-7 rounded-xl border-2 mx-auto flex items-center justify-center transition-all duration-300 ${
                  granted 
                    ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/20 scale-110' 
                    : 'bg-white border-gray-100 hover:border-secondary/40 hover:scale-105'
                }`}
              >
                {granted && <RiCheckLine size={18} className="stroke-[3]" />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mx-auto opacity-30" />
            )}
          </td>
        );
      })}
    </tr>
  );
};

const RolesAndPermissionsPanel = () => {
  const [selectedRole, setSelectedRole] = useState({
    id: 1,
    name: 'Admin',
    isSystem: true,
    permissionCount: 42,
    userCount: 8
  });

  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const roles = [
    { id: 1, name: 'Admin', isSystem: true, permissionCount: 42, userCount: 8 },
    { id: 2, name: 'Caseworker', isSystem: true, permissionCount: 28, userCount: 15 },
    { id: 3, name: 'Candidate', isSystem: true, permissionCount: 12, userCount: 4 },
    { id: 4, name: 'Sponsor', isSystem: true, permissionCount: 22, userCount: 21 },
  ];

  const [modulePermissions, setModulePermissions] = useState(
    DEFAULT_MODULES.map(m => ({
      module: m,
      permissions: [
        { id: `${m.name}_view`, action: 'View', hasPermission: true },
        { id: `${m.name}_add`, action: 'Add', hasPermission: true },
        { id: `${m.name}_edit`, action: 'Edit', hasPermission: false },
        { id: `${m.name}_delete`, action: 'Delete', hasPermission: false },
      ]
    }))
  );

  const handlePermissionChange = (moduleName, level, permId = null) => {
    setHasPendingChanges(true);
    setModulePermissions(prev => prev.map(mod => {
      if (mod.module.name !== moduleName) return mod;

      let newPermissions = [...mod.permissions];
      if (level === 'none') {
        newPermissions = newPermissions.map(p => ({ ...p, hasPermission: false }));
      } else if (level === 'full') {
        newPermissions = newPermissions.map(p => ({ ...p, hasPermission: true }));
      } else if (level === 'view') {
        newPermissions = newPermissions.map(p => ({ 
          ...p, 
          hasPermission: ['view', 'read'].includes(p.action.toLowerCase()) 
        }));
      } else if (level === 'edit') {
         newPermissions = newPermissions.map(p => ({ 
          ...p, 
          hasPermission: ['view', 'read', 'create', 'edit'].includes(p.action.toLowerCase()) 
        }));
      } else if (level === 'custom' && permId) {
        newPermissions = newPermissions.map(p => p.id === permId ? { ...p, hasPermission: !p.hasPermission } : p);
      }
      return { ...mod, permissions: newPermissions };
    }));
  };

  return (
    <div className="space-y-8">
      {/* Role Selection Tabs */}
      <div className="flex flex-wrap gap-3">
        {roles.map(role => {
          const isActive = selectedRole.id === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`px-8 py-3 rounded-2xl border font-black text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 scale-[1.02]'
                  : 'bg-white text-secondary border-gray-100 hover:border-secondary/20'
              }`}
            >
              {role.name}
            </button>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between gap-6 bg-gray-50/20">
          <div>
            <h3 className="text-lg font-black text-secondary tracking-tight">{selectedRole.name} Permissions</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Access Control Matrix</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl border-gray-200 text-[10px] font-black px-4 py-2">Enable All</Button>
            <Button variant="primary" className="rounded-xl text-[10px] font-black px-6 py-2 shadow-lg shadow-primary/20">Apply Matrix</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Module</th>
                <th className="py-4 px-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest w-28">View</th>
                <th className="py-4 px-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest w-28">Add</th>
                <th className="py-4 px-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest w-28">Edit</th>
                <th className="py-4 px-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest w-28">Delete</th>
              </tr>
            </thead>
            <tbody>
              {modulePermissions.map(mod => (
                <PermissionRow 
                  key={mod.module.name} 
                  module={mod.module} 
                  permissions={mod.permissions} 
                  onChange={handlePermissionChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Bar */}
      <AnimatePresence>
        {hasPendingChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-12 z-50 border border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                 <RiShieldFlashLine size={22} className="animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">Unsaved Changes</p>
                <p className="text-[11px] font-semibold opacity-60">Pending modifications for {selectedRole.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setHasPendingChanges(false)}
                className="px-6 py-2.5 text-xs font-black hover:bg-white/10 rounded-xl transition-all"
              >
                Discard
              </button>
              <button 
                onClick={() => setHasPendingChanges(false)}
                className="px-8 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Publish Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolesAndPermissionsPanel;
