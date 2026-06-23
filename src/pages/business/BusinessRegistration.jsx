import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  User,
  ClipboardList,
  FileText,
  Folder,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react';
import DatePicker from "../../components/DatePicker";
import PhoneInput from "../../components/PhoneInput";
import { COUNTRY_NAMES } from "../../utils/countries";

const PRESET_SECTORS = [
  'Accounting & Audit',
  'Agriculture & Farming',
  'Architecture & Design',
  'Automotive',
  'Aviation & Aerospace',
  'Banking & Finance',
  'Biotechnology',
  'Construction & Civil Engineering',
  'Consulting & Professional Services',
  'Defence & Security',
  'E-commerce & Retail',
  'Education & Training',
  'Energy & Utilities',
  'Engineering',
  'Entertainment & Media',
  'Environmental Services',
  'Food & Beverage',
  'Government & Public Sector',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'Information Technology',
  'Insurance',
  'Legal Services',
  'Logistics & Supply Chain',
  'Manufacturing',
  'Marketing & Advertising',
  'Mining & Extraction',
  'Non-profit & Charity',
  'Pharmaceuticals',
  'Real Estate & Property',
  'Recruitment & Staffing',
  'Research & Development',
  'Telecommunications',
  'Transportation',
  'Wholesale & Distribution',
];

// Shared country list — single source of truth in utils/countries.js.
const COUNTRIES = COUNTRY_NAMES;

