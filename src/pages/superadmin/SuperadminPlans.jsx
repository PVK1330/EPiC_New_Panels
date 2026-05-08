import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiSettings4Line,
  RiCheckLine,
  RiLayoutMasonryLine,
  RiMoneyPoundCircleLine,
  RiGroupLine,
  RiShieldFlashLine,
  RiInformationLine,
  RiDatabase2Line,
  RiUserFollowLine,
  RiFileList3Line,
} from 'react-icons/ri';
import { Plus } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: RiLayoutMasonryLine, description: 'Main analytics and overview' },
  { id: 'cases', name: 'Case Management', icon: RiShieldFlashLine, description: 'Manage and track visa applications' },
  { id: 'documents', name: 'Document Vault', icon: RiSettings4Line, description: 'Secure document storage and verification' },
  { id: 'finance', name: 'Finance & Invoices', icon: RiMoneyPoundCircleLine, description: 'Billing and payment tracking' },
  { id: 'reporting', name: 'Advanced Reporting', icon: RiSettings4Line, description: 'Custom reports and exports' },
  { id: 'team', name: 'Team Management', icon: RiGroupLine, description: 'Manage caseworkers and staff' },
];

const SuperadminPlans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: 'Starter', price: 99, interval: 'month', modules: ['dashboard', 'cases'], status: 'Active', limits: { users: 5, cases: 100, storage: '5 GB' } },
    { id: 2, name: 'Professional', price: 299, interval: 'month', modules: ['dashboard', 'cases', 'documents', 'team'], status: 'Active', limits: { users: 20, cases: 500, storage: '20 GB' } },
    { id: 3, name: 'Enterprise', price: 599, interval: 'month', modules: ['dashboard', 'cases', 'documents', 'finance', 'reporting', 'team'], status: 'Active', limits: { users: 'Unlimited', cases: 'Unlimited', storage: '100 GB' } },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    interval: 'month',
    selectedModules: [],
    limits: { users: '', cases: '', storage: '' }
  });

  const toggleModule = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleCreatePlan = () => {
    const newPlan = {
      id: Date.now(),
      name: formData.name,
      price: formData.price,
      interval: formData.interval,
      modules: formData.selectedModules,
      status: 'Active',
      limits: formData.limits
    };
    setPlans([...plans, newPlan]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight uppercase tracking-wider">Subscription Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Define platform tiers, pricing, and resource usage limits.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Create Plan Tier
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-lg hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-gray-100 shadow-sm">
                <RiShieldFlashLine size={24} />
              </div>
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100 tracking-widest">
                {plan.status}
              </span>
            </div>
            
            <h3 className="text-base font-black text-secondary uppercase tracking-tight mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6 border-b border-gray-50 pb-4">
              <span className="text-3xl font-black text-secondary tracking-tighter">£{plan.price}</span>
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">/ {plan.interval}</span>
            </div>

            {/* Resource Limits */}
            <div className="grid grid-cols-3 gap-2 mb-6">
               <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Users</p>
                  <p className="text-xs font-black text-secondary">{plan.limits.users}</p>
               </div>
               <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Cases</p>
                  <p className="text-xs font-black text-secondary">{plan.limits.cases}</p>
               </div>
               <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Storage</p>
                  <p className="text-xs font-black text-secondary">{plan.limits.storage}</p>
               </div>
            </div>

            <div className="space-y-4 flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Included Modules</p>
              <div className="space-y-2.5">
                {AVAILABLE_MODULES.map((module) => (
                  <div key={module.id} className={`flex items-center gap-2.5 ${plan.modules.includes(module.id) ? 'text-gray-900' : 'text-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${plan.modules.includes(module.id) ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-200'}`}>
                      <RiCheckLine size={10} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">{module.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-white text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all border border-gray-200 shadow-sm">
              Manage Configuration
            </button>
          </motion.div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Subscription Plan"
        subtitle="Configure pricing, resource limits, and module access levels."
        maxWidth="max-w-3xl"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>
              Finalize Plan Tier
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="Plan Name" 
              placeholder="e.g. Premium Business" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Price (£)" 
                type="number" 
                placeholder="299"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interval</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none"
                  value={formData.interval}
                  onChange={(e) => setFormData({...formData, interval: e.target.value})}
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resource Limits</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  label="User Limit" 
                  placeholder="e.g. 10" 
                  value={formData.limits.users}
                  onChange={(e) => setFormData({...formData, limits: {...formData.limits, users: e.target.value}})}
                />
                <Input 
                  label="Case Limit" 
                  placeholder="e.g. 500" 
                  value={formData.limits.cases}
                  onChange={(e) => setFormData({...formData, limits: {...formData.limits, cases: e.target.value}})}
                />
                <Input 
                  label="Storage (GB)" 
                  placeholder="e.g. 50" 
                  value={formData.limits.storage}
                  onChange={(e) => setFormData({...formData, limits: {...formData.limits, storage: e.target.value + ' GB'}})}
                />
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Modules to Include</p>
              <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
                {formData.selectedModules.length} Modules Selected
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto no-scrollbar p-1">
              {AVAILABLE_MODULES.map((module) => (
                <div 
                  key={module.id}
                  onClick={() => toggleModule(module.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3 ${
                    formData.selectedModules.includes(module.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-50 hover:border-gray-100 bg-white shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border ${
                    formData.selectedModules.includes(module.id) ? 'bg-primary text-white border-primary-dark shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    <module.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-xs uppercase tracking-tight ${formData.selectedModules.includes(module.id) ? 'text-secondary' : 'text-gray-600'}`}>{module.name}</h4>
                    <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">{module.description}</p>
                  </div>
                  {formData.selectedModules.includes(module.id) && (
                    <RiCheckLine className="text-primary" size={16} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
            <RiInformationLine className="text-blue-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
              Changes to core plan resources will be applied to all future subscriptions in this tier.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminPlans;
