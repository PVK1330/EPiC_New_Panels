import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCosSummary, requestCosAllocation, getCosRequests, updateCosRequest, deleteCosRequest } from "../../services/licenceApi";
import toast from "react-hot-toast";
import { fetchVisaTypeOptions } from "../../services/visaTypeApi";
import useDownloads from "../../hooks/useDownloads";
import { formatDate } from "../../utils/datetime";
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
  const [editingRequest, setEditingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'history'

  const [stats, setStats] = useState({ total: 0, used: 0, remaining: 0 });
  const [cosList, setCosList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visaTypeOptions, setVisaTypeOptions] = useState([]);

  const { downloadCosSummaryExcel, downloadCosRequestsExcel, busy } = useDownloads();

  useEffect(() => {
    fetchCosSummary();
    fetchRequests();
    loadVisaTypes();
  }, []);

  const loadVisaTypes = async () => {
    try {
      const options = await fetchVisaTypeOptions();
      setVisaTypeOptions(options);
    } catch (err) {
      console.error("Failed to load visa types:", err);
    }
  };

  const fetchCosSummary = async () => {
    try {
      setLoading(true);
      const res = await getCosSummary();
      const payload = res.data?.data || {};
      setStats(payload.summary || { total: 0, used: 0, remaining: 0 });
      setCosList(payload.byVisaType || []);
    } catch (err) {
      console.error("Summary error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await getCosRequests();
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error("Requests error:", err);
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setRequestData({
      visaType: request.licenceType,
      requestedAmount: request.cosAllocation,
      reason: request.reason.replace("CoS Request: ", "").replace("CoS Allocation Request: ", ""),
    });
    setShowRequestModal(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await deleteCosRequest(id);
      toast.success("Request deleted");
      fetchRequests();
      fetchCosSummary();
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  const handleDownload = async () => {
    const result = activeTab === 'summary' 
      ? await downloadCosSummaryExcel()
      : await downloadCosRequestsExcel();
    
    if (!result.ok) {
      toast.error(result.message || 'Export failed');
    }
  };

  const handleDownloadRow = async () => {
    const result = await downloadCosSummaryExcel();
    if (!result.ok) {
      toast.error(result.message || 'Export failed');
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

  const progress = stats.total > 0 ? (stats.used / stats.total) * 100 : 0;
  const filteredCosList = cosList.filter((item) =>
    (item.visaType || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {loading && (
          <p className="text-xs font-bold text-gray-400 mt-2">Loading CoS summary…</p>
        )}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-secondary flex items-center gap-2">
            <Hash size={24} className="text-primary" />
            CoS Usage Progress
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'summary' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500'}`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500'}`}
            >
              Requests History
            </button>
          </div>
        </div>

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
            {activeTab === 'summary' ? 'Active Allocations' : 'Request History'}
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
            <button
              onClick={handleDownload}
              disabled={busy.cosSummaryExcel || busy.cosRequestsExcel}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition disabled:opacity-50"
              title="Download Report"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => {
                setEditingRequest(null);
                setRequestData({ visaType: '', requestedAmount: '', reason: '' });
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
            >
              <Plus size={16} />
              Request CoS
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'summary' ? (
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
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCosList.map((item, index) => {
                  const initials = getInitials(item.visaType || "?");
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

                  const exp =
                    item.expiryDate instanceof Date
                      ? formatDate(item.expiryDate)
                      : item.expiryDate || "N/A";
                  const lastUsedDisp =
                    item.lastUsed instanceof Date
                      ? formatDate(item.lastUsed)
                      : item.lastUsed || "—";

                  return (
                    <tr
                      key={`${item.visaType}-${index}`}
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
                      <td className="px-4 py-4 text-xs font-bold text-gray-600">{exp}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-600">{lastUsedDisp}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${statusStyle}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2 justify-center">
                        <button 
                          onClick={() => {
                            setEditingRequest(null);
                            setRequestData({ visaType: item.visaType, requestedAmount: '', reason: '' });
                            setShowRequestModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition"
                          title="Request More Slots"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={handleDownloadRow}
                          disabled={busy.cosSummaryExcel}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition disabled:opacity-50"
                          title="Download Report"
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          className="p-1.5 rounded-lg text-gray-200 cursor-not-allowed transition"
                          title="Approved allocations cannot be deleted"
                          disabled
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Request ID</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Requested</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests
                  .filter(r => r.licenceType.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-xs font-black text-secondary">#REQ-{r.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-700">{r.licenceType}</td>
                    <td className="px-4 py-4 text-sm font-black text-primary">{r.cosAllocation} Slots</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                        r.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                        r.status === 'Under Review' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-4 flex gap-2">
                      {['Pending', 'Under Review'].includes(r.status) && (
                        <>
                          <button 
                            onClick={() => handleEditRequest(r)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(r.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                <h2 className="text-2xl font-black text-secondary">
                  {editingRequest ? "Edit CoS Request" : "Request Additional CoS"}
                </h2>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setEditingRequest(null);
                  }}
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
                    {visaTypeOptions.map((visa) => (
                      <option key={visa.id} value={visa.name}>
                        {visa.name}
                      </option>
                    ))}
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
                    type="button"
                    disabled={submitting}
                    onClick={async () => {
                      if (!requestData.visaType || !requestData.requestedAmount || !requestData.reason) {
                        toast.error("All fields required");
                        return;
                      }
                      try {
                        setSubmitting(true);
                        if (editingRequest) {
                          await updateCosRequest(editingRequest.id, requestData);
                          toast.success("CoS request updated");
                        } else {
                          await requestCosAllocation(requestData);
                          toast.success("CoS request submitted");
                        }
                        setShowRequestModal(false);
                        setEditingRequest(null);
                        setRequestData({ visaType: "", requestedAmount: "", reason: "" });
                        fetchCosSummary();
                        fetchRequests();
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Operation failed");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition disabled:opacity-60"
                  >
                    {submitting ? "Processing…" : editingRequest ? "Update Request" : "Submit Request"}
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


