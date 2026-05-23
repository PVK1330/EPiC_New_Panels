import { useState, useEffect } from 'react';
import { RiSettings4Line, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { RiBankCardLine, RiShieldFlashLine, RiServerLine, RiPaletteLine, RiLayoutMasonryLine } from 'react-icons/ri';
import Button from '../../../components/Button';
import Modal from '../../../components/common/Modal';
import { toast } from 'react-hot-toast';
import useModules from '../../../hooks/useModules';
import { getGatewayStatus, configureGateway } from '../../../services/billingApi';

import IdentityTab from './components/IdentityTab';
import CommerceTab from './components/CommerceTab';
import ConnectivityTab from './components/ConnectivityTab';
import SecurityTab from './components/SecurityTab';
import ModulesTab from './components/ModulesTab';

// Tabs that manage their own save buttons — hide the top-level save bar for these
const SELF_SAVING_TABS = new Set(['identity', 'connectivity', 'security']);

const TABS = [
  { id: 'identity',     name: 'Identity',     icon: RiPaletteLine,       desc: 'Brand & Global Info'       },
  { id: 'commerce',     name: 'Commerce',     icon: RiBankCardLine,      desc: 'Payments & Taxation'       },
  { id: 'connectivity', name: 'Connectivity', icon: RiServerLine,        desc: 'Mail & Cloud Storage'      },
  { id: 'security',     name: 'Security',     icon: RiShieldFlashLine,   desc: 'Access & Governance'       },
  { id: 'modules',      name: 'Modules',      icon: RiLayoutMasonryLine, desc: 'Sidebar Module Registry'   },
];

const SuperadminSettings = () => {
  const [activeTab, setActiveTab] = useState('identity');

  const [newModule, setNewModule] = useState({ key: '', label: '', panel: 'admin', icon: '' });
  const [newModuleErrors, setNewModuleErrors] = useState({});
  const [isDeleteModuleOpen, setIsDeleteModuleOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const [stripeConfig, setStripeConfig] = useState({
    publishable_key: '',
    secret_key: '',
    webhook_secret: '',
    currency: 'GBP',
    platform_fee: '0',
  });
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);

  const { modules, modulesLoading, fetchAllModules, addModule, removeModule } = useModules();

  useEffect(() => {
    if (activeTab === 'modules') fetchAllModules();
    if (activeTab === 'commerce') loadStripeConfig();
  }, [activeTab]);

  const loadStripeConfig = async () => {
    setStripeLoading(true);
    try {
      const res = await getGatewayStatus();
      const gw = res.data?.data?.gateway || {};
      setStripeStatus(gw.status);
      setStripeConfig({
        publishable_key: gw.publishable_key || '',
        secret_key: '',
        webhook_secret: '',
        currency: gw.currency || 'GBP',
        platform_fee: gw.platform_fee || '0',
      });
    } catch {
      setStripeStatus(null);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSaveStripe = async () => {
    if (!stripeConfig.publishable_key.trim() || !stripeConfig.secret_key.trim()) {
      toast.error('Publishable key and secret key are required');
      return;
    }
    setStripeSaving(true);
    try {
      await configureGateway({
        publishable_key: stripeConfig.publishable_key.trim(),
        secret_key: stripeConfig.secret_key.trim(),
        webhook_secret: stripeConfig.webhook_secret.trim() || undefined,
        currency: stripeConfig.currency,
        platform_fee: stripeConfig.platform_fee,
      });
      toast.success('Stripe configuration saved');
      await loadStripeConfig();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save configuration');
    } finally {
      setStripeSaving(false);
    }
  };

  const handleAddModule = async () => {
    const errors = {};
    if (!newModule.key.trim()) errors.key = 'Key is required';
    else if (!/^[a-z]+\.[a-z0-9-]+$/.test(newModule.key.trim())) errors.key = 'Format: panel.name (e.g. admin.reports)';
    if (!newModule.label.trim()) errors.label = 'Label is required';
    if (!newModule.panel) errors.panel = 'Panel is required';
    if (Object.keys(errors).length) { setNewModuleErrors(errors); return; }
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

  const ActiveIcon = TABS.find((t) => t.id === activeTab)?.icon || RiSettings4Line;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-secondary tracking-tight">System Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Platform Infrastructure</p>
        </div>
        {activeTab !== 'modules' && !SELF_SAVING_TABS.has(activeTab) && (
          <Button variant="primary" className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 shadow-lg shadow-primary/20">
            <RiCheckLine size={16} className="inline mr-1" /> Save Changes
          </Button>
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
            <IdentityTab />
          )}
          {activeTab === 'commerce' && (
            <CommerceTab
              stripeLoading={stripeLoading}
              stripeConfig={stripeConfig}
              setStripeConfig={setStripeConfig}
              stripeStatus={stripeStatus}
              showSecretKey={showSecretKey}
              setShowSecretKey={setShowSecretKey}
              showWebhookSecret={showWebhookSecret}
              setShowWebhookSecret={setShowWebhookSecret}
              stripeSaving={stripeSaving}
              handleSaveStripe={handleSaveStripe}
            />
          )}
          {activeTab === 'connectivity' && (
            <ConnectivityTab />
          )}
          {activeTab === 'security' && (
            <SecurityTab />
          )}
          {activeTab === 'modules' && (
            <ModulesTab
              modules={modules}
              modulesLoading={modulesLoading}
              newModule={newModule}
              setNewModule={setNewModule}
              newModuleErrors={newModuleErrors}
              handleAddModule={handleAddModule}
              setModuleToDelete={setModuleToDelete}
              setIsDeleteModuleOpen={setIsDeleteModuleOpen}
            />
          )}
        </div>

        {activeTab !== 'modules' && !SELF_SAVING_TABS.has(activeTab) && (
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