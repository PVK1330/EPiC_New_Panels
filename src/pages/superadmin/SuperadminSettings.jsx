import React, { useState, useEffect } from 'react';
import {
  RiSettings4Line,
  RiUserLine,
  RiBankCardLine,
  RiShieldCheckLine,
  RiNotification3Line,
  RiImageLine,
  RiServerLine,
  RiMailLine,
  RiUploadCloud2Line,
  RiPaletteLine,
  RiCheckLine,
  RiShieldFlashLine,
  RiPulseLine,
  RiLayoutMasonryLine,
  RiDeleteBin6Line,
  RiAddLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import useModules from '../../hooks/useModules';

const TABS = [
  { id: 'identity',     name: 'Identity',     icon: RiPaletteLine,      desc: 'Brand & Global Info' },
  { id: 'commerce',     name: 'Commerce',     icon: RiBankCardLine,     desc: 'Payments & Taxation' },
  { id: 'connectivity', name: 'Connectivity', icon: RiServerLine,       desc: 'Mail & Cloud Storage' },
  { id: 'security',     name: 'Security',     icon: RiShieldFlashLine,  desc: 'Access & Governance' },
  { id: 'modules',      name: 'Modules',      icon: RiLayoutMasonryLine, desc: 'Sidebar Module Registry' },
];

const PANEL_OPTIONS = ['admin', 'caseworker', 'candidate', 'business'];
const PANEL_LABELS = { admin: 'Admin', caseworker: 'Caseworker', candidate: 'Candidate', business: 'Business' };
const PANEL_ORDER = ['admin', 'caseworker', 'candidate', 'business'];

const SuperadminSettings = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [config, setConfig] = useState({
    maintenance: false,
    signups: true,
    analytics: true,
    mfa: true,
    ipWhitelist: false,
    sessionPersistence: true,
  });

  const [newModule, setNewModule] = useState({ key: '', label: '', panel: 'admin', icon: '' });
  const [newModuleErrors, setNewModuleErrors] = useState({});
  const [isDeleteModuleOpen, setIsDeleteModuleOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const { modules, modulesLoading, fetchAllModules, addModule, removeModule } = useModules();

  useEffect(() => {
    if (activeTab === 'modules') {
      fetchAllModules();
    }
  }, [activeTab]);

  const toggleKey = (key) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddModule = async () => {
    const errors = {};
    if (!newModule.key.trim()) errors.key = 'Key is required';
    else if (!/^[a-z]+\.[a-z0-9-]+$/.test(newModule.key.trim())) errors.key = 'Format: panel.name (e.g. admin.reports)';
    if (!newModule.label.trim()) errors.label = 'Label is required';
    if (!newModule.panel) errors.panel = 'Panel is required';
    if (Object.keys(errors).length) {
      setNewModuleErrors(errors);
      return;
    }
    setNewModuleErrors({});
    const result = await addModule({
      key: newModule.key.trim(),
      label: newModule.label.trim(),
      panel: newModule.panel,
      icon: newModule.icon.trim() || null,
    });
    if (result.ok) {
      toast.success('Module created');
      setNewModule({ key: '', label: '', panel: 'admin', icon: '' });
    } else {
      toast.error(result.error?.response?.data?.message || 'Failed to create module');
    }
  };

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    const result = await removeModule(moduleToDelete.id);
    if (result.ok) {
      toast.success('Module deactivated');
    } else {
      toast.error('Failed to deactivate module');
    }
    setIsDeleteModuleOpen(false);
    setModuleToDelete(null);
  };

  const allModulesList = Object.values(modules).flat();
  const ActiveIcon = TABS.find((t) => t.id === activeTab)?.icon || RiSettings4Line;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">System Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Platform Infrastructure</p>
        </div>
        {activeTab !== 'modules' && (
          <div className="flex items-center gap-2">
            <Button variant="primary" className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 shadow-lg shadow-primary/20">
              <RiCheckLine size={16} className="inline mr-1" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap bg-gray-50 p-1 rounded-lg border border-gray-100 w-fit shadow-sm mb-4 gap-1">
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
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-primary shadow-sm">
              <ActiveIcon size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">{TABS.find((t) => t.id === activeTab)?.name}</h3>
              <p className="text-xs text-gray-500">{TABS.find((t) => t.id === activeTab)?.desc}</p>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 space-y-6">
          {activeTab === 'identity' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    { id: 'signups',     label: 'Signups',     icon: RiUserLine,          color: 'text-blue-500' },
                    { id: 'analytics',   label: 'Analytics',   icon: RiPulseLine,         color: 'text-primary' },
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
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Default Rate (%)" type="number" defaultValue="20" />
                    <Input label="Tax ID" defaultValue="GB 123 456 789" />
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
                      { id: 'mfa',                label: 'Enforce MFA',     active: config.mfa },
                      { id: 'ipWhitelist',         label: 'IP Restrictions', active: config.ipWhitelist },
                      { id: 'sessionPersistence',  label: 'Stay Logged In',  active: config.sessionPersistence },
                    ].map((rule) => (
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

          {activeTab === 'modules' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-5">
                <div>
                  <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Add New Module</h4>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Register a new sidebar item without touching code. The key must match the route segment exactly.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Key</label>
                    <input
                      type="text"
                      placeholder="admin.new-feature"
                      value={newModule.key}
                      onChange={(e) => setNewModule((p) => ({ ...p, key: e.target.value }))}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all ${newModuleErrors.key ? 'border-red-400' : 'border-gray-100'}`}
                    />
                    {newModuleErrors.key && <p className="text-[10px] text-red-500 font-bold ml-1">{newModuleErrors.key}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Label</label>
                    <input
                      type="text"
                      placeholder="New Feature"
                      value={newModule.label}
                      onChange={(e) => setNewModule((p) => ({ ...p, label: e.target.value }))}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all ${newModuleErrors.label ? 'border-red-400' : 'border-gray-100'}`}
                    />
                    {newModuleErrors.label && <p className="text-[10px] text-red-500 font-bold ml-1">{newModuleErrors.label}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Panel</label>
                    <select
                      value={newModule.panel}
                      onChange={(e) => setNewModule((p) => ({ ...p, panel: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                      {PANEL_OPTIONS.map((p) => (
                        <option key={p} value={p}>{PANEL_LABELS[p]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Icon (optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="RiDashboardLine"
                        value={newModule.icon}
                        onChange={(e) => setNewModule((p) => ({ ...p, icon: e.target.value }))}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddModule}
                        className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
                      >
                        <RiAddLine size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {modulesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : allModulesList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-gray-400">No modules found. Run the module seeder first.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {PANEL_ORDER.filter((panel) => modules[panel]?.length > 0).map((panel) => (
                    <div key={panel} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-secondary uppercase tracking-widest">{PANEL_LABELS[panel]} Panel</p>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          {modules[panel].length} modules
                        </span>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Key</th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Label</th>
                              <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                              <th className="px-4 py-2.5 w-12" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {modules[panel].map((mod) => (
                              <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <code className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{mod.key}</code>
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-secondary">{mod.label}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                                    mod.is_active
                                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                      : 'bg-gray-100 text-gray-400 border-gray-200'
                                  }`}>
                                    {mod.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => { setModuleToDelete(mod); setIsDeleteModuleOpen(true); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Deactivate"
                                  >
                                    <RiDeleteBin6Line size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab !== 'modules' && (
          <div className="sticky bottom-0 px-4 py-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between rounded-b-xl z-20">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest tracking-tighter">System Health: Optimal</span>
            </div>
            <Button variant="primary" className="text-xs font-black uppercase tracking-widest px-8 shadow-md">
              Push Configuration
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isDeleteModuleOpen}
        onClose={() => { setIsDeleteModuleOpen(false); setModuleToDelete(null); }}
        title="Deactivate Module"
        subtitle="The module will be hidden from all plan assignments."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => { setIsDeleteModuleOpen(false); setModuleToDelete(null); }} className="px-5 py-2 text-sm font-bold">Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 border-red-600 px-6 py-2 text-sm font-bold" onClick={handleDeleteModule}>Deactivate</Button>
          </div>
        }
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3">
          <RiErrorWarningLine className="text-red-500 shrink-0" size={20} />
          <p className="text-sm text-red-800 font-bold leading-tight">
            Deactivate <code className="bg-red-100 px-1 rounded">{moduleToDelete?.key}</code>? It will no longer appear in plan module assignments.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminSettings;
