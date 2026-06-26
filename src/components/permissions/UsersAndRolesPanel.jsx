import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiSearchLine, 
  RiFilter2Line, 
  RiUser3Line, 
  RiArrowRightSLine,
  RiShieldCheckLine,
  RiCloseLine,
  RiCheckLine,
} from 'react-icons/ri';
import Button from '../Button';
import Input from '../Input';
import Modal from '../common/Modal';
import { RoleBadge } from '../common/Badge';

const UsersAndRolesPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Mock users data
  const users = [
    { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@epic-crm.com', role: { name: 'Admin', permissionCount: 42 } },
    { id: 2, first_name: 'Sarah', last_name: 'Smith', email: 'sarah.s@epic-crm.com', role: { name: 'Caseworker', permissionCount: 28 } },
    { id: 3, first_name: 'Michael', last_name: 'Brown', email: 'm.brown@epic-crm.com', role: { name: 'Caseworker', permissionCount: 28 } },
    { id: 4, first_name: 'Emma', last_name: 'Wilson', email: 'emma.w@employer.co.uk', role: { name: 'Sponsor', permissionCount: 22 } },
    { id: 5, first_name: 'David', last_name: 'Miller', email: 'd.miller@epic-crm.com', role: { name: 'Candidate', permissionCount: 12 } },
  ];

  // Mock roles for modal
  const roles = [
    { id: 1, name: 'Admin', description: 'Full system access and global configuration' },
    { id: 2, name: 'Caseworker', description: 'Manage cases, candidates, and standard workflows' },
    { id: 3, name: 'Candidate', description: 'Limited access to candidate self-service tools' },
    { id: 4, name: 'Sponsor', description: 'Business portal access for compliance management' },
  ];

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleId(roles.find(r => r.name === user.role.name)?.id);
    setIsChangeRoleModalOpen(true);
  };

  const handleUpdateRole = () => {
    // Logic to update user role would go here
    setIsChangeRoleModalOpen(false);
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleDistribution = [
    { name: 'Admin', count: 8, color: 'bg-secondary' },
    { name: 'Caseworker', count: 15, color: 'bg-indigo-500' },
    { name: 'Candidate', count: 4, color: 'bg-teal-500' },
    { name: 'Sponsor', count: 21, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-10">
      {/* Role Distribution Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {roleDistribution.map(item => (
          <div key={item.name} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}s</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-secondary leading-none">{item.count}</p>
              <div className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Active</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h4 className="text-lg font-black text-secondary tracking-tight">Active User Registry</h4>
           <p className="text-xs text-gray-400 font-bold italic mt-1">Manage platform access and assign authority levels</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-semibold focus:border-secondary focus:ring-4 focus:ring-secondary/5 outline-none shadow-sm transition-all"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto rounded-2xl px-6 py-4 border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
             <RiFilter2Line size={18} className="mr-2" /> 
             <span className="text-xs font-black">Filter</span>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
        <div className="overflow-auto max-h-[68vh]">
          <table className="w-full min-w-0 border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Sr No</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">User Profile</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Governance</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Permissions</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">{index + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-secondary to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20 group-hover:scale-110 transition-all">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                           <p className="text-base font-black text-secondary tracking-tight leading-tight">{user.first_name} {user.last_name}</p>
                           <p className="text-xs text-gray-400 font-bold mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <RoleBadge role={user.role.name} />
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Verified Identity</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex flex-col">
                         <span className="text-sm font-black text-secondary leading-none">{user.role.permissionCount}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Active Grants</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="inline-flex items-center gap-3 px-8 py-3.5 text-xs font-black text-secondary hover:text-white bg-white hover:bg-secondary border border-gray-100 hover:border-secondary rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-secondary/20"
                      >
                        Adjust Authority <RiArrowRightSLine size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center text-gray-400">
             <RiUser3Line size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xs font-black text-gray-400 tracking-wider">No matching users discovered</p>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        title=""
        maxWidth="max-w-md"
        footer={null}
      >
        <div className="p-2">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary border border-secondary/10">
                   <RiShieldCheckLine size={24} />
                </div>
                 <div>
                    <h3 className="text-sm font-black text-secondary tracking-tight">Modify User Role</h3>
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wide">Updating: {selectedUser?.first_name} {selectedUser?.last_name}</p>
                 </div>
             </div>
             <button onClick={() => setIsChangeRoleModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <RiCloseLine size={20} className="text-gray-400" />
             </button>
          </div>

          <div className="space-y-3 mb-8">
             <p className="text-[10px] font-black text-gray-400 ml-1 mb-4">Select new authority level</p>
            {roles.map(role => (
              <label 
                key={role.id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${
                  selectedRoleId === role.id
                    ? 'border-secondary bg-secondary/5 shadow-sm'
                    : 'border-gray-100 hover:border-secondary/20 hover:bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedRoleId === role.id ? 'border-secondary' : 'border-gray-200'
                }`}>
                   {selectedRoleId === role.id && <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-sm" />}
                </div>
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={selectedRoleId === role.id}
                  onChange={() => setSelectedRoleId(role.id)}
                  className="hidden"
                />
                 <div className="flex-1">
                  <p className={`text-[11px] font-black tracking-tight ${selectedRoleId === role.id ? 'text-secondary' : 'text-gray-500'}`}>{role.name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 leading-tight">{role.description}</p>
                </div>
                {selectedRoleId === role.id && <RiCheckLine className="text-secondary" size={18} />}
              </label>
            ))}
          </div>

           <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-3.5 text-[11px] font-black" onClick={() => setIsChangeRoleModalOpen(false)}>Discard</Button>
            <Button variant="primary" className="flex-1 py-3.5 text-[11px] font-black shadow-lg shadow-secondary/20" onClick={handleUpdateRole}>Assign Role</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersAndRolesPanel;
