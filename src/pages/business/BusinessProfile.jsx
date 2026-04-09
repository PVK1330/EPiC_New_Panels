import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";

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
      case "Approved":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "Pending":
        return <Clock size={16} className="text-amber-600" />;
      case "Rejected":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-emerald-700 bg-emerald-100";
      case "Pending":
        return "text-amber-700 bg-amber-100";
      case "Rejected":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Business Profile
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage your company information and change requests.
        </p>
      </motion.div>

      {/* Company Information Section */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            Company Information
          </h2>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
            onClick={() => navigate("/business/Businessregistration")}
          >
            Add Business Registration
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter company address"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={companyInfo.registrationNumber}
              onChange={(e) => handleCompanyInfoChange('registrationNumber', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter registration number"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Registered Address
            </label>
            <input
              type="text"
              value={companyInfo.registeredAddress}
              onChange={(e) => handleCompanyInfoChange('registeredAddress', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter registered address"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={companyInfo.city}
              onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Pincode
            </label>
            <input
              type="text"
              value={companyInfo.pincode}
              onChange={(e) => handleCompanyInfoChange('pincode', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
              placeholder="Enter pincode"
            />
          </div>
        </div>
      </motion.div>

      {/* Change Request Section */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
          <MapPin size={24} className="text-primary" />
          Change Requests
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Change Address</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Description</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Submitted Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Deadline</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {changeRequestsData.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-bold text-gray-600 max-w-xs truncate">
                    {request.changeAddress}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600 max-w-xs truncate">
                    {request.description}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">
                    {request.submittedDate}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">
                    {request.submittedDeadline}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${getStatusColor(request.status)}`}>
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
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSaveChanges}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessProfile;