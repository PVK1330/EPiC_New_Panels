import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSettings4Line,
  RiUserLine,
  RiShieldKeyholeLine,
  RiBillLine,
  RiKey2Line,
  RiShieldCheckLine,
  RiNotification3Line,
  RiInformationLine,
  RiImageLine,
  RiBuilding2Line,
  RiBankCardLine,
  RiServerLine,
  RiMailLine,
  RiLockPasswordLine,
  RiUploadCloud2Line,
  RiPaletteLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiShieldFlashLine,
  RiGoogleLine,
  RiEarthLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';

const SuperadminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: RiSettings4Line, desc: 'Basic platform info & localization' },
    { id: 'branding', name: 'Branding', icon: RiPaletteLine, desc: 'Visual identity, logos & colors' },
    { id: 'company', name: 'Business', icon: RiBuilding2Line, desc: 'Official company & legal details' },
    { id: 'commerce', name: 'Payments', icon: RiBankCardLine, desc: 'Gateways, trials & subscriptions' },
    { id: 'system', name: 'Infrastructure', icon: RiServerLine, desc: 'SMTP, Security & reCAPTCHA' },
    { id: 'account', name: 'Account', icon: RiUserLine, desc: 'Your personal profile & security' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-secondary uppercase tracking-widest">Platform Engine</h1>
          <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-wider">Configure the core logic and visual identity of your global CRM.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-gray-100 shadow-sm">
              <RiExternalLinkLine size={14} className="mr-2" /> Live Preview
           </Button>
           <Button className="text-[9px] font-black uppercase tracking-widest px-6 py-2 shadow-lg shadow-primary/20">
              Save All Changes
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-80 shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-2.5 space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative group ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                    : 'text-gray-500 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                   activeTab === tab.id ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-white border border-gray-100'
                }`}>
                   <tab.icon size={20} />
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-[11px] font-black uppercase tracking-wider leading-none ${activeTab === tab.id ? 'text-white' : 'text-secondary'}`}>{tab.name}</p>
                  <p className={`text-[8px] mt-1.5 font-bold uppercase truncate ${activeTab === tab.id ? 'text-white/70' : 'text-gray-400'}`}>{tab.desc}</p>
                </div>
                {activeTab === tab.id && (
                   <motion.div layoutId="active-tab" className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Integration Status Card */}
          <div className="mt-6 p-6 bg-secondary rounded-2xl border border-secondary shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
             <div className="relative z-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Core Connectivity</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/50 uppercase">Gateway</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-green-400 uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                      </span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/50 uppercase">Database</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">v18.4</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/50 uppercase">Region</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                         <RiEarthLine size={12} /> Global Node
                      </span>
                   </div>
                </div>
                <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] transition-all">
                   System Diagnostics
                </button>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col"
            >
              {/* Tab Header Section */}
              <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-primary shadow-sm">
                       {tabs.find(t => t.id === activeTab).icon({ size: 24 })}
                    </div>
                    <div>
                       <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">
                          {tabs.find(t => t.id === activeTab).name} Settings
                       </h3>
                       <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-tight">
                          {tabs.find(t => t.id === activeTab).desc}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Tab Content Section */}
              <div className="p-6 flex-1">
                {activeTab === 'general' && (
                  <div className="space-y-8 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-5">
                          <Input label="Platform Display Name" defaultValue="EPiC CRM" placeholder="e.g. ElitePic CRM" />
                          <Input label="Global Support Email" defaultValue="support@epic-crm.com" />
                       </div>
                       <div className="space-y-5">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default Platform Language</label>
                             <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none">
                                <option>English (United Kingdom)</option>
                                <option>English (United States)</option>
                                <option>Spanish (European)</option>
                             </select>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Timezone</label>
                             <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none">
                                <option>(GMT+00:00) London, United Kingdom</option>
                                <option>(GMT-05:00) New York, USA</option>
                                <option>(GMT+01:00) Paris, France</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Maintenance & Access</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-amber-500 shadow-sm">
                                   <RiNotification3Line size={18} />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-secondary uppercase tracking-tight">Maintenance Mode</p>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Lock platform for all non-admins</p>
                                </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                             </label>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-blue-500 shadow-sm">
                                   <RiEarthLine size={18} />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-secondary uppercase tracking-tight">Global Registration</p>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Allow new organizations to sign up</p>
                                </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                             </label>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div className="space-y-8 max-w-4xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Main Logo */}
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Identity (Main Logo)</p>
                           <div className="h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group relative overflow-hidden cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                              <RiImageLine size={40} className="text-gray-200 group-hover:text-primary transition-colors" />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 group-hover:text-primary transition-colors">Replace Logo</p>
                              <div className="absolute bottom-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">250 x 60px • Transparent PNG</div>
                           </div>
                        </div>

                        {/* Favicon & Mini */}
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Browser Identity (Favicon)</p>
                           <div className="h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group relative overflow-hidden cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                              <RiPaletteLine size={32} className="text-gray-200 group-hover:text-primary transition-colors" />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 group-hover:text-primary transition-colors">Upload Favicon</p>
                              <div className="absolute bottom-3 text-[8px] font-black text-gray-300 uppercase tracking-widest">32 x 32px • .ico / .png</div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Design System Tokens</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Primary Brand</label>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/20" />
                                 <Input defaultValue="#6366f1" className="font-mono text-xs font-bold" />
                              </div>
                           </div>
                           <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Secondary Brand</label>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-secondary shadow-lg shadow-secondary/20" />
                                 <Input defaultValue="#0f172a" className="font-mono text-xs font-bold" />
                              </div>
                           </div>
                           <div className="space-y-2.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Surface Color</label>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm" />
                                 <Input defaultValue="#ffffff" className="font-mono text-xs font-bold" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'company' && (
                  <div className="space-y-8 max-w-4xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="Legal Business Name" defaultValue="ElitePic Technology Solutions Ltd" />
                        <Input label="Company Registration Number" defaultValue="12345678" />
                     </div>
                     <Input label="Registered Office Address" defaultValue="124 Baker Street, London, NW1 6XE" />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input label="City / Region" defaultValue="London" />
                        <Input label="Postal Code" defaultValue="NW1 6XE" />
                        <Input label="Country" defaultValue="United Kingdom" />
                     </div>
                     <div className="pt-10 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Tax & Compliance</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Input label="VAT / Tax ID Number" defaultValue="GB 987 654 321" />
                           <Input label="Financial Year End" defaultValue="March 31st" />
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'commerce' && (
                  <div className="space-y-10 max-w-4xl">
                     {/* Stripe Gateway */}
                     <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                           <RiBankCardLine size={120} className="rotate-12" />
                        </div>
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="w-10" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Stripe Connect</h4>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Direct card processing gateway</p>
                              </div>
                           </div>
                           <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-200 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Operational
                           </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                           <Input label="Live Publishable Key" defaultValue="pk_live_51M..." className="font-mono text-[10px]" />
                           <Input label="Live Secret Key" defaultValue="sk_live_51M..." type="password" className="font-mono text-[10px]" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Currency</label>
                           <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 transition-all appearance-none">
                              <option>GBP (£) - British Pound</option>
                              <option>USD ($) - US Dollar</option>
                              <option>EUR (€) - Euro</option>
                           </select>
                        </div>
                        <Input label="Standard Trial Period" type="number" defaultValue="14" />
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invoice Generation</label>
                           <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 transition-all appearance-none">
                              <option>Automated (Instant)</option>
                              <option>Manual Approval</option>
                           </select>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-10 max-w-4xl">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Delivery Engine (SMTP)</p>
                           <button className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                              <RiMailLine size={14} /> Send Connectivity Test
                           </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="md:col-span-2">
                              <Input label="SMTP Hostname" defaultValue="smtp.sendgrid.net" />
                           </div>
                           <Input label="Security Port" type="number" defaultValue="587" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Input label="SMTP Authentication User" defaultValue="apikey" />
                           <Input label="SMTP Secret Key" type="password" defaultValue="********" />
                        </div>
                     </div>

                     <div className="pt-10 border-t border-gray-50 space-y-8">
                        <div className="flex items-center gap-3">
                           <RiGoogleLine size={24} className="text-blue-500" />
                           <div>
                              <p className="text-[11px] font-black text-secondary uppercase tracking-tight">Google reCAPTCHA Protection</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Bot & Spam mitigation services</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Input label="v3 Site Key" defaultValue="6Lc9..." className="font-mono text-xs" />
                           <Input label="v3 Secret Key" type="password" defaultValue="6Lc9..." className="font-mono text-xs" />
                        </div>
                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4">
                           <RiShieldFlashLine size={24} className="text-blue-500 shrink-0" />
                           <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-tight">
                              reCAPTCHA protection is active across all entry points including Login, Registration, and Password Recovery.
                           </p>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-10 max-w-4xl">
                     <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-3xl text-primary shadow-inner relative group cursor-pointer overflow-hidden">
                           SA
                           <div className="absolute inset-0 bg-secondary/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <RiUploadCloud2Line size={24} className="text-white" />
                              <span className="text-[8px] text-white font-black uppercase mt-2">Replace</span>
                           </div>
                        </div>
                        <div className="flex-1 space-y-6 w-full">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Input label="First Name" defaultValue="Super" />
                              <Input label="Last Name" defaultValue="Admin" />
                           </div>
                           <Input label="Primary Administrative Email" defaultValue="super@epic-crm.com" disabled />
                        </div>
                     </div>

                     <div className="pt-10 border-t border-gray-50">
                        <div className="flex items-center gap-3 mb-8">
                           <RiLockPasswordLine size={20} className="text-primary" />
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Authentication Update</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Input label="Current Administrative Password" type="password" placeholder="••••••••" />
                           <div />
                           <Input label="New Password" type="password" placeholder="••••••••" />
                           <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                        </div>
                     </div>

                     <div className="pt-10 border-t border-gray-50 space-y-8">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <RiShieldCheckLine size={24} className="text-green-500" />
                              <div>
                                 <p className="text-[11px] font-black text-secondary uppercase tracking-tight">Two-Factor Authentication (MFA)</p>
                                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Secure your account with an authentication app</p>
                              </div>
                           </div>
                           <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                              Setup Required
                           </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col justify-between group hover:bg-white hover:shadow-lg transition-all border-dashed border-2">
                              <div>
                                 <h5 className="text-[11px] font-black text-secondary uppercase tracking-widest mb-2">Authenticator App</h5>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">Use apps like Google Authenticator or 1Password</p>
                              </div>
                              <button className="w-full mt-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-secondary uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                 Setup Device
                              </button>
                           </div>
                           <div className="p-6 bg-white rounded-3xl border border-gray-100 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-2">
                                 <h5 className="text-[11px] font-black text-secondary uppercase tracking-widest">Recovery Codes</h5>
                                 <RiCheckLine className="text-green-500" size={16} />
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed mb-6">Backup codes generated on 08 May 2026</p>
                              <div className="grid grid-cols-2 gap-2">
                                 <div className="p-2 bg-gray-50 rounded-lg text-[9px] font-mono text-center text-gray-500">A1B2-C3D4</div>
                                 <div className="p-2 bg-gray-50 rounded-lg text-[9px] font-mono text-center text-gray-500">E5F6-G7H8</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Node Stable</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('general')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors">Reset</button>
                    <Button className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30">
                       Commit Changes
                    </Button>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SuperadminSettings;
