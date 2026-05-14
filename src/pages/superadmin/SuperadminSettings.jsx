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
   RiDatabase2Line,
   RiTimeLine,
   RiGlobalLine,
   RiHashtag,
   RiEyeLine,
   RiLockLine,
   RiPulseLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';

const SuperadminSettings = () => {
   const [activeTab, setActiveTab] = useState('general');

   const tabs = [
      { id: 'general', name: 'Platform', icon: RiGlobalLine, desc: 'Identity & localization' },
      { id: 'branding', name: 'Branding', icon: RiPaletteLine, desc: 'Visual identity & themes' },
      { id: 'security', name: 'Security', icon: RiShieldFlashLine, desc: 'Policies & encryption' },
      { id: 'commerce', name: 'Commerce', icon: RiBankCardLine, desc: 'Payments & billing' },
      { id: 'infra', name: 'Network', icon: RiServerLine, desc: 'SMTP & Integrations' },
      { id: 'governance', name: 'Compliance', icon: RiDatabase2Line, desc: 'Data & retention' },
   ];

   return (
      <div className="space-y-6 pb-6">
         {/* Modern Header with Gradient Background */}
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
                <h1 className="text-3xl font-black text-red-700 mb-2">System Governance</h1>
                <p className="text-sm text-gray-500 font-medium">Configure global platform parameters, brand identity, and security protocols.</p>
             </div>
             <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white shadow-lg backdrop-blur-sm flex items-center gap-2">
                     <RiExternalLinkLine size={16} /> Preview Platform
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-blue-950 border border-white/30 text-white shadow-lg backdrop-blur-sm">
                     <RiSettings4Line size={16} /> Deploy Configuration
                  </Button>
                </motion.div>
             </div>
           </div>
         </motion.div>

         <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Navigation Registry */}
            <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-2 space-y-1">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${activeTab === tab.id
                              ? 'bg-secondary text-white shadow-lg'
                              : 'text-gray-500 hover:text-secondary hover:bg-gray-50'
                           }`}
                     >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-white'
                           }`}>
                           <tab.icon size={18} />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest leading-none">{tab.name}</p>
                           <p className={`text-[8px] mt-1.5 font-bold uppercase truncate ${activeTab === tab.id ? 'text-white/60' : 'text-gray-400'}`}>{tab.desc}</p>
                        </div>
                     </button>
                  ))}
               </div>

               <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] font-black text-secondary uppercase tracking-widest">Global Status: Optimal</p>
               </div>
            </div>

            {/* Configuration Matrix */}
            <div className="flex-1 min-w-0 w-full">
               <AnimatePresence mode="wait">
                  <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[650px] flex flex-col"
                  >
                     {/* Configuration Header */}
                     <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-primary shadow-sm">
                              {tabs.find(t => t.id === activeTab).icon({ size: 24 })}
                           </div>
                           <div>
                              <h3 className="text-sm font-black text-secondary uppercase tracking-widest">{tabs.find(t => t.id === activeTab).name} Matrix</h3>
                              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">{tabs.find(t => t.id === activeTab).desc}</p>
                           </div>
                        </div>
                        <RiShieldCheckLine size={24} className="text-primary/20" />
                     </div>

                     {/* Matrix Content */}
                     <div className="p-8 flex-1 space-y-8">
                        {activeTab === 'general' && (
                           <div className="space-y-8 max-w-4xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <Input label="Platform Name" defaultValue="EPiC CRM" />
                                 <Input label="Support Alias" defaultValue="support@epic-crm.com" />
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default Locale</label>
                                    <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none focus:ring-2 focus:ring-primary/20 appearance-none uppercase tracking-tight">
                                       <option>United Kingdom (GBP)</option>
                                       <option>United States (USD)</option>
                                    </select>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Timezone</label>
                                    <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none focus:ring-2 focus:ring-primary/20 appearance-none uppercase tracking-tight">
                                       <option>(GMT+00:00) Europe/London</option>
                                       <option>(GMT-05:00) America/New_York</option>
                                    </select>
                                 </div>
                              </div>

                              <div className="pt-8 border-t border-gray-50 space-y-4">
                                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Feature Flags</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                       { label: 'Maintenance Mode', desc: 'Lock platform for upgrades', icon: RiNotification3Line, color: 'text-amber-500' },
                                       { label: 'Public Registration', desc: 'Allow new tenant signups', icon: RiUserLine, color: 'text-blue-500' },
                                       { label: 'Trial Environment', desc: 'Enable 14-day free trial', icon: RiTimeLine, color: 'text-green-500' },
                                       { label: 'Analytics Tracking', desc: 'Global telemetry collection', icon: RiPulseLine, color: 'text-primary' },
                                    ].map((item) => (
                                       <div key={item.label} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-primary/20 transition-all">
                                          <div className="flex items-center gap-4">
                                             <item.icon className={item.color} size={20} />
                                             <div>
                                                <p className="text-[10px] font-black text-secondary uppercase tracking-tight">{item.label}</p>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase">{item.desc}</p>
                                             </div>
                                          </div>
                                          <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer overflow-hidden group-hover:bg-primary/20 transition-all">
                                             <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'branding' && (
                           <div className="space-y-10 max-w-4xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Identity</h4>
                                    <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group hover:border-primary/20 transition-all cursor-pointer">
                                       <RiImageLine size={32} className="text-gray-300 group-hover:text-primary transition-all" />
                                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3 group-hover:text-primary">Update Platform Logo</p>
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Iconography</h4>
                                    <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group hover:border-primary/20 transition-all cursor-pointer">
                                       <RiPaletteLine size={32} className="text-gray-300 group-hover:text-primary transition-all" />
                                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3 group-hover:text-primary">Upload Favicon (32x32)</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="pt-8 border-t border-gray-50 space-y-6">
                                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Tokens</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                       { label: 'Primary Core', val: '#6366F1', color: 'bg-[#6366F1]' },
                                       { label: 'Deep Secondary', val: '#0F172A', color: 'bg-[#0F172A]' },
                                       { label: 'Growth Accent', val: '#10B981', color: 'bg-[#10B981]' },
                                    ].map(token => (
                                       <div key={token.label} className="space-y-2.5">
                                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{token.label}</label>
                                          <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                             <div className={`w-8 h-8 rounded-lg shadow-inner ${token.color}`} />
                                             <input defaultValue={token.val} className="bg-transparent border-none font-mono text-[11px] font-black text-secondary focus:ring-0 w-full" />
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'security' && (
                           <div className="space-y-10 max-w-4xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password Protocol</h4>
                                    <div className="space-y-4">
                                       {[
                                          { label: 'Minimum 12 Characters', active: true },
                                          { label: 'Must contain Symbols', active: true },
                                          { label: 'Periodic Reset (90 Days)', active: false },
                                       ].map(rule => (
                                          <div key={rule.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                             <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">{rule.label}</span>
                                             <div className={`w-8 h-4 rounded-full relative ${rule.active ? 'bg-primary' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${rule.active ? 'right-0.5' : 'left-0.5'}`} />
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Session Management</h4>
                                    <div className="space-y-4">
                                       <Input label="Session Timeout (Minutes)" type="number" defaultValue="60" />
                                       <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                          <p className="text-[9px] font-bold text-primary uppercase leading-relaxed">
                                             Inactivity longer than the specified limit will trigger a global session termination and mandate a new MFA challenge.
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="pt-8 border-t border-gray-50">
                                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">MFA Enforcement</h4>
                                 <div className="p-6 bg-secondary rounded-2xl border border-secondary relative overflow-hidden">
                                    <RiShieldFlashLine size={100} className="absolute -bottom-10 -right-10 text-white/5" />
                                    <div className="relative z-10 flex items-center justify-between">
                                       <div>
                                          <h5 className="text-white text-[11px] font-black uppercase tracking-widest mb-2">Mandatory MFA Strategy</h5>
                                          <p className="text-white/50 text-[9px] font-bold uppercase tracking-tight max-w-sm leading-relaxed">
                                             Require all SuperAdmin and Organisational Admin accounts to complete biometric or token verification on every login.
                                          </p>
                                       </div>
                                       <button className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 transition-all">
                                          Enable Policy
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'infra' && (
                           <div className="space-y-10 max-w-4xl">
                              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                 <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-primary">
                                       <RiMailLine size={24} />
                                    </div>
                                    <div>
                                       <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">SMTP Notification Engine</h4>
                                       <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Configure global email delivery protocols.</p>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Hostname" defaultValue="smtp.sendgrid.net" />
                                    <Input label="Port" type="number" defaultValue="587" />
                                    <Input label="System Sender Name" defaultValue="EPiC Notifications" />
                                    <Input label="Encryption" defaultValue="STARTTLS" />
                                 </div>
                              </div>

                              <div className="pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Google Analytics</h4>
                                    <Input label="Measurement ID" defaultValue="G-XXXXXXXXXX" className="font-mono" />
                                 </div>
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cloud Storage</h4>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <RiUploadCloud2Line className="text-primary" size={20} />
                                          <span className="text-[10px] font-black text-secondary uppercase">AWS S3 BUCKET</span>
                                       </div>
                                       <RiCheckLine className="text-green-500" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'commerce' && (
                           <div className="space-y-10 max-w-4xl">
                              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 group transition-all">
                                 <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                          <RiBankCardLine className="text-primary" size={24} />
                                       </div>
                                       <div>
                                          <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">Financial Gateway (Stripe)</h4>
                                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Live transaction environment keys.</p>
                                       </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">PRODUCTION</span>
                                 </div>
                                 <div className="grid grid-cols-1 gap-6">
                                    <Input label="Stripe Publishable Key" defaultValue="pk_live_..." className="font-mono text-[11px]" />
                                    <div className="relative">
                                       <Input label="Stripe Secret Key" type="password" defaultValue="sk_live_..." className="font-mono text-[11px]" />
                                       <button className="absolute right-4 top-10 text-gray-400 hover:text-primary">
                                          <RiEyeLine size={18} />
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Logic</h4>
                                    <div className="space-y-4">
                                       <Input label="Default Tax Rate (%)" type="number" defaultValue="20" />
                                       <Input label="Grace Period (Days)" type="number" defaultValue="7" />
                                    </div>
                                 </div>
                                 <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col justify-center">
                                    <RiInformationLine size={24} className="text-primary mb-3" />
                                    <p className="text-[10px] text-primary font-black uppercase tracking-tight leading-relaxed">
                                       Currency changes will affect all existing subscription invoices. Platform currently locked to GBP (£).
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'governance' && (
                           <div className="space-y-10 max-w-4xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Retention</h4>
                                    <div className="space-y-4">
                                       {[
                                          { label: 'Audit Log Retention', val: '90 Days' },
                                          { label: 'Deleted Tenant Archive', val: '30 Days' },
                                          { label: 'Session Log History', val: '14 Days' },
                                       ].map(policy => (
                                          <div key={policy.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                             <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">{policy.label}</span>
                                             <span className="text-[10px] font-black text-primary uppercase">{policy.val}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privacy Controls</h4>
                                    <div className="space-y-4">
                                       <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                          <div>
                                             <p className="text-[10px] font-black text-secondary uppercase tracking-tight">Anonymize IPs</p>
                                             <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Hide source IPs in logs</p>
                                          </div>
                                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary" defaultChecked />
                                       </div>
                                       <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                          <div>
                                             <p className="text-[10px] font-black text-secondary uppercase tracking-tight">Cookie Consent</p>
                                             <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Force policy acceptance</p>
                                          </div>
                                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary" defaultChecked />
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="p-6 bg-secondary rounded-2xl border border-secondary flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <RiDatabase2Line className="text-white/20" size={32} />
                                    <div>
                                       <p className="text-white text-[11px] font-black uppercase tracking-widest">Platform Export</p>
                                       <p className="text-white/40 text-[9px] font-bold uppercase tracking-tight mt-1">Download complete system snapshot for compliance.</p>
                                    </div>
                                 </div>
                                 <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10">
                                    Initialize Export
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Matrix Footer */}
                     <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration Sync Active</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary transition-all">Discard Changes</button>
                           <Button className="px-10 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]">
                              Commit Matrix Changes
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
