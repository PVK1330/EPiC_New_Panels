import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RiBuilding2Line,
  RiShieldUserLine,
  RiInformationLine,
  RiArrowDownSLine,
} from 'react-icons/ri';
import Input from '../Input';
import Button from '../Button';
import PhoneInput from '../PhoneInput';
import Modal from '../common/Modal';
import {
  slugifyOrganisation,
  isValidOrganisationSlug,
  getOrganisationSubdomainLabel,
} from '../../utils/organisationHost';
import { COUNTRIES, isValidPhone } from '../../utils/countries';
import { fetchPlans } from '../../services/superadminPlan.service';

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const initialForm = () => ({
  name: '',
  slug: '',
  primaryEmail: '',
  country: 'United Kingdom',
  plan_id: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminCountryCode: '+44',
  adminMobile: '',
});

const CreateOrganizationModal = ({ isOpen, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm());
      setSlugTouched(false);
      setSubmitting(false);
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await fetchPlans();
      const list = (res.data?.data?.plans || []).filter((p) => p.status === 'active');
      setPlans(list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, plan_id: String(list[0].id) }));
      }
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'slug') {
      setSlugTouched(true);
      setFormData((prev) => ({ ...prev, slug: slugifyOrganisation(value) }));
      return;
    }

    if (name === 'name') {
      setFormData((prev) => {
        const next = { ...prev, name: value };
        if (!slugTouched) next.slug = slugifyOrganisation(value);
        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    if (
      !formData.name?.trim() ||
      !formData.primaryEmail?.trim() ||
      !formData.adminEmail?.trim() ||
      !formData.adminFirstName?.trim() ||
      !formData.adminLastName?.trim()
    ) {
      toast.error('Please fill in all required fields (including admin name)');
      return;
    }

    const slug = slugifyOrganisation(formData.slug || formData.name);
    if (!isValidOrganisationSlug(slug)) {
      toast.error('Enter a valid subdomain (e.g. acme-immigration). Letters, numbers, and hyphens only.');
      return;
    }

    if (!formData.adminMobile?.trim()) {
      toast.error('Enter the administrator mobile number');
      return;
    }
    if (!isValidPhone(formData.adminCountryCode, formData.adminMobile)) {
      toast.error('Enter a valid mobile number for the selected country');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...formData, slug });
      onClose();
    } catch (e) {
      const isTimeout =
        e?.code === 'ECONNABORTED' || /timeout/i.test(String(e?.message || ''));
      toast.error(
        isTimeout
          ? 'Provisioning is taking longer than expected. Check the organisations list — the org may already have been created.'
          : e?.response?.data?.message || e.message || 'Request failed',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Organisation"
      subtitle="Register a new company and its administrator account."
      maxWidth="max-w-3xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={submitting} onClick={handleFormSubmit}>
            {submitting ? 'Creating...' : 'Create Organisation'}
          </Button>
        </div>
      }
    >
      <div className="space-y-8 py-2">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-secondary flex items-center gap-2">
            <RiBuilding2Line className="text-primary" /> Organisation Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organisation Name"
              name="name"
              placeholder="e.g. Elite Visa Solutions"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Subdomain <span className="text-gray-400 font-normal">(editable)</span>
              </label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-semibold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="acme-immigration"
              />
              <p className="text-[11px] text-gray-400 ml-1">
                Login URL:{' '}
                <span className="font-mono text-primary">{getOrganisationSubdomainLabel(formData.slug)}</span>
              </p>
              <p className="text-[11px] text-gray-400 ml-1">
                Auto-filled from name until you edit this field.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Email"
              name="primaryEmail"
              type="email"
              placeholder="contact@organisation.com"
              value={formData.primaryEmail}
              onChange={handleChange}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Country</label>
              <div className="relative">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-semibold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a country</option>
                  {SORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <RiArrowDownSLine
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Subscription Plan</label>
            <div className="relative">
              <select
                name="plan_id"
                value={formData.plan_id}
                onChange={handleChange}
                disabled={plansLoading}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-semibold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer disabled:opacity-60"
              >
                {plansLoading && <option value="">Loading plans...</option>}
                {!plansLoading && plans.length === 0 && <option value="">No active plans found</option>}
                {!plansLoading && plans.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} — £{Number(p.price).toFixed(0)}/{p.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                  </option>
                ))}
              </select>
              <RiArrowDownSLine
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-bold text-secondary flex items-center gap-2">
            <RiShieldUserLine className="text-primary" /> Administrator Account
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="adminFirstName"
              placeholder="John"
              value={formData.adminFirstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="adminLastName"
              placeholder="Doe"
              value={formData.adminLastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Admin Email"
              name="adminEmail"
              type="email"
              placeholder="admin@organisation.com"
              value={formData.adminEmail}
              onChange={handleChange}
              required
            />
            <PhoneInput
              split
              label="Mobile Number"
              dialCode={formData.adminCountryCode}
              national={formData.adminMobile}
              dialName="adminCountryCode"
              nationalName="adminMobile"
              onChange={handleChange}
              placeholder="7700900123"
              required
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-3">
          <RiInformationLine className="text-primary shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-gray-500 leading-relaxed">
            A temporary password will be generated for the admin account. You can view it in the notification toast after creation.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CreateOrganizationModal;
