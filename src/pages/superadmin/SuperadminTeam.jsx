import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiShieldUserLine,
  RiAddLine,
  RiMailLine,
  RiMore2Line,
  RiKey2Line,
  RiCheckboxCircleLine,
  RiUserSettingsLine,
  RiShieldCheckLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/Input';

const SuperadminTeam = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [team, setTeam] = useState([
    { id: 1, name: 'Super Admin', email: 'super@epic-crm.com', role: 'Owner', status: 'Active', joined: '2024-01-10' },
    { id: 2, name: 'System Manager', email: 'manager@epic-crm.com', role: 'Administrator', status: 'Active', joined: '2024-02-15' },
    { id: 3, name: 'Billing Auditor', email: 'audit@epic-crm.com', role: 'Billing Admin', status: 'Pending', joined: '2026-05-01' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Platform Team</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage internal administrative access and team roles.</p>
        </div>
        <Button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2"
        >
          <RiAddLine size={18} /> Invite Member
        </Button>
      </div>

      {/* Team List Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Member</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-center">2FA Status</th>
                <th className="px-6 py-4 text-left">Joined Date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-secondary leading-none">{member.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 font-bold uppercase tracking-tight text-[10px]">
                      <RiUserSettingsLine size={16} className="text-gray-400" />
                      <span>{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {member.role === 'Owner' || member.id === 2 ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-black text-[9px] uppercase tracking-widest">
                         <RiShieldCheckLine size={12} /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase tracking-widest">
                         <RiErrorWarningLine size={12} /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-[10px] font-black uppercase tracking-tight">{member.joined}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      member.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <RiMore2Line size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles & Permissions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
              <RiKey2Line size={20} />
            </div>
            <h3 className="font-bold text-slate-900 tracking-tight">Security Protocol</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <RiCheckboxCircleLine className="text-green-500 mt-0.5" size={18} />
              <p className="text-xs text-slate-600 font-medium leading-relaxed uppercase tracking-tight">
                Mandatory 2FA enabled for all platform administrators.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <RiCheckboxCircleLine className="text-green-500 mt-0.5" size={18} />
              <p className="text-xs text-slate-600 font-medium leading-relaxed uppercase tracking-tight">
                Session timeout restricted to 60 minutes of inactivity.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
           <h4 className="text-center text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Team Statistics</h4>
           <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <p className="text-2xl font-black text-primary">05</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Total Slots</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <p className="text-2xl font-black text-secondary">03</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Active Now</p>
              </div>
           </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        subtitle="Grant administrative access to a new member."
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsInviteModalOpen(false)}>Send Invitation</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Michael Scott" />
          <Input label="Email Address" type="email" placeholder="member@epic-crm.com" />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Assigned Role</label>
            <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none">
               <option>Administrator</option>
               <option>Billing Admin</option>
               <option>Support Manager</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminTeam;
