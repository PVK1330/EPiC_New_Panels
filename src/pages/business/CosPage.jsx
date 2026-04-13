import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Hash,
  ShieldCheck,
  Star,
  Calendar,
  FileText,
  ShieldAlert,
  RefreshCw,
  Clock,
  FilesIcon,
  Pencil,
  Trash2,
  X,
  Search,
  Plus,
  Download,
} from "lucide-react";

const COSPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    visaType: '',
    requestedAmount: '',
    reason: '',
  });

  // Dummy Data
  const stats = {
    total: 120,
    used: 75,
    remaining: 45,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const progress = (stats.used / stats.total) * 100;
  const cosList = [
    {
      visaType: "Skilled Worker Visa",
      allocated: 50,
      used: 30,
      remaining: 20,
      expiryDate: "2025-12-31",
      allocationDate: "2025-01-01",
      lastUsed: "2025-04-05",
    },
    // {
    //   visaType: "Skilled Worker Visa",
    //   allocated: 30,
    //   used: 20,
    //   remaining: 10,
    //   expiryDate: "2025-08-31",
    //   allocationDate: "2025-02-15",
    //   lastUsed: "2025-04-02",
    // },
    // {
    //   visaType: "Skilled Worker Visa",
    //   allocated: 40,
    //   used: 25,
    //   remaining: 15,
    //   expiryDate: "2025-11-30",
    //   allocationDate: "2025-01-20",
    //   lastUsed: "2025-04-08",
    // },
  ];

  // Utility to generate initials
  const getInitials = (text) => {
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Random background colors
  const avatarColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  return (
    <div className="space-y-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          CoS Management
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage your Certificate of Sponsorship allocations and requests.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <FilesIcon size={20} className="text-primary" />
            <span className="font-black">Total CoS Allocated</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.total}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <FileText size={20} className="text-emerald-600" />
            <span className="font-black">CoS Used</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
            {stats.used}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <FilesIcon size={20} className="text-amber-500" />
            <span className="font-black">CoS Remaining</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.remaining}</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
          <Hash size={24} className="text-primary" />
          CoS Usage Progress
        </h2>

        <div className="w-full bg-gray-200 h-3 rounded-full">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs font-bold text-gray-600 mt-2">
          {stats.used} of {stats.total} CoS used ({progress.toFixed(1)}%)
        </p>
      </motion.div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-secondary flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            CoS Allocation
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search allocations..."
                className="w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
            >
              <Plus size={16} />
              Request CoS
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Allocated</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Used</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Remaining</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Expiry Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Last Used</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {cosList.map((item, index) => {
                const initials = getInitials(item.visaType);
                const bgColor = avatarColors[index % avatarColors.length];

                const status =
                  item.remaining === 0
                    ? "Exhausted"
                    : item.remaining < 10
                    ? "Low"
                    : "Active";

                const statusStyle =
                  status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "Low"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700";

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 flex items-center justify-center text-white rounded-2xl ${bgColor}`}
                      >
                        {initials}
                      </div>
                      <span className="text-sm font-black text-secondary">
                        {item.visaType}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-gray-700">{item.allocated}</td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-700">{item.used}</td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-700">{item.remaining}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{item.expiryDate}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-600">{item.lastUsed}</td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${statusStyle}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center flex justify-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-secondary transition">
                        <Pencil size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-secondary transition">
                        <Download size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* CoS Request Modal */}
      {showRequestModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-secondary">Request Additional CoS</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2">Visa Type *</label>
                  <select
                    value={requestData.visaType}
                    onChange={(e) => setRequestData({ ...requestData, visaType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                  >
                    <option value="">Select visa type</option>
                    <option>Skilled Worker Visa</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2">Requested Amount *</label>
                  <input
                    type="number"
                    value={requestData.requestedAmount}
                    onChange={(e) => setRequestData({ ...requestData, requestedAmount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="Enter requested amount"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2">Reason for Request *</label>
                  <textarea
                    value={requestData.reason}
                    onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                    placeholder="Explain why you need additional CoS"
                    rows={4}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      console.log('Submitting CoS request:', requestData);
                      setShowRequestModal(false);
                    }}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default COSPage;


