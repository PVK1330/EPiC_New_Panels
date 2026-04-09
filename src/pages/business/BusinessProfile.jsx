import React, { useState, } from 'react';
import { Building2, MapPin, FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {useNavigate} from "react-router-dom";
const BusinessProfile = () => {
    const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState({
    address: '123 Business Street',
    registrationNumber: 'REG123456789',
    registeredAddress: '456 Corporate Avenue',
    city: 'London',
    pincode: 'SW1A 1AA'
  });

  const changeRequestsData = [
    {
      id: 1,
      changeAddress: '789 New Business Road, Manchester',
      description: 'Update Register Address',
      submittedDeadline: '2026-05-15',
      status: 'Pending',
      submittedDate: '2026-04-01'
    },
  ];

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    // Handle save logic here
    console.log('Saving changes...');
  };

  const handleCancel = () => {
    // Handle cancel logic here
    console.log('Cancelling changes...');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'Rejected':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-green-700 bg-green-100';
      case 'Pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'Rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
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
          <Building2 className="text-blue-600" size={36} />
          Business Profile
        </h1>
        <p className="text-slate-600 font-medium text-sm mt-1">
          Manage your company information and change requests
        </p>
      </motion.div>

      {/* Company Information Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        variants={cardVariants}
      >
        <div className='flex justify-between'>
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Company Information
        </h2>

        <button className='bg-red-800 text-white rounded-xl px-2 transition-transform hover:scale-105 font-medium' onClick={()=> navigate("/business/Businessregistration")}>Add Business Registration </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              placeholder="Enter company address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={companyInfo.registrationNumber}
              onChange={(e) => handleCompanyInfoChange('registrationNumber', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              placeholder="Enter registration number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Registered Address
            </label>
            <input
              type="text"
              value={companyInfo.registeredAddress}
              onChange={(e) => handleCompanyInfoChange('registeredAddress', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              placeholder="Enter registered address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={companyInfo.city}
              onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pincode
            </label>
            <input
              type="text"
              value={companyInfo.pincode}
              onChange={(e) => handleCompanyInfoChange('pincode', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              placeholder="Enter pincode"
            />
          </div>
        </div>
      </motion.div>

      {/* Change Request Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        variants={cardVariants}
      >
        <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <MapPin size={24} className="text-blue-600" />
          Change Requests
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Change Address</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {changeRequestsData.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-slate-900 max-w-xs truncate">
                    {request.changeAddress}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {request.description}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {request.submittedDate}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {request.submittedDeadline}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-slate-200 mt-6">
          <button
            onClick={handleSaveChanges}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BusinessProfile;