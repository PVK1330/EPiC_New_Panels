import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Download,
  Building2,
  Mail,
  Phone,
  AlertCircle,
  Check,
  X,
  FileText,
  MessageSquare,
  Loader2
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const CaseworkerLicenceApplications = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(""); // Approved, Rejected, Information Requested
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/caseworker/licence/assigned");
      setApplications(res.data.data);
    } catch (err) {
      showToast({ message: "Failed to fetch assigned applications", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async () => {
    if (!actionType) return;
    if ((actionType === 'Rejected' || actionType === 'Information Requested') && !adminNotes.trim()) {
      showToast({ message: "Please enter a note for this action", variant: "warning" });
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/api/caseworker/licence/update-status/${selectedApp.id}`, { 
        status: actionType, 
        adminNotes: adminNotes 
      });
      
      showToast({ message: `Status updated to ${actionType} successfully`, variant: "success" });
      setShowActionModal(false);
      setAdminNotes("");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      showToast({ message: "Action failed", variant: "danger" });
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
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-secondary flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} />
          Assigned Licence Reviews
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">Review and manage sponsor licence applications assigned to you.</p>
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
          {["All", "Pending", "Under Review", "Information Requested"].map((f) => (
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
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned At</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(3)].map((_, i) => (
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
                      {new Date(app.updatedAt).toLocaleDateString('en-GB')}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-sm font-bold text-gray-400">No assigned reviews found.</p>
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
                      <h2 className="text-2xl font-black text-secondary">Review Application</h2>
                      <p className="text-xs font-bold text-gray-400">Application ID: #{selectedApp.id}</p>
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
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Contact Officer</label>
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
                  </div>
                </div>

                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="mb-10">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Evidence & Documents</label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedApp.documents.map((doc, i) => (
                        <a 
                          key={i}
                          href={`/${doc}`} 
                          target="_blank"
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

                <div className="space-y-4 pt-6 border-t border-gray-50">
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
                    <button
                      onClick={() => { setActionType("Information Requested"); setShowActionModal(true); }}
                      className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-black rounded-2xl py-4 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} /> Request Info
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
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
                <h3 className="text-xl font-black text-secondary">Review Decision</h3>
                <button onClick={() => setShowActionModal(false)}><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Reviewer Notes</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 outline-none resize-none"
                    rows={4}
                    placeholder="Enter your assessment notes here..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

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
                    {actionLoading ? <Loader2 className="animate-spin" /> : `Confirm ${actionType.replace('Information Requested', 'Request')}`}
                  </button>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-2xl"
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

export default CaseworkerLicenceApplications;
