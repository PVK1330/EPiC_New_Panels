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
  RiBox3Line,
} from 'react-icons/ri';
import { Plus } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Analytics', icon: RiLayoutMasonryLine, description: 'Core reporting & performance overview' },
  { id: 'cases', name: 'Case Manager', icon: RiShieldFlashLine, description: 'Workflow automation & tracking' },
  { id: 'documents', name: 'Data Vault', icon: RiDatabase2Line, description: 'Encrypted document infrastructure' },
  { id: 'finance', name: 'Revenue', icon: RiMoneyPoundCircleLine, description: 'Monetization & payment tracking' },
  { id: 'reporting', name: 'Audit Logs', icon: RiFileList3Line, description: 'Compliance & activity history' },
  { id: 'team', name: 'Staff Control', icon: RiGroupLine, description: 'User roles & permission logic' },
];

const SuperadminPlans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: 'Starter', price: 99, interval: 'month', modules: ['dashboard', 'cases'], status: 'Active', limits: { users: 5, cases: 100, storage: '5 GB' }, desc: 'For small specialized firms' },
    { id: 2, name: 'Professional', price: 299, interval: 'month', modules: ['dashboard', 'cases', 'documents', 'team'], status: 'Active', limits: { users: 20, cases: 500, storage: '20 GB' }, desc: 'Standard for growing agencies' },
    { id: 3, name: 'Enterprise', price: 599, interval: 'month', modules: ['dashboard', 'cases', 'documents', 'finance', 'reporting', 'team'], status: 'Active', limits: { users: 'Unlimited', cases: 'Unlimited', storage: '100 GB' }, desc: 'Full-scale enterprise power' },
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
      limits: formData.limits,
      desc: 'New customized tier'
    };
    setPlans([...plans, newPlan]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-secondary uppercase tracking-widest">Pricing Strategy</h1>
          <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-wider">Configure global subscription tiers and architectural resource limits.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> New Tier Model
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col group hover:shadow-2xl hover:border-primary/20 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-gray-100 shadow-inner">
                <RiBox3Line size={28} />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[9px] font-black uppercase rounded-lg border border-green-100 tracking-[0.2em]">
                {plan.status}
              </span>
            </div>
            
            <div className="relative z-10">
               <h3 className="text-lg font-black text-secondary uppercase tracking-widest leading-none mb-1">{plan.name}</h3>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mb-6">{plan.desc}</p>
            </div>

            <div className="flex items-baseline gap-1.5 mb-8 border-b border-gray-50 pb-6 relative z-10">
              <span className="text-4xl font-black text-secondary tracking-tighter">£{plan.price}</span>
              <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">/ {plan.interval}</span>
            </div>

            {/* Quota Visualization */}
            <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
               <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center hover:bg-white hover:shadow-sm transition-all">
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Users</p>
                  <p className="text-xs font-black text-secondary tracking-tighter">{plan.limits.users}</p>
               </div>
               <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center hover:bg-white hover:shadow-sm transition-all">
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Cases</p>
                  <p className="text-xs font-black text-secondary tracking-tighter">{plan.limits.cases}</p>
               </div>
               <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center hover:bg-white hover:shadow-sm transition-all">
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Storage</p>
                  <p className="text-xs font-black text-secondary tracking-tighter">{plan.limits.storage}</p>
               </div>
            </div>

            <div className="space-y-4 flex-1 relative z-10">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <div className="w-1 h-3 bg-primary rounded-full" /> Architecture
              </p>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {AVAILABLE_MODULES.map((module) => (
                  <div key={module.id} className={`flex items-center gap-2.5 ${plan.modules.includes(module.id) ? 'opacity-100' : 'opacity-25 grayscale'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${plan.modules.includes(module.id) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-200'}`}>
                      <RiCheckLine size={10} />
                    </div>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{module.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-10 py-3.5 bg-white text-secondary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-secondary hover:text-white hover:shadow-xl transition-all border border-gray-100 shadow-sm relative z-10">
              Configure Model
            </button>
          </motion.div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Model New Tier"
        subtitle="Define global pricing and resource boundaries for organizations."
        maxWidth="max-w-4xl"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5">
              Discard
            </Button>
            <Button onClick={handleCreatePlan} className="text-[10px] font-black uppercase tracking-widest px-8 py-2.5">
              Finalize Architecture
            </Button>
          </div>
        }
      >
        <div className="space-y-8 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <Input 
                 label="Model Identity Name" 
                 placeholder="e.g. Premium Business" 
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Price (£)" 
                    type="number" 
                    placeholder="299"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Billing Interval</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                      value={formData.interval}
                      onChange={(e) => setFormData({...formData, interval: e.target.value})}
                    >
                      <option value="month">Monthly Cycle</option>
                      <option value="year">Annual Cycle</option>
                    </select>
                  </div>
               </div>
            </div>
            
            <div className="space-y-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Resource Boundaries</p>
               <div className="space-y-4">
                  <Input 
                    label="User Quota" 
                    placeholder="e.g. 10" 
                    value={formData.limits.users}
                    onChange={(e) => setFormData({...formData, limits: {...formData.limits, users: e.target.value}})}
                  />
                  <Input 
                    label="Case Quota" 
                    placeholder="e.g. 500" 
                    value={formData.limits.cases}
                    onChange={(e) => setFormData({...formData, limits: {...formData.limits, cases: e.target.value}})}
                  />
                  <Input 
                    label="Storage Capacity (GB)" 
                    placeholder="e.g. 50" 
                    value={formData.limits.storage}
                    onChange={(e) => setFormData({...formData, limits: {...formData.limits, storage: e.target.value + ' GB'}})}
                  />
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
               <div className="flex-1 h-px bg-gray-100" /> Authorized Modules <div className="flex-1 h-px bg-gray-100" />
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AVAILABLE_MODULES.map((module) => (
                <div 
                  key={module.id}
                  onClick={() => toggleModule(module.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative group ${
                    formData.selectedModules.includes(module.id)
                      ? 'border-primary bg-primary/5 shadow-inner shadow-primary/10'
                      : 'border-gray-50 hover:border-gray-100 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all ${
                    formData.selectedModules.includes(module.id) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    <module.icon size={20} />
                  </div>
                  <div>
                    <h4 className={`font-black text-[10px] uppercase tracking-widest ${formData.selectedModules.includes(module.id) ? 'text-secondary' : 'text-gray-600'}`}>{module.name}</h4>
                    <p className="text-[8px] text-gray-400 font-bold uppercase leading-tight mt-1 group-hover:text-gray-500">{module.description}</p>
                  </div>
                  {formData.selectedModules.includes(module.id) && (
                    <div className="absolute top-4 right-4 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                       <RiCheckLine size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100/50 flex gap-4">
            <RiInformationLine className="text-amber-500 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
              Platform warning: modifying core tier architecture may impact existing organization resource allocation upon renewal.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminPlans;
