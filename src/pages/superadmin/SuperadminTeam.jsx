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
  { id: 'organizations', label: 'Organizations', description: 'Tenant and user management' },
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
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const team = [
    { id: 1, name: 'Alex Thompson', role: 'Super Admin', modules: 8, email: 'alex@epic.com', status: 'Active', lastActive: '2 mins ago', mfa: true },
    { id: 2, name: 'Sarah Chen', role: 'Security Admin', modules: 3, email: 'sarah@epic.com', status: 'Active', lastActive: '1 hour ago', mfa: true },
    { id: 3, name: 'James Wilson', role: 'Billing Admin', modules: 2, email: 'james@epic.com', status: 'Inactive', lastActive: '2 days ago', mfa: false },
  ];

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

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-secondary uppercase tracking-tight mb-1">Administrative Team</h1>
           <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Manage internal accounts and define custom role-based access levels.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
              variant="secondary"
              onClick={handleCreateRole}
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest bg-white border-gray-100 shadow-sm"
           >
              Create Role
           </Button>
           <Button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02]"
           >
              <RiAddLine size={18} /> Invite Member
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-100 w-fit">
         {['Members', 'Roles'].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-secondary'
               }`}
            >
               {tab}
            </button>
         ))}
      </div>

      {activeTab === 'Members' ? (
        <>
          {/* Team Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/10">
                  <RiShieldCheckLine size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">MFA Compliance</p>
                  <h4 className="text-lg font-black text-secondary tracking-tight">100%</h4>
                </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/10">
                  <RiNotificationBadgeLine size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Admins</p>
                  <h4 className="text-lg font-black text-secondary tracking-tight">02</h4>
                </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/10">
                  <RiListSettingsLine size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Roles</p>
                  <h4 className="text-lg font-black text-secondary tracking-tight">04</h4>
                </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary border border-primary/10">
                  <RiTimeLine size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Audit Status</p>
                  <h4 className="text-lg font-black text-secondary tracking-tight">Enabled</h4>
                </div>
            </div>
          </div>

          {/* Team Registry */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest">Administrative Personnel</h3>
              <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search team..." 
                    className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 w-full md:w-56 uppercase"
                  />
              </div>
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
                <tbody className="divide-y divide-gray-50/50">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-secondary text-white flex items-center justify-center font-black text-[11px] shadow-sm group-hover:bg-primary transition-all">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-secondary text-xs uppercase tracking-tight">{member.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold tracking-tight">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 text-secondary">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black text-secondary uppercase tracking-tight">{member.modules} / 8</span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(member.modules / 8) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{member.lastActive}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest transition-all">Revoke Access</button>
                      </td>
                    </tr>
                  ))}
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
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col group hover:border-primary/20 transition-all"
              >
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                          <RiShieldUserLine size={24} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-secondary uppercase tracking-tight">{role.name}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${role.type === 'System' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{role.type} Role</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 space-y-4 mb-6">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Module Access</span>
                       <span className="text-[10px] font-black text-secondary uppercase">{role.modules} / 8 Modules</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Members</span>
                       <span className="text-[10px] font-black text-secondary uppercase">{role.members} Assigned</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditRole(role)}
                      className="flex-1 py-2 bg-gray-50 text-secondary text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-all border border-gray-100"
                    >
                       Edit Role
                    </button>
                    {role.type !== 'System' && (
                       <button 
                        onClick={() => confirmDeleteRole(role)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all border border-red-100"
                       >
                          <RiDeleteBinLine size={16} />
                       </button>
                    )}
                 </div>
              </motion.div>
           ))}
           <motion.button 
              onClick={handleCreateRole}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-primary hover:text-primary transition-all group bg-gray-50/20"
           >
              <RiAddLine size={32} className="mb-2 group-hover:scale-110 transition-all" />
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
