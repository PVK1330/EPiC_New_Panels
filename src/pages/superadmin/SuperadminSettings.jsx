import React, { useState } from 'react';
import {
   RiSettings4Line,
   RiUserLine,
   RiShieldKeyholeLine,
   RiBillLine,
   RiShieldCheckLine,
   RiNotification3Line,
   RiImageLine,
   RiBankCardLine,
   RiServerLine,
   RiMailLine,
   RiUploadCloud2Line,
   RiPaletteLine,
   RiCheckLine,
   RiShieldFlashLine,
   RiPulseLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';

const TABS = [
   { id: 'identity', name: 'Identity', icon: RiPaletteLine, desc: 'Brand & Global Info' },
   { id: 'commerce', name: 'Commerce', icon: RiBankCardLine, desc: 'Payments & Taxation' },
   { id: 'connectivity', name: 'Connectivity', icon: RiServerLine, desc: 'Mail & Cloud Storage' },
   { id: 'security', name: 'Security', icon: RiShieldFlashLine, desc: 'Access & Governance' },
];

const SuperadminSettings = () => {
   const [activeTab, setActiveTab] = useState('identity');
   const [config, setConfig] = useState({
      maintenance: false,
      signups: true,
      analytics: true,
      mfa: true,
      ipWhitelist: false,
      sessionPersistence: true
   });

   const toggleKey = (key) => {
      setConfig(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || RiSettings4Line;

   return (
    <div className="space-y-4 pb-4">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">System Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Platform Infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 shadow-lg shadow-primary/20">
            <RiCheckLine size={16} className="inline mr-1"/> Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 w-fit shadow-sm mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-secondary text-white shadow-md'
                : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col relative min-h-[500px]">
        {/* Configuration Header */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-primary shadow-sm">
              <ActiveIcon size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">{TABS.find(t => t.id === activeTab)?.name}</h3>
              <p className="text-xs text-gray-500">{TABS.find(t => t.id === activeTab)?.desc}</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-5 flex-1 space-y-6">
                        {activeTab === 'identity' && (
                           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {/* Branding */}
                                 <div className="space-y-4">
                                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Brand Assets</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group hover:border-primary/20 transition-all cursor-pointer">
                                          <RiImageLine size={24} className="text-gray-300 group-hover:text-primary" />
                                          <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">App Logo</p>
                                       </div>
                                       <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group hover:border-primary/20 transition-all cursor-pointer">
                                          <RiPaletteLine size={24} className="text-gray-300 group-hover:text-primary" />
                                          <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Favicon</p>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Global Identity */}
                                 <div className="space-y-6">
                                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest">General Info</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                       <Input label="Platform Name" defaultValue="EPiC CRM" />
                                       <Input label="Support Email" defaultValue="support@epic.com" />
                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Default Locale</label>
                                             <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none">
                                                <option>UK (GBP)</option>
                                                <option>US (USD)</option>
                                             </select>
                                          </div>
                                          <div className="space-y-1.5">
                                             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                                             <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none">
                                                <option>GMT / London</option>
                                                <option>EST / New York</option>
                                             </select>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="pt-6 border-t border-gray-50 space-y-4">
                                 <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Core Toggles</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                       { id: 'maintenance', label: 'Maintenance', icon: RiNotification3Line, color: 'text-amber-500' },
                                       { id: 'signups', label: 'Signups', icon: RiUserLine, color: 'text-blue-500' },
                                       { id: 'analytics', label: 'Analytics', icon: RiPulseLine, color: 'text-primary' },
                                    ].map((item) => (
                                       <div 
                                          key={item.id} 
                                          onClick={() => toggleKey(item.id)}
                                          className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white transition-all"
                                       >
                                          <div className="flex items-center gap-3">
                                             <item.icon className={item.color} size={18} />
                                             <p className="text-xs font-black text-secondary uppercase tracking-tight">{item.label}</p>
                                          </div>
                                          <div className={`w-8 h-4 rounded-full relative transition-all shadow-inner ${config[item.id] ? 'bg-primary' : 'bg-gray-200'}`}>
                                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${config[item.id] ? 'right-0.5' : 'left-0.5'}`} />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'commerce' && (
                           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                 <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 text-primary">
                                       <RiBankCardLine size={20} />
                                    </div>
                                    <div>
                                       <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Payments (Stripe)</h4>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gateway integration</p>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Publishable Key" defaultValue="pk_live_..." />
                                    <Input label="Secret Key" type="password" defaultValue="sk_live_..." />
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Taxation</h4>
                                    <div className="space-y-4">
                                       <div className="grid grid-cols-2 gap-4">
                                          <Input label="Default Rate (%)" type="number" defaultValue="20" />
                                          <Input label="Tax ID" defaultValue="GB 123 456 789" />
                                       </div>
                                    </div>
                                 </div>
                                 <div className="p-5 bg-secondary text-white rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-center">
                                    <RiShieldCheckLine size={60} className="absolute -bottom-4 -right-4 opacity-10" />
                                    <p className="text-lg font-black tracking-tight mb-2 text-white">Financial Compliance</p>
                                    <p className="text-[10px] font-medium opacity-70 leading-relaxed text-white">
                                       Automatic invoicing and tax records are enabled across all subscriptions.
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'connectivity' && (
                           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {/* SMTP */}
                                 <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3">
                                       <RiMailLine className="text-primary" size={20} />
                                       <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Email Server (SMTP)</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                       <Input label="SMTP Host" defaultValue="smtp.sendgrid.net" />
                                       <Input label="Username" defaultValue="apikey" />
                                       <Input label="Password" type="password" defaultValue="••••••••••••" />
                                    </div>
                                    <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest">
                                       Test Connection
                                    </Button>
                                 </div>

                                 {/* S3 Storage */}
                                 <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3">
                                       <RiUploadCloud2Line className="text-primary" size={20} />
                                       <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Cloud Storage (S3)</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                       <Input label="Bucket Name" defaultValue="epic-assets" />
                                       <Input label="Region" defaultValue="eu-west-1" />
                                       <Input label="Access Key" defaultValue="AKIA..." />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'security' && (
                           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-6">
                                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Access Policy</h4>
                                    <div className="space-y-3">
                                       {[
                                          { id: 'mfa', label: 'Enforce MFA', active: config.mfa },
                                          { id: 'ipWhitelist', label: 'IP Restrictions', active: config.ipWhitelist },
                                          { id: 'sessionPersistence', label: 'Stay Logged In', active: config.sessionPersistence },
                                       ].map(rule => (
                                          <div 
                                             key={rule.id} 
                                             onClick={() => toggleKey(rule.id)}
                                             className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white transition-all"
                                          >
                                             <p className="text-xs font-black text-secondary uppercase tracking-tight">{rule.label}</p>
                                             <div className={`w-8 h-4 rounded-full relative transition-all shadow-inner ${rule.active ? 'bg-primary' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${rule.active ? 'right-0.5' : 'left-0.5'}`} />
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="space-y-6">
                                    <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Session Governance</h4>
                                    <div className="p-5 bg-white rounded-xl border border-gray-100 space-y-4 shadow-sm">
                                       <Input label="Inactivity Timeout (Min)" type="number" defaultValue="30" />
                                       <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                          Specifies the duration of inactivity before an administrative session is automatically terminated.
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Footer */}
                     <div className="sticky bottom-0 px-4 py-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between rounded-b-xl z-20">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                           <span className="text-xs font-black text-gray-400 uppercase tracking-widest tracking-tighter">System Health: Optimal</span>
                        </div>
                        <Button variant="primary" className="text-xs font-black uppercase tracking-widest px-8 shadow-md">
                           Push Configuration
                        </Button>
                     </div>
      </div>
    </div>
   );
};

export default SuperadminSettings;
