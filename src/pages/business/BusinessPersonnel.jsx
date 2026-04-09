import React, { useState } from 'react';
import { User, Phone, Mail, Plus, Users, Briefcase, Building2, Trash2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessPersonnel = () => {
  const [authorisingOfficer, setAuthorisingOfficer] = useState({
    name: 'John Smith',
    phone: '+44 20 7123 4567',
    email: 'john.smith@company.com',
    jobTitle: ''
  });

  const [keyContact, setKeyContact] = useState({
    name: 'Sarah Johnson',
    phone: '+44 20 7987 6543',
    email: 'sarah.johnson@company.com',
    department: ''
  });

  const [level1Users, setLevel1Users] = useState([
    {
      name: 'Michael Brown',
      phone: '+44 20 7456 1234',
      email: 'michael.brown@company.com',
      jobTitle: 'HR Manager',
      department: 'Human Resources'
    },
    {
      name: 'Emma Davis',
      phone: '+44 20 7234 5678',
      email: 'emma.davis@company.com',
      jobTitle: 'Compliance Officer',
      department: 'Compliance'
    }
  ]);

  const [hrManager, setHrManager] = useState({
    name: 'David Wilson',
    phone: '+44 20 7890 1234',
    email: 'david.wilson@company.com',
    jobTitle: 'HR Director'
  });

  const addLevel1User = () => {
    setLevel1Users([...level1Users, { name: '', phone: '', email: '', jobTitle: '', department: '' }]);
  };

  const removeLevel1User = (index) => {
    const updatedUsers = level1Users.filter((_, i) => i !== index);
    setLevel1Users(updatedUsers);
  };

  const handleSave = () => {
    console.log('Saving personnel data:', { authorisingOfficer, keyContact, level1Users, hrManager });
  };

  const handleCancel = () => {
    console.log('Cancelling changes');
  };

  const updateLevel1User = (index, field, value) => {
    const updatedUsers = [...level1Users];
    updatedUsers[index][field] = value;
    setLevel1Users(updatedUsers);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <Users className="text-primary" size={36} />
          Key Personnel
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage your company's key personnel and contact information for UKVI sponsor licence compliance
        </p>
      </motion.div>

      {/* Form Container */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        variants={cardVariants}
      >
        <h2 className="text-2xl font-black mb-6 text-secondary flex items-center">
          <User className="mr-2 text-primary" />
          Key Personnel Details
        </h2>

        <div className="space-y-8">
          {/* Authorising Officer Section */}
          <motion.div
            className="border-b border-gray-200 pb-6"
            variants={cardVariants}
          >
            <h3 className="text-lg font-black mb-4 text-secondary">Authorising Officer</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={authorisingOfficer.name}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={authorisingOfficer.phone}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={authorisingOfficer.email}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={authorisingOfficer.jobTitle || ''}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter job title"
                />
              </div>
            </div>
          </motion.div>

          {/* Key Contact Section */}
          <motion.div
            className="border-b border-gray-200 pb-6"
            variants={cardVariants}
          >
            <h3 className="text-lg font-black mb-4 text-secondary">Key Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={keyContact.name}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={keyContact.phone}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={keyContact.email}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={keyContact.department || ''}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter department"
                />
              </div>
            </div>
          </motion.div>

          {/* HR Manager Section */}
          <motion.div
            className="border-b border-gray-200 pb-6"
            variants={cardVariants}
          >
            <h3 className="text-lg font-black mb-4 text-secondary flex items-center gap-2">
              <Briefcase size={20} className="text-primary" />
              HR Manager
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={hrManager.name}
                  onChange={(e) => setHrManager(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={hrManager.phone}
                  onChange={(e) => setHrManager(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={hrManager.email}
                  onChange={(e) => setHrManager(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  value={hrManager.jobTitle}
                  onChange={(e) => setHrManager(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  placeholder="Enter job title"
                />
              </div>
            </div>
          </motion.div>

          {/* Level 1 Users Section */}
          <motion.div variants={cardVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-secondary flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Level 1 Users (SMS Access)
              </h3>
              <button
                type="button"
                onClick={addLevel1User}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <Plus size={16} />
                Add User
              </button>
            </div>
            {level1Users.map((user, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50"
                variants={cardVariants}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black text-secondary">User {index + 1}</h4>
                  {level1Users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLevel1User(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => updateLevel1User(index, 'name', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={user.phone}
                      onChange={(e) => updateLevel1User(index, 'phone', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => updateLevel1User(index, 'email', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={user.jobTitle}
                      onChange={(e) => updateLevel1User(index, 'jobTitle', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={user.department}
                      onChange={(e) => updateLevel1User(index, 'department', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-black rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/15 flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BusinessPersonnel;