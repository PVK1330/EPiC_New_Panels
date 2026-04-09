import React, { useState } from 'react';
import { User, Phone, Mail, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessPersonnel = () => {
  const [authorisingOfficer, setAuthorisingOfficer] = useState({
    name: 'John Smith',
    phone: '+44 20 7123 4567',
    email: 'john.smith@company.com'
  });

  const [keyContact, setKeyContact] = useState({
    name: 'Sarah Johnson',
    phone: '+44 20 7987 6543',
    email: 'sarah.johnson@company.com'
  });

  const [level1Users, setLevel1Users] = useState([
    {
      name: 'Michael Brown',
      phone: '+44 20 7456 1234',
      email: 'michael.brown@company.com'
    },
    {
      name: 'Emma Davis',
      phone: '+44 20 7234 5678',
      email: 'emma.davis@company.com'
    }
  ]);

  const addLevel1User = () => {
    setLevel1Users([...level1Users, { name: '', phone: '', email: '' }]);
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
        <h1 className="text-4xl font-black text-blue-900 tracking-tight flex items-center gap-3">
          <Users className="text-blue-600" size={36} />
          Key Personnel
        </h1>
        <p className="text-slate-600 font-medium text-sm mt-1">
          Manage your company's key personnel and contact information
        </p>
      </motion.div>

      {/* Form Container */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        variants={cardVariants}
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-900 flex items-center">
          <User className="mr-2 text-blue-600" />
          Key Personnel Details
        </h2>

        <div className="space-y-8">
          {/* Authorising Officer Section */}
          <motion.div
            className="border-b border-slate-200 pb-6"
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Authorising Officer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <User className="mr-2 w-4 h-4 text-slate-500" />
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={authorisingOfficer.name}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="mr-2 w-4 h-4 text-slate-500" />
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={authorisingOfficer.phone}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="mr-2 w-4 h-4 text-slate-500" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={authorisingOfficer.email}
                  onChange={(e) => setAuthorisingOfficer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </motion.div>

          {/* Key Contact Section */}
          <motion.div
            className="border-b border-slate-200 pb-6"
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Key Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <User className="mr-2 w-4 h-4 text-slate-500" />
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={keyContact.name}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="mr-2 w-4 h-4 text-slate-500" />
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={keyContact.phone}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="mr-2 w-4 h-4 text-slate-500" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={keyContact.email}
                  onChange={(e) => setKeyContact(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </motion.div>

          {/* Level 1 Users Section */}
          <motion.div variants={cardVariants}>
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Level 1 Users</h3>
            {level1Users.map((user, index) => (
              <motion.div
                key={index}
                className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50"
                variants={cardVariants}
              >
                <h4 className="text-md font-medium mb-3 text-slate-600">User {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <User className="mr-2 w-4 h-4 text-slate-500" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => updateLevel1User(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <Phone className="mr-2 w-4 h-4 text-slate-500" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={user.phone}
                      onChange={(e) => updateLevel1User(index, 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <Mail className="mr-2 w-4 h-4 text-slate-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => updateLevel1User(index, 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BusinessPersonnel;