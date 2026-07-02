import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiSettings4Line,
  RiCheckLine,
  RiDeleteBin6Line,
  RiArchiveLine,
  RiStarFill,
  RiErrorWarningLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/common/Modal';
import PageHero, { HeroButton } from '../../components/superadmin/PageHero';
import * as planService from '../../services/superadminPlan.service';
import { toast } from 'react-hot-toast';
import useModules from '../../hooks/useModules';
import { formatCurrencyExact } from '../../utils/currencyFormatter';
import usePlatformCurrency from '../../hooks/usePlatformCurrency';

const PANEL_LABELS = {
  admin: 'Admin',
  caseworker: 'Caseworker',
  candidate: 'Candidate',
  business: 'Business',
};

const PANEL_ORDER = ['admin', 'caseworker', 'candidate', 'business'];

// Order modules the same way the edit modal does: by panel (PANEL_ORDER),
// then by each module's sort_order. Unknown panels sort last.
const sortModules = (mods) =>
  [...mods].sort((a, b) => {
    const pa = PANEL_ORDER.indexOf(a.panel);
    const pb = PANEL_ORDER.indexOf(b.panel);
    const ra = pa === -1 ? PANEL_ORDER.length : pa;
    const rb = pb === -1 ? PANEL_ORDER.length : pb;
    if (ra !== rb) return ra - rb;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

const SuperadminPlans = () => {
  const currency = usePlatformCurrency();
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
    selectedModuleIds: [],
    isFeatured: false,
    user_quota: 5,
    case_quota: 50,
    storage_quota_gb: 1,
  });

  const {
    modules,
    modulesLoading,
    fetchAllModules,
    fetchModulesByPlan,
    savePlanModules,
  } = useModules();

  useEffect(() => {
    loadPlans();
    fetchAllModules();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await planService.fetchPlans();
      if (res.data.status === 'success') {
        const mappedPlans = (res.data?.data?.plans || []).map((p) => ({
          ...p,
          interval: p.billing_cycle === 'monthly' ? 'month' : 'year',
          isFeatured: p.is_public,
          assignedModules: sortModules(p.modules || []),
          assignedModuleIds: (p.modules || []).map((m) => m.id),
        }));
        setPlans(mappedPlans);
      }
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleId = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedModuleIds: prev.selectedModuleIds.includes(id)
        ? prev.selectedModuleIds.filter((x) => x !== id)
        : [...prev.selectedModuleIds, id],
    }));
  };

  const handleOpenModal = async (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      const res = await fetchModulesByPlan(plan.id);
      const currentIds = plan.assignedModuleIds || [];
      setFormData({
        name: plan.name,
        description: plan.description || plan.desc || '',
        price: plan.price,
        interval: plan.interval,
        selectedModuleIds: currentIds,
        isFeatured: plan.isFeatured || false,
        user_quota: plan.user_quota || 5,
        case_quota: plan.case_quota || 50,
        storage_quota_gb: plan.storage_quota_gb || 1,
      });
    } else {
      setEditingPlan(null);
      const allIds = Object.values(modules).flat().map((m) => m.id);
      setFormData({
        name: '',
        description: '',
        price: '',
        interval: 'month',
        selectedModuleIds: allIds,
        isFeatured: false,
        user_quota: 5,
        case_quota: 50,
        storage_quota_gb: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name?.trim()) {
      toast.error('Plan name is required');
      return;
    }
    const priceValue = parseFloat(formData.price);
    if (formData.price === '' || Number.isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price (0 or more)');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: priceValue,
        billing_cycle: formData.interval === 'month' ? 'monthly' : 'yearly',
        features: formData.selectedModuleIds,
        is_public: formData.isFeatured,
        user_quota: parseInt(formData.user_quota),
        case_quota: parseInt(formData.case_quota),
        storage_quota_gb: parseInt(formData.storage_quota_gb),
      };

      let planId = editingPlan?.id;

      if (editingPlan) {
        await planService.updatePlan(editingPlan.id, payload);
        toast.success('Plan updated successfully');
      } else {
        const res = await planService.createPlan(payload);
        planId = res.data?.data?.plan?.id;
        toast.success('Plan created successfully');
      }

      if (planId) {
        await savePlanModules(planId, formData.selectedModuleIds);
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
      toast.success(`Plan ${newStatus === 'archived' ? 'archived' : 'activated'}`);
      loadPlans();
    } catch {
      toast.error('Failed to update plan status');
    }
  };

  const allModulesList = Object.values(modules).flat();

  return (
    <div className="space-y-6 pb-6">
      <PageHero
        icon={RiSettings4Line}
        title="Subscription Plans"
        subtitle="Create and manage subscription tiers, pricing, and available modules."
      >
        <HeroButton onClick={() => handleOpenModal()}>
          <RiSettings4Line size={18} /> Create Plan
        </HeroButton>
      </PageHero>

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
                  plan.status === 'active' || plan.status === 'Active'
                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}>
                  {plan.status}
                </span>
              </div>

              <div className="flex items-baseline gap-2 py-3 border-y border-gray-50/50">
                <span className="text-3xl font-black text-secondary tracking-tighter">{formatCurrencyExact(plan.price, currency)}</span>
                <span className="text-xs text-gray-400 font-bold opacity-60">/{plan.interval}</span>
              </div>

              <div className="space-y-3 flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Modules ({plan.assignedModules?.length || 0})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(plan.assignedModules || []).slice(0, 8).map((mod) => (
                    <div key={mod.id} className="flex items-center gap-2 group">
                      <div className="w-4 h-4 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <RiCheckLine size={10} />
                      </div>
                      <span className="text-xs font-bold text-secondary truncate">
                        {mod.label}
                        {PANEL_LABELS[mod.panel] && (
                          <span className="ml-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                            {PANEL_LABELS[mod.panel]}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {(plan.assignedModules?.length || 0) > 8 && (
                    <p className="text-[10px] font-black text-gray-400">+{plan.assignedModules.length - 8} more</p>
                  )}
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
        subtitle="Define features, pricing, and module access for this tier."
        maxWidth="max-w-5xl"
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
                label="Plan Name"
                name="plan_name"
                placeholder="e.g. Professional"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Description"
                name="plan_description"
                placeholder="Brief description of the tier"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`Price (${currency})`}
                  name="plan_price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Interval</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-primary/10 transition-all"
                      value={formData.interval}
                      onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    >
                      <option value="month">Monthly</option>
                      <option value="year">Annual</option>
                    </select>
                    <RiArrowDownSLine className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              {/* <div className="grid grid-cols-3 gap-4 pt-2">
                <Input
                  label="Users"
                  type="number"
                  value={formData.user_quota}
                  onChange={(e) => setFormData({ ...formData, user_quota: e.target.value })}
                />
                <Input
                  label="Cases"
                  type="number"
                  value={formData.case_quota}
                  onChange={(e) => setFormData({ ...formData, case_quota: e.target.value })}
                />
                <Input
                  label="Storage (GB)"
                  type="number"
                  value={formData.storage_quota_gb}
                  onChange={(e) => setFormData({ ...formData, storage_quota_gb: e.target.value })}
                />
              </div> */}
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
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">Mark as Featured / Most Popular</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-secondary uppercase tracking-widest">Module Access</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  {formData.selectedModuleIds.length} / {allModulesList.length} Selected
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, selectedModuleIds: allModulesList.map((m) => m.id) }))}
                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, selectedModuleIds: [] }))}
                  className="text-[10px] font-black text-gray-400 hover:underline uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>
            </div>

            {modulesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {PANEL_ORDER.filter((panel) => modules[panel]?.length > 0).map((panel) => (
                  <div key={panel} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-secondary uppercase tracking-widest">{PANEL_LABELS[panel]}</p>
                      <div className="flex-1 h-px bg-gray-100" />
                      <button
                        type="button"
                        onClick={() => {
                          const panelIds = modules[panel].map((m) => m.id);
                          const allSelected = panelIds.every((id) => formData.selectedModuleIds.includes(id));
                          setFormData((prev) => ({
                            ...prev,
                            selectedModuleIds: allSelected
                              ? prev.selectedModuleIds.filter((id) => !panelIds.includes(id))
                              : [...new Set([...prev.selectedModuleIds, ...panelIds])],
                          }));
                        }}
                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                      >
                        {modules[panel].every((m) => formData.selectedModuleIds.includes(m.id)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {modules[panel].map((mod) => {
                        const selected = formData.selectedModuleIds.includes(mod.id);
                        return (
                          <motion.div
                            key={mod.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toggleModuleId(mod.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 relative ${
                              selected
                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                              selected ? 'bg-primary border-primary' : 'border-gray-300'
                            }`}>
                              {selected && <RiCheckLine size={10} className="text-white" />}
                            </div>
                            <span className={`text-xs font-black truncate ${selected ? 'text-secondary' : 'text-gray-400'}`}>
                              {mod.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

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

const RiArrowDownSLine = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default SuperadminPlans;
