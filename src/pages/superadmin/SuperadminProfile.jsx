import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUser3Line,
  RiLockPasswordLine,
  RiShieldCheckLine,
  RiCamera2Line,
  RiShieldFlashLine,
  RiArrowRightSLine,
  RiMailLine,
  RiPhoneLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';
import TwoFactorSetup from '../../components/TwoFactorSetup';
import TwoFactorDisable from '../../components/TwoFactorDisable';

const SuperadminProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState('setup');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Identity', icon: RiUser3Line, desc: 'Personal Information' },
    { id: 'security', name: 'Security', icon: RiShieldKeyholeLine, desc: 'Password & Access' },
    { id: '2fa', name: 'Auth', icon: RiShieldCheckLine, desc: 'Two-Factor Auth' },
  ];

  const handle2FAAction = () => {
    setTwoFactorMode(twoFactorEnabled ? 'disable' : 'setup');
    setIsTwoFactorModalOpen(true);
  };

  const on2FAComplete = () => {
    setTwoFactorEnabled(twoFactorMode === 'setup');
    setIsTwoFactorModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">Account Center</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Administrative Identity & Security</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">Global Administrator</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Modern Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group border ${
                activeTab === tab.id
                  ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/10'
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                 <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-gray-300 group-hover:text-secondary transition-colors'} />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest">{tab.name}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-tighter ${activeTab === tab.id ? 'text-white/60' : 'text-gray-400'}`}>{tab.desc}</p>
                 </div>
              </div>
              {activeTab === tab.id && <RiArrowRightSLine size={16} />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
          {/* Header Strip */}
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-primary shadow-sm">
                {React.createElement(tabs.find(t => t.id === activeTab).icon, { size: 20 })}
             </div>
             <div>
                <h3 className="text-sm font-black text-secondary uppercase tracking-tight">
                   {tabs.find(t => t.id === activeTab).name} Management
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update your platform credentials</p>
             </div>
          </div>

          <div className="p-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && (
                  <div className="space-y-10 max-w-3xl">
                     <div className="flex items-center gap-8">
                        <div className="relative group">
                           <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl font-black text-secondary shadow-inner relative overflow-hidden group-hover:border-primary/20 transition-all">
                              SA
                              <div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex flex-col items-center justify-center">
                                 <RiCamera2Line size={24} className="text-white mb-1" />
                                 <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                              </div>
                           </div>
                           <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-primary shadow-md">
                              <RiUser3Line size={16} />
                           </div>
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest mb-1.5">Avatar Identity</h4>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-4">Recommended: 512x512px, PNG or JPG</p>
                           <Button variant="outline" className="px-5 py-1.5 text-[9px] font-black uppercase tracking-widest border-gray-200">Upload New</Button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First Name" defaultValue="Super" icon={<RiUser3Line />} />
                        <Input label="Last Name" defaultValue="Admin" />
                        <div className="md:col-span-2">
                           <Input label="Email Address" defaultValue="superadmin@epic-crm.com" disabled icon={<RiMailLine />} className="bg-gray-50/50" />
                           <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 ml-1">Contact your system provider to change the primary administrator email.</p>
                        </div>
                        <Input label="Phone Number" defaultValue="+44 20 7946 0000" icon={<RiPhoneLine />} />
                     </div>

                     <div className="pt-8 border-t border-gray-50 flex justify-end gap-3">
                        <Button variant="outline" className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest">Reset</Button>
                        <Button className="px-10 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Save Profile</Button>
                     </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8 max-w-2xl">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                           <RiLockPasswordLine className="text-primary" size={18} />
                           <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">Credential Update</h4>
                        </div>
                        <Input label="Current Password" type="password" placeholder="••••••••" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Input label="New Password" type="password" placeholder="••••••••" />
                           <Input label="Confirm Password" type="password" placeholder="••••••••" />
                        </div>
                     </div>
                     <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-4">
                        <RiShieldFlashLine className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                           <p className="text-[10px] text-amber-700 font-black uppercase tracking-tight mb-1">Security Protocol</p>
                           <p className="text-[9px] text-amber-600/80 font-bold uppercase leading-relaxed">
                              Changing your password will terminate all other active administrative sessions across devices for maximum security.
                           </p>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-gray-50 flex justify-end">
                        <Button className="px-10 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/10 bg-secondary text-white border-secondary">Update Security</Button>
                     </div>
                  </div>
                )}

                {activeTab === '2fa' && (
                  <div className="space-y-10 max-w-3xl">
                     <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                           <RiShieldCheckLine size={32} />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-[12px] font-black text-secondary uppercase tracking-widest mb-1">Two-Factor Authentication</h4>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-relaxed">
                              Add an extra layer of security to your administrative account using time-based OTPs.
                           </p>
                           <div className="mt-3 flex items-center">
                              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                 twoFactorEnabled 
                                   ? 'bg-green-50 text-green-600 border-green-100' 
                                   : 'bg-gray-100 text-gray-400 border-gray-200'
                              }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${twoFactorEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                 {twoFactorEnabled ? 'Protection Active' : 'Protection Inactive'}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                              <RiShieldKeyholeLine size={24} />
                           </div>
                           <div className="space-y-1">
                              <h5 className="text-[11px] font-black text-secondary uppercase tracking-widest">Authenticator App</h5>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Configure Google or Microsoft Authenticator</p>
                           </div>
                        </div>
                        <button 
                          onClick={handle2FAAction}
                          className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                             twoFactorEnabled 
                               ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                               : 'bg-secondary text-white border-secondary hover:shadow-lg shadow-secondary/20'
                          }`}
                        >
                           {twoFactorEnabled ? 'Disable 2FA' : 'Activate 2FA'}
                        </button>
                     </div>

                     <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed text-center tracking-widest">
                           MFA IS MANDATORY FOR GLOBAL ADMINISTRATORS TO ENSURE COMPLIANCE WITH DATA PROTECTION STANDARDS.
                        </p>
                     </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Standard Modal Architecture */}
      <Modal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        title=""
        maxWidth="max-w-md"
        footer={null}
      >
        <div className="p-0">
          {twoFactorMode === 'setup' ? (
            <TwoFactorSetup 
              onSetupComplete={on2FAComplete} 
              onCancel={() => setIsTwoFactorModalOpen(false)} 
            />
          ) : (
            <TwoFactorDisable 
              onDisableComplete={on2FAComplete} 
              onCancel={() => setIsTwoFactorModalOpen(false)} 
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminProfile;
