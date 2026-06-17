import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  RiUser3Line,
  RiShieldCheckLine,
  RiArrowRightSLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri';
import useSuperadminProfile from '../../hooks/useSuperadminProfile';
import ProfileTab from './profile/ProfileTab';
import SecurityTab from './profile/SecurityTab';
import TwoFactorTab from './profile/TwoFactorTab';

const tabs = [
  { id: 'profile', name: 'My Profile', icon: RiUser3Line, desc: 'Name & Contact Details' },
  { id: 'security', name: 'Password', icon: RiShieldKeyholeLine, desc: 'Change Access Password' },
  { id: '2fa', name: 'Security (2FA)', icon: RiShieldCheckLine, desc: 'Secure Your Account' },
];

const SuperadminProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const {
    profile,
    loading,
    saving,
    uploadingAvatar,
    changingPassword,
    twoFactorLoading,
    error,
    fetchProfile,
    saveProfile,
    uploadAvatar,
    changePassword,
    initiate2FASetup,
    confirm2FASetup,
    disable2FA,
  } = useSuperadminProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">Account Center</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Administrative Identity & Security</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">Global Administrator</span>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 font-black uppercase tracking-widest">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
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

        <div className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[550px]">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-primary shadow-sm">
              {ActiveIcon && <ActiveIcon size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-black text-secondary uppercase tracking-tight">
                {tabs.find((t) => t.id === activeTab)?.name} Management
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update your platform credentials</p>
            </div>
          </div>

          <div className="p-8 flex-1">
            {loading && !profile ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'profile' && (
                    <ProfileTab
                      profile={profile}
                      saving={saving}
                      uploadingAvatar={uploadingAvatar}
                      onSave={saveProfile}
                      onAvatarUpload={uploadAvatar}
                    />
                  )}
                  {activeTab === 'security' && (
                    <SecurityTab
                      changingPassword={changingPassword}
                      onChangePassword={changePassword}
                    />
                  )}
                  {activeTab === '2fa' && (
                    <TwoFactorTab
                      profile={profile}
                      twoFactorLoading={twoFactorLoading}
                      onInitiateSetup={initiate2FASetup}
                      onConfirmSetup={confirm2FASetup}
                      onDisable={disable2FA}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminProfile;
