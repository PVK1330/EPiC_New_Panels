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
  RiDeleteBin6Line,
  RiArchiveLine,
  RiEditLine,
  RiStarFill,
  RiOrganizationChart,
  RiCalendarEventLine,
  RiMessage3Line,
} from 'react-icons/ri';
import { Plus } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard & KPI', icon: RiLayoutMasonryLine, description: 'Analytics' },
  { id: 'cases', name: 'Case Management', icon: RiShieldFlashLine, description: 'Workflow' },
  { id: 'clients', name: 'Client Portal', icon: RiUserFollowLine, description: 'Candidate Access' },
  { id: 'business', name: 'Business Hub', icon: RiOrganizationChart, description: 'Company Management' },
  { id: 'documents', name: 'Data Vault', icon: RiDatabase2Line, description: 'Document Management' },
  { id: 'finance', name: 'Revenue Engine', icon: RiMoneyPoundCircleLine, description: 'Billing & Invoices' },
  { id: 'compliance', name: 'Compliance Node', icon: RiFileList3Line, description: 'Audit Logs' },
  { id: 'team', name: 'Staff Control', icon: RiGroupLine, description: 'Team & HR' },
  { id: 'calendar', name: 'Appointments', icon: RiCalendarEventLine, description: 'Global Calendar' },
  { id: 'messages', name: 'Communications', icon: RiMessage3Line, description: 'Direct Messaging' },
];

const SuperadminPlans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: 'Starter', price: 99, interval: 'month', modules: ['dashboard', 'cases'], status: 'Active', isFeatured: false, desc: 'For small firms' },
    { id: 2, name: 'Professional', price: 299, interval: 'month', modules: ['dashboard', 'cases', 'documents', 'team'], status: 'Active', isFeatured: true, desc: 'Growing agencies' },
    { id: 3, name: 'Enterprise', price: 599, interval: 'month', modules: ['dashboard', 'cases', 'documents', 'finance', 'compliance', 'team'], status: 'Active', isFeatured: false, desc: 'Full-scale power' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    interval: 'month',
    selectedModules: [],
    isFeatured: false
  });

  const toggleModule = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        selectedModules: plan.modules,
        isFeatured: plan.isFeatured || false
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: '',
        interval: 'month',
        selectedModules: [],
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = () => {
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...formData, modules: formData.selectedModules } : p));
    } else {
      const newPlan = {
        id: Date.now(),
        ...formData,
        modules: formData.selectedModules,
        status: 'Active',
        desc: 'Subscription Tier'
      };
      setPlans([...plans, newPlan]);
    }
    setIsModalOpen(false);
  };

  const handleDeletePlan = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const handleArchivePlan = (id) => {
    setPlans(plans.map(p => p.id === id ? { ...p, status: p.status === 'Archived' ? 'Active' : 'Archived' } : p));
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Modern Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-secondary via-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg border border-white/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-2xl font-black text-white mb-2">Subscription Plans</h1>
             <p className="text-sm text-white/80 font-medium">Manage subscription tiers and resource limits.</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
            variant='secondory'
              onClick={() => handleOpenModal()}
                className="px-6 py-3 text-[11px] font-black uppercase tracking-widest bg-white/20 border border-white/30 text-white hover:bg-white/30 shadow-lg backdrop-blur-sm"
            >
              <RiSettings4Line size={18} /> Create Plan
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col group hover:border-primary/20 transition-all relative overflow-hidden ${plan.isFeatured ? 'ring-1 ring-primary/20' : ''}`}
          >
            {plan.isFeatured && (
              <div className="absolute top-2 right-3 flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-full border border-primary/20 tracking-widest animate-pulse">
                <RiStarFill size={10} /> Popular
              </div>
            )}
            
            <div className="flex justify-between items-start mb-5">
              <div>
                 <h3 className="text-base font-bold text-secondary uppercase tracking-widest">{plan.name}</h3>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{plan.desc}</p>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border tracking-widest ${
                plan.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}>
                {plan.status}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-6 border-b border-gray-50 pb-5">
              <span className="text-3xl font-black text-secondary tracking-tight">£{plan.price}</span>
              <span className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">/ {plan.interval}</span>
            </div>

            <div className="space-y-3 flex-1">
              <div className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                 <div className="w-1 h-3 bg-primary rounded-full" /> Included Modules
              </div>
              <div className="grid grid-cols-1 gap-y-2.5">
                {AVAILABLE_MODULES.filter(m => plan.modules.includes(m.id)).map((module) => (
                  <div key={module.id} className="flex items-center gap-2.5">
                    <RiCheckLine size={14} className="text-primary shrink-0" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{module.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleOpenModal(plan)}
                  className="p-1.5 text-gray-500 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
                  title="Edit Plan"
                >
                  <RiEditLine size={17} />
                </button>
                <button 
                  onClick={() => handleArchivePlan(plan.id)}
                  className={`p-1.5 rounded-lg transition-all ${plan.status === 'Archived' ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`}
                  title={plan.status === 'Archived' ? 'Unarchive' : 'Archive'}
                >
                  <RiArchiveLine size={17} />
                </button>
                <button 
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Plan"
                >
                  <RiDeleteBin6Line size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        subtitle="Define features and pricing for this tier."
        maxWidth="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleSavePlan} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
               <Input 
                 label="Model Name" 
                 placeholder="e.g. Pro" 
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
               <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Price (£)" 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Interval</label>
                    <select 
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none"
                      value={formData.interval}
                      onChange={(e) => setFormData({...formData, interval: e.target.value})}
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Annual</option>
                    </select>
                  </div>
               </div>
            </div>
            
            <div className="space-y-4 p-5 bg-primary/5 rounded-xl border border-primary/10">
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                  <RiStarFill size={14} /> Marketing Options
               </p>
               <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="featured" className="text-[10px] font-bold text-secondary uppercase tracking-widest cursor-pointer select-none">
                    Mark as Popular / Featured Plan
                  </label>
               </div>
               <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                  Featured plans are highlighted with a badge and subtle glow to encourage selection by organizations.
               </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Included Modules</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {AVAILABLE_MODULES.map((module) => (
                <div 
                  key={module.id}
                  onClick={() => toggleModule(module.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative group ${
                    formData.selectedModules.includes(module.id)
                      ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5'
                      : 'border-gray-50 bg-white hover:border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border transition-all ${
                      formData.selectedModules.includes(module.id) ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      <module.icon size={16} />
                    </div>
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      formData.selectedModules.includes(module.id) ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                    }`}>
                      {formData.selectedModules.includes(module.id) && <RiCheckLine className="text-white" size={12} />}
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-bold text-[9px] uppercase tracking-widest leading-none ${formData.selectedModules.includes(module.id) ? 'text-secondary' : 'text-gray-500'}`}>{module.name}</h4>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-tight opacity-60">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperadminPlans;
