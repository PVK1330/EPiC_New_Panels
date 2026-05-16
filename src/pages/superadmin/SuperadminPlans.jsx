import React, { useState, useEffect } from 'react';
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
  RiErrorWarningLine,
} from 'react-icons/ri';
import { Plus } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';
import * as planService from '../../services/superadminPlan.service';
import { toast } from 'react-hot-toast';

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: RiLayoutMasonryLine, description: 'Analytics' },
  { id: 'cases', name: 'Cases', icon: RiShieldFlashLine, description: 'Workflow' },
  { id: 'clients', name: 'Client Portal', icon: RiUserFollowLine, description: 'Candidate Access' },
  { id: 'business', name: 'Organisations', icon: RiOrganizationChart, description: 'Company Management' },
  { id: 'documents', name: 'Documents', icon: RiDatabase2Line, description: 'Document Management' },
  { id: 'finance', name: 'Billing', icon: RiMoneyPoundCircleLine, description: 'Payments & Invoices' },
  { id: 'compliance', name: 'Audit Logs', icon: RiFileList3Line, description: 'Compliance' },
  { id: 'team', name: 'Team', icon: RiGroupLine, description: 'Staff Control' },
  { id: 'calendar', name: 'Calendar', icon: RiCalendarEventLine, description: 'Global Calendar' },
  { id: 'messages', name: 'Messaging', icon: RiMessage3Line, description: 'Direct Messaging' },
];

const SuperadminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'month',
    selectedModules: [],
    isFeatured: false,
    user_quota: 5,
    case_quota: 50,
    storage_quota_gb: 1
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await planService.fetchPlans();
      if (res.data.status === 'success') {
        // Map backend features to frontend selectedModules
        const mappedPlans = res.data.data.plans.map(p => ({
          ...p,
          modules: p.features || [],
          interval: p.billing_cycle === 'monthly' ? 'month' : 'year',
          isFeatured: p.is_public // or use a dedicated field if exists
        }));
        setPlans(mappedPlans);
      }
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

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
        description: plan.description || plan.desc || '',
        price: plan.price,
        interval: plan.interval,
        selectedModules: plan.modules,
        isFeatured: plan.isFeatured || false,
        user_quota: plan.user_quota || 5,
        case_quota: plan.case_quota || 50,
        storage_quota_gb: plan.storage_quota_gb || 1
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        interval: 'month',
        selectedModules: [],
        isFeatured: false,
        user_quota: 5,
        case_quota: 50,
        storage_quota_gb: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        billing_cycle: formData.interval === 'month' ? 'monthly' : 'yearly',
        features: formData.selectedModules,
        is_public: formData.isFeatured,
        user_quota: parseInt(formData.user_quota),
        case_quota: parseInt(formData.case_quota),
        storage_quota_gb: parseInt(formData.storage_quota_gb),
      };

      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, payload);
        toast.success('Plan updated successfully');
      } else {
        await planService.createPlan(payload);
        toast.success('Plan created successfully');
      }
      loadPlans();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDeletePlan = async () => {
    try {
      await planService.deletePlan(selectedPlan.id);
      toast.success('Plan deleted successfully');
      loadPlans();
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleArchivePlan = async (plan) => {
    try {
      const newStatus = plan.status === 'archived' ? 'active' : 'archived';
      await planService.updatePlan(plan.id, { status: newStatus });
      toast.success(`Plan ${newStatus}d`);
      loadPlans();
    } catch (err) {
      toast.error('Failed to update plan status');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Create and manage subscription tiers, pricing, and available modules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => handleOpenModal()} className="px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary/20">
            <RiSettings4Line size={18} className="inline mr-2"/> Create Plan
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/50 rounded-3xl border border-gray-100 animate-pulse">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synchronizing Plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -2 }}
            className={`relative bg-white rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 w-full ${
              plan.isFeatured 
                ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/10' 
                : 'border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            {plan.isFeatured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-dark text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl border border-white/20 whitespace-nowrap z-10">
                Most Popular
              </div>
            )}
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-secondary tracking-tight">{plan.name}</h3>
                <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-tighter opacity-80">{plan.description || plan.desc}</p>
              </div>
              <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest ${
                plan.status === 'active' || plan.status === 'Active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}>
                {plan.status}
              </span>
            </div>
           
            <div className="flex items-baseline gap-2 py-3 border-y border-gray-50/50">
              <span className="text-3xl font-black text-secondary tracking-tighter">£{plan.price}</span>
              <span className="text-xs text-gray-400 font-bold opacity-60">/{plan.interval}</span>
            </div>
           
            <div className="space-y-3 flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modules</p>
              <div className="space-y-2">
                {plan.modules.map(m => {
                  const modInfo = AVAILABLE_MODULES.find(mod => mod.id === m);
                  return (
                    <div key={m} className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10 transition-transform group-hover:scale-110">
                        {modInfo ? <modInfo.icon size={16} /> : <RiCheckLine size={16} />}
                      </div>
                      <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">{modInfo?.name || m}</span>
                    </div>
                  );
                })}
              </div>
            </div>
           
            <div className="flex gap-2 pt-4 border-t border-gray-50">
              <Button 
                variant={plan.isFeatured ? 'primary' : 'outline'} 
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm ${plan.isFeatured ? 'bg-primary' : ''}`}
                onClick={() => handleOpenModal(plan)}
              >
                Edit Plan
              </Button>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleArchivePlan(plan)}
                  className="p-2 text-gray-400 hover:text-secondary hover:bg-gray-50 rounded-lg transition-all"
                  title={plan.status === 'archived' ? 'Activate' : 'Archive'}
                >
                  <RiArchiveLine size={18} />
                </button>
                <button 
                  onClick={() => { setSelectedPlan(plan); setIsDeleteModalOpen(true); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <RiDeleteBin6Line size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        subtitle="Define features and pricing for this tier."
        maxWidth="max-w-4xl"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold">Cancel</Button>
            <Button onClick={handleSavePlan} className="px-8 py-2.5 text-sm font-bold shadow-lg shadow-primary/20">
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-8 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <Input 
                label="Model Name"
                placeholder="e.g. Professional"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input 
                label="Description"
                placeholder="Brief description of the tier"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Price (£)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Interval</label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/10 transition-all"
                      value={formData.interval}
                      onChange={(e) => setFormData({...formData, interval: e.target.value})}
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Annual</option>
                    </select>
                    <RiArrowDownSLine className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <Input 
                  label="Users"
                  type="number"
                  value={formData.user_quota}
                  onChange={(e) => setFormData({...formData, user_quota: e.target.value})}
                />
                <Input 
                  label="Cases"
                  type="number"
                  value={formData.case_quota}
                  onChange={(e) => setFormData({...formData, case_quota: e.target.value})}
                />
                <Input 
                  label="Storage (GB)"
                  type="number"
                  value={formData.storage_quota_gb}
                  onChange={(e) => setFormData({...formData, storage_quota_gb: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-5 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                  <RiStarFill size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-secondary uppercase tracking-tight">Marketing Status</h4>
                  <p className="text-xs text-gray-500 font-bold">Highlight this plan to users</p>
                </div>
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 transition-all group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">Mark as Featured / Most Popular</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-secondary uppercase tracking-widest">Included Modules</p>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                {formData.selectedModules.length} Selected
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AVAILABLE_MODULES.map((module) => (
                <motion.div 
                  key={module.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleModule(module.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative group ${
                    formData.selectedModules.includes(module.id)
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                      : 'border-gray-50 bg-white hover:border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all ${
                    formData.selectedModules.includes(module.id) ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    <module.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-black text-sm leading-tight uppercase tracking-tight ${formData.selectedModules.includes(module.id) ? 'text-secondary' : 'text-gray-400'}`}>{module.name}</h4>
                  </div>
                  {formData.selectedModules.includes(module.id) && (
                    <div className="absolute top-2 right-2 text-primary">
                      <RiCheckLine size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Plan"
        subtitle="This action cannot be undone."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 text-sm font-bold">Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 border-red-600 px-6 py-2 text-sm font-bold" onClick={handleDeletePlan}>Delete</Button>
          </div>
        }
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3">
          <RiErrorWarningLine className="text-red-500 shrink-0" size={20} />
          <p className="text-sm text-red-800 font-bold leading-tight">
            Delete {selectedPlan?.name} plan? All associated module settings will be removed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

// Simplified arrow icon for select
const RiArrowDownSLine = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default SuperadminPlans;
