import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Building2,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Check,
  X,
  FileText,
  UserPlus,
  MessageSquare,
  ChevronDown,
  Trash2,
  Pencil,
  Save
} from "lucide-react";
import { 
  getAllLicenceApplications, 
  updateLicenceApplicationStatus,
  requestLicenceInfo,
  assignLicenceCaseworker,
  deleteLicenceApplicationByAdmin
} from "../../services/licenceApi";
import { API_BASE_URL } from "../../utils/constants";
import { getCaseworkers } from "../../services/caseWorker";
import { useToast } from "../../context/ToastContext";

const AdminLicenceApplications = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [caseworkers, setCaseworkers] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionType, setActionType] = useState(""); // Approve, Reject, RequestInfo
  const [adminNotes, setAdminNotes] = useState("");
  const [requestedDocs, setRequestedDocs] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedCaseworkerIds, setSelectedCaseworkerIds] = useState([]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getAllLicenceApplications();
      setApplications(res.data.data);
    } catch (err) {
      showToast({ message: "Failed to fetch applications", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseworkers = async () => {
    try {
      const res = await getCaseworkers(1, 100);
      setCaseworkers(res.data?.data?.caseworkers || []);
    } catch (err) {
      console.error("Failed to fetch caseworkers");
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchCaseworkers();
  }, []);

  const handleAction = async () => {
    if (!actionType || !selectedApp) return;
    if ((actionType === 'Rejected' || actionType === 'RequestInfo') && !adminNotes.trim()) {
      showToast({ message: "Please enter a note for this action", variant: "warning" });
      return;
    }

    try {
      setActionLoading(true);
      if (actionType === 'RequestInfo') {
        const docs = requestedDocs.split(',').map(d => d.trim()).filter(d => d);
        await requestLicenceInfo(selectedApp?.id, { 
          adminNotes: adminNotes, 
          requestedDocuments: docs 
        });
        showToast({ message: "Information request sent", variant: "success" });
      } else {
        await updateLicenceApplicationStatus(selectedApp?.id, { 
          status: actionType, 
          adminNotes: adminNotes 
        });
        showToast({ message: `Application ${actionType} successfully`, variant: "success" });
      }
      
      setShowActionModal(false);
      setAdminNotes("");
      setRequestedDocs("");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      showToast({ message: "Action failed", variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (appId, selectedIds) => {
    if (!appId) return;
    try {
      setActionLoading(true);
      await assignLicenceCaseworker(appId, { caseworkerIds: selectedIds });
      showToast({ message: "Caseworkers assigned successfully", variant: "success" });
      setShowActionModal(false);
      fetchApplications();
    } catch (err) {
      showToast({ message: "Assignment failed", variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application? This is a soft delete.")) return;
    try {
      await deleteLicenceApplicationByAdmin(id);
      showToast({ message: "Application deleted successfully", variant: "success" });
      fetchApplications();
    } catch (err) {
      showToast({ message: "Delete failed", variant: "danger" });
    }
  };

  const handleEditSubmit = async () => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/licence/update/${selectedApp.id}`, editData);
      showToast({ message: "Application updated successfully", variant: "success" });
      setShowEditModal(false);
      fetchApplications();
    } catch (err) {
      showToast({ message: "Failed to update application", variant: "danger" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === "All" || app.status === filter;
    const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Under Review': return 'bg-blue-100 text-blue-700';
      case 'Information Requested': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            Licence Requests
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-1">Manage sponsor licence applications and renewals.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Requests", value: applications.length, color: "text-secondary" },
          { label: "Pending Approval", value: applications.filter(a => a.status === "Pending").length, color: "text-amber-600" },
          { label: "Approved", value: applications.filter(a => a.status === "Approved").length, color: "text-emerald-600" },
          { label: "Rejected", value: applications.filter(a => a.status === "Rejected").length, color: "text-red-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search by company or contact..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {["All", "Pending", "Approved", "Rejected", "Under Review", "Information Requested"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filter === f 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Company / Type</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Requested At</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned To</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/20"></td>
                </tr>
              ))
            ) : filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-secondary">{app.companyName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${app.type === 'Renewal' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {app.type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">CoS: {app.cosAllocation}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-secondary">{app.contactName}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">{app.contactEmail}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-secondary">
                      {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">
                      {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {app.assignedcaseworkerId && app.assignedcaseworkerId.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-[10px] font-black text-primary">
                          CW
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">Assigned</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap max-w-[400px]">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        <button 
                          onClick={() => { 
                            setSelectedApp(app); 
                            setActionType("Assign"); 
                            setSelectedCaseworkerIds(app.assignedcaseworkerId || []);
                            setShowActionModal(true); 
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase"
                        >
                          <UserPlus size={14} /> Assign
                        </button>

                        <button 
                          onClick={() => { setSelectedApp(app); setActionType("Approved"); setShowActionModal(true); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[9px] font-black uppercase"
                        >
                          <Check size={14} /> Approve
                        </button>

                        <button 
                          onClick={() => { setSelectedApp(app); setActionType("Rejected"); setShowActionModal(true); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-[9px] font-black uppercase"
                        >
                          <X size={14} /> Reject
                        </button>

                        <button 
                          onClick={() => { setSelectedApp(app); setActionType("RequestInfo"); setShowActionModal(true); }}
                          className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all"
                          title="Request Info"
                        >
                          <MessageSquare size={16} />
                        </button>

                        <button 
                          onClick={() => { 
                            setSelectedApp(app); 
                            setEditData({
                              companyName: app.companyName,
                              registrationNumber: app.registrationNumber,
                              industry: app.industry,
                              licenceType: app.licenceType,
                              cosAllocation: app.cosAllocation,
                              contactName: app.contactName,
                              contactEmail: app.contactEmail,
                              contactPhone: app.contactPhone,
                            });
                            setShowEditModal(true); 
                          }}
                          className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-sm font-bold text-gray-400">No applications found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-2xl">
                      <FileText className="text-primary" size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-secondary">Request Details</h2>
                      <p className="text-xs font-bold text-gray-400">Application ID: #{selectedApp?.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="p-2 text-gray-400 hover:text-secondary transition-colors">
                    <X size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Company Information</label>
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.companyName}</p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Building2 size={14} /> {selectedApp.registrationNumber}
                        </p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Filter size={14} /> {selectedApp.industry}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Licence Request</label>
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.licenceType}</p>
                        <p className="text-xs font-bold text-gray-500">Allocation: {selectedApp.cosAllocation}</p>
                        <p className="text-xs font-bold text-gray-500">Type: {selectedApp.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Authorising Officer</label>
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <p className="text-sm font-black text-secondary">{selectedApp.contactName}</p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Mail size={14} /> {selectedApp.contactEmail}
                        </p>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                          <Phone size={14} /> {selectedApp.contactPhone}
                        </p>
                      </div>
                    </div>
                    {selectedApp.reason && (
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Business Justification</label>
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{selectedApp.reason}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="mb-10">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Evidence & Documents</label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedApp.documents.map((doc, i) => (
                        <a 
                          key={i}
                          href={`${API_BASE_URL}/${doc.replace(/\\/g, '/')}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-primary" />
                            <span className="text-xs font-black text-secondary truncate max-w-[150px]">Document {i+1}</span>
                          </div>
                          <Download size={16} className="text-gray-300" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  {selectedApp.adminNotes && (
                    <div className="mb-10">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Reviewer Notes</label>
                      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                        <p className="text-sm font-bold text-amber-900 leading-relaxed">{selectedApp.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                    <div className="flex gap-4">
                      <button
                        onClick={() => { setActionType("Assign"); setSelectedCaseworkerIds(selectedApp?.assignedcaseworkerId || []); setShowActionModal(true); }}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black rounded-2xl py-4 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} /> Assign
                      </button>
                      <button
                        onClick={() => { setActionType("RequestInfo"); setShowActionModal(true); }}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-black rounded-2xl py-4 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={18} /> Request Info
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => { setActionType("Approved"); setShowActionModal(true); }}
                        className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black rounded-2xl py-4 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button
                        onClick={() => { setActionType("Rejected"); setShowActionModal(true); }}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-black rounded-2xl py-4 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Action Modal (Approve/Reject/RequestInfo) */}
      <AnimatePresence>
        {showActionModal && selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-secondary">
                  {actionType === 'Approved' ? 'Confirm Approval' : 
                   actionType === 'Rejected' ? 'Confirm Rejection' : 
                   actionType === 'Assign' ? 'Assign Caseworker' :
                   'Request More Evidence'}
                </h3>
                <button onClick={() => setShowActionModal(false)}><X size={24} /></button>
              </div>

              <div className="space-y-6">
                {actionType === 'Assign' ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Caseworkers</p>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {caseworkers.map(cw => {
                          const isSelected = selectedCaseworkerIds.includes(cw.id);
                          return (
                            <button
                              key={cw.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCaseworkerIds(selectedCaseworkerIds.filter(id => id !== cw.id));
                                } else {
                                  setSelectedCaseworkerIds([...selectedCaseworkerIds, cw.id]);
                                }
                              }}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                                isSelected 
                                ? "bg-primary/5 border-primary text-primary" 
                                : "bg-gray-50 border-gray-100 text-secondary hover:border-gray-200"
                              } shadow-sm group`}
                            >
                              <div className="text-left">
                                <p className="text-sm font-black">{cw.first_name} {cw.last_name}</p>
                                <p className="text-[10px] opacity-70 font-bold">{cw.email}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? "bg-primary border-primary" : "border-gray-200"
                              }`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAssign(selectedApp?.id, selectedCaseworkerIds)}
                        disabled={actionLoading}
                        className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                      >
                        {actionLoading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} /> Confirm Assignment</>}
                      </button>
                      <button
                        onClick={() => setShowActionModal(false)}
                        className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">
                        {actionType === 'RequestInfo' ? 'Request Instructions' : 'Admin Note / Reason'}
                      </label>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none resize-none"
                        rows={4}
                        placeholder="Enter details here..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>

                    {actionType === 'RequestInfo' && (
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Requested Documents (Comma separated)</label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-secondary outline-none"
                          placeholder="e.g. Passport, Bank Statements"
                          value={requestedDocs}
                          onChange={(e) => setRequestedDocs(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={handleAction}
                        disabled={actionLoading}
                        className={`flex-[2] py-4 rounded-2xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                          actionType === 'Approved' ? 'bg-emerald-500 shadow-emerald-100' :
                          actionType === 'Rejected' ? 'bg-red-500 shadow-red-100' :
                          'bg-primary shadow-primary/20'
                        } shadow-lg`}
                      >
                        {actionLoading ? <Loader2 className="animate-spin" /> : `Confirm ${actionType.replace('Info', '')}`}
                      </button>
                      <button
                        onClick={() => setShowActionModal(false)}
                        className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                      <Pencil size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-secondary">Edit Application</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: #LIC-{selectedApp?.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-secondary transition-colors">
                    <X size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Company Name</label>
                    <input
                      type="text"
                      value={editData.companyName}
                      onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Registration Number</label>
                    <input
                      type="text"
                      value={editData.registrationNumber}
                      onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Licence Type</label>
                    <input
                      type="text"
                      value={editData.licenceType}
                      onChange={(e) => setEditData({ ...editData, licenceType: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">CoS Allocation</label>
                    <input
                      type="text"
                      value={editData.cosAllocation}
                      onChange={(e) => setEditData({ ...editData, cosAllocation: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={editData.contactName}
                      onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={editData.contactEmail}
                      onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleEditSubmit}
                    disabled={actionLoading}
                    className="flex-[2] bg-primary hover:bg-primary-dark text-white font-black rounded-2xl py-4 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-50 text-gray-500 font-black rounded-2xl py-4 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLicenceApplications;