// Year-established upper bound: a company can't have been established in the future.
const CURRENT_YEAR = new Date().getFullYear();
// Permissive website check: bare domain or http(s) URL.
const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const BusinessRegistration = ({ embedded, initialForm, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [industrySectorOther, setIndustrySectorOther] = useState(false);
  const [phoneValid, setPhoneValid] = useState({});
  const [form, setForm] = useState({
    companyName: '',
    tradingName: '',
    registrationNumber: '',
    sponsorLicenceNumber: '',
    licenceRating: '',
    industrySector: '',
    yearEstablished: '',
    website: '',

    registeredAddress: '',
    tradingAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',

    authorisingName: '',
    authorisingPhone: '',
    authorisingEmail: '',
    authorisingJobTitle: '',

    keyContactName: '',
    keyContactPhone: '',
    keyContactEmail: '',
    keyContactDepartment: '',

    level1Users: [],

    hrName: '',
    hrEmail: '',
    hrPhone: '',
    hrJobTitle: '',
    licenceIssueDate: '',
    licenceExpiryDate: '',
    cosAllocation: '',

    ownershipType: '',
    shareholders: [],
    directors: [],

    sponsorLetter: null,
    insuranceCertificate: null,
    hrPolicies: null,
    organisationalChart: null,
    recruitmentDocs: null,

    billingName: '',
    billingEmail: '',
    billingPhone: '',
    outstandingBalance: '',
    paymentTerms: '',
  });

  useEffect(() => {
    if (initialForm) {
      setForm(prev => ({
        ...prev,
        ...initialForm,
        level1Users: initialForm.level1Users || prev.level1Users || [],
        shareholders: initialForm.shareholders || prev.shareholders || [],
        directors: initialForm.directors || prev.directors || [],
      }));
      if (initialForm.industrySector && !PRESET_SECTORS.includes(initialForm.industrySector)) {
        setIndustrySectorOther(true);
      }
    }
  }, [initialForm]);

  const steps = [
    { id: 1, label: 'Company Info' },
    { id: 2, label: 'Business Address' },
    { id: 3, label: 'Key Personnel' },
    { id: 4, label: 'HR & Sponsor' },
    { id: 5, label: 'Ownership Structure' },
    { id: 6, label: 'Documents & Billing' },
  ];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Pure rule set for a single step — returns a field→message map (no state writes).
  // Required fields are enforced; optional fields are only validated when filled in.
  const getStepErrors = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.companyName) e.companyName = "Company Name is required";
      if (!form.registrationNumber) e.registrationNumber = "Registration Number is required";
      if (!form.sponsorLicenceNumber) e.sponsorLicenceNumber = "Licence Number is required";
      if (!form.licenceRating) e.licenceRating = "Licence Rating is required";
      if (!form.industrySector) e.industrySector = "Industry Sector is required";
      if (form.yearEstablished) {
        const y = Number(form.yearEstablished);
        if (!/^\d{4}$/.test(String(form.yearEstablished)) || y < 1800 || y > CURRENT_YEAR) {
          e.yearEstablished = `Enter a valid year between 1800 and ${CURRENT_YEAR}`;
        }
      }
      if (form.website && !URL_REGEX.test(String(form.website).trim())) {
        e.website = "Enter a valid website (e.g. www.example.com)";
      }
    }
    if (s === 2) {
      if (!form.registeredAddress) e.registeredAddress = "Registered Address is required";
      if (!form.city) e.city = "City is required";
      if (!form.state) e.state = "State is required";
      if (!form.country) e.country = "Country is required";
      if (!form.postalCode) e.postalCode = "Postal Code is required";
    }
    if (s === 3) {
      if (!form.authorisingPhone) e.authorisingPhone = "Phone is required";
      else if (phoneValid.authorisingPhone === false) e.authorisingPhone = "Enter a valid phone number for the selected country";
      if (!form.authorisingEmail) e.authorisingEmail = "Email is required";
      else if (!emailRegex.test(form.authorisingEmail)) e.authorisingEmail = "Enter a valid email address";
      if (!form.keyContactName) e.keyContactName = "Key Contact Name is required";
      if (!form.keyContactPhone) e.keyContactPhone = "Phone is required";
      else if (phoneValid.keyContactPhone === false) e.keyContactPhone = "Enter a valid phone number for the selected country";
      if (!form.keyContactEmail) e.keyContactEmail = "Key Contact Email is required";
      else if (!emailRegex.test(form.keyContactEmail)) e.keyContactEmail = "Enter a valid email address";
    }
    if (s === 4) {
      if (form.hrEmail && !emailRegex.test(form.hrEmail)) e.hrEmail = "Enter a valid email address";
      if (form.hrPhone && phoneValid.hrPhone === false) e.hrPhone = "Enter a valid phone number for the selected country";
      if (form.cosAllocation && !/^\d+$/.test(String(form.cosAllocation))) {
        e.cosAllocation = "CoS allocation must be a whole number";
      }
      if (form.licenceIssueDate && form.licenceExpiryDate &&
          new Date(form.licenceExpiryDate) < new Date(form.licenceIssueDate)) {
        e.licenceExpiryDate = "Expiry date cannot be before the issue date";
      }
    }
    if (s === 5) {
      (form.shareholders || []).forEach((sh, i) => {
        if (sh.percentage !== "" && sh.percentage != null) {
          const p = Number(sh.percentage);
          if (Number.isNaN(p) || p < 0 || p > 100) {
            e[`shareholder_${i}`] = "Percentage must be between 0 and 100";
          }
        }
      });
    }
    if (s === 6) {
      if (form.billingEmail && !emailRegex.test(form.billingEmail)) e.billingEmail = "Enter a valid email address";
      if (form.billingPhone && phoneValid.billingPhone === false) e.billingPhone = "Enter a valid phone number for the selected country";
      if (form.outstandingBalance !== "" && form.outstandingBalance != null) {
        const n = Number(form.outstandingBalance);
        if (Number.isNaN(n) || n < 0) e.outstandingBalance = "Enter a valid amount";
      }
    }
    return e;
  };

  const validateStep = (s) => {
    const e = getStepErrors(s);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Validate every step (used on final submit) so issues on earlier steps can't
  // slip through. Returns the merged errors plus the first step that has any.
  const validateAll = () => {
    let merged = {};
    let firstInvalid = null;
    for (let s = 1; s <= steps.length; s += 1) {
      const e = getStepErrors(s);
      if (Object.keys(e).length && firstInvalid === null) firstInvalid = s;
      merged = { ...merged, ...e };
    }
    setErrors(merged);
    return { ok: Object.keys(merged).length === 0, firstInvalid };
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (field, file) => {
    setForm((prev) => ({ ...prev, [field]: file }));
  };

  const addLevel1User = () => {
    setForm((prev) => ({
      ...prev,
      level1Users: [...prev.level1Users, { name: '', phone: '', email: '' }],
    }));
  };

  const updateLevel1User = (index, field, value) => {
    const updated = [...form.level1Users];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, level1Users: updated }));
  };

  const removeLevel1User = (index) => {
    setForm((prev) => ({
      ...prev,
      level1Users: prev.level1Users.filter((_, i) => i !== index),
    }));
  };

  // Ownership Helpers
  const addShareholder = () => {
    setForm(prev => ({
      ...prev,
      shareholders: [...(prev.shareholders || []), { name: "", percentage: "" }]
    }));
  };

  const updateShareholder = (idx, field, val) => {
    const updated = [...(form.shareholders || [])];
    updated[idx][field] = val;
    setForm(prev => ({ ...prev, shareholders: updated }));
    // Mirror handleChange's clear-on-edit so a fixed percentage drops its red border.
    if (field === 'percentage' && errors[`shareholder_${idx}`]) {
      setErrors(prev => ({ ...prev, [`shareholder_${idx}`]: null }));
    }
  };

  const removeShareholder = (idx) => {
    setForm(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== idx)
    }));
  };

  const addDirector = () => {
    setForm(prev => ({
      ...prev,
      directors: [...(prev.directors || []), { name: "", position: "" }]
    }));
  };

  const updateDirector = (idx, field, val) => {
    const updated = [...(form.directors || [])];
    updated[idx][field] = val;
    setForm(prev => ({ ...prev, directors: updated }));
  };

  const removeDirector = (idx) => {
    setForm(prev => ({
      ...prev,
      directors: prev.directors.filter((_, i) => i !== idx)
    }));
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (event) => {
    event.preventDefault();
    const { ok, firstInvalid } = validateAll();
    if (!ok) {
      if (firstInvalid) setStep(firstInvalid);
      return;
    }
    if (onSubmit) {
      onSubmit({ ...form, isFullRegistration: true });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Company Name <span className="text-red-500">*</span></label>
                <input
                  value={form.companyName || ""}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className={`mt-2 w-full border ${errors.companyName ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter official registered name"
                />
                {errors.companyName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.companyName}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Trading Name</label>
                <input
                  value={form.tradingName || ""}
                  onChange={(e) => handleChange('tradingName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter trading name if different"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Company Registration Number <span className="text-red-500">*</span></label>
                <input
                  value={form.registrationNumber || ""}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  className={`mt-2 w-full border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter registration number"
                />
                {errors.registrationNumber && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.registrationNumber}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Sponsor Licence Number <span className="text-red-500">*</span></label>
                <input
                  value={form.sponsorLicenceNumber || ""}
                  onChange={(e) => handleChange('sponsorLicenceNumber', e.target.value)}
                  className={`mt-2 w-full border ${errors.sponsorLicenceNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter UKVI sponsor licence number"
                />
                {errors.sponsorLicenceNumber && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.sponsorLicenceNumber}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Rating <span className="text-red-500">*</span></label>
                <select
                  value={form.licenceRating || ""}
                  onChange={(e) => handleChange('licenceRating', e.target.value)}
                  className={`mt-2 w-full border ${errors.licenceRating ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                >
                  <option value="">Select rating</option>
                  <option>Gold</option>
                  <option>Silver</option>
                  <option>Bronze</option>
                </select>
                {errors.licenceRating && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.licenceRating}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Industry Sector <span className="text-red-500">*</span></label>
                <select
                  value={industrySectorOther ? 'Other' : (form.industrySector || "")}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIndustrySectorOther(true);
                      handleChange('industrySector', '');
                    } else {
                      setIndustrySectorOther(false);
                      handleChange('industrySector', e.target.value);
                    }
                  }}
                  className={`mt-2 w-full border ${errors.industrySector ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                >
                  <option value="">Select industry</option>
                  {PRESET_SECTORS.map(s => <option key={s}>{s}</option>)}
                  <option value="Other">Other</option>
                </select>
                {industrySectorOther && (
                  <input
                    value={form.industrySector || ""}
                    onChange={(e) => handleChange('industrySector', e.target.value)}
                    className={`mt-2 w-full border ${errors.industrySector ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                    placeholder="Type your industry sector"
                    autoFocus
                  />
                )}
                {errors.industrySector && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.industrySector}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Year Established</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.yearEstablished || ""}
                  onChange={(e) => handleChange('yearEstablished', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`mt-2 w-full border ${errors.yearEstablished ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="e.g. 2020"
                />
                {errors.yearEstablished && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.yearEstablished}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Company Website</label>
                <input
                  value={form.website || ""}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={`mt-2 w-full border ${errors.website ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="https://www.example.com"
                />
                {errors.website && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.website}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-700">Registered Address <span className="text-red-500">*</span></label>
              <textarea
                value={form.registeredAddress || ""}
                onChange={(e) => handleChange('registeredAddress', e.target.value)}
                className={`mt-2 w-full border ${errors.registeredAddress ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none`}
                placeholder="Enter official registered address"
                rows={3}
              />
              {errors.registeredAddress && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.registeredAddress}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Trading Address</label>
              <textarea
                value={form.tradingAddress || ""}
                onChange={(e) => handleChange('tradingAddress', e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                placeholder="Enter operational business address if different"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">City <span className="text-red-500">*</span></label>
                <input
                  value={form.city || ""}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`mt-2 w-full border ${errors.city ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter city"
                />
                {errors.city && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.city}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">State / Region <span className="text-red-500">*</span></label>
                <input
                  value={form.state || ""}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={`mt-2 w-full border ${errors.state ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter state or region"
                />
                {errors.state && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Country <span className="text-red-500">*</span></label>
                <select
                  value={form.country || ""}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className={`mt-2 w-full border ${errors.country ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                >
                  <option value="">Select country</option>
                  {/* Keep a previously saved, non-canonical value (e.g. free-typed
                      elsewhere) visible/selected instead of rendering blank. */}
                  {form.country && !COUNTRIES.includes(form.country) && (
                    <option value={form.country}>{form.country}</option>
                  )}
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.country}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Postal Code <span className="text-red-500">*</span></label>
                <input
                  value={form.postalCode || ""}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className={`mt-2 w-full border ${errors.postalCode ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter ZIP / postal code"
                />
                {errors.postalCode && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.postalCode}</p>}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Authorising Officer Name</label>
                <input
                  value={form.authorisingName || ""}
                  onChange={(e) => handleChange('authorisingName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block">Phone <span className="text-red-500">*</span></label>
                <PhoneInput
                  name="authorisingPhone"
                  value={form.authorisingPhone || ""}
                  onChange={(e) => handleChange('authorisingPhone', e.target.value)}
                  onValidityChange={(ok) => setPhoneValid(prev => ({ ...prev, authorisingPhone: ok }))}
                  error={errors.authorisingPhone || ""}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                  value={form.authorisingEmail || ""}
                  onChange={(e) => handleChange('authorisingEmail', e.target.value)}
                  className={`mt-2 w-full border ${errors.authorisingEmail ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter email address"
                />
                {errors.authorisingEmail && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.authorisingEmail}</p>}
              </div>
              <div className="lg:col-span-3">
                <label className="text-xs font-bold text-gray-700">Job Title</label>
                <input
                  value={form.authorisingJobTitle || ""}
                  onChange={(e) => handleChange('authorisingJobTitle', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter job title"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-black text-secondary mb-4">Key Contact</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-700">Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.keyContactName || ""}
                    onChange={(e) => handleChange('keyContactName', e.target.value)}
                    className={`mt-2 w-full border ${errors.keyContactName ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                    placeholder="Enter name"
                  />
                  {errors.keyContactName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.keyContactName}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block">Phone <span className="text-red-500">*</span></label>
                  <PhoneInput
                    name="keyContactPhone"
                    value={form.keyContactPhone || ""}
                    onChange={(e) => handleChange('keyContactPhone', e.target.value)}
                    onValidityChange={(ok) => setPhoneValid(prev => ({ ...prev, keyContactPhone: ok }))}
                    error={errors.keyContactPhone || ""}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                  <input
                    value={form.keyContactEmail || ""}
                    onChange={(e) => handleChange('keyContactEmail', e.target.value)}
                    className={`mt-2 w-full border ${errors.keyContactEmail ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                    placeholder="Enter email address"
                  />
                  {errors.keyContactEmail && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.keyContactEmail}</p>}
                </div>
                <div className="lg:col-span-3">
                  <label className="text-xs font-bold text-gray-700">Department</label>
                  <input
                    value={form.keyContactDepartment || ""}
                    onChange={(e) => handleChange('keyContactDepartment', e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="Enter department"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-black text-secondary mb-4">Level 1 Users</h3>
              <div className="space-y-4">
                {(form.level1Users || []).map((user, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-black text-gray-700 mb-3">User {index + 1}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">Name</label>
                        <input
                          value={user.name || ""}
                          onChange={(e) => updateLevel1User(index, 'name', e.target.value)}
                          className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-2 block">Phone</label>
                        <PhoneInput
                          name={`level1UserPhone_${index}`}
                          value={user.phone || ""}
                          onChange={(e) => updateLevel1User(index, 'phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">Email</label>
                        <input
                          value={user.email || ""}
                          onChange={(e) => updateLevel1User(index, 'email', e.target.value)}
                          className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLevel1User(index)}
                      className="mt-4 text-red-400 hover:text-red-600 self-end transition-colors"
                      title="Remove User"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLevel1User}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <Plus size={16} />
                Add Level 1 User
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">HR Manager Name</label>
                <input
                  value={form.hrName || ""}
                  onChange={(e) => handleChange('hrName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter HR manager name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">HR Manager Email</label>
                <input
                  value={form.hrEmail || ""}
                  onChange={(e) => handleChange('hrEmail', e.target.value)}
                  className={`mt-2 w-full border ${errors.hrEmail ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter HR email address"
                />
                {errors.hrEmail && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.hrEmail}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block">HR Manager Phone</label>
                <PhoneInput
                  name="hrPhone"
                  value={form.hrPhone || ""}
                  onChange={(e) => handleChange('hrPhone', e.target.value)}
                  onValidityChange={(ok) => setPhoneValid(prev => ({ ...prev, hrPhone: ok }))}
                  error={errors.hrPhone || ""}
                  placeholder="Enter HR phone number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">HR Manager Job Title</label>
                <input
                  value={form.hrJobTitle || ""}
                  onChange={(e) => handleChange('hrJobTitle', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter job title"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Issue Date</label>
                <DatePicker
                  name="licenceIssueDate"
                  value={form.licenceIssueDate || ""}
                  onChange={(e) => handleChange('licenceIssueDate', e.target.value)}
                  placeholder="Select date"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Expiry Date</label>
                <DatePicker
                  name="licenceExpiryDate"
                  value={form.licenceExpiryDate || ""}
                  onChange={(e) => handleChange('licenceExpiryDate', e.target.value)}
                  min={form.licenceIssueDate || undefined}
                  error={errors.licenceExpiryDate || ""}
                  placeholder="Select date"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">CoS Allocation</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.cosAllocation || ""}
                  onChange={(e) => handleChange('cosAllocation', e.target.value.replace(/\D/g, ''))}
                  className={`mt-2 w-full border ${errors.cosAllocation ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                  placeholder="Enter number of CoS"
                />
                {errors.cosAllocation && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.cosAllocation}</p>}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Ownership Type</label>
              <input
                value={form.ownershipType || ""}
                onChange={(e) => handleChange('ownershipType', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                placeholder="Enter ownership type (e.g. Private Limited)"
              />
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary">Shareholders</h3>
                <button
                  type="button"
                  onClick={addShareholder}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Add Shareholder
                </button>
              </div>
              <div className="space-y-4">
                {(form.shareholders || []).map((s, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        placeholder="Name"
                        value={s.name || ""}
                        onChange={(e) => updateShareholder(idx, "name", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white"
                      />
                      <div>
                        <input
                          placeholder="Percentage (e.g. 50)"
                          inputMode="decimal"
                          value={s.percentage || ""}
                          onChange={(e) => updateShareholder(idx, "percentage", e.target.value.replace(/[^\d.]/g, ''))}
                          className={`w-full border ${errors[`shareholder_${idx}`] ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white`}
                        />
                        {errors[`shareholder_${idx}`] && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors[`shareholder_${idx}`]}</p>}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeShareholder(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-secondary">Directors</h3>
                <button
                  type="button"
                  onClick={addDirector}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Add Director
                </button>
              </div>
              <div className="space-y-4">
                {(form.directors || []).map((d, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        placeholder="Name"
                        value={d.name || ""}
                        onChange={(e) => updateDirector(idx, "name", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white"
                      />
                      <input
                        placeholder="Position"
                        value={d.position || ""}
                        onChange={(e) => updateDirector(idx, "position", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary bg-white"
                      />
                    </div>
                    <button type="button" onClick={() => removeDirector(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3 mb-4 text-gray-700">
                  <FileText size={20} />
                  <span className="font-black">Business Documents</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Sponsor Licence Approval Letter', field: 'sponsorLetter' },
                    { label: 'Insurance Certificate', field: 'insuranceCertificate' },
                    { label: 'HR Policies', field: 'hrPolicies' },
                    { label: 'Organisational Chart', field: 'organisationalChart' },
                    { label: 'Recruitment Process Documents', field: 'recruitmentDocs' },
                  ].map((item) => (
                    <div key={item.field} className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">{item.label}</label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(item.field, e.target.files[0] || null)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 text-sm font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3 mb-4 text-gray-700">
                  <CreditCard size={20} />
                  <span className="font-black">Billing Contact</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Billing Contact Name</label>
                    <input
                      value={form.billingName || ""}
                      onChange={(e) => handleChange('billingName', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Billing Email</label>
                    <input
                      value={form.billingEmail || ""}
                      onChange={(e) => handleChange('billingEmail', e.target.value)}
                      className={`mt-2 w-full border ${errors.billingEmail ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                      placeholder="Enter email"
                    />
                    {errors.billingEmail && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.billingEmail}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2 block">Billing Phone</label>
                    <PhoneInput
                      name="billingPhone"
                      value={form.billingPhone || ""}
                      onChange={(e) => handleChange('billingPhone', e.target.value)}
                      onValidityChange={(ok) => setPhoneValid(prev => ({ ...prev, billingPhone: ok }))}
                      error={errors.billingPhone || ""}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Outstanding Balance</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.outstandingBalance || ""}
                      onChange={(e) => handleChange('outstandingBalance', e.target.value.replace(/[^\d.]/g, ''))}
                      className={`mt-2 w-full border ${errors.outstandingBalance ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40`}
                      placeholder="Enter amount"
                    />
                    {errors.outstandingBalance && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.outstandingBalance}</p>}
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-gray-700">Payment Terms</label>
                    <select
                      value={form.paymentTerms || ""}
                      onChange={(e) => handleChange('paymentTerms', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    >
                      <option value="">Select terms</option>
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>Due on receipt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={embedded ? "p-4 sm:p-6" : "mx-auto max-w-6xl p-6"}>
      <div className={embedded ? "" : "rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"}>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {!embedded && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-secondary flex items-center gap-3">
                <Building2 size={28} className="text-primary shrink-0" />
                Business Registration
              </h1>
              <p className="mt-2 text-sm font-bold text-primary">Complete the registration in a few simple steps.</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((item) => (
              <div
                key={item.id}
                className={`rounded-full border px-4 py-2 text-xs font-black ${
                  step === item.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center gap-3 text-gray-700 mb-4">
              <ClipboardList size={20} />
              <h2 className="text-lg font-black">Step {step}: {steps.find((item) => item.id === step)?.label}</h2>
            </div>
            {renderStepContent()}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 px-6 py-3 text-xs font-black shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <div className="flex gap-3">
              {step < steps.length && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-black text-white shadow-sm transition hover:bg-primary-dark"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              )}
              {step === steps.length && (
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-dark px-6 py-3 text-xs font-black text-white shadow-sm transition hover:bg-primary"
                >
                  Submit Registration
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegistration;