import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUser3Line,
  RiLockPasswordLine,
  RiShieldCheckLine,
  RiCamera2Line,
  RiShieldFlashLine,
  RiArrowRightSLine,
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
    { id: 'profile', name: 'Profile', icon: RiUser3Line },
    { id: 'security', name: 'Security', icon: RiShieldFlashLine },
    { id: '2fa', name: 'Authentication', icon: RiShieldCheckLine },
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
    <div className="max-w-5xl mx-auto space-y-5 pb-8 px-2">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-lg font-bold text-secondary uppercase tracking-tight">Account Management</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Manage your identity and security settings.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-2.5 py-1 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded-md">Global Admin</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-56 shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm p-1.5 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all group ${
                activeTab === tab.id
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                 <tab.icon size={16} className={activeTab === tab.id ? 'text-primary' : 'text-gray-300 transition-colors'} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{tab.name}</span>
              </div>
              {activeTab === tab.id && <RiArrowRightSLine size={14} />}
            </button>
          ))}
        </div>

        {/* Content Matrix */}
        <div className="flex-1 min-w-0 w-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {/* Section Title */}
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-primary shadow-sm">
                {tabs.find(t => t.id === activeTab).icon({ size: 18 })}
             </div>
             <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">
                {tabs.find(t => t.id === activeTab).name} Configuration
             </h3>
          </div>

          <div className="p-6 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
              >
                {activeTab === 'profile' && (
                  <div className="space-y-8 max-w-3xl">
                     <div className="flex items-center gap-6">
                        <div className="relative group">
                           <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl font-black text-secondary shadow-inner relative overflow-hidden group-hover:border-primary/20 transition-all">
                              SA
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center">
                                 <RiCamera2Line size={24} className="text-white" />
                              </div>
                           </div>
                        </div>
                        <div>
                           <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Avatar Identification</h4>
                           <p className="text-[9px] text-gray-400 font-bold uppercase">Standard 400x400 Recommended</p>
                           <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest mt-2 transition-all">Update Photo</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input label="First Name" defaultValue="Super" className="py-2.5 rounded-lg" />
                        <Input label="Last Name" defaultValue="Admin" className="py-2.5 rounded-lg" />
                        <div className="md:col-span-2">
                           <Input label="Email Address" defaultValue="superadmin@epic-crm.com" disabled className="py-2.5 rounded-lg bg-gray-50/50" />
                        </div>
                        <Input label="Phone Number" defaultValue="+44 20 7946 0000" className="py-2.5 rounded-lg" />
                     </div>

                     <div className="pt-6 border-t border-gray-50 flex justify-end">
                        <Button className="px-8 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">Save Profile</Button>
                     </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6 max-w-2xl">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password Update</h4>
                        <Input label="Current Password" type="password" placeholder="••••••••" className="py-2.5 rounded-lg" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Input label="New Password" type="password" placeholder="••••••••" className="py-2.5 rounded-lg" />
                           <Input label="Confirm Password" type="password" placeholder="••••••••" className="py-2.5 rounded-lg" />
                        </div>
                     </div>
                     <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex gap-3">
                        <RiShieldFlashLine className="text-primary shrink-0" size={18} />
                        <p className="text-[9px] text-primary font-bold uppercase leading-relaxed">
                           Updating your master password will reset all active sessions for security purposes.
                        </p>
                     </div>
                     <div className="pt-4 border-t border-gray-50 flex justify-end">
                        <Button className="px-8 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm bg-secondary text-white border-secondary">Update Password</Button>
                     </div>
                  </div>
                )}

                {activeTab === '2fa' && (
                  <div className="space-y-8 max-w-3xl">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-inner">
                           <RiShieldCheckLine size={32} />
                        </div>
                        <div className="flex-1 space-y-1">
                           <h4 className="text-[11px] font-bold text-secondary uppercase tracking-widest">Two-Factor Authentication</h4>
                           <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">
                              Secure your account using time-based one-time passwords (TOTP).
                           </p>
                           <div className="flex items-center gap-2 pt-1">
                              <span className={`px-2 py-0.5 ${twoFactorEnabled ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'} text-[8px] font-bold uppercase tracking-widest rounded border`}>
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="space-y-1">
                           <h5 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Authenticator App</h5>
                           <p className="text-[8px] text-gray-400 font-bold uppercase">Google Authenticator, Microsoft Authenticator, etc.</p>
                        </div>
                        <button 
                          onClick={handle2FAAction}
                          className={`px-6 py-2 ${twoFactorEnabled ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-primary border-primary/20 shadow-sm'} text-[9px] font-bold uppercase tracking-widest rounded-lg border transition-all hover:scale-[1.02]`}
                        >
                           {twoFactorEnabled ? 'Disable' : 'Setup'}
                        </button>
                     </div>

                     <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                        <p className="text-[8px] text-gray-400 font-bold uppercase leading-relaxed text-center">
                           Global administration mandates MFA for all system-level accounts. Please ensure backup codes are stored securely.
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
