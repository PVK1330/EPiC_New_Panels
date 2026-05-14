import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiShieldUserLine,
  RiAddLine,
  RiMore2Line,
  RiMailSendLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiFilter3Line,
  RiSearchLine,
  RiArrowRightSLine,
  RiNotificationBadgeLine,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiLockLine,
  RiListSettingsLine,
  RiGroupLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAlertLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';

const modules = [
  { id: 'dashboard', label: 'Dashboard', description: 'Business intelligence and KPIs' },
  { id: 'organizations', label: 'Organisations', description: 'Tenant and user management' },
  { id: 'plans', label: 'Subscription Plans', description: 'Pricing and tier configuration' },
  { id: 'payments', label: 'Financial Hub', description: 'Stripe and revenue tracking' },
  { id: 'billing', label: 'Invoicing', description: 'Invoices and usage credits' },
  { id: 'audit-logs', label: 'Audit Logs', description: 'System and security events' },
  { id: 'team', label: 'Team Management', description: 'Admin roles and permissions' },
  { id: 'settings', label: 'System Settings', description: 'Global platform configuration' },
];

const SuperadminTeam = () => {
  const [activeTab, setActiveTab] = useState('Members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [disabledUsers, setDisabledUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const [team, setTeam] = useState([
    { id: 1, name: 'Alex Thompson', role: 'Super Admin', modules: 8, email: 'alex@epic.com', status: 'Active', lastActive: '2 mins ago', mfa: true },
    { id: 2, name: 'Sarah Chen', role: 'Security Admin', modules: 3, email: 'sarah@epic.com', status: 'Active', lastActive: '1 hour ago', mfa: true },
    { id: 3, name: 'James Wilson', role: 'Billing Admin', modules: 2, email: 'james@epic.com', status: 'Inactive', lastActive: '2 days ago', mfa: false },
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: 'Super Admin', modules: 8, members: 1, type: 'System', perms: ['dashboard', 'organizations', 'plans', 'payments', 'billing', 'audit-logs', 'team', 'settings'] },
    { id: 2, name: 'Support Agent', modules: 2, members: 4, type: 'Custom', perms: ['dashboard', 'organizations'] },
    { id: 3, name: 'Billing Manager', modules: 3, members: 1, type: 'Custom', perms: ['billing', 'payments', 'audit-logs'] },
    { id: 4, name: 'Compliance Officer', modules: 2, members: 0, type: 'Custom', perms: ['audit-logs', 'settings'] },
  ]);

  const handleTogglePermission = (moduleId) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleRevokeAccess = (member) => {
    setRevokeTarget(member);
    setIsRevokeModalOpen(true);
  };

  const confirmRevokeAccess = () => {
    if (revokeTarget) {
      setDisabledUsers(prev => new Set([...prev, revokeTarget.id]));
      setTeam(prev => prev.map(m => 
        m.id === revokeTarget.id ? { ...m, status: 'Inactive' } : m
      ));
      setIsRevokeModalOpen(false);
      setRevokeTarget(null);
    }
  };

  const handleRestoreAccess = (member) => {
    setDisabledUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(member.id);
      return newSet;
    });
    setTeam(prev => prev.map(m => 
      m.id === member.id ? { ...m, status: 'Active' } : m
    ));
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    const perms = {};
    role.perms.forEach(p => perms[p] = true);
    setSelectedPermissions(perms);
    setIsRoleModalOpen(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setSelectedPermissions({});
    setIsRoleModalOpen(true);
  };

  const confirmDeleteRole = (role) => {
    setEditingRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRole = () => {
    setRoles(prev => prev.filter(r => r.id !== editingRole.id));
    setIsDeleteModalOpen(false);
    setEditingRole(null);
  };

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-6">
      {/* Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 rounded-2xl p-8 text-white shadow-lg border border-white/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-2xl font-black text-red-700 mb-2">Administrative Team</h1>
             <p className="text-sm text-gray-500  tracking-widest">Manage internal accounts and define custom role-based access levels.</p>
          </div>
          <div className="flex items-center gap-3">
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Button 
                  onClick={handleCreateRole}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white shadow-lg backdrop-blur-sm"
               >
                  <RiShieldUserLine size={16} className="inline mr-2" />Create Role
               </Button>
             </motion.div>
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               <Button 
               
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white  shadow-lg backdrop-blur-sm"
               >
                  <RiAddLine size={18} /> Invite Member
               </Button>
             </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tabs with Modern Styling */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex bg-gradient-to-r from-gray-50 to-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm"
      >
         {['Members', 'Roles'].map((tab) => (
            <motion.button
               key={tab}
               onClick={() => setActiveTab(tab)}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className={`px-8 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-lg' 
                    : 'text-gray-500 hover:text-secondary hover:bg-white'
               }`}
            >
               {tab}
            </motion.button>
         ))}
      </motion.div>

      {activeTab === 'Members' ? (
        <>
          {/* Team Security Metrics with Gradients */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 shadow-sm flex items-center gap-4 hover:border-blue-300/80 cursor-pointer group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl" />
                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                  <RiShieldCheckLine size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">MFA Compliance</p>
                  <h4 className="text-3xl font-black text-blue-900 tracking-tight">100%</h4>
                </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50 shadow-sm flex items-center gap-4 hover:border-green-300/80 cursor-pointer group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full blur-2xl" />
                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                  <RiCheckboxCircleLine size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active Admins</p>
                  <h4 className="text-3xl font-black text-green-900 tracking-tight">
                    {team.filter(m => m.status === 'Active').length}
                  </h4>
                </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 shadow-sm flex items-center gap-4 hover:border-purple-300/80 cursor-pointer group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl" />
                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                  <RiListSettingsLine size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Active Roles</p>
                  <h4 className="text-3xl font-black text-purple-900 tracking-tight">04</h4>
                </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50 shadow-sm flex items-center gap-4 hover:border-amber-300/80 cursor-pointer group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full blur-2xl" />
                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                  <RiTimeLine size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Audit Status</p>
                  <h4 className="text-3xl font-black text-amber-900 tracking-tight">Enabled</h4>
                </div>
            </motion.div>
          </motion.div>

          {/* Team Registry */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-[11px] font-black text-secondary uppercase tracking-widest mb-1">Administrative Personnel</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase">{filteredTeam.length} Total Members</p>
              </div>
              <motion.div className="relative w-full md:w-72" whileHover={{ scale: 1.02 }}>
                  <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search member name or email..." 
                    className="w-full pl-12 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-gray-400 uppercase shadow-sm hover:border-gray-200"
                  />
              </motion.div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-white text-[9px] uppercase text-gray-400 tracking-widest font-black border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Member Profile</th>
                    <th className="px-6 py-4 text-left">Primary Role</th>
                    <th className="px-6 py-4 text-center">Module Access</th>
                    <th className="px-6 py-4 text-left">Activity</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                  {filteredTeam.map((member, idx) => (
                    <motion.tr 
                      key={member.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-50 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-black text-[11px] shadow-sm group-hover:scale-110 transition-all ${
                            member.status === 'Active' ? 'bg-secondary group-hover:bg-primary' : 'bg-gray-300 group-hover:bg-gray-400'
                          }`}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-secondary text-xs uppercase tracking-tight">{member.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold tracking-tight">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          member.status === 'Active' 
                            ? 'bg-green-50 border-green-100 text-green-700' 
                            : 'bg-gray-100 border-gray-200 text-gray-600'
                        }`}>
                          {member.status === 'Active' ? member.role : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-black uppercase tracking-tight ${
                            member.status === 'Active' ? 'text-secondary' : 'text-gray-400'
                          }`}>
                            {member.status === 'Active' ? `${member.modules} / 8` : 'Disabled'}
                          </span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${member.status === 'Active' ? 'bg-primary' : 'bg-gray-300'}`} 
                                style={{ width: member.status === 'Active' ? `${(member.modules / 8) * 100}%` : '0%' }} 
                              />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{member.lastActive}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {member.status === 'Active' ? (
                          <button 
                            onClick={() => handleRevokeAccess(member)}
                            className="text-[10px] font-black text-red-600 hover:text-red-700 hover:underline uppercase tracking-widest transition-all flex items-center gap-1.5 ml-auto hover:bg-red-50/50 px-2 py-1 rounded"
                          >
                            <RiLockLine size={14} />
                            Revoke Access
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRestoreAccess(member)}
                            className="text-[10px] font-black text-green-600 hover:text-green-700 hover:underline uppercase tracking-widest transition-all flex items-center gap-1.5 ml-auto hover:bg-green-50/50 px-2 py-1 rounded"
                          >
                            <RiCheckboxCircleLine size={14} />
                            Restore Access
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {roles.map((role) => (
              <motion.div 
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-2xl border shadow-sm flex flex-col group hover:border-transparent transition-all overflow-hidden relative ${
                  role.type === 'System' 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50' 
                    : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50'
                }`}
              >
                 <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl" style={{
                   background: role.type === 'System' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #a855f7, #9333ea)'
                 }} />
                 <div className="relative z-10 flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                         role.type === 'System' 
                           ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                           : 'bg-gradient-to-br from-purple-500 to-purple-600'
                       }`}>
                          <RiShieldUserLine size={24} />
                       </div>
                       <div>
                          <h4 className={`text-sm font-black uppercase tracking-tight ${role.type === 'System' ? 'text-blue-900' : 'text-purple-900'}`}>{role.name}</h4>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase block mt-1 ${role.type === 'System' ? 'bg-blue-200/50 text-blue-700' : 'bg-purple-200/50 text-purple-700'}`}>{role.type} Role</span>
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 flex-1 space-y-3 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${role.type === 'System' ? 'bg-blue-100/50' : 'bg-purple-100/50'}`}
                    >
                       <span className={`text-[9px] font-black uppercase tracking-widest ${role.type === 'System' ? 'text-blue-600' : 'text-purple-600'}`}>Module Access</span>
                       <span className={`text-[10px] font-black uppercase ${role.type === 'System' ? 'text-blue-900' : 'text-purple-900'}`}>{role.modules} / 8</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${role.type === 'System' ? 'bg-blue-100/50' : 'bg-purple-100/50'}`}
                    >
                       <span className={`text-[9px] font-black uppercase tracking-widest ${role.type === 'System' ? 'text-blue-600' : 'text-purple-600'}`}>Active Members</span>
                       <span className={`text-[10px] font-black uppercase ${role.type === 'System' ? 'text-blue-900' : 'text-purple-900'}`}>{role.members} Assigned</span>
                    </motion.div>
                 </div>

                 <div className="relative z-10 flex items-center gap-2">
                    <motion.button 
                      onClick={() => handleEditRole(role)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border-2 ${
                        role.type === 'System' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                          : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                       <RiEditLine className="inline mr-1.5" size={14} />Edit Role
                    </motion.button>
                    {role.type !== 'System' && (
                       <motion.button 
                        onClick={() => confirmDeleteRole(role)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                       >
                          <RiDeleteBinLine size={18} />
                       </motion.button>
                    )}
                 </div>
              </motion.div>
           ))}
           <motion.button 
              onClick={handleCreateRole}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
              className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 hover:text-primary hover:border-primary transition-all group bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-sm"
           >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 90 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <RiAddLine size={36} className="mb-3 group-hover:scale-110 transition-all" />
              </motion.div>
              <span className="text-[10px] font-black uppercase tracking-widest">Define New Role</span>
           </motion.button>
        </div>
      )}

      {/* Role Designer Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={editingRole ? "Edit Role Definition" : "Role Designer"}
        subtitle={editingRole ? `Updating permissions for ${editingRole.name}.` : "Define a custom administrative role with pre-set module access."}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsRoleModalOpen(false)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={() => setIsRoleModalOpen(false)} className="px-8 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
               {editingRole ? "Update Role" : "Save Role Definition"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-2">
           <div className="space-y-4">
              <Input 
                label="Role Name" 
                placeholder="e.g. Regional Support Lead" 
                defaultValue={editingRole?.name}
                disabled={editingRole?.type === 'System'}
              />
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                 <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Configure Role Permissions</h4>
                 <span className="text-[9px] font-bold text-primary uppercase">Granular RBAC</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {modules.map((mod) => (
                    <div 
                      key={mod.id}
                      onClick={() => handleTogglePermission(mod.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        selectedPermissions[mod.id] 
                        ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' 
                        : 'bg-white border-gray-100 hover:border-primary/10'
                      }`}
                    >
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-all ${
                             selectedPermissions[mod.id] ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-white'
                          }`}>
                             {selectedPermissions[mod.id] ? <RiCheckboxCircleLine size={16} /> : <RiLockLine size={16} />}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-secondary uppercase tracking-tight">{mod.label}</p>
                             <p className="text-[8px] text-gray-400 font-bold uppercase">{mod.description}</p>
                          </div>
                       </div>
                       <div className={`w-8 h-4 rounded-full relative transition-all ${selectedPermissions[mod.id] ? 'bg-primary' : 'bg-gray-200'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedPermissions[mod.id] ? 'right-0.5' : 'left-0.5'}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        subtitle="This action cannot be undone."
        maxWidth="max-w-sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleDeleteRole} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-600 border-red-600 hover:bg-red-700 shadow-sm">Delete Role</Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
              <RiAlertLine size={32} />
           </div>
           <p className="text-sm font-bold text-secondary mb-2 uppercase tracking-tight">Delete {editingRole?.name}?</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight px-4 leading-relaxed">
              All members currently assigned to this role will lose their administrative permissions immediately.
           </p>
        </div>
      </Modal>

      {/* Revoke Access Confirmation Modal */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Access?"
        subtitle=""
        maxWidth="max-w-sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="secondary" 
              onClick={() => setIsRevokeModalOpen(false)} 
              className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmRevokeAccess} 
              className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-600 border-red-600 hover:bg-red-700 shadow-sm flex items-center gap-2"
            >
              <RiLockLine size={14} />
              Revoke Access
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-6">
           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
              <RiAlertLine size={32} />
           </div>
           {revokeTarget && (
             <>
               <p className="text-sm font-bold text-secondary mb-4 uppercase tracking-tight">
                 Revoke Access for {revokeTarget.name}?
               </p>
               <p className="text-[10px] text-gray-600 font-medium tracking-tight px-4 leading-relaxed">
                 Are you sure you want to revoke access for <span className="font-bold text-secondary">{revokeTarget.name}</span>? This user will no longer be able to access assigned modules.
               </p>
             </>
           )}
        </div>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Admin Invitation"
        subtitle="Send a secure invitation and assign a pre-defined role."
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={() => setIsInviteModalOpen(false)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">Send Invitation</Button>
          </div>
        }
      >
        <div className="space-y-6 py-1">
           <div className="space-y-4">
              <Input label="Full Name" placeholder="e.g. Sarah Connor" />
              <Input label="Work Email" type="email" placeholder="sarah@epic.com" />
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Role</label>
                 <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none focus:ring-1 focus:ring-primary/20 appearance-none">
                    {roles.map(role => (
                       <option key={role.id}>{role.name}</option>
                    ))}
                 </select>
              </div>
           </div>
           
           <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
              <RiShieldCheckLine className="text-primary shrink-0" size={20} />
              <p className="text-[9px] text-primary font-bold uppercase tracking-tight leading-relaxed">
                 The recipient will be granted access only to the modules defined in the selected role. Custom roles can be updated anytime in the Roles tab.
              </p>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminTeam;
