import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  CreditCard,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  ShieldCheck,
  AlertCircle,
  FileText,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Hash,
  Building,
  Building2,
  PoundSterling,
  Clock,
  Mail,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { getSponsoredWorkerDetails, getWorkerAuditTrail, assignCosToWorker } from "../../services/sponsoredWorkerApi";
import WorkerAbsenceTab from "./WorkerAbsenceTab";
import { getCosAllocations } from "../../services/licenceApi";
import { toast } from "react-hot-toast";
import { formatDate } from "../../utils/datetime";
import useSponsorLicence from "../../hooks/useSponsorLicence";
import LicenceGateBanner from "../../components/business/LicenceGateBanner";

const Field = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-bold text-secondary">{value || "—"}</p>
  </div>
);

const SectionCard = ({ icon: Icon, color = "primary", title, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-5">
      <div className={`h-9 w-9 rounded-xl bg-${color}/10 flex items-center justify-center text-${color}`}>
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-black text-secondary uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const SponsoredWorkerDetails = () => {
  const [activeTab, setActiveTab] = useState("details");
  const [workerData, setWorkerData] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  // Assign CoS modal
  const [showAssignCos, setShowAssignCos] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [selectedAllocId, setSelectedAllocId] = useState("");
  const [assigningCos, setAssigningCos] = useState(false);
  const { ready: licenceReady, licenceStatus, canSponsorWorkers } = useSponsorLicence();
  const workerBlocked = licenceReady && !canSponsorWorkers;

  const location = useLocation();
  const navigate = useNavigate();
  const workerId = location.state?.workerId;

  useEffect(() => {
    if (!workerId) { navigate("/business/workers", { replace: true }); return; }
    fetchWorkerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  useEffect(() => {
    if (activeTab === "history" && workerId) fetchAuditTrail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const res = await getSponsoredWorkerDetails(workerId);
      if (res.data.status === "success") setWorkerData(res.data.data);
    } catch { toast.error("Failed to load worker details"); }
    finally { setLoading(false); }
  };

  const fetchAuditTrail = async () => {
    try {
      const res = await getWorkerAuditTrail(workerId);
      if (res.data.status === "success") setAuditTrail(res.data.data || []);
    } catch { /* silent */ }
  };

  // Load available CoS allocations when modal opens
  useEffect(() => {
    if (!showAssignCos) return;
    getCosAllocations()
      .then((res) => {
        const list = res.data?.data || [];
        // Only show Active allocations; exhausted ones will be rejected by the backend
        setAllocations(list.filter((a) => a.status === "Active"));
      })
      .catch(() => toast.error("Failed to load CoS allocations"));
  }, [showAssignCos]);

  const handleAssignCos = async () => {
    if (!selectedAllocId) { toast.error("Please select a CoS allocation"); return; }
    try {
      setAssigningCos(true);
      const res = await assignCosToWorker(workerId, { cosAllocationRecordId: Number(selectedAllocId) });
      if (res.data.status === "success") {
        toast.success(`CoS assigned — ${res.data.data?.workerCosNumber || ""}`);
        setShowAssignCos(false);
        setSelectedAllocId("");
        fetchWorkerDetails(); // refresh the displayed data
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign CoS");
    } finally {
      setAssigningCos(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Visa Granted": return "bg-emerald-100 text-emerald-700";
      case "Visa Rejected": return "bg-red-100 text-red-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-sm font-black text-secondary animate-pulse">Loading worker details…</p>
    </div>
  );

  if (!workerData) return (
    <div className="p-8 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <p className="text-lg font-black text-secondary">Worker not found</p>
      <button onClick={() => navigate("/business/workers")} className="mt-4 text-primary font-bold">Go Back</button>
    </div>
  );

  const w = workerData;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <button onClick={() => navigate("/business/workers")}
          className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-primary transition mb-3">
          <ArrowLeft size={14} /> BACK TO WORKERS
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-black text-secondary tracking-tight">
                {w.workerFirstName} {w.workerLastName}
              </h1>
              <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase ${getStatusColor(w.status)}`}>
                {w.status}
              </span>
            </div>
            <p className="text-primary font-bold text-sm mt-1 uppercase tracking-widest">
              {w.jobTitle || "No job title"} • {w.visaType || "No visa type"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* CoS Reference number — prominent if assigned */}
            {w.workerCosNumber ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-right">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-0.5">CoS Reference Number</p>
                <p className="text-lg font-black text-emerald-800 tracking-widest flex items-center gap-1.5 justify-end">
                  <Hash size={16} className="text-emerald-600" />
                  {w.workerCosNumber}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowAssignCos(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-black shadow hover:bg-primary/90 transition"
              >
                <Plus size={16} />
                Assign CoS
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {workerBlocked && <LicenceGateBanner status={licenceStatus} />}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          ["details", "Worker Details"],
          ["absence", "Absence Monitoring"],
          ["history", "Activity History"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-6 py-3 text-sm font-black border-b-2 transition whitespace-nowrap ${
              activeTab === key ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

          {/* Personal */}
          <SectionCard icon={User} title="Personal Information">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="First Name" value={w.workerFirstName} />
              <Field label="Last Name" value={w.workerLastName} />
              <Field label="Date of Birth" value={w.dob ? formatDate(w.dob) : null} />
              <Field label="Gender" value={w.gender} />
              <Field label="Nationality" value={w.workerNationality} />
              <Field label="Marital Status" value={w.maritalStatus} />
            </div>
          </SectionCard>

          {/* Passport */}
          <SectionCard icon={CreditCard} title="Passport / Travel Document">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="Passport Number" value={w.passportNumber} />
              <Field label="Country of Issue" value={w.passportCountry} />
              <Field label="Issue Date" value={w.passportIssueDate ? formatDate(w.passportIssueDate) : null} />
              <Field label="Expiry Date" value={w.passportExpiryDate ? formatDate(w.passportExpiryDate) : null} />
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard icon={Phone} title="Contact Information">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="Email" value={w.workerEmail} />
              <Field label="Phone" value={w.phone} />
              <Field label="Address" value={w.address} />
              <Field label="City" value={w.city} />
            </div>
          </SectionCard>

          {/* Employment */}
          <SectionCard icon={Briefcase} title="Employment Details">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="Job Title" value={w.jobTitle} />
              <Field label="SOC Code" value={w.socCode} />
              <Field label="Department" value={w.department} />
              <Field label="Start Date" value={w.startDate ? formatDate(w.startDate) : null} />
              <Field label="Annual Salary" value={w.salary ? `£${Number(w.salary).toLocaleString()}` : null} />
              <Field label="Weekly Hours" value={w.weeklyHours ? `${w.weeklyHours} hrs` : null} />
            </div>
          </SectionCard>

          {/* Visa & CoS */}
          <SectionCard icon={ShieldCheck} title="Visa & CoS Information">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="Visa Type" value={w.visaType} />
              <Field label="Previous UK Visa" value={w.previousUkVisa ? "Yes" : "No"} />
              <Field label="Worker CoS Number" value={w.workerCosNumber} />
              {w.cosAllocationRecordId && <Field label="Allocation Record" value={`#${w.cosAllocationRecordId}`} />}
              {w.cosRequestId && <Field label="CoS Request" value={`Request #${w.cosRequestId}`} />}
              <Field label="Registered On" value={w.createdAt ? formatDate(w.createdAt) : null} />
            </div>

            {w.notes && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm font-bold text-secondary whitespace-pre-wrap">{w.notes}</p>
              </div>
            )}

            {w.rejectionReason && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-black text-red-700 uppercase tracking-wider mb-1">Rejection Reason</p>
                <p className="text-sm font-bold text-red-800">{w.rejectionReason}</p>
              </div>
            )}
          </SectionCard>

        </motion.div>
      )}

      {/* ABSENCE MONITORING TAB */}
      {activeTab === "absence" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <WorkerAbsenceTab workerId={workerId} />
        </motion.div>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {auditTrail.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-gray-200 bg-white">
              <FileText size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm font-bold text-gray-500">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-secondary capitalize">
                        {entry.action?.replace(/_/g, " ")}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">
                        {entry.createdAt ? formatDate(entry.createdAt) : ""}
                      </span>
                    </div>
                    {(entry.fromStatus || entry.toStatus) && (
                      <p className="text-xs font-bold text-gray-500 mt-0.5">
                        {entry.fromStatus && <span>{entry.fromStatus}</span>}
                        {entry.fromStatus && entry.toStatus && <span className="mx-1">→</span>}
                        {entry.toStatus && <span>{entry.toStatus}</span>}
                      </p>
                    )}
                    {entry.actor && (
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        by {entry.actor.first_name} {entry.actor.last_name}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-xs font-bold text-gray-600 mt-1 italic">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ASSIGN CoS MODAL */}
      {showAssignCos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-secondary">Assign Certificate of Sponsorship</h2>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  Select an approved allocation for {w.workerFirstName} {w.workerLastName}
                </p>
              </div>
              <button
                onClick={() => { setShowAssignCos(false); setSelectedAllocId(""); }}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {allocations.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={36} className="mx-auto text-amber-400 mb-3" />
                <p className="text-sm font-black text-secondary mb-1">No allocations available</p>
                <p className="text-xs font-bold text-gray-500">
                  All approved CoS allocations have been fully used or no approved allocations exist.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    CoS Allocation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAllocId}
                      onChange={(e) => setSelectedAllocId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">— Select allocation —</option>
                      {allocations.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.allocationNumber} — {a.visaType} ({a.allocatedAmount} slot{a.allocatedAmount !== 1 ? "s" : ""} allocated)
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {selectedAllocId && (() => {
                    const chosen = allocations.find((a) => String(a.id) === String(selectedAllocId));
                    if (!chosen) return null;
                    return (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 space-y-1">
                        <p><span className="text-emerald-600">Visa Type:</span> {chosen.visaType}</p>
                        <p><span className="text-emerald-600">Total slots in batch:</span> {chosen.allocatedAmount}</p>
                        <p><span className="text-emerald-600">A unique CoS number</span> will be auto-generated for this worker.</p>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowAssignCos(false); setSelectedAllocId(""); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignCos}
                    disabled={!selectedAllocId || assigningCos}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-black shadow hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {assigningCos ? (
                      <><Loader2 size={16} className="animate-spin" /> Assigning…</>
                    ) : (
                      <><CheckCircle2 size={16} /> Assign CoS</>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SponsoredWorkerDetails;
