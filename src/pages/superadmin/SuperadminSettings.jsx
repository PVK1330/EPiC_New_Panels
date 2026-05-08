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
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';

const SuperadminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: RiSettings4Line },
    { id: 'branding', name: 'Branding & Logo', icon: RiPaletteLine },
    { id: 'company', name: 'Company Details', icon: RiBuilding2Line },
    { id: 'commerce', name: 'Commerce & Trials', icon: RiBankCardLine },
    { id: 'system', name: 'SMTP & Security', icon: RiServerLine },
    { id: 'account', name: 'Account Details', icon: RiUserLine },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight uppercase tracking-wider">Settings & Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">Manage global platform parameters, branding, and core infrastructure.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-gray-500 hover:text-secondary hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Quick Info Card */}
          <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
             <div className="flex items-center gap-2 mb-3">
                <RiInformationLine className="text-primary" size={16} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Status</p>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Version</span>
                   <span className="text-[10px] font-black text-secondary">v2.4.0-build</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Environment</span>
                   <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[9px] font-black uppercase">Production</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]"
            >
              {/* --- GENERAL SETTINGS --- */}
              {activeTab === 'general' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <RiSettings4Line size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">General Platform Config</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1.5">Manage global system-wide identification and localization.</p>
                    </div>
                  </div>

                  <div className="space-y-8 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Platform Name" defaultValue="EPiC CRM" placeholder="e.g. ElitePic CRM" />
                      <Input label="System Language" defaultValue="English (UK)" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Support Email" defaultValue="support@epic-crm.com" />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Default Timezone</label>
                        <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none">
                          <option>(GMT+00:00) London</option>
                          <option>(GMT-05:00) New York</option>
                          <option>(GMT+05:30) Mumbai</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-8 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Environment Preferences</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                           <div className="flex items-center gap-3">
                              <RiNotification3Line className="text-primary" size={18} />
                              <div>
                                 <p className="text-xs font-bold text-secondary uppercase tracking-tight">Enable Maintenance Mode</p>
                                 <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Restricts access to superadmins only during updates.</p>
                              </div>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                           </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                    <Button className="px-12 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Save Global Changes</Button>
                  </div>
                </div>
              )}

              {/* --- BRANDING SETTINGS --- */}
              {activeTab === 'branding' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <RiPaletteLine size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">Branding & Assets</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1.5">Customize the visual identity and logos of the platform.</p>
                    </div>
                  </div>

                  <div className="space-y-10 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Logo Upload */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Logo</p>
                        <div className="relative group">
                           <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center transition-all group-hover:border-primary/30 group-hover:bg-primary/5 overflow-hidden">
                              <RiImageLine className="text-gray-300 mb-2 group-hover:text-primary transition-colors" size={40} />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Click to upload logo</p>
                              <p className="text-[9px] text-gray-300 mt-1 uppercase font-bold">250x60px • Max 2MB</p>
                           </div>
                        </div>
                      </div>
                      {/* Favicon Upload */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Favicon Asset</p>
                        <div className="relative group">
                           <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center transition-all group-hover:border-primary/30 group-hover:bg-primary/5 mx-auto">
                              <RiImageLine className="text-gray-300 mb-2 group-hover:text-primary transition-colors" size={32} />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload</p>
                              <p className="text-[9px] text-gray-300 mt-1 uppercase font-bold">32x32px • .ico, .png</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-gray-50">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Brand Color Palette</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight ml-1">Primary Color</label>
                             <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary border border-gray-100 shadow-sm" />
                                <Input defaultValue="#6366f1" className="font-mono text-xs" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight ml-1">Secondary Color</label>
                             <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-lg bg-secondary border border-gray-100 shadow-sm" />
                                <Input defaultValue="#0f172a" className="font-mono text-xs" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                    <Button className="px-12 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Update Assets</Button>
                  </div>
                </div>
              )}

              {/* --- COMPANY DETAILS --- */}
              {activeTab === 'company' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <RiBuilding2Line size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">Company Information</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1.5">Official business details for invoices and system identification.</p>
                    </div>
                  </div>

                  <div className="space-y-6 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Legal Entity Name" defaultValue="ElitePic Technology Ltd" />
                      <Input label="Tax ID / VAT Number" defaultValue="GB 123 456 789" />
                    </div>
                    <Input label="Registered Business Address" defaultValue="124 Baker Street, Marylebone, London, NW1 6XE, United Kingdom" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input label="City" defaultValue="London" />
                      <Input label="Postcode" defaultValue="NW1 6XE" />
                      <Input label="Country" defaultValue="United Kingdom" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Contact Phone" defaultValue="+44 (20) 1234 5678" />
                      <Input label="Finance Email" defaultValue="finance@epic-crm.com" />
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                    <Button className="px-12 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Save Company Info</Button>
                  </div>
                </div>
              )}

              {/* --- COMMERCE & TRIALS --- */}
              {activeTab === 'commerce' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <RiBankCardLine size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">Commerce & Monetization</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1.5">Configure payment gateways, currencies, and trial periods.</p>
                    </div>
                  </div>

                  <div className="space-y-10 max-w-3xl">
                    {/* Payment Gateways */}
                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Payment Gateways</p>
                       
                       <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                          <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 p-2">
                                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="w-full" />
                                </div>
                                <p className="text-xs font-black text-secondary uppercase tracking-widest">Stripe Checkout</p>
                             </div>
                             <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[9px] font-black uppercase tracking-widest">Active</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input label="Publishable Key" defaultValue="pk_live_51M..." className="font-mono text-[10px]" />
                             <Input label="Secret Key" defaultValue="sk_live_51M..." type="password" className="font-mono text-[10px]" />
                          </div>
                       </div>

                       <div className="p-6 bg-white border border-gray-100 rounded-2xl opacity-60">
                          <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 p-2">
                                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="w-full" />
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">PayPal Business</p>
                             </div>
                             <span className="px-2 py-0.5 bg-gray-50 text-gray-400 border border-gray-100 rounded text-[9px] font-black uppercase tracking-widest">Inactive</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input label="Client ID" placeholder="Not configured" disabled />
                             <Input label="Client Secret" placeholder="Not configured" type="password" disabled />
                          </div>
                       </div>
                    </div>

                    {/* Subscription Rules */}
                    <div className="pt-10 border-t border-gray-50">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Subscription Rules</p>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Input label="Free Trial Days" type="number" defaultValue="14" />
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Platform Currency</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none appearance-none">
                              <option>GBP (£)</option>
                              <option>USD ($)</option>
                              <option>EUR (€)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Auto-Invoice</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none appearance-none">
                              <option>On (Default)</option>
                              <option>Off (Manual Only)</option>
                            </select>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                    <Button className="px-12 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Save Commerce Rules</Button>
                  </div>
                </div>
              )}

              {/* --- SYSTEM CONFIG (SMTP & RECAPTCHA) --- */}
              {activeTab === 'system' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <RiServerLine size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">Infrastructure & SMTP</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1.5">Configure email delivery and third-party security integrations.</p>
                    </div>
                  </div>

                  <div className="space-y-10 max-w-3xl">
                    {/* SMTP Config */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SMTP Server Configuration</p>
                          <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5">
                             <RiMailLine size={12} /> Send Test Email
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-3">
                             <Input label="SMTP Host" defaultValue="smtp.sendgrid.net" placeholder="e.g. smtp.gmail.com" />
                          </div>
                          <Input label="Port" type="number" defaultValue="587" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="SMTP Username" defaultValue="apikey" />
                          <Input label="SMTP Password" type="password" defaultValue="********" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Encryption</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none">
                              <option>TLS / STARTTLS</option>
                              <option>SSL</option>
                              <option>None</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                             <Input label="Default 'From' Email" defaultValue="no-reply@epic-crm.com" />
                          </div>
                       </div>
                    </div>

                    {/* Security Integration */}
                    <div className="pt-10 border-t border-gray-50 space-y-6">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Google reCAPTCHA v3</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="Site Key" defaultValue="6Lc9..." className="font-mono text-[10px]" />
                          <Input label="Secret Key" defaultValue="6Lc9..." type="password" className="font-mono text-[10px]" />
                       </div>
                       <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                          <RiInformationLine size={20} className="text-blue-500 shrink-0" />
                          <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-tight">
                            reCAPTCHA is currently protecting the login, registration, and password reset forms from automated bot attacks.
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                    <Button className="px-12 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Validate & Save</Button>
                  </div>
                </div>
              )}

              {/* --- ACCOUNT DETAILS & SETTINGS --- */}
              {activeTab === 'account' && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                      <RiUserLine size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-secondary uppercase tracking-widest leading-none">Account & Security</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1.5">Manage your personal administrative profile and credentials.</p>
                    </div>
                  </div>

                  <div className="space-y-10 max-w-3xl">
                    {/* Personal Info */}
                    <div className="flex flex-col md:flex-row items-start gap-8">
                       <div className="relative group">
                          <div className="w-32 h-32 bg-gray-100 rounded-3xl border border-gray-200 flex items-center justify-center text-gray-400 text-3xl font-black overflow-hidden relative">
                             SA
                             <div className="absolute inset-0 bg-secondary/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                <RiUploadCloud2Line className="text-white" size={24} />
                                <span className="text-[8px] text-white font-black uppercase tracking-widest mt-1">Upload</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex-1 space-y-6 w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue="Super" />
                            <Input label="Last Name" defaultValue="Admin" />
                          </div>
                          <Input label="Email Address" defaultValue="super@epic-crm.com" disabled />
                       </div>
                    </div>

                    {/* Password Management */}
                    <div className="pt-10 border-t border-gray-50">
                       <div className="flex items-center gap-2 mb-6">
                          <RiLockPasswordLine className="text-primary" size={18} />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Password</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="Current Password" type="password" placeholder="••••••••" />
                          <div className="hidden md:block" />
                          <Input label="New Password" type="password" placeholder="••••••••" />
                          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                       </div>
                    </div>

                    {/* Advanced Security & MFA */}
                    <div className="pt-10 border-t border-gray-50 space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <RiShieldCheckLine className="text-primary" size={18} />
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Multi-Factor Authentication (MFA)</p>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[9px] font-black uppercase tracking-widest">Action Required</span>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                             <div>
                                <p className="text-xs font-black text-secondary uppercase tracking-tight mb-1">Authenticator App</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                                   Use an app like Google Authenticator or 1Password to generate secure verification codes.
                                </p>
                             </div>
                             <Button variant="secondary" className="mt-6 px-6 py-2 text-[9px] font-black uppercase tracking-widest bg-white shadow-sm">Setup App</Button>
                          </div>

                          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                             <div>
                                <p className="text-xs font-black text-secondary uppercase tracking-tight mb-1">SMS Verification</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                                   Receive a one-time code via text message to your registered mobile number.
                                </p>
                             </div>
                             <Button variant="secondary" className="mt-6 px-6 py-2 text-[9px] font-black uppercase tracking-widest bg-white shadow-sm opacity-50 cursor-not-allowed" disabled>Configure SMS</Button>
                          </div>
                       </div>

                       {/* Backup Codes */}
                       <div className="p-6 bg-white border border-gray-100 rounded-2xl">
                          <div className="flex items-center justify-between mb-4">
                             <div>
                                <p className="text-xs font-black text-secondary uppercase tracking-tight">Recovery Codes</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Use these if you lose access to your authentication device.</p>
                             </div>
                             <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download CSV</button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             {['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6'].map(code => (
                                <div key={code} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-center font-mono text-[10px] text-gray-500">{code}</div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                    <Button className="px-12 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Save Profile Data</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SuperadminSettings;
