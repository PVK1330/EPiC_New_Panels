import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiBuilding2Line, 
  RiMailLine, 
  RiGlobalLine, 
  RiShieldUserLine, 
  RiCheckLine,
  RiInformationLine,
  RiArrowDownSLine
} from 'react-icons/ri';
import Input from '../Input';
import Button from '../Button';
import Modal from '../common/Modal';

const CreateOrganizationModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primaryEmail: '',
    country: '',
    plan: 'starter',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const steps = [
    { title: 'Company Details', subtitle: 'Basic information about the organization' },
    { title: 'Subscription Plan', subtitle: 'Select a plan and module access' },
    { title: 'Primary Admin', subtitle: 'Create the first administrative account' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={steps[step - 1].title}
      subtitle={`Step ${step} of 3: ${steps[step - 1].subtitle}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex justify-between w-full">
          {step > 1 ? (
            <Button variant="secondary" onClick={handlePrev}>
              Previous Step
            </Button>
          ) : <div />}
          <Button onClick={step < 3 ? handleNext : () => onSubmit(formData)}>
            {step < 3 ? 'Continue' : 'Finalize & Create'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {step === 1 && (
          <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Organization Name"
                name="name"
                placeholder="e.g. Elite Visa Solutions"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subdomain / Slug</label>
                <div className="relative">
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full pl-4 pr-24 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="elite-visa"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">.epic-crm.com</span>
                </div>
              </div>
            </div>
            <Input
              label="Business Email"
              name="primaryEmail"
              type="email"
              placeholder="contact@organization.com"
              value={formData.primaryEmail}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input
                 label="Country"
                 name="country"
                 placeholder="United Kingdom"
                 value={formData.country}
                 onChange={handleChange}
                 required
               />
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subscription Plan</label>
                  <div className="relative">
                     <select
                       name="plan"
                       value={formData.plan}
                       onChange={handleChange}
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                     >
                        <option value="starter">Starter Plan (£99/mo)</option>
                        <option value="pro">Professional Plan (£299/mo)</option>
                        <option value="enterprise">Enterprise Plan (£599/mo)</option>
                     </select>
                     <RiArrowDownSLine className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'starter', name: 'Starter', price: 99, modules: ['Dashboard', 'Cases'] },
                { id: 'pro', name: 'Professional', price: 299, modules: ['Dashboard', 'Cases', 'Docs', 'Team'] },
                { id: 'enterprise', name: 'Enterprise', price: 599, modules: ['All Modules'] },
              ].map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.plan === plan.id 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-gray-50 hover:border-gray-100 bg-white'
                  }`}
                >
                  {formData.plan === plan.id && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border border-primary-dark">
                      <RiCheckLine size={12} />
                    </div>
                  )}
                  <h4 className="font-black text-secondary text-[10px] uppercase tracking-widest mb-1">{plan.name}</h4>
                  <p className="text-xl font-black text-primary tracking-tight">£{plan.price}<span className="text-[10px] text-gray-400 font-bold tracking-widest">/mo</span></p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Modules</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.modules.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-white border border-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-primary/5 rounded-xl flex gap-3 border border-primary/10">
              <RiInformationLine className="text-primary shrink-0" size={18} />
              <p className="text-[10px] font-black text-primary leading-relaxed uppercase tracking-tight">
                Trial period: 14 days. Billing cycles will activate automatically after verification.
              </p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Admin First Name"
                name="adminFirstName"
                placeholder="John"
                value={formData.adminFirstName}
                onChange={handleChange}
                required
              />
              <Input
                label="Admin Last Name"
                name="adminLastName"
                placeholder="Doe"
                value={formData.adminLastName}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Admin Login Email"
              name="adminEmail"
              type="email"
              placeholder="admin@organization.com"
              value={formData.adminEmail}
              onChange={handleChange}
              required
            />
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Temporary Access Key</p>
              <p className="font-black text-secondary tracking-[0.3em] text-lg">EPIC-TEMP-2024</p>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default CreateOrganizationModal;
