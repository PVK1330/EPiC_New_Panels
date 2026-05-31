import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as teamService from '../../services/superadminTeam.service';
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
import {
  PLATFORM_MODULES_FALLBACK,
  PLATFORM_MODULE_COUNT,
  formatPlatformRoleName,
} from '../../constants/platformModules';
import { formatDateTime } from '../../utils/datetime';

const MODULE_COUNT = PLATFORM_MODULE_COUNT;

const SuperadminTeam = () => {
 const [activeTab, setActiveTab] = useState('Members');
 const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
 const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
 const [editingRole, setEditingRole] = useState(null);
 const [selectedPermissions, setSelectedPermissions] = useState({});
 const [revokeTarget, setRevokeTarget] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [modules, setModules] = useState([]);
 const [roleFormName, setRoleFormName] = useState('');
 const [inviteForm, setInviteForm] = useState({
   first_name: '',
   last_name: '',
   email: '',
   role_id: '',
 });

 const [team, setTeam] = useState([]);
 const [roles, setRoles] = useState([]);
 const [stats, setStats] = useState({ total: 0, active: 0, mfa_enabled: 0 });
 const [loadError, setLoadError] = useState(null);

 const loadData = useCallback(async () => {
   try {
     setLoading(true);
     setLoadError(null);
     const [teamRes, rolesRes, modRes] = await Promise.all([
       teamService.fetchTeamMembers(),
       teamService.fetchPlatformRoles(),
       teamService.fetchPlatformModules(),
     ]);
     const teamPayload = teamRes.data?.data ?? teamRes.data;
     const rolesPayload = rolesRes.data?.data ?? rolesRes.data;
     setTeam(teamPayload?.members ?? []);
     setStats(teamPayload?.stats ?? { total: 0, active: 0, mfa_enabled: 0 });
     setRoles(rolesPayload?.roles ?? []);
     const modPayload = modRes.data?.data ?? modRes.data;
     const loadedModules = modPayload?.modules ?? [];
     setModules(loadedModules.length ? loadedModules : PLATFORM_MODULES_FALLBACK);
   } catch (e) {
     const msg = e?.response?.data?.message || e.message || 'Failed to load team';
     setLoadError(msg);
     setModules(PLATFORM_MODULES_FALLBACK);
     toast.error(msg);
   } finally {
     setLoading(false);
   }
 }, []);

 useEffect(() => {
   loadData();
 }, [loadData]);

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

 const confirmRevokeAccess = async () => {
   if (!revokeTarget) return;
   try {
     setSaving(true);
     await teamService.updateTeamMember(revokeTarget.id, { status: 'inactive' });
     toast.success('Access revoked');
     setIsRevokeModalOpen(false);
     setRevokeTarget(null);
     await loadData();
   } catch (e) {
     toast.error(e?.response?.data?.message || e.message || 'Failed to revoke access');
   } finally {
     setSaving(false);
   }
 };

 const handleRestoreAccess = async (member) => {
   try {
     setSaving(true);
     await teamService.updateTeamMember(member.id, { status: 'active' });
     toast.success('Access restored');
     await loadData();
   } catch (e) {
     toast.error(e?.response?.data?.message || e.message || 'Failed to restore access');
   } finally {
     setSaving(false);
   }
 };

 const handleEditRole = (role) => {
   setEditingRole(role);
   const perms = {};
   (role.perms || role.moduleIds || []).forEach((p) => { perms[p] = true; });
   setSelectedPermissions(perms);
   setRoleFormName(role.name?.replace(/^platform_/, '').replace(/_/g, ' ') || role.name);
   setIsRoleModalOpen(true);
 };

 const handleCreateRole = () => {
   setEditingRole(null);
   setSelectedPermissions({});
   setRoleFormName('');
   setIsRoleModalOpen(true);
 };

 const confirmDeleteRole = (role) => {
   setEditingRole(role);
   setIsDeleteModalOpen(true);
 };

 const handleDeleteRole = async () => {
   if (!editingRole) return;
   try {
     setSaving(true);
     await teamService.deletePlatformRole(editingRole.id);
     toast.success('Role deleted');
     setIsDeleteModalOpen(false);
     setEditingRole(null);
     await loadData();
   } catch (e) {
     toast.error(e?.response?.data?.message || e.message || 'Failed to delete role');
   } finally {
     setSaving(false);
   }
 };

 const handleSaveRole = async () => {
   const moduleIds = Object.keys(selectedPermissions).filter((k) => selectedPermissions[k]);
   try {
     setSaving(true);
     if (editingRole) {
       await teamService.updatePlatformRole(editingRole.id, { moduleIds });
       toast.success('Role updated');
     } else {
       if (!roleFormName.trim()) {
         toast.error('Role name is required');
         return;
       }
       await teamService.createPlatformRole({
         name: roleFormName.trim(),
         moduleIds,
       });
       toast.success('Role created');
     }
     setIsRoleModalOpen(false);
     setEditingRole(null);
     await loadData();
   } catch (e) {
     toast.error(e?.response?.data?.message || e.message || 'Failed to save role');
   } finally {
     setSaving(false);
   }
 };

 const handleInviteSubmit = async () => {
   if (!inviteForm.email?.trim() || !inviteForm.first_name?.trim() || !inviteForm.last_name?.trim() || !inviteForm.role_id) {
     toast.error('Please fill in all required fields');
     return;
   }
   try {
     setSaving(true);
     const res = await teamService.inviteTeamMember({
       email: inviteForm.email.trim(),
       first_name: inviteForm.first_name.trim(),
       last_name: inviteForm.last_name.trim(),
       role_id: Number(inviteForm.role_id),
     });
     const data = res.data?.data ?? res.data;
     const welcome = data?.welcome_email;
     const tempPw = data?.temporary_password;
     if (welcome?.sent) {
       toast.success('Invitation sent with login details');
     } else if (tempPw) {
       toast.success(`Member created. Temporary password: ${tempPw}`, { duration: 14000 });
     } else {
       toast.success('Team member created');
     }
     setIsInviteModalOpen(false);
     setInviteForm({ first_name: '', last_name: '', email: '', role_id: '' });
     await loadData();
   } catch (e) {
     toast.error(e?.response?.data?.message || e.message || 'Failed to invite member');
   } finally {
     setSaving(false);
   }
 };

 const filteredTeam = team.filter(member => 
 member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 member.email.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
    <div className="space-y-4 pb-4">
 {/* Modern Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
 <div>
        <h1 className="text-xl font-black text-secondary tracking-tight">Administrative Team</h1>
        <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Manage internal accounts and access levels</p>
 </div>
 <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCreateRole} className="text-xs font-black uppercase tracking-widest px-4 py-2">
            <RiShieldUserLine size={16} className="inline mr-1"/> Create Role
          </Button>
          <Button variant="primary" onClick={() => setIsInviteModalOpen(true)} className="text-xs font-black uppercase tracking-widest px-4 py-2 shadow-lg shadow-primary/20">
            <RiAddLine size={16} className="inline mr-1"/> Invite
          </Button>
 </div>
 </div>

 {loadError && (
   <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
     <span>{loadError} — ensure EPIC_API is running, then retry.</span>
     <Button variant="outline" onClick={loadData} className="text-xs font-bold uppercase tracking-widest">
       Retry
     </Button>
   </div>
 )}

 {/* Tabs with Modern Styling */}
      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 w-fit shadow-sm">
        {['Members', 'Roles'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-secondary text-white shadow-md'
                : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

 {activeTab === 'Members' ? (
 <>
 {/* Team Security Metrics with Gradients */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <RiShieldCheckLine size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MFA Compliance</p>
              <h4 className="text-2xl font-black text-secondary tracking-tight">
                {stats.total ? Math.round((stats.mfa_enabled / stats.total) * 100) : 0}%
              </h4>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <RiCheckboxCircleLine size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Admins</p>
              <h4 className="text-2xl font-black text-secondary tracking-tight">{stats.active}</h4>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <RiListSettingsLine size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Roles</p>
              <h4 className="text-2xl font-black text-secondary tracking-tight">{String(roles.length).padStart(2, '0')}</h4>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
              <RiTimeLine size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Status</p>
              <h4 className="text-2xl font-black text-secondary tracking-tight uppercase">Live</h4>
            </div>
          </motion.div>
 </motion.div>

 {/* Team Registry */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Team Registry</h3>
            <span className="px-2 py-0.5 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm">{filteredTeam.length} Active Members</span>
          </div>
          <div className="relative w-full md:w-64">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team..."
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-bold text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black border-b border-gray-100 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">Member Profile</th>
                <th className="px-4 py-3 text-left">Primary Role</th>
                <th className="px-4 py-3 text-center">Access Level</th>
                <th className="px-4 py-3 text-left">Activity</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
 <tbody className="divide-y divide-gray-100">
 {loading ? (
   <tr>
     <td colSpan={5} className="px-4 py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
       Loading team…
     </td>
   </tr>
 ) : filteredTeam.length === 0 ? (
   <tr>
     <td colSpan={5} className="px-4 py-12 text-center">
       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">No platform staff yet</p>
       <Button onClick={() => setIsInviteModalOpen(true)} className="text-[10px] font-bold uppercase tracking-widest">
         <RiAddLine size={16} /> Invite your first team member
       </Button>
     </td>
   </tr>
 ) : (
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
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-3">
 <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-semibold text-base shadow-sm group-hover:scale-110 transition-all ${
 member.status === 'Active' ? 'bg-secondary group-hover:bg-primary' : 'bg-gray-300 group-hover:bg-gray-400'
 }`}>
 {member.name.split(' ').map(n => n[0]).join('')}
 </div>
 <div>
 <p className="font-bold text-secondary text-xs flex items-center gap-2">
 {member.name}
 {member.mfa && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-xs font-semibold">2FA On</span>}
 </p>
 <p className="text-sm text-gray-400 font-bold">{member.email}</p>
 </div>
 </div>
 </td>
 <td className="px-4 py-2.5">
 <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold border ${
 member.status === 'Active' 
 ? 'bg-green-50 border-green-100 text-green-700' 
 : 'bg-gray-100 border-gray-200 text-gray-600'
 }`}>
 {member.status === 'Active'
   ? formatPlatformRoleName(member.role, member.role_id)
   : 'INACTIVE'}
 </span>
 </td>
 <td className="px-4 py-2.5 text-center">
 <div className="flex flex-col items-center">
 <span className={`text-sm font-semibold ${
 member.status === 'Active' ? 'text-secondary' : 'text-gray-400'
 }`}>
 {member.status === 'Active' ? `${member.modules} / ${MODULE_COUNT}` : 'Disabled'}
 </span>
 <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
 <div 
 className={`h-full transition-all ${member.status === 'Active' ? 'bg-primary' : 'bg-gray-300'}`} 
 style={{ width: member.status === 'Active' ? `${(member.modules / MODULE_COUNT) * 100}%` : '0%' }} 
 />
 </div>
 </div>
 </td>
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full animate-pulse ${
 member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
 }`} />
 <span className="text-sm font-bold text-gray-400">
   {member.lastActive ? formatDateTime(member.lastActive) : '—'}
 </span>
 </div>
 </td>
 <td className="px-4 py-2.5 text-right">
 {member.status === 'Active' ? (
 <button 
 onClick={() => handleRevokeAccess(member)}
 className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-all flex items-center gap-1.5 ml-auto hover:bg-red-50/50 px-2 py-1 rounded"
 >
 <RiLockLine size={14} />
 Revoke Access
 </button>
 ) : (
 <button 
 onClick={() => handleRestoreAccess(member)}
 className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-all flex items-center gap-1.5 ml-auto hover:bg-green-50/50 px-2 py-1 rounded"
 >
 <RiCheckboxCircleLine size={14} />
 Restore Access
 </button>
 )}
 </td>
 </motion.tr>
 ))}
 </AnimatePresence>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {roles.map((role) => (
 <div 
 key={role.id}
 className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col group relative"
 >
 <div className="relative z-10 flex items-center justify-between mb-5">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary border border-gray-100">
 <RiShieldUserLine size={20} />
 </div>
 <div>
 <h4 className="text-sm font-semibold text-secondary">
   {role.display_name || formatPlatformRoleName(role.name, role.id)}
 </h4>
 <span className={`text-xs font-bold px-2 py-0.5 rounded-full block mt-1 border ${role.type === 'System' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-secondary/5 text-secondary border-secondary/10'}`}>{role.type} Role</span>
 </div>
 </div>
 </div>

 <div className="relative z-10 flex-1 space-y-3 mb-6">
 <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-50">
 <span className="text-sm font-semibold text-gray-500">Module Access</span>
 <span className="text-sm font-semibold text-secondary">{role.modules} / 8</span>
 </div>
 <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-50">
 <span className="text-sm font-semibold text-gray-500">Active Members</span>
 <span className="text-sm font-semibold text-secondary">{role.members} Assigned</span>
 </div>
 </div>

 <div className="relative z-10 flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
 <Button 
 variant="outline"
 onClick={() => handleEditRole(role)}
 className="flex-1 text-sm font-bold"
 >
 <RiEditLine className="inline mr-1"size={14} />Edit
 </Button>
 {role.type !== 'System' && (
 <Button 
 variant="ghost"
 onClick={() => confirmDeleteRole(role)}
 className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
 >
 <RiDeleteBinLine size={16} />
 </Button>
 )}
 </div>
 </div>
 ))}
 <button 
 onClick={handleCreateRole}
 className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm bg-white"
 >
 <RiAddLine size={32} className="mb-2 text-gray-300 group-hover:text-primary transition-colors"/>
 <span className="text-sm font-semibold">Create New Role</span>
 </button>
 </div>
 )}

 {/* Role Designer Modal */}
 <Modal
 isOpen={isRoleModalOpen}
 onClose={() => setIsRoleModalOpen(false)}
 title={editingRole ?"Edit Role Definition":"Role Designer"}
 subtitle={editingRole ? `Updating permissions for ${editingRole.name}.` :"Define a custom administrative role with pre-set module access."}
 maxWidth="max-w-2xl"
 footer={
 <div className="flex justify-end gap-2 w-full">
 <Button variant="secondary"onClick={() => setIsRoleModalOpen(false)} className="px-6 py-2 text-sm font-bold">Cancel</Button>
 <Button disabled={saving} onClick={handleSaveRole} className="px-8 py-2 text-sm font-bold shadow-sm">
 {saving ? 'Saving…' : editingRole ? 'Update Role' : 'Save Role Definition'}
 </Button>
 </div>
 }
 >
 <div className="space-y-6 py-2">
 <div className="space-y-4">
 <Input 
 label="Role Name"
 placeholder="e.g. Regional Support Lead"
 value={roleFormName}
 onChange={(e) => setRoleFormName(e.target.value)}
 disabled={editingRole?.type === 'System'}
 />
 <div className="flex items-center justify-between border-b border-gray-100 pb-2">
 <h4 className="text-sm font-semibold text-secondary">Configure Role Permissions</h4>
 <span className="text-sm font-bold text-primary">Granular RBAC</span>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {modules.map((mod) => (
 <div 
 key={mod.id}
 onClick={() => handleTogglePermission(mod.id)}
 className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
 selectedPermissions[mod.id] 
 ? 'bg-primary/5 border-primary text-primary' 
 : 'bg-white border-gray-200 hover:bg-gray-50'
 }`}
 >
 <div>
 <p className={`text-sm font-semibold ${selectedPermissions[mod.id] ? 'text-primary' : 'text-secondary'}`}>{mod.label}</p>
 <p className={`text-xs font-bold mt-0.5 ${selectedPermissions[mod.id] ? 'text-primary/70' : 'text-gray-400'}`}>{mod.description}</p>
 </div>
 <div className="flex items-center justify-center">
 {selectedPermissions[mod.id] ? (
 <RiCheckboxCircleLine size={18} className="text-primary"/>
 ) : (
 <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300"/>
 )}
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
 <Button variant="secondary"onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 text-sm font-bold">Cancel</Button>
 <Button onClick={handleDeleteRole} className="px-6 py-2 text-sm font-bold bg-red-600 border-red-600 hover:bg-red-700 shadow-sm">Delete Role</Button>
 </div>
 }
 >
 <div className="flex flex-col items-center text-center py-4">
 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
 <RiAlertLine size={32} />
 </div>
 <p className="text-sm font-bold text-secondary mb-2">Delete {editingRole?.name}?</p>
 <p className="text-sm text-gray-400 font-bold px-4 leading-relaxed">
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
 className="px-6 py-2 text-sm font-bold"
 >
 Cancel
 </Button>
 <Button
 disabled={saving}
 onClick={confirmRevokeAccess}
 className="px-6 py-2 text-sm font-bold bg-red-600 border-red-600 hover:bg-red-700 shadow-sm flex items-center gap-2"
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
 <p className="text-sm font-bold text-secondary mb-4">
 Revoke Access for {revokeTarget.name}?
 </p>
 <p className="text-sm text-gray-600 font-medium px-4 leading-relaxed">
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
 <Button variant="secondary"onClick={() => setIsInviteModalOpen(false)} className="px-5 py-2 text-sm font-bold">Cancel</Button>
 <Button disabled={saving} onClick={handleInviteSubmit} className="px-6 py-2 text-sm font-bold shadow-sm">
   {saving ? 'Sending…' : 'Send Invitation'}
 </Button>
 </div>
 }
 >
 <div className="space-y-6 py-1">
 <div className="space-y-4">
 <motion.div className="grid grid-cols-2 gap-3">
   <Input label="First name" value={inviteForm.first_name} onChange={(e) => setInviteForm((p) => ({ ...p, first_name: e.target.value }))} />
   <Input label="Last name" value={inviteForm.last_name} onChange={(e) => setInviteForm((p) => ({ ...p, last_name: e.target.value }))} />
 </motion.div>
 <Input label="Work Email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} placeholder="sarah@epic.com" />
 <div className="space-y-1">
 <label className="text-sm font-bold text-gray-400 ml-1">Assign Role</label>
 <select value={inviteForm.role_id} onChange={(e) => setInviteForm((p) => ({ ...p, role_id: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none focus:ring-1 focus:ring-primary/20 appearance-none">
 <option value="">Select role</option>
 {roles.map((role) => (
 <option key={role.id} value={role.id}>{role.display_name || formatPlatformRoleName(role.name, role.id)}</option>
 ))}
 </select>
 </div>
 </div>
 
 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
 <RiShieldCheckLine className="text-primary shrink-0"size={20} />
 <p className="text-sm text-primary font-bold leading-relaxed">
 The recipient will be granted access only to the modules defined in the selected role. Custom roles can be updated anytime in the Roles tab.
 </p>
 </div>
 </div>
 </Modal>
 </div>
 );
};

export default SuperadminTeam;
