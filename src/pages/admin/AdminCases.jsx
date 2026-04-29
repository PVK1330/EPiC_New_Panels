import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_CASES } from "../../data/casesData";
import {
  Briefcase,
  X,
  Eye,
  Pencil,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { getCases, createCase, updateCase, deleteCase, getVisaTypes, getPetitionTypes, getCandidates, getSponsors, getCaseworkers, updateCaseStatus, exportCases, getAllUsers, getDepartments } from "../../services/caseApi";




const statusBadge = {
  Approved: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Review: "bg-blue-100 text-blue-800",
  Lead: "bg-gray-100 text-gray-800",
};

const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const priorityBadge = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const TABLE_COLS = [
  "Case ID",
  "Candidate",
  "Business",
  "CaseWorker (s)",
  "Visa Type",
  "Priority",
  "Status",
  "Submitted",
  "Actions",
];

/** Mock caseworkers — ID selects name automatically */
const CASE_WORKERS = [
  { id: "CW-301", name: "Emily Davis" },
  { id: "CW-302", name: "Mark Lee" },
  { id: "CW-303", name: "Priya Sharma" },
  { id: "CW-304", name: "Sarah Chen" },
  { id: "CW-305", name: "James Okoye" },
];

const emptyForm = {
  candidateName: "",
  candidateId: "",
  nationality: "",
  jobTitle: "",
  department: "",
  businessName: "",
  businessId: "",
  visaTypeId: "",
  petitionTypeId: "",
  priority: "medium",
  targetSubmissionDate: "",
  lcaNumber: "",
  receiptNumber: "",
  assignedCaseworkerIds: [],
  salaryOffered: 0,
  totalAmount: 0,
  paidAmount: 0,
  notes: "",
};

function caseworkerNamesFromIds(ids, options = CASE_WORKERS) {
  return ids
    .map((id) => options.find((w) => w.id === id)?.name)
    .filter(Boolean);
}

function CaseworkerMultiSelect({ options, value, onChange, error }) {
  const [open, setOpen] = useState(false);

  const toggleId = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else if (value.length < 2) {
      onChange([...value, id]);
    }
  };

  const summaryText = value.length
    ? value
        .map((id) => {
          const o = options.find((x) => x.id === id);
          return o ? `${o.name} (${o.id})` : id;
        })
        .join(" · ")
    : "";

  return (
    <div className="relative md:col-span-2 space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Caseworker Assignment <span className="text-red-500">*</span>
        <span className="text-gray-400 font-normal ml-1">(1–2 workers)</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-left text-sm bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary ${
          error ? "border-red-400" : ""
        }`}
      >
        <span
          className={
            value.length ? "text-gray-900 font-semibold" : "text-gray-400"
          }
        >
          {value.length ? summaryText : "Choose caseworkers…"}
        </span>
        <span className="text-xs font-bold text-gray-400 tabular-nums shrink-0">
          {value.length}/2
        </span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-[70] left-0 right-0 mt-1 border border-gray-200 rounded-xl bg-white shadow-xl py-1 max-h-60 overflow-y-auto">
            {options.map((o) => {
              const checked = value.includes(o.id);
              const disabled = !checked && value.length >= 2;
              return (
                <label
                  key={o.id}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm border-b border-gray-50 last:border-0 ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:bg-secondary/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-secondary rounded border-gray-300"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleId(o.id)}
                  />
                  <span className="font-semibold text-gray-800">{o.name}</span>
                  <span className="text-xs font-mono text-gray-500 ml-auto">
                    {o.id}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
      {value.length > 0 && (
        <p className="text-xs text-gray-600 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
          <span className="font-bold text-secondary">Assigned:</span>{" "}
          {value
            .map((id) => {
              const o = options.find((x) => x.id === id);
              return o ? `${o.name} — ${o.id}` : id;
            })
            .join(" · ")}
        </p>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CaseFormModal({
  title,
  subtitle,
  formData,
  errors,
  isLoading,
  onChange,
  onSubmit,
  onClose,
  onCaseworkerIdsChange,
  candidates = [],
  sponsors = [],
  visaTypes = [],
  petitionTypes = [],
  caseworkers = [],
  setFormData,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-secondary">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-black text-secondary mb-4">
                Candidate Information
              </h4>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Candidate <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="candidateId"
                      value={formData.candidateId}
                      onChange={(e) => {
                        const selectedCandidate = candidates.find(
                          (c) => c.id === parseInt(e.target.value),
                        );
                        setFormData((prev) => ({
                          ...prev,
                          candidateId: e.target.value,
                          candidateName: selectedCandidate
                            ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}`
                            : "",
                        }));
                        if (errors.candidateId)
                          setErrors((prev) => ({ ...prev, candidateId: "" }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${errors.candidateId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">Select candidate</option>
                      {candidates.map((c, idx) => (
                        <option key={`${c.id}-${idx}`} value={c.id}>
                          {c.first_name} {c.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.candidateId && (
                    <span className="text-xs text-red-500">
                      {errors.candidateId}
                    </span>
                  )}
                </div>
                <Input
                  label="Candidate Name"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={onChange}
                  placeholder="Auto-filled from selection"
                  disabled
                />
                <Input
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={onChange}
                  placeholder="e.g. Indian"
                />
                <Input
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={onChange}
                  placeholder="e.g. Software Engineer"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={onChange}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary mb-4">
                Business Information
              </h4>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Sponsor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="businessId"
                      value={formData.businessId}
                      onChange={(e) => {
                        const selectedSponsor = sponsors.find(
                          (s) => s.id === parseInt(e.target.value),
                        );
                        setFormData((prev) => ({
                          ...prev,
                          businessId: e.target.value,
                          businessName: selectedSponsor
                            ? `${selectedSponsor.first_name} ${selectedSponsor.last_name}`
                            : "",
                        }));
                        if (errors.businessId)
                          setErrors((prev) => ({ ...prev, businessId: "" }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${errors.businessId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">Select sponsor</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.businessId && (
                    <span className="text-xs text-red-500">
                      {errors.businessId}
                    </span>
                  )}
                </div>
                <Input
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={onChange}
                  placeholder="Auto-filled from selection"
                  disabled
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">
              Case Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Visa Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="visaTypeId"
                  value={formData.visaTypeId}
                  onChange={onChange}
                  className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${errors.visaTypeId ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select visa type</option>
                  {visaTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.visaTypeId && (
                  <span className="text-xs text-red-500">
                    {errors.visaTypeId}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Petition Type
                </label>
                <select
                  name="petitionTypeId"
                  value={formData.petitionTypeId}
                  onChange={onChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="">Select type</option>
                  {petitionTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={onChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {priorityLevels.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Target Submission Date"
                name="targetSubmissionDate"
                type="date"
                value={formData.targetSubmissionDate}
                onChange={onChange}
                error={errors.targetSubmissionDate}
                required
              />
              <Input
                label="LCA Number"
                name="lcaNumber"
                value={formData.lcaNumber}
                onChange={onChange}
                placeholder="e.g. I-200-24001"
              />
              <Input
                label="Receipt Number"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={onChange}
                placeholder="e.g. EAC240..."
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">
              Caseworker Assignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CaseworkerMultiSelect
                options={
                  caseworkers.length > 0
                    ? caseworkers.map((c) => ({
                        id: c.id,
                        name: `${c.first_name} ${c.last_name}`,
                      }))
                    : CASE_WORKERS
                }
                value={formData.assignedCaseworkerIds || []}
                onChange={onCaseworkerIdsChange}
                error={errors.assignedCaseworkers}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">
              Financial Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Salary Offered ($)"
                name="salaryOffered"
                type="number"
                value={formData.salaryOffered}
                onChange={onChange}
                placeholder="Annual salary"
              />
              <Input
                label="Total Amount ($)"
                name="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={onChange}
                error={errors.totalAmount}
                placeholder="Total fee"
                required
              />
              <Input
                label="Paid Amount ($)"
                name="paidAmount"
                type="number"
                value={formData.paidAmount}
                onChange={onChange}
                placeholder="Amount paid so far"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows={3}
              placeholder="Any notes or comments..."
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : title.includes("Edit")
                  ? "Save Changes"
                  : "Create Case"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState(INITIAL_CASES);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [approveRejectOpen, setApproveRejectOpen] = useState(false);
  const [approveRejectAction, setApproveRejectAction] = useState(null); // 'approve' or 'reject'
  const [approveRejectNote, setApproveRejectNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [visaTypes, setVisaTypes] = useState([]);
  const [petitionTypes, setPetitionTypes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [caseworkers, setCaseworkers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Create caseworker name map
  const caseworkerNameMap = {};
  caseworkers.forEach((cw) => {
    caseworkerNameMap[cw.id] = `${cw.first_name} ${cw.last_name}`;
  });

  // Helper function to get caseworker names from IDs
  const getCaseworkerNames = (ids) => {
    const cwIds = Array.isArray(ids) ? ids : ids ? [ids] : [];
    return cwIds.map((id) => caseworkerNameMap[id] || `ID:${id}`).join(", ");
  };

  // Calculate dynamic stats from cases
  const stats = [
    {
      label: "Total Cases",
      value: cases.length,
      bg: "bg-blue-100",
      color: "text-blue-600",
      Icon: FileText,
    },
    {
      label: "Pending",
      value: cases.filter((c) => c.status === "Pending").length,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
      Icon: Clock,
    },
    {
      label: "Approved",
      value: cases.filter((c) => c.status === "Approved").length,
      bg: "bg-green-100",
      color: "text-green-600",
      Icon: CheckCircle,
    },
    {
      label: "Rejected",
      value: cases.filter((c) => c.status === "Rejected").length,
      bg: "bg-red-100",
      color: "text-red-600",
      Icon: XCircle,
    },
  ];

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cases from API with pagination and filters
  useEffect(() => {
    const fetchCasesFromAPI = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 50,
          search: searchQuery,
          status: filterType === "all" ? "" : filterType,
          priority: priorityFilter === "all" ? "" : priorityFilter,
          visaTypeId: visaTypeFilter === "all" ? "" : visaTypeFilter,
          sortBy: "created_at",
          sortOrder: "DESC",
        };
        const response = await getCases(params);

        // Map API response to component structure
        const mappedCases = response.data.data.cases.map((c) => ({
          caseId: c.caseId || `#C-${c.id}`,
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "Unknown",
          business:
            c.sponsor?.sponsorProfile?.companyName ||
            c.sponsor?.sponsorProfile?.tradingName ||
            c.sponsor?.first_name ||
            "Unknown",
          visa: c.visaType?.name || "Unknown",
          status: c.status,
          target: c.targetSubmissionDate || c.created_at,
          priority: c.priority?.toLowerCase() || "medium",
          payment: mapPaymentStatus(c.paidAmount, c.totalAmount),
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.department,
          sponsor: c.sponsor,
          caseworkerIds: Array.isArray(c.assignedcaseworkerId) ? c.assignedcaseworkerId : (c.assignedcaseworkerId ? [c.assignedcaseworkerId] : []),
          caseworker:
            c.caseworkers && c.caseworkers.length > 0
              ? c.caseworkers
                  .map((cw) => `${cw.first_name} ${cw.last_name}`)
                  .join(", ")
              : "Unassigned",
          caseworkerId: Array.isArray(c.assignedcaseworkerId) ? c.assignedcaseworkerId.join(', ') : c.assignedcaseworkerId,
          visaType: c.visaType?.name || "Unknown",
          petitionType: c.petitionType?.name || "Unknown",
          submitted: c.submitted ? new Date(c.submitted).toLocaleDateString() : new Date(c.created_at).toLocaleDateString(),
          targetSubmissionDate: c.targetSubmissionDate,
          lcaNumber: c.lcaNumber,
          receiptNumber: c.receiptNumber,
          nationality: c.nationality,
          jobTitle: c.jobTitle,
          salaryOffered: c.salaryOffered,
          totalAmount: c.totalAmount,
          paidAmount: c.paidAmount,
          notes: c.notes,
        }));

        setCases(mappedCases);
        setError(null);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases. Please try again.");
        // Fallback to demo data on error
        setCases([...INITIAL_CASES]);
      } finally {
        setLoading(false);
      }
    };

    fetchCasesFromAPI();
  }, [page, searchQuery, filterType, priorityFilter, visaTypeFilter]);

  // Helper function to map payment status
  const mapPaymentStatus = (paid, total) => {
    if (!total || total === 0) return "outstanding";
    const ratio = paid / total;
    if (ratio >= 1) return "paid";
    if (ratio >= 0.5) return "partial";
    return "outstanding";
  };

  // Fetch dropdown data for new case form
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [visaRes, petitionRes, usersRes, deptRes] = await Promise.all([
          getVisaTypes(),
          getPetitionTypes(),
          getAllUsers(),
          getDepartments(),
        ]);


        if (visaRes?.data?.data?.visa_types) {
          setVisaTypes(visaRes.data.data.visa_types);
        }


        if (petitionRes?.data?.data?.petition_types) {
          setPetitionTypes(petitionRes.data.data.petition_types);
        }

        if (usersRes?.data?.data) {
          const { candidate, sponsor, caseworker } = usersRes.data.data;
          setCandidates(candidate || []);
          setSponsors(sponsor || []);
          setCaseworkers(caseworker || []);
        }

        if (deptRes?.data?.data?.departments) {
          setDepartments(deptRes.data.data.departments);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCaseworkerIdsChange = (ids) => {
    setFormData((prev) => ({ ...prev, assignedCaseworkerIds: ids }));
    if (errors.assignedCaseworkers)
      setErrors((prev) => ({ ...prev, assignedCaseworkers: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.candidateId) e.candidateId = "Required";
    if (!formData.businessId) e.businessId = "Required";
    if (!formData.visaTypeId) e.visaTypeId = "Required";
    const n = formData.assignedCaseworkerIds?.length || 0;
    if (n < 1 || n > 2) e.assignedCaseworkers = "Select 1 or 2 caseworkers";
    if (!formData.targetSubmissionDate) e.targetSubmissionDate = "Required";
    if (formData.totalAmount <= 0) e.totalAmount = "Must be > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const cwIds = formData.assignedCaseworkerIds || [];
      const caseData = {
        candidateId: parseInt(formData.candidateId) || null,
        sponsorId: parseInt(formData.businessId) || null,
        visaTypeId: parseInt(formData.visaTypeId) || null,
        petitionTypeId: parseInt(formData.petitionTypeId) || null,
        priority: formData.priority,
        targetSubmissionDate: formData.targetSubmissionDate,
        lcaNumber: formData.lcaNumber,
        receiptNumber: formData.receiptNumber,
        assignedcaseworkerId: cwIds,
        salaryOffered: formData.salaryOffered,
        totalAmount: formData.totalAmount,
        paidAmount: formData.paidAmount,
        notes: formData.notes,
        nationality: formData.nationality,
        jobTitle: formData.jobTitle,
        department: formData.department,
      };
      await createCase(caseData);
      // Refresh cases from API
      const response = await getCases();
      if (response?.data?.data?.cases) {
        const mappedCases = response.data.data.cases.map((c) => ({
          caseId: c.caseId || c.id.toString(),
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "—",
          candidateId: c.candidateId,
          business: c.sponsor
            ? `${c.sponsor.first_name} ${c.sponsor.last_name}`
            : "—",
          businessId: c.sponsorId,
          visaType: c.visaType?.name || "—",
          petitionType: c.petitionType?.name || "—",
          visaTypeId: c.visaTypeId,
          petitionTypeId: c.petitionTypeId,
          status: c.status,
          priority: c.priority,
          submitted: c.submitted
            ? new Date(c.submitted).toLocaleDateString()
            : new Date(c.created_at).toLocaleDateString(),
          caseworkerIds: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId
            : [],
          caseworkerId: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId.join(", ")
            : c.assignedcaseworkerId,
          caseworker: Array.isArray(c.assignedcaseworkerId)
            ? `${c.assignedcaseworkerId.length} assigned`
            : "—",
          targetSubmissionDate: c.targetSubmissionDate,
          lcaNumber: c.lcaNumber,
          receiptNumber: c.receiptNumber,
          nationality: c.nationality,
          jobTitle: c.jobTitle,
          department: c.department,
          salaryOffered: c.salaryOffered,
          totalAmount: c.totalAmount,
          paidAmount: c.paidAmount,
          notes: c.notes,
        }));
        setCases(mappedCases);
      }
      setIsLoading(false);
      setAddOpen(false);
      setFormData(emptyForm);
      setErrors({});
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating case:", error);
      alert(
        "Error creating case. Please ensure Candidate ID, Business ID, Visa Type, and Petition Type are provided.",
      );
    }
  };

  const openEdit = (c) => {
    setSelectedCase(c);
    let assignedCaseworkerIds = [];
    if (Array.isArray(c.caseworkerIds) && c.caseworkerIds.length) {
      assignedCaseworkerIds = [...c.caseworkerIds];
    } else if (typeof c.caseworkerId === "string" && c.caseworkerId.trim()) {
      assignedCaseworkerIds = c.caseworkerId
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    setFormData({
      candidateName: c.candidate,
      candidateId: c.candidateId || "",
      nationality: c.nationality || "",
      jobTitle: c.jobTitle || "",
      department: c.department || "",
      businessName: c.business,
      businessId: c.businessId || "",
      visaTypeId: c.visaTypeId || "",
      petitionTypeId: c.petitionTypeId || "",
      priority: c.priority,
      targetSubmissionDate: c.targetSubmissionDate || "",
      lcaNumber: c.lcaNumber || "",
      receiptNumber: c.receiptNumber || "",
      assignedCaseworkerIds,
      salaryOffered: c.salaryOffered || 0,
      totalAmount: c.totalAmount || 0,
      paidAmount: c.paidAmount || 0,
      notes: c.notes || "",
    });
    setErrors({});
    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const cwIds = formData.assignedCaseworkerIds || [];
      const caseData = {
        candidateId: formData.candidateId || selectedCase.candidateId,
        sponsorId: formData.businessId || selectedCase.businessId,
        visaTypeId: parseInt(formData.visaTypeId) || selectedCase.visaTypeId,
        petitionTypeId:
          parseInt(formData.petitionTypeId) || selectedCase.petitionTypeId,
        priority: formData.priority,
        targetSubmissionDate: formData.targetSubmissionDate,
        lcaNumber: formData.lcaNumber,
        receiptNumber: formData.receiptNumber,
        assignedcaseworkerId: cwIds,
        salaryOffered: formData.salaryOffered,
        totalAmount: formData.totalAmount,
        paidAmount: formData.paidAmount,
        notes: formData.notes,
        nationality: formData.nationality,
        jobTitle: formData.jobTitle,
        department: formData.department,
      };
      await updateCase(selectedCase.caseId, caseData);
      // Refresh cases from API
      const response = await getCases();
      if (response?.data?.data?.cases) {
        const mappedCases = response.data.data.cases.map((c) => ({
          caseId: c.caseId || c.id.toString(),
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "—",
          candidateId: c.candidateId,
          business: c.sponsor
            ? `${c.sponsor.first_name} ${c.sponsor.last_name}`
            : "—",
          businessId: c.sponsorId,
          visaType: c.visaType?.name || "—",
          petitionType: c.petitionType?.name || "—",
          visaTypeId: c.visaTypeId,
          petitionTypeId: c.petitionTypeId,
          status: c.status,
          priority: c.priority,
          submitted: c.submitted
            ? new Date(c.submitted).toLocaleDateString()
            : new Date(c.created_at).toLocaleDateString(),
          caseworkerIds: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId
            : [],
          caseworkerId: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId.join(", ")
            : c.assignedcaseworkerId,
          caseworker: Array.isArray(c.assignedcaseworkerId)
            ? `${c.assignedcaseworkerId.length} assigned`
            : "—",
          targetSubmissionDate: c.targetSubmissionDate,
          lcaNumber: c.lcaNumber,
          receiptNumber: c.receiptNumber,
          nationality: c.nationality,
          jobTitle: c.jobTitle,
          department: c.department,
          salaryOffered: c.salaryOffered,
          totalAmount: c.totalAmount,
          paidAmount: c.paidAmount,
          notes: c.notes,
        }));
        setCases(mappedCases);
      }
      setIsLoading(false);
      setEditOpen(false);
      setFormData(emptyForm);
      setSelectedCase(null);
    } catch (error) {
      setIsLoading(false);
      console.error("Error editing case:", error);
      alert("Error editing case.");
    }
  };

  const handleDelete = async (caseId) => {
    try {
      await deleteCase(caseId);
      // Refresh cases from API
      const response = await getCases();
      if (response?.data?.data?.cases) {
        const mappedCases = response.data.data.cases.map((c) => ({
          caseId: c.caseId || c.id.toString(),
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "—",
          candidateId: c.candidateId,
          business: c.sponsor
            ? `${c.sponsor.first_name} ${c.sponsor.last_name}`
            : "—",
          businessId: c.sponsorId,
          visaType: c.visaType?.name || "—",
          petitionType: c.petitionType?.name || "—",
          visaTypeId: c.visaTypeId,
          petitionTypeId: c.petitionTypeId,
          status: c.status,
          priority: c.priority,
          submitted: c.submitted
            ? new Date(c.submitted).toLocaleDateString()
            : new Date(c.created_at).toLocaleDateString(),
          caseworkerIds: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId
            : [],
          caseworkerId: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId.join(", ")
            : c.assignedcaseworkerId,
          caseworker: Array.isArray(c.assignedcaseworkerId)
            ? `${c.assignedcaseworkerId.length} assigned`
            : "—",
          targetSubmissionDate: c.targetSubmissionDate,
          lcaNumber: c.lcaNumber,
          receiptNumber: c.receiptNumber,
          nationality: c.nationality,
          jobTitle: c.jobTitle,
          department: c.department,
          salaryOffered: c.salaryOffered,
          totalAmount: c.totalAmount,
          paidAmount: c.paidAmount,
          notes: c.notes,
        }));
        setCases(mappedCases);
      }
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting case:", error);
      alert("Error deleting case.");
      setDeleteId(null);
    }
  };

  const handleApprove = async (caseId) => {
    setSelectedCase(cases.find((c) => c.caseId === caseId));
    setApproveRejectAction("approve");
    setApproveRejectNote("");
    setApproveRejectOpen(true);
  };

  const handleReject = async (caseId) => {
    setSelectedCase(cases.find((c) => c.caseId === caseId));
    setApproveRejectAction("reject");
    setApproveRejectNote("");
    setApproveRejectOpen(true);
  };

  const handleApproveRejectSubmit = async () => {
    if (!selectedCase) return;
    setIsLoading(true);
    try {
      console.log(
        "Updating case:",
        selectedCase.caseId,
        "to status:",
        approveRejectAction === "approve" ? "Approved" : "Rejected",
      );
      await updateCaseStatus(
        selectedCase.caseId,
        approveRejectAction === "approve" ? "Approved" : "Rejected",
      );
      // Refresh cases from API
      const response = await getCases();
      if (response?.data?.data?.cases) {
        const mappedCases = response.data.data.cases.map((c) => ({
          caseId: c.caseId || c.id.toString(),
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "—",
          candidateId: c.candidateId,
          business: c.sponsor
            ? `${c.sponsor.first_name} ${c.sponsor.last_name}`
            : "—",
          businessId: c.sponsorId,
          visaType: c.visaType?.name || "—",
          petitionType: c.petitionType?.name || "—",
          visaTypeId: c.visaTypeId,
          petitionTypeId: c.petitionTypeId,
          status: c.status,
          priority: c.priority,
          submitted: c.submitted
            ? new Date(c.submitted).toLocaleDateString()
            : new Date(c.created_at).toLocaleDateString(),
          caseworkerIds: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId
            : [],
          caseworkerId: Array.isArray(c.assignedcaseworkerId)
            ? c.assignedcaseworkerId.join(", ")
            : c.assignedcaseworkerId,
          caseworker: Array.isArray(c.assignedcaseworkerId)
            ? `${c.assignedcaseworkerId.length} assigned`
            : "—",
          targetSubmissionDate: c.targetSubmissionDate,
          lcaNumber: c.lcaNumber,
          receiptNumber: c.receiptNumber,
          nationality: c.nationality,
          jobTitle: c.jobTitle,
          department: c.department,
          salaryOffered: c.salaryOffered,
          totalAmount: c.totalAmount,
          paidAmount: c.paidAmount,
          notes: c.notes,
        }));
        setCases(mappedCases);
      }
      setIsLoading(false);
      setApproveRejectOpen(false);
      setApproveRejectNote("");
      setSelectedCase(null);
    } catch (error) {
      setIsLoading(false);
      console.error(`Error ${approveRejectAction}ing case:`, error);
      alert(`Error ${approveRejectAction}ing case: ${error.message}`);
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterType !== "all")
        params.status =
          filterType === "approved"
            ? "Approved"
            : filterType === "rejected"
              ? "Rejected"
              : filterType === "review"
                ? "Review"
                : "Pending";
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (visaTypeFilter !== "all") params.visaType = visaTypeFilter;

      const response = await exportCases(params);

      // Create a blob URL and download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cases_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting cases:", error);
      alert("Error exporting cases.");
    }
  };

  // Filter logic - simplified like MyCandidates
  const filteredCases = cases.filter((c) => {
    const caseIdStr = String(c.caseId || "").toLowerCase();
    const candidateStr = String(c.candidate || "").toLowerCase();
    const businessStr = String(c.business || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      caseIdStr.includes(query) ||
      candidateStr.includes(query) ||
      businessStr.includes(query);

    const matchesFilter =
      filterType === "all" ||
      (filterType?.toLowerCase() === "lead" &&
        c.status?.toLowerCase() === "lead") ||
      (filterType === "approved" && c.status === "Approved") ||
      (filterType === "pending" && c.status === "Pending") ||
      (filterType === "rejected" && c.status === "Rejected") ||
      (filterType === "review" && c.status === "Review");

    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "low" && c.priority === "low") ||
      (priorityFilter === "medium" && c.priority === "medium") ||
      (priorityFilter === "high" && c.priority === "high") ||
      (priorityFilter === "urgent" && c.priority === "urgent");

    const matchesVisaType =
      visaTypeFilter === "all" || c.visaType === visaTypeFilter;

    return matchesSearch && matchesFilter && matchesPriority && matchesVisaType;
  });

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <Briefcase className="text-primary" size={36} />
            Case Management
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            Manage visa cases and applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleExport}>
            <Download size={15} className="mr-1.5 inline" />
            Export
          </Button>
          <Button
            onClick={() => {
              setFormData(emptyForm);
              setErrors({});
              setAddOpen(true);
            }}
          >
            Add New Case
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, bg, color, Icon }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 ${bg} rounded-lg`}>
              <Icon className={`${color} h-6 w-6`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-secondary">Recent Cases</h3>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="review">Review</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-gray-400" />
              <select
                value={visaTypeFilter}
                onChange={(e) => setVisaTypeFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="all">All Visa Types</option>
                {visaTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_COLS.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredCases.map((c, i) => (
                <motion.tr
                  key={c.caseId}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">
                    {c.caseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {c.candidate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {c.business}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-[14rem]">
                    <span className="font-mono text-xs font-semibold text-secondary">
                      {getCaseworkerNames(c.caseworkerIds)}
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5 truncate">
                      {c.caseworker || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {c.visaType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${priorityBadge[c.priority]}`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {c.submitted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/case-detail/${c.caseId.replace(/^#/, "")}`,
                          )
                        }
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleApprove(c.caseId)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleReject(c.caseId)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.caseId)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {addOpen && (
          <CaseFormModal
            title="Add New Case"
            subtitle="Create a new visa case application"
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onChange={handleInputChange}
            onSubmit={handleAdd}
            onCaseworkerIdsChange={handleCaseworkerIdsChange}
            onClose={() => {
              setAddOpen(false);
              setFormData(emptyForm);
              setErrors({});
            }}
            candidates={candidates}
            sponsors={sponsors}
            visaTypes={visaTypes}
            petitionTypes={petitionTypes}
            caseworkers={caseworkers}
            setFormData={setFormData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen && (
          <CaseFormModal
            title="Edit Case"
            subtitle={`Editing ${selectedCase?.caseId}`}
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onChange={handleInputChange}
            onSubmit={handleEdit}
            onCaseworkerIdsChange={handleCaseworkerIdsChange}
            onClose={() => {
              setEditOpen(false);
              setFormData(emptyForm);
              setErrors({});
              setSelectedCase(null);
            }}
            candidates={candidates}
            sponsors={sponsors}
            visaTypes={visaTypes}
            petitionTypes={petitionTypes}
            caseworkers={caseworkers}
            setFormData={setFormData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {approveRejectOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setApproveRejectOpen(false)}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-black text-secondary mb-2">
                {approveRejectAction === "approve"
                  ? "Approve Case"
                  : "Reject Case"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {approveRejectAction === "approve"
                  ? "Approving this case will send a notification to the candidate and assigned caseworkers."
                  : "Rejecting this case will send a notification to the candidate and assigned caseworkers."}
              </p>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Note (optional)
                </label>
                <textarea
                  value={approveRejectNote}
                  onChange={(e) => setApproveRejectNote(e.target.value)}
                  placeholder="Add a note for the candidate and caseworkers..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setApproveRejectOpen(false)}
                >
                  Cancel
                </Button>
                <button
                  onClick={handleApproveRejectSubmit}
                  disabled={isLoading}
                  className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors ${
                    approveRejectAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLoading
                    ? "Processing..."
                    : approveRejectAction === "approve"
                      ? "Approve"
                      : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-black text-secondary mb-2">
                Delete Case
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">{deleteId}</span>? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
