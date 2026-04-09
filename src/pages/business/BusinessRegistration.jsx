import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

const BusinessRegistration = () => {
  const [step, setStep] = useState(1);
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

    keyContactName: '',
    keyContactPhone: '',
    keyContactEmail: '',

    level1Users: [
      { name: 'Michael Brown', phone: '+44 20 7456 1234', email: 'michael.brown@company.com' },
    ],

    hrName: '',
    hrEmail: '',
    hrPhone: '',
    licenceIssueDate: '',
    licenceExpiryDate: '',
    cosAllocation: '',
    licenceStatus: '',

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

  const steps = [
    { id: 1, label: 'Company Info' },
    { id: 2, label: 'Business Address' },
    { id: 3, label: 'Key Personnel' },
    { id: 4, label: 'HR & Sponsor' },
    { id: 5, label: 'Documents & Billing' },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Registration submitted', form);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Company Name *</label>
                <input
                  value={form.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter official registered name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Trading Name</label>
                <input
                  value={form.tradingName}
                  onChange={(e) => handleChange('tradingName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter trading name if different"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Company Registration Number *</label>
                <input
                  value={form.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter registration number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Sponsor Licence Number *</label>
                <input
                  value={form.sponsorLicenceNumber}
                  onChange={(e) => handleChange('sponsorLicenceNumber', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter UKVI sponsor licence number"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Rating *</label>
                <select
                  value={form.licenceRating}
                  onChange={(e) => handleChange('licenceRating', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                >
                  <option value="">Select rating</option>
                  <option>Gold</option>
                  <option>Silver</option>
                  <option>Bronze</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Industry Sector *</label>
                <select
                  value={form.industrySector}
                  onChange={(e) => handleChange('industrySector', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                >
                  <option value="">Select industry</option>
                  <option>Information Technology</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Logistics</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Year Established</label>
                <input
                  value={form.yearEstablished}
                  onChange={(e) => handleChange('yearEstablished', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="e.g. 2020"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Company Website</label>
                <input
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-700">Registered Address *</label>
              <textarea
                value={form.registeredAddress}
                onChange={(e) => handleChange('registeredAddress', e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                placeholder="Enter official registered address"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Trading Address</label>
              <textarea
                value={form.tradingAddress}
                onChange={(e) => handleChange('tradingAddress', e.target.value)}
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                placeholder="Enter operational business address if different"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">State / Region *</label>
                <input
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter state or region"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Country *</label>
                <select
                  value={form.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                >
                  <option value="">Select country</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>India</option>
                  <option>Canada</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Postal Code *</label>
                <input
                  value={form.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter ZIP / postal code"
                />
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
                  value={form.authorisingName}
                  onChange={(e) => handleChange('authorisingName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Phone *</label>
                <input
                  value={form.authorisingPhone}
                  onChange={(e) => handleChange('authorisingPhone', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Email *</label>
                <input
                  value={form.authorisingEmail}
                  onChange={(e) => handleChange('authorisingEmail', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-black text-secondary mb-4">Key Contact</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-700">Name *</label>
                  <input
                    value={form.keyContactName}
                    onChange={(e) => handleChange('keyContactName', e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Phone *</label>
                  <input
                    value={form.keyContactPhone}
                    onChange={(e) => handleChange('keyContactPhone', e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Email *</label>
                  <input
                    value={form.keyContactEmail}
                    onChange={(e) => handleChange('keyContactEmail', e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-black text-secondary mb-4">Level 1 Users</h3>
              <div className="space-y-4">
                {form.level1Users.map((user, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-black text-gray-700 mb-3">User {index + 1}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">Name</label>
                        <input
                          value={user.name}
                          onChange={(e) => updateLevel1User(index, 'name', e.target.value)}
                          className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">Phone</label>
                        <input
                          value={user.phone}
                          onChange={(e) => updateLevel1User(index, 'phone', e.target.value)}
                          className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">Email</label>
                        <input
                          value={user.email}
                          onChange={(e) => updateLevel1User(index, 'email', e.target.value)}
                          className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
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
                  value={form.hrName}
                  onChange={(e) => handleChange('hrName', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter HR manager name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">HR Manager Email</label>
                <input
                  value={form.hrEmail}
                  onChange={(e) => handleChange('hrEmail', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter HR email address"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">HR Manager Phone</label>
                <input
                  value={form.hrPhone}
                  onChange={(e) => handleChange('hrPhone', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter HR phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Issue Date</label>
                <input
                  type="date"
                  value={form.licenceIssueDate}
                  onChange={(e) => handleChange('licenceIssueDate', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Expiry Date</label>
                <input
                  type="date"
                  value={form.licenceExpiryDate}
                  onChange={(e) => handleChange('licenceExpiryDate', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">CoS Allocation</label>
                <input
                  value={form.cosAllocation}
                  onChange={(e) => handleChange('cosAllocation', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter number of CoS"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Licence Status</label>
                <select
                  value={form.licenceStatus}
                  onChange={(e) => handleChange('licenceStatus', e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                >
                  <option value="">Select status</option>
                  <option>Active</option>
                  <option>Suspended</option>
                  <option>Expired</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 5:
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
                      value={form.billingName}
                      onChange={(e) => handleChange('billingName', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Billing Email</label>
                    <input
                      value={form.billingEmail}
                      onChange={(e) => handleChange('billingEmail', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Billing Phone</label>
                    <input
                      value={form.billingPhone}
                      onChange={(e) => handleChange('billingPhone', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Outstanding Balance</label>
                    <input
                      value={form.outstandingBalance}
                      onChange={(e) => handleChange('outstandingBalance', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-gray-700">Payment Terms</label>
                    <select
                      value={form.paymentTerms}
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
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-secondary flex items-center gap-3">
              <Building2 size={32} className="text-primary" />
              Business Registration
            </h1>
            <p className="mt-2 text-sm font-bold text-primary">Complete the registration in a few simple steps.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-8">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-400 text-gray px-6 py-3 text-xs font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
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