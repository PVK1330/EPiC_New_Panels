import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getCosSummary, requestCosAllocation, getCosRequests, updateCosRequest, deleteCosRequest } from "../../services/licenceApi";
import toast from "react-hot-toast";
import { fetchVisaTypeOptions } from "../../services/visaTypeApi";
import useDownloads from "../../hooks/useDownloads";
import { formatDate } from "../../utils/datetime";
import useSponsorLicence from "../../hooks/useSponsorLicence";
import LicenceGateBanner from "../../components/business/LicenceGateBanner";
import Pagination from "../../components/common/Pagination";
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
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    visaType: '',
    requestedAmount: '',
    reason: '',
  });
  const [editingRequest, setEditingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'history' ? 'history' : 'summary'
  );

  const [stats, setStats] = useState({ total: 0, used: 0, remaining: 0 });
  const [cosList, setCosList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visaTypeOptions, setVisaTypeOptions] = useState([]);

  const { downloadCosSummaryExcel, downloadCosRequestsExcel, busy } = useDownloads();
  const { ready: licenceReady, licenceStatus, canRequestCos } = useSponsorLicence();
  const cosBlocked = licenceReady && !canRequestCos;

  useEffect(() => {
    fetchCosSummary();
    loadVisaTypes();
  }, []);

  // Request History is server-side paginated — re-fetch whenever the page changes.
  useEffect(() => {
    fetchRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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

  const fetchRequests = async (targetPage = page) => {
    try {
      const res = await getCosRequests({ page: targetPage, limit: pagination.limit });
      setRequests(res.data?.data || []);
      const meta = res.data?.pagination;
      if (meta) {
        setPagination((prev) => ({
          total: meta.total ?? prev.total,
          page: meta.page ?? targetPage,
          limit: meta.limit ?? prev.limit,
          totalPages: meta.totalPages ?? prev.totalPages,
        }));
      }
    } catch (err) {
      console.error("Requests error:", err);
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setRequestData({
      visaType: request.visaType || "",
      requestedAmount: request.requestedAmount ?? "",
      reason: request.reason || "",
    });
    setShowRequestModal(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await deleteCosRequest(id);
      toast.success("Request deleted");
      fetchRequests(page);
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

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesQuery = (request.visaType || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const requestStatusCounts = useMemo(() => {
    const counts = { All: requests.length };
    requests.forEach((request) => {
      const status = request.status || "Pending";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [requests]);

  const STATUS_FILTERS = ["All", "Pending", "Under Review", "Allocated", "Rejected"];

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
    <div className="space-y-5 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          CoS Management
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">
          Manage your Certificate of Sponsorship allocations and requests.
        </p>
        {loading && (
          <p className="text-xs font-bold text-gray-400 mt-2">Loading CoS summary…</p>
        )}
      </motion.div>

      {cosBlocked && <LicenceGateBanner status={licenceStatus} />}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-3 mb-3 text-gray-900">
            <FilesIcon size={20} className="text-primary" />
            <span className="font-black text-sm">Total CoS Allocated</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.total}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-3 mb-3 text-gray-900">
            <FileText size={20} className="text-emerald-600" />
            <span className="font-black text-sm">CoS Used</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
            {stats.used}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-3 mb-3 text-gray-900">
            <FilesIcon size={20} className="text-amber-500" />
            <span className="font-black text-sm">CoS Remaining</span>
          </div>
          <p className="text-3xl font-black text-secondary">{stats.remaining}</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-secondary flex items-center gap-2">
              <Hash size={16} className="text-primary" />
              CoS Usage Progress
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'summary' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500'}`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500'}`}
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
        </div>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-secondary flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              {activeTab === 'summary' ? 'Active Allocations' : 'Request History'}
            </h2>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-56 rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                />
              </div>
              {activeTab === 'history' && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-black text-gray-500">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black transition ${statusFilter === filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {filter} ({requestStatusCounts[filter] || 0})
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={handleDownload}
                disabled={busy.cosSummaryExcel || busy.cosRequestsExcel}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition disabled:opacity-50"
                title="Download Report"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => {
                  if (cosBlocked) return;
                  setEditingRequest(null);
                  setRequestData({ visaType: '', requestedAmount: '', reason: '' });
                  setShowRequestModal(true);
                }}
                disabled={cosBlocked}
                title={cosBlocked ? "Your Sponsorship Licence is not active." : "Request CoS"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white transition hover:bg-primary-dark shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Request CoS
              </button>
            </div>
          </div>

          {activeTab === 'summary' ? (
            <div className="overflow-auto max-h-[68vh]">
              <table className="w-full min-w-0 text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-black text-gray-500 uppercase tracking-wider text-[10px]">Sr No</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Visa Type</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Allocated</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Used</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Remaining</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Expiry Date</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Last Used</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px] text-center">Actions</th>
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
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2 flex items-center gap-2">
                          <div
                            className={`w-7 h-7 flex items-center justify-center text-white rounded-xl text-xs font-black ${bgColor}`}
                          >
                            {initials}
                          </div>
                          <span className="text-xs font-black text-secondary">
                            {item.visaType}
                          </span>
                        </td>

                        <td className="px-3 py-2 text-xs font-bold text-gray-700">{item.allocated}</td>
                        <td className="px-3 py-2 text-xs font-bold text-gray-700">{item.used}</td>
                        <td className="px-3 py-2 text-xs font-bold text-gray-700">{item.remaining}</td>
                        <td className="px-3 py-2 text-[10px] font-bold text-gray-600">{exp}</td>
                        <td className="px-3 py-2 text-[10px] font-bold text-gray-600">{lastUsedDisp}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full ${statusStyle}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2 flex gap-1.5 justify-center">
                          <button
                            onClick={() => {
                              if (cosBlocked) return;
                              setEditingRequest(null);
                              setRequestData({ visaType: item.visaType, requestedAmount: '', reason: '' });
                              setShowRequestModal(true);
                            }}
                            disabled={cosBlocked}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={cosBlocked ? "Licence not active" : "Request More Slots"}
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
                  {filteredCosList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-xs font-bold text-gray-400">
                        No allocations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="overflow-auto max-h-[68vh]">
                <table className="w-full min-w-0 text-left">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-black text-gray-500 uppercase tracking-wider text-[10px]">Sr No</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Request ID</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Visa Type</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Requested</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Date</th>
                      <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.map((r, index) => (
                      <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                            {(page - 1) * pagination.limit + index + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs font-black text-secondary">#REQ-{r.id}</td>
                        <td className="px-3 py-2 text-xs font-bold text-gray-700">{r.visaType}</td>
                        <td className="px-3 py-2 text-xs font-black text-primary">
                          {r.requestedAmount} Slots
                          {['Approved', 'Allocated'].includes(r.status) && r.approvedAmount != null && (
                            <span className="block text-[10px] font-bold text-emerald-600">
                              Allocated: {r.approvedAmount}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {(() => {
                            const infoNeeded = r.status === 'Under Review' && !!r.reviewNotes;
                            const badgeClass = ['Approved', 'Allocated'].includes(r.status)
                              ? 'bg-emerald-50 text-emerald-600'
                              : r.status === 'Rejected'
                              ? 'bg-red-50 text-red-600'
                              : infoNeeded
                              ? 'bg-amber-50 text-amber-700'
                              : r.status === 'Under Review'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-amber-50 text-amber-600';
                            return (
                              <>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badgeClass}`}>
                                  {infoNeeded ? 'Info Required' : r.status}
                                </span>
                                {r.reviewNotes && (r.status === 'Under Review' || r.status === 'Rejected') && (
                                  <p
                                    className={`text-[10px] font-bold mt-1 max-w-[200px] truncate ${
                                      infoNeeded ? 'text-amber-600' : 'text-gray-400'
                                    }`}
                                    title={r.reviewNotes}
                                  >
                                    {r.reviewNotes}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2 text-[10px] font-bold text-gray-500">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-3 py-2 flex gap-1.5">
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
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-xs font-bold text-gray-400">
                          No requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
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
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-secondary">
                  {editingRequest ? "Edit CoS Request" : "Request Additional CoS"}
                </h2>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setEditingRequest(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">
                    Visa Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={requestData.visaType}
                    onChange={(e) => setRequestData({ ...requestData, visaType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
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
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">
                    No. of Additional CoS Slots Needed <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">
                    How many additional Certificates of Sponsorship do you need for this visa type?
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={requestData.requestedAmount}
                    onChange={(e) => setRequestData({ ...requestData, requestedAmount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-xs font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">
                    Reason for Request <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={requestData.reason}
                    onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40 resize-none"
                    placeholder="Explain why you need additional CoS"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3 pt-3">
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
                        fetchRequests(page);
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Operation failed");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-white hover:bg-primary-dark transition shadow-sm disabled:opacity-60"
                  >
                    {submitting ? "Processing…" : editingRequest ? "Update Request" : "Submit Request"}
                  </button>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-lg px-3 py-1.5 text-xs transition"
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
