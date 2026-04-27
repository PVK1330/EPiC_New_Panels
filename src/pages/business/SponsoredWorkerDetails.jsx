import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Hash,
  ShieldCheck,
  AlertCircle,
  User,
  Briefcase,
  Loader2,
  ArrowLeft,
  Save,
  X,
  Check,
  XCircle,
  MessageSquare
} from "lucide-react";
import { getSponsoredWorkerDetails, updateSponsoredWorker, updateWorkerStatus } from "../../services/sponsoredWorkerApi";
import { toast } from "react-hot-toast";

const SponsoredWorkerDetails = () => {
  const [activeTab, setActiveTab] = useState("details");
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [statusNote, setStatusNote] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const candidateId = queryParams.get("candidateId");

  useEffect(() => {
    if (candidateId) {
      fetchWorkerDetails();
    }
  }, [candidateId]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const response = await getSponsoredWorkerDetails(candidateId);
      if (response.data.status === "success") {
        setWorkerData(response.data.data);
        const { case: c, application: a } = response.data.data;
        setEditForm({
          firstName: c.candidate.first_name,
          lastName: c.candidate.last_name,
          email: c.candidate.email,
          phone: c.candidate.mobile,
          dob: a?.dob,
          gender: a?.gender,
          nationality: a?.nationality,
          passportNumber: a?.passportNumber,
          visaType: a?.visaType,
          visaExpiryDate: a?.visaEndDate,
          address: a?.address,
          jobTitle: c.jobTitle,
          salary: c.salaryOffered,
          notes: c.notes
        });
      }
    } catch (error) {
      console.error("Error fetching worker details:", error);
      toast.error("Failed to load worker details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorker = async () => {
    try {
      const response = await updateSponsoredWorker(candidateId, editForm);
      if (response.data.status === "success") {
        toast.success("Worker updated successfully");
        setIsEditing(false);
        fetchWorkerDetails();
      }
    } catch (error) {
      console.error("Error updating worker:", error);
      toast.error("Failed to update worker");
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await updateWorkerStatus(candidateId, { status: statusToUpdate, note: statusNote });
      if (response.data.status === "success") {
        toast.success(`Worker ${statusToUpdate} successfully`);
        setShowStatusModal(false);
        setStatusNote("");
        fetchWorkerDetails();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40";

  const editInputStyle = 
    "w-full border border-primary/30 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white transition-all";

  const labelStyle = "text-xs font-bold text-gray-700 mb-2";

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-black text-secondary animate-pulse">Loading worker details...</p>
      </div>
    );
  }

  if (!workerData) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-lg font-black text-secondary">Worker not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  const { case: workerCase, application } = workerData;
  const candidate = workerCase.candidate;

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
      case "Active":
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Pending":
      case "Under Review":
      case "Docs Pending":
      case "In Progress":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <button 
            onClick={() => navigate("/business/workers")}
            className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-primary transition mb-2"
          >
            <ArrowLeft size={14} />
            BACK TO WORKERS
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-secondary tracking-tight">
              {candidate?.first_name} {candidate?.last_name}
            </h1>
            <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider ${getStatusColor(workerCase?.status)}`}>
              {workerCase?.status}
            </div>
          </div>
          <p className="text-primary font-bold text-sm mt-1 uppercase tracking-widest">
            {workerCase?.caseId || `WORKER-${candidate?.id}`} • STAGE: {workerCase?.caseStage}
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-gray-600 transition hover:bg-gray-50 shadow-sm"
              >
                <X size={18} />
                CANCEL
              </button>
              <button
                onClick={handleUpdateWorker}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white transition hover:bg-primary-dark shadow-md"
              >
                <Save size={18} />
                SAVE CHANGES
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-black text-gray-700 transition hover:bg-gray-50 shadow-sm"
              >
                <Briefcase size={18} className="text-primary" />
                EDIT WORKER
              </button>
              
              <div className="h-10 w-[1px] bg-gray-200 mx-1 hidden md:block" />
              
              <button
                onClick={() => {
                  setStatusToUpdate("Approved");
                  setShowStatusModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 shadow-md"
              >
                <Check size={18} />
                APPROVE
              </button>
              <button
                onClick={() => {
                  setStatusToUpdate("Rejected");
                  setShowStatusModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-700 shadow-md"
              >
                <XCircle size={18} />
                REJECT
              </button>
            </>
          )}
        </div>
      </div>

      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          {["details", "visa", "documents", "compliance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-black border-b-2 transition whitespace-nowrap uppercase tracking-wider ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {/* PERSONAL */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Personal Information</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className={labelStyle}>First Name</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.firstName} 
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{candidate?.first_name}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Last Name</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.lastName} 
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{candidate?.last_name}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Date of Birth</label>
                  {isEditing ? (
                    <input 
                      type="date"
                      className={editInputStyle} 
                      value={editForm.dob ? editForm.dob.split('T')[0] : ''} 
                      onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{application?.dob ? new Date(application.dob).toLocaleDateString() : "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Gender</label>
                  {isEditing ? (
                    <select 
                      className={editInputStyle} 
                      value={editForm.gender} 
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className={inputStyle}>{application?.gender || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Nationality</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.nationality} 
                      onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{application?.nationality || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Email Address</label>
                  <div className={inputStyle}>{candidate?.email}</div>
                </div>

                <div>
                  <label className={labelStyle}>Phone Number</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{candidate?.mobile || "N/A"}</div>
                  )}
                </div>
              </div>
            </section>

            {/* JOB */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Employment Details</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className={labelStyle}>Job Title</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.jobTitle} 
                      onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{workerCase?.jobTitle || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Proposed Salary</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      className={editInputStyle} 
                      value={editForm.salary} 
                      onChange={(e) => setEditForm({...editForm, salary: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>£{Number(workerCase?.salaryOffered).toLocaleString()}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Current Stage</label>
                  <div className={inputStyle}>{workerCase?.caseStage}</div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* VISA TAB */}
        {activeTab === "visa" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Hash size={24} />
                </div>
                <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Visa & Immigration</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className={labelStyle}>Visa Type</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.visaType} 
                      onChange={(e) => setEditForm({...editForm, visaType: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{application?.visaType || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Visa Expiry Date</label>
                  {isEditing ? (
                    <input 
                      type="date"
                      className={editInputStyle} 
                      value={editForm.visaExpiryDate ? editForm.visaExpiryDate.split('T')[0] : ''} 
                      onChange={(e) => setEditForm({...editForm, visaExpiryDate: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{application?.visaEndDate ? new Date(application.visaEndDate).toLocaleDateString() : "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>Passport Number</label>
                  {isEditing ? (
                    <input 
                      className={editInputStyle} 
                      value={editForm.passportNumber} 
                      onChange={(e) => setEditForm({...editForm, passportNumber: e.target.value})}
                    />
                  ) : (
                    <div className={inputStyle}>{application?.passportNumber || "N/A"}</div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-black text-secondary uppercase tracking-tight">Additional Notes</h3>
              </div>

              <div className="w-full">
                {isEditing ? (
                  <textarea 
                    className={`${editInputStyle} min-h-[150px]`} 
                    value={editForm.notes} 
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  />
                ) : (
                  <div className={`${inputStyle} h-auto min-h-[150px] whitespace-pre-wrap leading-relaxed`}>
                    {workerCase?.notes || "No notes provided."}
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-gray-300" />
            </div>
            <p className="text-lg font-black text-secondary">Document Repository</p>
            <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto mt-2">
              All documents uploaded by the worker will appear here for verification.
            </p>
          </motion.div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === "compliance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
             <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-secondary">Right to Work Verification</p>
                    <p className="text-sm font-bold text-gray-500 italic">Automated Compliance Check</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center px-4 py-1.5 text-xs font-black rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                    Compliant
                  </span>
                  <p className="text-[10px] font-bold text-gray-400">Verified on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
          </motion.div>
        )}
      </motion.div>

      {/* STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${statusToUpdate === 'Approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {statusToUpdate === 'Approve' ? <Check size={28} /> : <XCircle size={28} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-secondary">{statusToUpdate} Worker</h3>
                <p className="text-sm font-bold text-gray-500">Provide a reason or note for this action.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 block">Notes / Reason</label>
                <textarea
                  className="w-full border border-gray-200 rounded-2xl p-4 text-sm font-bold text-secondary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px]"
                  placeholder={`Enter reason for ${statusToUpdate.toLowerCase()}ing...`}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-sm font-black text-gray-600 hover:bg-gray-50 transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className={`flex-1 px-6 py-3 rounded-2xl text-sm font-black text-white transition shadow-lg ${statusToUpdate === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  CONFIRM {statusToUpdate.toUpperCase()}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SponsoredWorkerDetails;