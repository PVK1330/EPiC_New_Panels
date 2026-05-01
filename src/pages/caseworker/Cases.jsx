import { useMemo, useState, useCallback, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  FileText,
  Send,
  Check,
  Lock,
  Eye,
  Pencil,
  MessageSquare,
  UserRoundCog,
  X,
  CalendarClock,
  ArrowRightLeft,
  Clock,
  Table,
  LayoutGrid,
} from "lucide-react";
import { useSelector } from "react-redux";
import Modal from "../../components/Modal";
import CaseTimeline from "../../components/CaseTimeline";
import useCaseDetail from "../../hooks/useCaseDetail";
import { getCaseworkerCases, getVisaTypes, getPetitionTypes, getAllUsers, createCaseworkerCase, updateCaseworkerCase, getDepartments, getCaseworkerCaseDetails, getCaseDocuments, uploadDocument, updateDocument, deleteDocument, updateDocumentStatus, downloadDocument, getCaseNotes, createCaseNote, updateCaseNote, deleteCaseNote, getTasks, getTaskByCaseId, createTask, updateTask, deleteTask, exportCases } from "../../services/caseApi";
import { getCaseAuditLogs } from "../../services/auditApi";
import { getCaseChecklist } from "../../services/documentChecklistApi";
import { useToast } from "../../context/ToastContext";
import { DOCUMENT_TYPE_OPTIONS } from "../../utils/constants";

const PAGE_SIZE = 7;

/** Demo dataset — 24 cases */
const CASES_DATA = [
  {
    caseId: "#C-2401",
    candidate: "Ahmed Al-Rashid",
    business: "TechCorp Ltd",
    visa: "Tier 2",
    status: "on_track",
    target: "2026-04-18",
    priority: "high",
    payment: "paid",
  },
  {
    caseId: "#C-2398",
    candidate: "Priya Sharma",
    business: "Nexus Group",
    visa: "Skilled Worker",
    status: "due_soon",
    target: "2026-04-12",
    priority: "medium",
    payment: "partial",
  },
  {
    caseId: "#C-2391",
    candidate: "Carlos Mendes",
    business: "BuildRight Inc",
    visa: "Intra-Co",
    status: "overdue",
    target: "2026-04-03",
    priority: "urgent",
    payment: "outstanding",
  },
  {
    caseId: "#C-2389",
    candidate: "Mei Lin Chen",
    business: "Global Finance",
    visa: "Graduate",
    status: "on_track",
    target: "2026-05-02",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2385",
    candidate: "Ivan Petrov",
    business: "EnviroTech",
    visa: "Tier 2",
    status: "on_track",
    target: "2026-05-15",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2380",
    candidate: "Fatima Al-Zahra",
    business: "MediCare Group",
    visa: "Health & Care",
    status: "due_soon",
    target: "2026-04-20",
    priority: "medium",
    payment: "partial",
  },
  {
    caseId: "#C-2376",
    candidate: "Rajesh Patel",
    business: "Innovate Corp",
    visa: "Skilled Worker",
    status: "on_track",
    target: "2026-06-01",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2370",
    candidate: "Sofia Nielsen",
    business: "Nordic AI Ltd",
    visa: "Skilled Worker",
    status: "on_track",
    target: "2026-06-12",
    priority: "medium",
    payment: "paid",
  },
  {
    caseId: "#C-2365",
    candidate: "James O'Connor",
    business: "Celtic Foods",
    visa: "Tier 2",
    status: "due_soon",
    target: "2026-04-25",
    priority: "high",
    payment: "partial",
  },
  {
    caseId: "#C-2360",
    candidate: "Yuki Tanaka",
    business: "Tokyo Trade UK",
    visa: "Intra-Co",
    status: "on_track",
    target: "2026-07-01",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2355",
    candidate: "Elena Popov",
    business: "EuroBuild",
    visa: "Skilled Worker",
    status: "overdue",
    target: "2026-03-28",
    priority: "urgent",
    payment: "outstanding",
  },
  {
    caseId: "#C-2350",
    candidate: "Marcus Webb",
    business: "Webb Legal",
    visa: "Graduate",
    status: "completed",
    target: "2026-03-01",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2344",
    candidate: "Nomsa Dlamini",
    business: "HealthFirst",
    visa: "Health & Care",
    status: "on_track",
    target: "2026-05-30",
    priority: "medium",
    payment: "paid",
  },
  {
    caseId: "#C-2339",
    candidate: "Lukas Meyer",
    business: "AutoParts DE UK",
    visa: "Tier 2",
    status: "on_track",
    target: "2026-06-20",
    priority: "low",
    payment: "partial",
  },
  {
    caseId: "#C-2332",
    candidate: "Anna Kowalski",
    business: "PolskaBake",
    visa: "Skilled Worker",
    status: "due_soon",
    target: "2026-04-22",
    priority: "high",
    payment: "paid",
  },
  {
    caseId: "#C-2328",
    candidate: "David Mensah",
    business: "AfriCommerce",
    visa: "Skilled Worker",
    status: "on_track",
    target: "2026-07-05",
    priority: "medium",
    payment: "paid",
  },
  {
    caseId: "#C-2321",
    candidate: "Hannah Scott",
    business: "Scott Retail",
    visa: "Graduate",
    status: "overdue",
    target: "2026-04-01",
    priority: "high",
    payment: "outstanding",
  },
  {
    caseId: "#C-2315",
    candidate: "Omar Farouk",
    business: "Desert Tech",
    visa: "Tier 2",
    status: "on_track",
    target: "2026-08-01",
    priority: "medium",
    payment: "paid",
  },
  {
    caseId: "#C-2310",
    candidate: "Chloe Martin",
    business: "Martin Design",
    visa: "Skilled Worker",
    status: "completed",
    target: "2026-02-15",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2304",
    candidate: "Diego Silva",
    business: "Silva Logistics",
    visa: "Intra-Co",
    status: "on_track",
    target: "2026-09-10",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2299",
    candidate: "Grace Okonkwo",
    business: "Lagos Express UK",
    visa: "Skilled Worker",
    status: "due_soon",
    target: "2026-04-28",
    priority: "medium",
    payment: "partial",
  },
  {
    caseId: "#C-2293",
    candidate: "Tom Bradley",
    business: "Bradley Farms",
    visa: "Tier 2",
    status: "on_track",
    target: "2026-10-01",
    priority: "low",
    payment: "paid",
  },
  {
    caseId: "#C-2288",
    candidate: "Wang Lei",
    business: "Pacific Imports",
    visa: "Skilled Worker",
    status: "on_track",
    target: "2026-06-18",
    priority: "high",
    payment: "paid",
  },
  {
    caseId: "#C-2281",
    candidate: "Isabelle Fortin",
    business: "Fortin Avocats UK",
    visa: "Graduate",
    status: "completed",
    target: "2026-01-20",
    priority: "low",
    payment: "paid",
  },
];

const REASSIGN_REASONS = [
  "Caseworker unavailable / on leave",
  "Conflict of interest",
  "Specialist expertise required",
  "Workload rebalancing",
  "Escalation to senior caseworker",
  "Other",
];

const STATUS_CHIPS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "due_soon", label: "Due soon" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

const VISA_OPTIONS = [
  "All visa types",
  "Tier 2",
  "Skilled Worker",
  "Graduate",
  "Intra-Co",
  "Health & Care",
];

const PRIORITY_OPTIONS = ["All priorities", "Urgent", "High", "Medium", "Low"];

const NEW_CASE_VISA = VISA_OPTIONS.filter((v) => v !== "All visa types");

const CASE_STATUS_EDIT = [
  { value: "on_track", label: "On track" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
];

const CASE_PAYMENT_EDIT = [
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "outstanding", label: "Outstanding" },
];

const emptyNewCaseForm = () => ({
  candidateName: "",
  candidateId: "",
  nationality: "",
  jobTitle: "",
  department: "",
  businessName: "",
  businessId: "",
  sponsorId: "",
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
});

const caseToEditForm = (c) => ({
  candidate:
    c.candidate?.first_name && c.candidate?.last_name
      ? `${c.candidate.first_name} ${c.candidate.last_name}`
      : c.candidate || "",
  business:
    c.business?.sponsor?.first_name && c.business?.sponsor?.last_name
      ? `${c.business.sponsor.first_name} ${c.business.sponsor.last_name}`
      : c.business || "",
  visa: c.visaType?.name || c.visa || "",
  status: c.status || c.overview?.status || "",
  target:
    c.target ||
    c.targetSubmissionDate ||
    c.overview?.targetSubmissionDate ||
    "",
  priority: c.priority || c.overview?.priority || "",
  payment: c.payment || "",
  candidateId: c.candidateId || c.candidate?.id || "",
  sponsorId: c.sponsorId || c.business?.sponsor?.id || "",
  businessId: c.businessId || c.business?.businessId || "",
  visaTypeId: c.visaTypeId || c.visaType?.id || "",
  petitionTypeId: c.petitionTypeId || c.petitionType?.id || "",
  lcaNumber: c.lcaNumber || c.additional?.lcaNumber || "",
  receiptNumber: c.receiptNumber || c.additional?.receiptNumber || "",
  assignedCaseworkerIds: c.assignedcaseworkerId 
    ? (Array.isArray(c.assignedcaseworkerId) ? c.assignedcaseworkerId : [c.assignedcaseworkerId])
    : [],
  salaryOffered: c.salaryOffered || c.financial?.salaryOffered || "",
  totalAmount: c.totalAmount || c.financial?.totalFee || "",
  paidAmount: c.paidAmount || c.financial?.totalPaid || "",
  notes: c.notes || c.additional?.notes || "",
  nationality: c.nationality || c.candidate?.nationality || "",
  jobTitle: c.jobTitle || c.additional?.jobTitle || "",
  department:
    c.departmentId || c.department?.id || c.additional?.departmentId || "",
});

const emptyReassignForm = () => ({
  caseworkerIds: [],
  reasonPreset: "",
  reasonCustom: "",
});

function formatTarget(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function badgeStatus(status) {
  const m = {
    on_track: "bg-emerald-50 text-emerald-800 border-emerald-200",
    due_soon: "bg-amber-50 text-amber-800 border-amber-200",
    overdue: "bg-red-50 text-red-800 border-red-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const labels = {
    on_track: "On track",
    due_soon: "Due soon",
    overdue: "Overdue",
    completed: "Completed",
  };
  return {
    className: m[status] || m.on_track,
    label: labels[status] || status,
  };
}

function badgePriority(p) {
  const m = {
    urgent: "bg-red-50 text-red-800 border-red-200",
    high: "bg-red-50 text-red-800 border-red-200",
    medium: "bg-amber-50 text-amber-800 border-amber-200",
    low: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return m[p] || m.low;
}

function badgePayment(p) {
  const m = {
    paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
    partial: "bg-amber-50 text-amber-800 border-amber-200",
    outstanding: "bg-red-50 text-red-800 border-red-200",
  };
  const labels = {
    paid: "Paid",
    partial: "Partial",
    outstanding: "Outstanding",
  };
  return { className: m[p], label: labels[p] };
}

function badgeVisa(v) {
  const isPurple = v === "Health & Care";
  return isPurple
    ? "bg-violet-50 text-violet-800 border-violet-200"
    : "bg-sky-50 text-sky-800 border-sky-200";
}

function loadColor(load) {
  if (load >= 10) return "bg-red-50 text-red-700 border-red-200";
  if (load >= 5) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-green-50 text-green-700 border-green-200";
}

const priorityLabel = (p) => {
  return p.charAt(0).toUpperCase() + p.slice(1);
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

const Cases = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'kanban'
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("all");
  const [visaFilter, setVisaFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailCase, setDetailCase] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState(emptyNewCaseForm);
  const [newCaseErrors, setNewCaseErrors] = useState({});
  const [editCaseId, setEditCaseId] = useState(null);
  const [editCaseForm, setEditCaseForm] = useState(() =>
    caseToEditForm(CASES_DATA[0]),
  );
  const [editCaseErrors, setEditCaseErrors] = useState({});
  const [visaTypes, setVisaTypes] = useState([]);
  const [petitionTypes, setPetitionTypes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [caseworkers, setCaseworkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Kanban specific states
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = useCallback((card) => {
    setDetailCase(card);
  }, []);

  // Fetch cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: PAGE_SIZE,
          search,
          status: chip === "all" ? "" : chip,
          priority:
            priorityFilter === "All priorities"
              ? ""
              : priorityFilter.toLowerCase(),
          visaTypeId: visaFilter === "All visa types" ? "" : visaFilter,
          sortBy: "created_at",
          sortOrder: "DESC",
        };
        const response = await getCaseworkerCases(params);

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
          status: mapApiStatus(c.status),
          target: c.targetSubmissionDate || c.created_at,
          priority: c.priority?.toLowerCase() || "medium",
          payment: mapPaymentStatus(c.paidAmount, c.totalAmount),
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.department,
          sponsor: c.sponsor,
          caseworker:
            c.caseworkers && c.caseworkers.length > 0
              ? c.caseworkers
                  .map((cw) => `${cw.first_name} ${cw.last_name}`)
                  .join(", ")
              : "Unassigned",
        }));

        setCases(mappedCases);
        setPagination(response.data.data.pagination);
        setError(null);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases. Please try again.");
        // Fallback to demo data on error
        setCases([...CASES_DATA]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [page, search, chip, visaFilter, priorityFilter]);

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
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  // Helper functions to map API data to UI format
  const mapApiStatus = (status) => {
    const statusMap = {
      Pending: "on_track",
      "In Progress": "on_track",
      Completed: "completed",
      Approved: "completed",
      Rejected: "overdue",
      Cancelled: "overdue",
    };
    return statusMap[status] || "on_track";
  };

  const mapPaymentStatus = (paid, total) => {
    if (!paid || paid === 0) return "outstanding";
    if (paid >= total) return "paid";
    return "partial";
  };

  // ── Reassign state ──────────────────────────────────────────────────────────
  const [reassignCaseId, setReassignCaseId] = useState(null);
  const [reassignForm, setReassignForm] = useState(emptyReassignForm());
  const [reassignErrors, setReassignErrors] = useState({});
  // Map: caseId → { caseworker, reason, at }
  const [reassignments, setReassignments] = useState({});
  // ───────────────────────────────────────────────────────────────────────────

  const openDetail = useCallback((c) => {
    setNewCaseOpen(false);
    setEditCaseId(null);
    setReassignCaseId(null);
    setDetailCase(c);
    setDetailTab("overview");
  }, []);

  const closeDetail = useCallback(() => setDetailCase(null), []);

  const openNewCaseModal = useCallback(() => {
    setDetailCase(null);
    setEditCaseId(null);
    setReassignCaseId(null);
    setNewCaseErrors({});
    setNewCaseForm(emptyNewCaseForm());
    setNewCaseOpen(true);
  }, []);

  const openCaseEdit = useCallback((c) => {
    setNewCaseOpen(false);
    setDetailCase(null);
    setReassignCaseId(null);
    setEditCaseErrors({});
    setEditCaseId(c.caseId);
    setEditCaseForm(caseToEditForm(c));
  }, []);

  const closeCaseEdit = useCallback(() => {
    setEditCaseId(null);
    setEditCaseErrors({});
  }, []);

  const submitCaseEdit = useCallback(async () => {
    const err = {};
    if (!editCaseForm.candidate.trim()) err.candidate = "Required";
    if (!editCaseForm.business.trim()) err.business = "Required";
    if (!editCaseForm.target) err.target = "Required";
    setEditCaseErrors(err);
    if (Object.keys(err).length) return;

    try {
      const caseData = {
        candidateId: editCaseForm.candidateId,
        sponsorId: editCaseForm.sponsorId,
        businessId: editCaseForm.businessId,
        visaTypeId: editCaseForm.visaTypeId,
        petitionTypeId: editCaseForm.petitionTypeId,
        priority: editCaseForm.priority,
        status: editCaseForm.status,
        targetSubmissionDate: editCaseForm.target,
        lcaNumber: editCaseForm.lcaNumber,
        receiptNumber: editCaseForm.receiptNumber,
        assignedcaseworkerId: editCaseForm.assignedCaseworkerIds,
        salaryOffered: editCaseForm.salaryOffered,
        totalAmount: editCaseForm.totalAmount,
        paidAmount: editCaseForm.paidAmount,
        notes: editCaseForm.notes,
        nationality: editCaseForm.nationality,
        jobTitle: editCaseForm.jobTitle,
        departmentId: editCaseForm.department,
        biometricsDate: editCaseForm.biometricsDate,
        submissionDate: editCaseForm.submissionDate,
        decisionDate: editCaseForm.decisionDate,
      };

      await updateCaseworkerCase(editCaseId, caseData);

      // Refresh cases from API
      const params = {
        page: 1,
        limit: PAGE_SIZE,
        search,
        status: chip === "all" ? "" : chip,
        priority:
          priorityFilter === "All priorities"
            ? ""
            : priorityFilter.toLowerCase(),
        visaTypeId: visaFilter === "All visa types" ? "" : visaFilter,
        sortBy: "created_at",
        sortOrder: "DESC",
      };
      const response = await getCaseworkerCases(params);

      if (response?.data?.data?.cases) {
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
          status: mapApiStatus(c.status),
          target: c.targetSubmissionDate || c.created_at,
          priority: c.priority?.toLowerCase() || "medium",
          payment:
            c.paidAmount >= c.totalAmount
              ? "paid"
              : c.paidAmount > 0
                ? "partial"
                : "outstanding",
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.department,
          sponsor: c.sponsor,
          caseworker:
            c.caseworkers && c.caseworkers.length > 0
              ? c.caseworkers
                  .map((cw) => `${cw.first_name} ${cw.last_name}`)
                  .join(", ")
              : "Unassigned",
        }));
        setCases(mappedCases);
      }

      closeCaseEdit();
    } catch (error) {
      console.error("Error updating case:", error);
      alert("Failed to update case. Please try again.");
    }
  }, [
    editCaseId,
    editCaseForm,
    closeCaseEdit,
    search,
    chip,
    priorityFilter,
    visaFilter,
  ]);

  const closeNewCaseModal = useCallback(() => {
    setNewCaseOpen(false);
    setNewCaseErrors({});
    setNewCaseForm(emptyNewCaseForm());
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewCaseForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    if (newCaseErrors[name])
      setNewCaseErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCaseworkerIdsChange = (ids) => {
    setNewCaseForm((prev) => ({ ...prev, assignedCaseworkerIds: ids }));
    if (newCaseErrors.assignedCaseworkers)
      setNewCaseErrors((prev) => ({ ...prev, assignedCaseworkers: "" }));
  };

  const validateNewCase = () => {
    const e = {};
    if (!newCaseForm.candidateId) e.candidateId = "Required";
    if (!newCaseForm.businessId) e.businessId = "Required";
    if (!newCaseForm.visaTypeId) e.visaTypeId = "Required";
    const n = newCaseForm.assignedCaseworkerIds?.length || 0;
    if (n < 1 || n > 2) e.assignedCaseworkers = "Select 1 or 2 caseworkers";
    if (!newCaseForm.targetSubmissionDate) e.targetSubmissionDate = "Required";
    if (newCaseForm.totalAmount <= 0) e.totalAmount = "Must be > 0";
    setNewCaseErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitNewCase = useCallback(async () => {
    if (!validateNewCase()) return;
    setIsLoading(true);
    try {
      const cwIds = newCaseForm.assignedCaseworkerIds || [];
      const caseData = {
        candidateId: parseInt(newCaseForm.candidateId) || null,
        sponsorId: parseInt(newCaseForm.sponsorId) || null,
        businessId: parseInt(newCaseForm.businessId) || null,
        visaTypeId: parseInt(newCaseForm.visaTypeId) || null,
        petitionTypeId: parseInt(newCaseForm.petitionTypeId) || null,
        priority: newCaseForm.priority,
        targetSubmissionDate: newCaseForm.targetSubmissionDate,
        lcaNumber: newCaseForm.lcaNumber,
        receiptNumber: newCaseForm.receiptNumber,
        assignedcaseworkerId: cwIds,
        salaryOffered: newCaseForm.salaryOffered,
        totalAmount: newCaseForm.totalAmount,
        paidAmount: newCaseForm.paidAmount,
        notes: newCaseForm.notes,
        nationality: newCaseForm.nationality,
        jobTitle: newCaseForm.jobTitle,
        departmentId: parseInt(newCaseForm.department) || null,
      };
      await createCaseworkerCase(caseData);

      // Refresh cases from API
      const params = {
        page: 1,
        limit: PAGE_SIZE,
        search,
        status: chip === "all" ? "" : chip,
        priority:
          priorityFilter === "All priorities"
            ? ""
            : priorityFilter.toLowerCase(),
        visaTypeId: visaFilter === "All visa types" ? "" : visaFilter,
        sortBy: "created_at",
        sortOrder: "DESC",
      };
      const response = await getCaseworkerCases(params);

      if (response?.data?.data?.cases) {
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
          status: mapApiStatus(c.status),
          target: c.targetSubmissionDate || c.created_at,
          priority: c.priority?.toLowerCase() || "medium",
          payment: mapPaymentStatus(c.paidAmount, c.totalAmount),
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.department,
          sponsor: c.sponsor,
          caseworker:
            c.caseworkers && c.caseworkers.length > 0
              ? c.caseworkers
                  .map((cw) => `${cw.first_name} ${cw.last_name}`)
                  .join(", ")
              : "Unassigned",
        }));
        setCases(mappedCases);
        setPagination(response.data.data.pagination);
      }

      setIsLoading(false);
      closeNewCaseModal();
      setNewCaseForm(emptyNewCaseForm());
      setNewCaseErrors({});
      setPage(1);
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating case:", error);
      alert(
        "Error creating case. Please ensure Candidate ID, Business ID, Visa Type, and Petition Type are provided.",
      );
    }
  }, [
    newCaseForm,
    newCaseErrors,
    closeNewCaseModal,
    search,
    chip,
    priorityFilter,
    visaFilter,
  ]);

  // ── Reassign handlers ───────────────────────────────────────────────────────
  const openReassign = useCallback((c) => {
    setDetailCase(null);
    setNewCaseOpen(false);
    setEditCaseId(null);
    setReassignErrors({});
    setReassignForm(emptyReassignForm());
    setReassignCaseId(c.caseId);
  }, []);

  const closeReassign = useCallback(() => {
    setReassignCaseId(null);
    setReassignErrors({});
    setReassignForm(emptyReassignForm());
  }, []);

  const submitReassign = useCallback(() => {
    const err = {};
    if (!reassignForm.caseworkerIds || reassignForm.caseworkerIds.length === 0)
      err.caseworkerIds = "Please select at least one caseworker";
    if (!reassignForm.reasonPreset) err.reasonPreset = "Please select a reason";
    if (
      reassignForm.reasonPreset === "Other" &&
      !reassignForm.reasonCustom.trim()
    )
      err.reasonCustom = "Please provide a reason";
    setReassignErrors(err);
    if (Object.keys(err).length) return;

    const caseworkers = reassignForm.caseworkerIds.map(id => caseworkers.find((w) => w.id === id)).filter(Boolean);
    const reason =
      reassignForm.reasonPreset === "Other"
        ? reassignForm.reasonCustom.trim()
        : reassignForm.reasonPreset;

    setReassignments((prev) => ({
      ...prev,
      [reassignCaseId]: {
        caseworkers: caseworkers.map(cw => ({ name: `${cw.first_name} ${cw.last_name}`, role: cw.role || "Caseworker" })),
        reason,
        at: new Date(),
      },
    }));
    closeReassign();
  }, [reassignCaseId, reassignForm, closeReassign, caseworkers]);
  // ───────────────────────────────────────────────────────────────────────────

  // Filtering is now handled by the API, so we use cases directly
  const filtered = cases;

  // Use API pagination instead of client-side
  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const pageSlice = cases; // API already paginates

  // The case object for the reassign modal title
  const reassignCase = reassignCaseId
    ? cases.find((c) => c.caseId === reassignCaseId)
    : null;

  // Calculate stats for summary cards
  const stats = [
    {
      label: "Total Cases",
      value: cases.length,
      bg: "bg-blue-50",
      color: "text-blue-600",
      Icon: FileText,
    },
    {
      label: "Pending",
      value: cases.filter(
        (c) => c.status === "on_track" || c.status === "due_soon",
      ).length,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
      Icon: Clock,
    },
    {
      label: "Approved",
      value: cases.filter((c) => c.status === "completed").length,
      bg: "bg-green-50",
      color: "text-green-600",
      Icon: Check,
    },
    {
      label: "Rejected",
      value: cases.filter((c) => c.status === "overdue").length,
      bg: "bg-red-50",
      color: "text-red-600",
      Icon: X,
    },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            Case Management
          </h1>
          <p className="text-sm font-bold text-gray-600 mt-1">
            Manage visa cases and applications
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/caseworker/pipeline")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <LayoutGrid size={18} />
            Pipeline View
          </button>
          <button
            type="button"
            onClick={() =>
              window.alert("Demo: export would download a CSV/spreadsheet.")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Download size={18} />
            Export
          </button>
          <button
            type="button"
            onClick={openNewCaseModal}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add New Cases
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
              >
                <stat.Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Cases Section */}
      {viewMode === "table" && (
        <>
          <div>
            <h2 className="text-lg font-black text-secondary mb-4">
              Recent Cases
            </h2>

            <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-center mb-4">
              {loading && (
                <div className="w-full py-8 text-center text-sm font-bold text-gray-500">
                  Loading cases...
                </div>
              )}
              {error && (
                <div className="w-full py-4 px-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700">
                  {error}
                </div>
              )}
              {!loading && !error && (
                <>
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search cases..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={chip === "all" ? "" : chip}
                      onChange={(e) => {
                        setChip(e.target.value || "all");
                        setPage(1);
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    >
                      <option value="">All Statuses</option>
                      {STATUS_CHIPS.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => {
                        setPriorityFilter(e.target.value);
                        setPage(1);
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    >
                      <option value="">All Priorities</option>
                      {PRIORITY_OPTIONS.filter(
                        (p) => p !== "All priorities",
                      ).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select
                      value={visaFilter}
                      onChange={(e) => {
                        setVisaFilter(e.target.value);
                        setPage(1);
                      }}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    >
                      <option value="">All Visa Types</option>
                      {visaTypes.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {[
                      "CASE-ID",
                      "CANDIDATE",
                      "BUSINESS",
                      "DEPARTMENT",
                      "CASEWORKER(S)",
                      "VISA TYPE",
                      "PRIORITY",
                      "STATUS",
                      "SUBMITTED",
                      "ACTIONS",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageSlice.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-sm font-bold text-gray-500"
                      >
                        No cases match your filters.
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map((c, idx) => {
                      const st = badgeStatus(c.status);
                      const reassigned = reassignments[c.caseId];
                      return (
                        <Fragment key={c.id || c.caseId || idx}>
                          {/* ── Main data row ── */}
                          <tr
                            className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${reassigned ? "border-b-0" : ""}`}
                            onClick={() => openDetail(c)}
                          >
                            <td className="py-3 px-4 text-sm font-bold text-secondary">
                              {c.caseId}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900">
                              {c.candidate?.first_name && c.candidate?.last_name
                                ? `${c.candidate.first_name} ${c.candidate.last_name}`
                                : c.candidate || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900">
                              {c.sponsor?.first_name && c.sponsor?.last_name
                                ? `${c.sponsor.first_name} ${c.sponsor.last_name}`
                                : c.business || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-600">
                              {c.department?.name || c.department || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-600">
                              {c.caseworker || "Unassigned"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeVisa(c.visa)}`}
                              >
                                {c.visa}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgePriority(c.priority)}`}
                              >
                                {priorityLabel(c.priority)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${st.className}`}
                              >
                                {st.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-600 tabular-nums whitespace-nowrap">
                              {formatTarget(c.target)}
                            </td>
                            <td
                              className="py-3 px-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openDetail(c)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-600 hover:border-secondary/40 hover:text-secondary transition-colors"
                                  title="View case"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openCaseEdit(c)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-secondary hover:bg-secondary/5 transition-colors"
                                  title="Edit case"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/caseworker/messages?caseId=${encodeURIComponent(c.caseId)}`,
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-600 hover:border-primary/40 hover:text-primary transition-colors"
                                  title="Message candidate"
                                >
                                  <MessageSquare size={14} />
                                </button>
                                {/* ── Reassign button ── */}
                                <button
                                  type="button"
                                  onClick={() => openReassign(c)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-black transition-colors ${
                                    reassigned
                                      ? "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50"
                                  }`}
                                  title="Reassign case"
                                >
                                  <ArrowRightLeft size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ── Reassignment info banner row ── */}
                          {reassigned && (
                            <tr
                              key={`${c.caseId}-reassigned`}
                              className="bg-violet-50/60 border-b border-violet-100"
                            >
                              <td colSpan={9} className="px-4 py-2">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-violet-700">
                                    <ArrowRightLeft size={12} />
                                    Reassigned to{" "}
                                    <span className="font-black text-violet-900">
                                      {reassigned.caseworker}
                                    </span>
                                    <span className="font-bold text-violet-500">
                                      ({reassigned.caseworkerRole})
                                    </span>
                                  </span>
                                  <span className="text-[11px] font-bold text-violet-600">
                                    Reason:{" "}
                                    <span className="italic">
                                      {reassigned.reason}
                                    </span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-500 ml-auto">
                                    <CalendarClock size={12} />
                                    {formatDateTime(reassigned.at)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/80">
              <p className="text-xs font-bold text-gray-500 tabular-nums">
                Showing {(pageClamped - 1) * PAGE_SIZE + 1}–
                {Math.min(pageClamped * PAGE_SIZE, pagination.total)} of{" "}
                {pagination.total} cases
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pageClamped <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-white"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPage(num)}
                      className={`min-w-[2rem] rounded-lg border px-2 py-1 text-xs font-black ${
                        pageClamped === num
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-gray-200 text-gray-600 hover:bg-white"
                      }`}
                    >
                      {num}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={pageClamped >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-white"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            className="pb-10 min-h-[calc(100vh-8rem)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {isPipelineLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-500">Loading pipeline...</div>
              </div>
            ) : (
              <motion.div
                className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 [scrollbar-width:thin]"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {stages.map((stage) => (
                  <motion.section
                    key={stage.id}
                    variants={colVariant}
                    className={`shrink-0 w-[min(100%,280px)] sm:w-72 flex flex-col rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/90 shadow-sm overflow-hidden ${stage.header}`}
                  >
                    <header className="px-3.5 pt-3.5 pb-2 flex items-center justify-between gap-2 border-b border-gray-100/80 bg-white/60 backdrop-blur-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <h2
                          className={`text-sm font-black ${stage.titleClass} truncate`}
                        >
                          {stage.title}
                        </h2>
                      </div>
                      <span
                        className={`text-xs font-black tabular-nums text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg`}
                      >
                        {stage.cards.length}
                      </span>
                    </header>
                    <SortableContext
                      items={stage.cards.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn stage={stage}>
                        {stage.cards.map((card) => (
                          <SortableCard
                            key={card.id}
                            card={card}
                            onClick={handleCardClick}
                          />
                        ))}
                        {stage.cards.length === 0 && (
                          <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-400">
                            Drop here
                          </div>
                        )}
                      </DroppableColumn>
                    </SortableContext>
                  </motion.section>
                ))}
              </motion.div>
            )}
          </motion.div>

          <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
            {activeCard && (
              <article className="rounded-xl bg-white border border-gray-200 p-3.5 shadow-2xl rotate-2 w-72 opacity-95">
                <CardContent card={activeCard} />
              </article>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Case Detail Modal is handled at the bottom of the file (shared with Table view) */}

      {/* ─────────────────────── NEW CASE MODAL ─────────────────────── */}
      <Modal
        open={newCaseOpen}
        onClose={closeNewCaseModal}
        title="New case"
        titleId="new-case-modal-title"
        maxWidthClass="max-w-3xl"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-6">
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
                      value={newCaseForm.candidateId}
                      onChange={(e) => {
                        const selectedCandidate = candidates.find(
                          (c) => c.id === parseInt(e.target.value),
                        );
                        setNewCaseForm((prev) => ({
                          ...prev,
                          candidateId: e.target.value,
                          candidateName: selectedCandidate
                            ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}`
                            : "",
                        }));
                        if (newCaseErrors.candidateId)
                          setNewCaseErrors((prev) => ({
                            ...prev,
                            candidateId: "",
                          }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.candidateId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">Select candidate</option>
                      {candidates.map((c, idx) => (
                        <option key={`${c.id}-${idx}`} value={c.id}>
                          {c.first_name} {c.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {newCaseErrors.candidateId && (
                    <span className="text-xs text-red-500">
                      {newCaseErrors.candidateId}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    value={newCaseForm.candidateName}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from selection"
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none cursor-not-allowed text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={newCaseForm.nationality}
                    onChange={handleInputChange}
                    placeholder="e.g. Indian"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newCaseForm.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={newCaseForm.department}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
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
                      value={newCaseForm.businessId}
                      onChange={(e) => {
                        const selectedSponsor = sponsors.find(
                          (s) => s.id === parseInt(e.target.value),
                        );
                        setNewCaseForm((prev) => ({
                          ...prev,
                          sponsorId: e.target.value,
                          businessId:
                            selectedSponsor?.sponsorProfile?.id ||
                            e.target.value,
                          businessName:
                            selectedSponsor?.sponsorProfile?.companyName ||
                            selectedSponsor?.sponsorProfile?.tradingName ||
                            `${selectedSponsor.first_name} ${selectedSponsor.last_name}`,
                        }));
                        if (newCaseErrors.businessId)
                          setNewCaseErrors((prev) => ({
                            ...prev,
                            businessId: "",
                          }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.businessId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">Select sponsor</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {newCaseErrors.businessId && (
                    <span className="text-xs text-red-500">
                      {newCaseErrors.businessId}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={newCaseForm.businessName}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from selection"
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none cursor-not-allowed text-gray-600"
                  />
                </div>
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
                  value={newCaseForm.visaTypeId}
                  onChange={handleInputChange}
                  className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.visaTypeId ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select visa type</option>
                  {visaTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {newCaseErrors.visaTypeId && (
                  <span className="text-xs text-red-500">
                    {newCaseErrors.visaTypeId}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Petition Type
                </label>
                <select
                  name="petitionTypeId"
                  value={newCaseForm.petitionTypeId}
                  onChange={handleInputChange}
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
                  value={newCaseForm.priority}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {priorityLevels.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Target Submission Date
                </label>
                <input
                  type="date"
                  name="targetSubmissionDate"
                  value={newCaseForm.targetSubmissionDate}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.targetSubmissionDate ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.targetSubmissionDate && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.targetSubmissionDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  LCA Number
                </label>
                <input
                  type="text"
                  name="lcaNumber"
                  value={newCaseForm.lcaNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. I-200-24001"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Receipt Number
                </label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={newCaseForm.receiptNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. EAC240..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
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
                    : []
                }
                value={newCaseForm.assignedCaseworkerIds || []}
                onChange={handleCaseworkerIdsChange}
                error={newCaseErrors.assignedCaseworkers}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">
              Financial Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Salary Offered ($)
                </label>
                <input
                  type="number"
                  name="salaryOffered"
                  value={newCaseForm.salaryOffered}
                  onChange={handleInputChange}
                  placeholder="Annual salary"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Total Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={newCaseForm.totalAmount}
                  onChange={handleInputChange}
                  placeholder="Total fee"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.totalAmount ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.totalAmount && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.totalAmount}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Paid Amount ($)
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={newCaseForm.paidAmount}
                  onChange={handleInputChange}
                  placeholder="Amount paid so far"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={newCaseForm.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any notes or comments..."
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeNewCaseModal}
              disabled={isLoading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitNewCase}
              disabled={isLoading}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
            >
              {isLoading ? "Saving..." : "Create Case"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────── EDIT CASE MODAL ─────────────────────── */}
      <Modal
        open={!!editCaseId}
        onClose={closeCaseEdit}
        title={editCaseId ? `Edit case ${editCaseId}` : ""}
        titleId="case-edit-modal-title"
        maxWidthClass="max-w-4xl"
        bodyClassName="p-4 sm:p-6"
      >
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
                    value={editCaseForm.candidateId}
                    onChange={(e) => {
                      const selectedCandidate = candidates.find(
                        (c) => c.id === parseInt(e.target.value),
                      );
                      setEditCaseForm((prev) => ({
                        ...prev,
                        candidateId: e.target.value,
                        candidate: selectedCandidate
                          ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}`
                          : "",
                      }));
                    }}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary border-gray-300"
                  >
                    <option value="">Select candidate</option>
                    {candidates.map((c, idx) => (
                      <option key={`${c.id}-${idx}`} value={c.id}>
                        {c.first_name} {c.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={editCaseForm.candidate}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none cursor-not-allowed text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={editCaseForm.nationality}
                  onChange={(e) =>
                    setEditCaseForm((f) => ({ ...f, nationality: e.target.value }))
                  }
                  placeholder="e.g. Indian"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editCaseForm.jobTitle}
                  onChange={(e) =>
                    setEditCaseForm((f) => ({ ...f, jobTitle: e.target.value }))
                  }
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Department
                </label>
                <select
                  value={editCaseForm.department}
                  onChange={(e) =>
                    setEditCaseForm((f) => ({ ...f, department: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
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
                    value={editCaseForm.sponsorId}
                    onChange={(e) => {
                      const selectedSponsor = sponsors.find(
                        (s) => s.id === parseInt(e.target.value),
                      );
                      setEditCaseForm((prev) => ({
                        ...prev,
                        sponsorId: e.target.value,
                        businessName:
                          selectedSponsor?.sponsorProfile?.companyName ||
                          selectedSponsor?.sponsorProfile?.tradingName ||
                          `${selectedSponsor.first_name} ${selectedSponsor.last_name}`,
                      }));
                    }}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary border-gray-300"
                  >
                    <option value="">Select sponsor</option>
                    {sponsors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={editCaseForm.businessName}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none cursor-not-allowed text-gray-600"
                />
              </div>
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
                value={editCaseForm.visaTypeId}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, visaTypeId: e.target.value }))
                }
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary border-gray-300"
              >
                <option value="">Select visa type</option>
                {visaTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Petition Type
              </label>
              <select
                value={editCaseForm.petitionTypeId}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, petitionTypeId: e.target.value }))
                }
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
                value={editCaseForm.priority}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, priority: e.target.value }))
                }
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {priorityLevels.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Target Submission Date
              </label>
              <input
                type="date"
                value={editCaseForm.targetSubmissionDate}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, targetSubmissionDate: e.target.value }))
                }
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${editCaseErrors.targetSubmissionDate ? "border-red-300" : "border-gray-200"}`}
              />
              {editCaseErrors.targetSubmissionDate && (
                <p className="text-xs font-bold text-red-600 mt-1">
                  {editCaseErrors.targetSubmissionDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                LCA Number
              </label>
              <input
                type="text"
                value={editCaseForm.lcaNumber}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, lcaNumber: e.target.value }))
                }
                placeholder="e.g. I-200-24001"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                value={editCaseForm.receiptNumber}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, receiptNumber: e.target.value }))
                }
                placeholder="e.g. EAC240..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              />
            </div>
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
                  : []
              }
              value={editCaseForm.assignedCaseworkerIds || []}
              onChange={(ids) => setEditCaseForm((f) => ({ ...f, assignedCaseworkerIds: ids }))}
              error={editCaseErrors.assignedCaseworkers}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black text-secondary mb-4">
            Financial Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Salary Offered ($)
              </label>
              <input
                type="number"
                value={editCaseForm.salaryOffered}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, salaryOffered: e.target.value }))
                }
                placeholder="Annual salary"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Total Amount ($)
              </label>
              <input
                type="number"
                value={editCaseForm.totalAmount}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, totalAmount: e.target.value }))
                }
                placeholder="Total fee"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Paid Amount ($)
              </label>
              <input
                type="number"
                value={editCaseForm.paidAmount}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, paidAmount: e.target.value }))
                }
                placeholder="Amount paid so far"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black text-secondary mb-4">
            Additional Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Status
              </label>
              <select
                value={editCaseForm.status}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                {CASE_STATUS_EDIT.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Internal Notes
              </label>
              <textarea
                value={editCaseForm.notes}
                onChange={(e) =>
                  setEditCaseForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-y"
                placeholder="Anything the team should know…"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={closeCaseEdit}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitCaseEdit}
            className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
          >
            Save changes
          </button>
        </div>
      </Modal>

      {/* ─────────────────────── REASSIGN MODAL ─────────────────────── */}
      <Modal
        open={!!reassignCaseId}
        onClose={closeReassign}
        title={
          reassignCase
            ? `Reassign case ${reassignCase.caseId}`
            : "Reassign case"
        }
        titleId="reassign-modal-title"
        maxWidthClass="max-w-xl"
        bodyClassName="p-4 sm:p-6"
      >
        {reassignCase && (
          <div className="space-y-5">
            {/* Case summary chip */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">
                  {reassignCase.candidate}
                </p>
                <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                  {reassignCase.business} · {reassignCase.visa}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeStatus(reassignCase.status).className}`}
              >
                {badgeStatus(reassignCase.status).label}
              </span>
            </div>

            {/* Caseworker list */}
            <CaseworkerMultiSelect
              options={
                caseworkers.length > 0
                  ? caseworkers.map((c) => ({
                      id: c.id,
                      name: `${c.first_name} ${c.last_name}`,
                    }))
                  : []
              }
              value={reassignForm.caseworkerIds}
              onChange={(ids) => setReassignForm((f) => ({ ...f, caseworkerIds: ids }))}
              error={reassignErrors.caseworkerIds}
            />

            {/* Reason preset */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Reason for reassignment
              </label>
              <select
                value={reassignForm.reasonPreset}
                onChange={(e) =>
                  setReassignForm((f) => ({
                    ...f,
                    reasonPreset: e.target.value,
                    reasonCustom: "",
                  }))
                }
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 bg-white ${
                  reassignErrors.reasonPreset
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
              >
                <option value="">Select a reason…</option>
                {REASSIGN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {reassignErrors.reasonPreset && (
                <p className="text-xs font-bold text-red-600 mt-1">
                  {reassignErrors.reasonPreset}
                </p>
              )}
            </div>

            {/* Custom reason (shown when "Other" selected) */}
            {reassignForm.reasonPreset === "Other" && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Please describe the reason
                </label>
                <textarea
                  value={reassignForm.reasonCustom}
                  onChange={(e) =>
                    setReassignForm((f) => ({
                      ...f,
                      reasonCustom: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Explain why this case is being reassigned…"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 resize-y ${
                    reassignErrors.reasonCustom
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                />
                {reassignErrors.reasonCustom && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {reassignErrors.reasonCustom}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={closeReassign}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReassign}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-violet-200 hover:bg-violet-700 transition-colors"
              >
                <UserRoundCog size={16} />
                Confirm reassignment
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────── CASE DETAIL MODAL ─────────────────────── */}
      <Modal
        open={!!detailCase}
        onClose={closeDetail}
        title={detailCase ? `Case ${detailCase.caseId}` : ""}
        titleId="case-detail-modal-title"
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        {detailCase && (
          <>
            <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/80 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  id="case-detail-modal-heading"
                  className="text-lg font-black text-gray-900"
                >
                  {detailCase.candidate}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgeStatus(detailCase.status).className}`}
                  >
                    {badgeStatus(detailCase.status).label}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgePriority(detailCase.priority)}`}
                  >
                    {priorityLabel(detailCase.priority)} priority
                  </span>
                  {reassignments[detailCase.caseId] && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-black text-violet-700">
                      <ArrowRightLeft size={11} />
                      Reassigned → {reassignments[detailCase.caseId].caseworkers.map(c => c.name).join(" · ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openReassign(detailCase)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100 transition-colors"
                >
                  <ArrowRightLeft size={14} />
                  Reassign
                </button>
                <button
                  type="button"
                  onClick={() => openCaseEdit(detailCase)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-secondary hover:bg-secondary/5"
                >
                  Edit case
                </button>
              </div>
            </div>

            <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar">
              {[
                { id: "overview", label: "Overview" },
                { id: "documents", label: "Documents" },
                { id: "tasks", label: "Tasks" },
                { id: "payments", label: "Payments" },
                { id: "comms", label: "Communication" },
                { id: "notes", label: "Notes" },
                { id: "timeline", label: "Timeline" },
                 { id: "auditlogs", label: "Audit Logs" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailTab(t.id)}
                  className={`shrink-0 border-b-2 px-3 sm:px-4 py-3 text-xs font-black transition-colors whitespace-nowrap ${
                    detailTab === t.id
                      ? "border-secondary text-secondary"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {detailTab === "overview" && (
                <OverviewTab c={detailCase} userName={user?.name || "You"} />
              )}
              {detailTab === "documents" && (
                <DocumentsTab
                  caseId={detailCase?.id}
                  candidateId={detailCase?.candidateId}
                />
              )}
              {detailTab === "tasks" && <TasksTab caseId={detailCase?.id} />}
              {detailTab === "payments" && <PaymentsTab />}
              {detailTab === "comms" && (
                <CommsTab candidate={detailCase.candidate} caseId={detailCase.caseId} />
              )}
              {detailTab === "notes" && (
                <NotesTab
                  caseId={detailCase?.id}
                  userName={user?.name || "Caseworker"}
                />
              )}
              {detailTab === "timeline" && (
                <CaseTimeline caseId={detailCase?.id} currentUser={user} />
              )}
              {detailTab === "auditlogs" && (
                <AuditLogsTab caseId={detailCase?.id} />
              )}
            </div>
          </>
        )}
      </Modal>

      {/* ─────────────────────── NEW CASE MODAL ─────────────────────── */}
      <Modal
        open={newCaseOpen}
        onClose={closeNewCaseModal}
        title="New case"
        titleId="new-case-modal-title"
        maxWidthClass="max-w-3xl"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-6">
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
                      value={newCaseForm.candidateId}
                      onChange={(e) => {
                        const selectedCandidate = candidates.find(
                          (c) => c.id === parseInt(e.target.value),
                        );
                        setNewCaseForm((prev) => ({
                          ...prev,
                          candidateId: e.target.value,
                          candidateName: selectedCandidate
                            ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}`
                            : "",
                        }));
                        if (newCaseErrors.candidateId)
                          setNewCaseErrors((prev) => ({
                            ...prev,
                            candidateId: "",
                          }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.candidateId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">Select candidate</option>
                      {candidates.map((c, idx) => (
                        <option key={`${c.id}-${idx}`} value={c.id}>
                          {c.first_name} {c.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {newCaseErrors.candidateId && (
                    <span className="text-xs text-red-500">
                      {newCaseErrors.candidateId}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    value={newCaseForm.candidateName}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from selection"
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none cursor-not-allowed text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={newCaseForm.nationality}
                    onChange={handleInputChange}
                    placeholder="e.g. Indian"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newCaseForm.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={newCaseForm.department}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
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
                      value={newCaseForm.businessId}
                      onChange={(e) => {
                        const selectedSponsor = sponsors.find(
                          (s) => s.id === parseInt(e.target.value),
                        );
                        setNewCaseForm((prev) => ({
                          ...prev,
                          sponsorId: e.target.value,
                          businessId:
                            selectedSponsor?.sponsorProfile?.id ||
                            e.target.value,
                          businessName:
                            selectedSponsor?.sponsorProfile?.companyName ||
                            selectedSponsor?.sponsorProfile?.tradingName ||
                            `${selectedSponsor.first_name} ${selectedSponsor.last_name}`,
                        }));
                        if (newCaseErrors.businessId)
                          setNewCaseErrors((prev) => ({
                            ...prev,
                            businessId: "",
                          }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.businessId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">Select sponsor</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {newCaseErrors.businessId && (
                    <span className="text-xs text-red-500">
                      {newCaseErrors.businessId}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={newCaseForm.businessName}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from selection"
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none cursor-not-allowed text-gray-600"
                  />
                </div>
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
                  value={newCaseForm.visaTypeId}
                  onChange={handleInputChange}
                  className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.visaTypeId ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select visa type</option>
                  {visaTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {newCaseErrors.visaTypeId && (
                  <span className="text-xs text-red-500">
                    {newCaseErrors.visaTypeId}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Petition Type
                </label>
                <select
                  name="petitionTypeId"
                  value={newCaseForm.petitionTypeId}
                  onChange={handleInputChange}
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
                  value={newCaseForm.priority}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {priorityLevels.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Target Submission Date
                </label>
                <input
                  type="date"
                  name="targetSubmissionDate"
                  value={newCaseForm.targetSubmissionDate}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.targetSubmissionDate ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.targetSubmissionDate && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.targetSubmissionDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  LCA Number
                </label>
                <input
                  type="text"
                  name="lcaNumber"
                  value={newCaseForm.lcaNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. I-200-24001"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Receipt Number
                </label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={newCaseForm.receiptNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. EAC240..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
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
                    : []
                }
                value={newCaseForm.assignedCaseworkerIds || []}
                onChange={handleCaseworkerIdsChange}
                error={newCaseErrors.assignedCaseworkers}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">
              Financial Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Salary Offered ($)
                </label>
                <input
                  type="number"
                  name="salaryOffered"
                  value={newCaseForm.salaryOffered}
                  onChange={handleInputChange}
                  placeholder="Annual salary"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Total Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={newCaseForm.totalAmount}
                  onChange={handleInputChange}
                  placeholder="Total fee"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.totalAmount ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.totalAmount && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.totalAmount}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Paid Amount ($)
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={newCaseForm.paidAmount}
                  onChange={handleInputChange}
                  placeholder="Amount paid so far"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={newCaseForm.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any notes or comments..."
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeNewCaseModal}
              disabled={isLoading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitNewCase}
              disabled={isLoading}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
            >
              {isLoading ? "Saving..." : "Create Case"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <div className="text-sm font-bold text-gray-900">{children}</div>
    </div>
  );
}

function OverviewTab({ c, userName }) {
  const st = badgeStatus(c.status);
  return (
    <div className="space-y-6">
      {/* <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
        <button
          type="button"
          className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white"
        >
          Update status
        </button>
        <button
          type="button"
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700"
        >
          Add note
        </button>
        <button
          type="button"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800"
        >
          Flag case
        </button>
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Case ID">
          <span className="font-mono text-secondary">{c.caseId}</span>
        </Field>
        <Field label="Candidate name">{c.candidate}</Field>
        <Field label="Sponsor name">{c.business}</Field>
        <Field label="Visa type">{c.visa} (General)</Field>
        <Field label="Case status">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${st.className}`}
          >
            {st.label}
          </span>
        </Field>
        <Field label="Assigned to">{userName} (You)</Field>
        <Field label="Start date">1 Mar 2026</Field>
        <Field label="Target submission">{formatTarget(c.target)}</Field>
        <Field label="Decision date">
          <span className="text-gray-500">Pending</span>
        </Field>
        <Field label="Priority">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-black ${badgePriority(c.priority)}`}
          >
            {priorityLabel(c.priority)}
          </span>
        </Field>
      </div>
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-3">
          Case progress
        </p>
        <div className="flex justify-between text-center gap-1">
          {["Onboarded", "Documents", "Drafting", "Review", "Submitted"].map(
            (label, i) => {
              const done = i < 2;
              const current = i === 2;
              return (
                <div key={label} className="flex-1 relative">
                  {i > 0 && (
                    <div
                      className={`absolute left-0 right-1/2 top-[14px] h-0.5 -translate-x-1/2 ${
                        i <= 2 ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                      style={{ width: "50%" }}
                    />
                  )}
                  <div
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${
                      done
                        ? "bg-emerald-500 text-white"
                        : current
                          ? "border-2 border-secondary bg-secondary/15 text-secondary"
                          : "border-2 border-gray-200 bg-white text-gray-400"
                    }`}
                  >
                    {done ? <Check size={14} /> : current ? "●" : ""}
                  </div>
                  <p
                    className={`mt-1 text-[10px] font-bold ${
                      current ? "text-secondary" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ caseId, candidateId }) {
  const {
    documents,
    docsLoading: loading,
    fetchDocuments,
    uploadDocument,
    changeDocumentStatus,
  } = useCaseDetail();
  const [checklist, setChecklist] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "",
    documentCategory: "candidate",
    userFileName: "",
    expiryDate: "",
    notes: "",
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState("");
  const [uploadingForItem, setUploadingForItem] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const { showToast } = useToast();

  const closeViewDocument = () => {
    setViewDocumentOpen(false);
    setViewDocumentUrl(null);
  };

  useEffect(() => {
    if (!caseId) return;
    fetchDocuments(caseId);
  }, [caseId, fetchDocuments]);

  const fetchChecklist = useCallback(async () => {
    if (!caseId) return;
    setChecklistLoading(true);
    try {
      const res = await getCaseChecklist(caseId);
      if (res.data?.status === 'success') {
        setChecklist(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch checklist:", err);
    } finally {
      setChecklistLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const getBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-800 border-red-200";
      case "under review":
      case "under_review":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "uploaded":
        return "bg-gray-50 text-gray-800 border-gray-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const openUploadModal = useCallback((item = null) => {
    setUploadErrors({});
    setUploadForm({
      documentType: item ? item.documentType : "General",
      documentCategory: "candidate",
      userFileName: item ? item.documentName : "",
      expiryDate: "",
      notes: "",
    });
    setSelectedFile(null);
    setUploadingForItem(item);
    setUploadOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setUploadOpen(false);
    setUploadErrors({});
    setUploadForm({
      documentType: "",
      documentCategory: "candidate",
      userFileName: "",
      expiryDate: "",
      notes: "",
    });
    setSelectedFile(null);
    setUploadingForItem(null);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.userFileName) {
        setUploadForm((f) => ({ ...f, userFileName: file.name }));
      }
    }
  };

  const submitUploadDocument = useCallback(async () => {
    const err = {};
    if (!selectedFile) err.file = "Required";
    if (!uploadForm.documentType) err.documentType = "Required";
    setUploadErrors(err);
    if (Object.keys(err).length) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("documents", selectedFile);
      formData.append("caseId", caseId);
      formData.append("userId", candidateId);
      formData.append("documentType", uploadForm.documentType);
      formData.append("documentCategory", uploadForm.documentCategory);
      formData.append(
        "userFileName",
        uploadForm.userFileName || selectedFile.name,
      );
      if (uploadForm.expiryDate) {
        formData.append("expiryDate", uploadForm.expiryDate);
      }
      if (uploadForm.notes) {
        formData.append("notes", uploadForm.notes);
      }

      const response = await uploadDocument(formData);

      if (response.data.status === "success") {
        await fetchDocuments(caseId);
        await fetchChecklist();
        closeUploadModal();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      if (error.response?.data?.message) {
        setUploadErrors({ api: error.response.data.message });
      } else {
        setUploadErrors({ api: "Failed to upload document" });
      }
    } finally {
      setUploading(false);
    }
  }, [uploadForm, selectedFile, caseId, candidateId, closeUploadModal, uploadDocument, fetchDocuments, fetchChecklist]);

  const handleDocumentStatusChange = useCallback(
    async (documentId, status) => {
      try {
        setStatusUpdatingId(documentId);
        const reviewNotes =
          status === "approved"
            ? "Document approved by caseworker"
            : "Document rejected by caseworker";
        await changeDocumentStatus(documentId, { status, reviewNotes });
        await fetchDocuments(caseId);
        await fetchChecklist();
        showToast({
          message:
            status === "approved"
              ? "Document approved successfully."
              : "Document rejected successfully.",
          variant: "success",
        });
      } catch (error) {
        console.error("Error updating document status:", error);
        showToast({ message: "Failed to update document status.", variant: "danger" });
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [changeDocumentStatus, fetchDocuments, fetchChecklist, caseId],
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'uploaded':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'missing':
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'uploaded':
        return <Check size={14} className="text-green-600" />;
      case 'under_review':
        return <Clock size={14} className="text-blue-600" />;
      case 'rejected':
        return <X size={14} className="text-red-600" />;
      case 'missing':
      default:
        return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />;
    }
  };

  const categoryLabels = {
    identity: 'Identity Documents',
    education: 'Education & Qualifications',
    work: 'Work Experience',
    financial: 'Financial Documents',
    medical: 'Medical Documents',
    legal: 'Legal Documents',
    other: 'Other Documents'
  };

  return (
    <div className="space-y-6">
      {/* Document Checklist Section */}
      {checklist && !checklistLoading && Object.keys(checklist.checklist).length > 0 && (
        <>
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl border border-secondary/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-secondary uppercase tracking-wide">
                Document Completion Progress
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-secondary">
                  {checklist.completionPercentage}%
                </span>
                <button
                  type="button"
                  onClick={() => openUploadModal()}
                  className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white"
                >
                  + Add Document
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-out"
                style={{ width: `${checklist.completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{checklist.completed} of {checklist.required} required documents completed</span>
              <span>{checklist.total} total documents</span>
            </div>
          </div>

          {/* Checklist by Category */}
          {Object.entries(checklist.checklist).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h5 className="text-sm font-bold text-secondary">
                  {categoryLabels[category] || category}
                </h5>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4"
                  >
                    <div className="shrink-0 mt-0.5">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.documentName}
                        </p>
                        {item.isRequired && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                        {!item.isRequired && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.expiryDate && (
                          <span className="text-[10px] text-gray-500">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                        {item.uploadedAt && (
                          <span className="text-[10px] text-gray-500">
                            Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.status === 'missing' ? (
                      <button
                        type="button"
                        onClick={() => openUploadModal(item)}
                        className="shrink-0 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-[11px] font-black text-secondary hover:bg-secondary/20 transition-colors"
                      >
                        Add
                      </button>
                    ) : item.documentId ? (
                      <button
                        type="button"
                        onClick={() => {
                          const doc = documents.find(d => d.id === item.documentId);
                          if (doc && doc.documentUrl) {
                            window.open(doc.documentUrl, "_blank");
                          }
                        }}
                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* General uploaded documents - always shown below checklist */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            All uploaded documents
          </p>
          {/* <button
            type="button"
            onClick={openUploadModal}
            className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white"
          >
            Upload documents
          </button> */}
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <FileText size={18} className="text-secondary" />
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm font-bold text-gray-900">
                  {doc.userFileName || doc.documentName}
                </p>
                <p className="text-[11px] font-bold text-gray-500">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} ·{" "}
                  {doc.documentType}
                </p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getBadgeColor(doc.status)}`}
              >
                {doc.status || "Uploaded"}
              </span>
              <button
                type="button"
                onClick={() => window.open(doc.documentUrl, "_blank")}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600"
              >
                View
              </button>
              {(doc.status === "uploaded" || doc.status === "under_review") && (
                <>
                  <button
                    type="button"
                    disabled={statusUpdatingId === doc.id}
                    onClick={() => handleDocumentStatusChange(doc.id, "approved")}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-800 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={statusUpdatingId === doc.id}
                    onClick={() => handleDocumentStatusChange(doc.id, "rejected")}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-800 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        open={uploadOpen}
        onClose={closeUploadModal}
        title="Upload document"
        titleId="upload-document-modal-title"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Document file
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                uploadErrors.file ? "border-red-300" : "border-gray-200"
              }`}
            />
            {uploadErrors.file && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {uploadErrors.file}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Document name
            </label>
            <input
              type="text"
              value={uploadForm.userFileName}
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, userFileName: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              placeholder="e.g. Passport copy"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Document type
              </label>
                  <select
                value={uploadForm.documentType}
                onChange={(e) =>
                  setUploadForm((f) => ({ ...f, documentType: e.target.value }))
                }
                disabled={!!uploadingForItem}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary disabled:bg-gray-50 disabled:text-gray-500"
              >
                    {DOCUMENT_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Category
              </label>
              <select
                value={uploadForm.documentCategory}
                onChange={(e) =>
                  setUploadForm((f) => ({
                    ...f,
                    documentCategory: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                <option value="candidate">Candidate</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
                <option value="legal">Legal</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Expiry date (optional)
            </label>
            <input
              type="date"
              value={uploadForm.expiryDate}
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, expiryDate: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={uploadForm.notes}
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={3}
              placeholder="Add any notes about this document…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-y min-h-[72px]"
            />
          </div>
          {uploadErrors.api && (
            <p className="text-xs font-bold text-red-600 mt-1">
              {uploadErrors.api}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={closeUploadModal}
              disabled={uploading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitUploadDocument}
              disabled={uploading}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload document"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TasksTab({ caseId }) {
  const { tasks, tasksLoading: loading, fetchTasks, addTask } = useCaseDetail();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    due: new Date().toISOString().split("T")[0],
    priority: "medium",
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    if (!caseId) return;
    fetchTasks(caseId);
  }, [caseId, fetchTasks]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700";
      case "medium":
        return "bg-amber-50 text-amber-700";
      case "low":
        return "bg-gray-50 text-gray-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const openCreateModal = useCallback(() => {
    setCreateErrors({});
    setCreateForm({
      name: "",
      due: new Date().toISOString().split("T")[0],
      priority: "medium",
    });
    setCreateOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateOpen(false);
    setCreateErrors({});
    setCreateForm({
      name: "",
      due: new Date().toISOString().split("T")[0],
      priority: "medium",
    });
  }, []);

  const submitCreateTask = useCallback(async () => {
    const err = {};
    if (!createForm.name.trim()) err.name = "Required";
    if (!createForm.due) err.due = "Required";
    setCreateErrors(err);
    if (Object.keys(err).length) return;

    try {
      const data = {
        title: createForm.name.trim(),
        due_date: createForm.due,
        priority: createForm.priority,
        case_id: Number(caseId),
      };

      const response = await addTask(data);

      if (response.data.status === "success") {
        await fetchTasks(caseId);
        closeCreateModal();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response?.data?.message) {
        setCreateErrors({ api: error.response.data.message });
      } else {
        setCreateErrors({ api: "Failed to create task" });
      }
    }
  }, [createForm, caseId, closeCreateModal]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={openCreateModal}
        className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white"
      >
        Create task
      </button>
      {loading ? (
        <p className="text-sm text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks created yet.</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100"
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                task.status === "completed"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-300"
              }`}
            >
              {task.status === "completed" ? (
                <Check size={10} strokeWidth={3} />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{task.title}</p>
              <p className="text-[11px] text-gray-500">
                {task.status === "completed"
                  ? "Completed"
                  : `Due ${new Date(task.due_date).toLocaleDateString()}`}
              </p>
            </div>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </span>
          </div>
        ))
      )}

      <Modal
        open={createOpen}
        onClose={closeCreateModal}
        title="Create task"
        titleId="create-task-modal-title"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Task name
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                createErrors.name ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. Request English certificate"
            />
            {createErrors.name && (
              <p className="text-xs font-bold text-red-600 mt-1">
                {createErrors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={createForm.due}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, due: e.target.value }))
                }
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${
                  createErrors.due ? "border-red-300" : "border-gray-200"
                }`}
              />
              {createErrors.due && (
                <p className="text-xs font-bold text-red-600 mt-1">
                  {createErrors.due}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Priority
              </label>
              <select
                value={createForm.priority}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, priority: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {createErrors.api && (
            <p className="text-xs font-bold text-red-600 mt-1">
              {createErrors.api}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitCreateTask}
              className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90"
            >
              Create task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2.5 text-xs font-bold text-gray-600">
        <Lock size={16} className="text-secondary shrink-0 mt-0.5" />
        Finance data is read-only. Contact Finance to make changes.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          // { label: "Total fee", value: "£3,500", color: "text-gray-900" },
          // { label: "Paid", value: "£3,500", color: "text-emerald-600" },
          { label: "Outstanding", value: "£0", color: "text-gray-500" },
        ].map((b) => (
          <div
            key={b.label}
            className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-center"
          >
            <p className="text-[10px] font-black uppercase text-gray-500">
              {b.label}
            </p>
            <p className={`text-xl font-black mt-1 ${b.color}`}>{b.value}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-black uppercase text-gray-500">
        Payment history
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-[10px] font-black uppercase text-gray-500">
            <th className="py-2 pr-2">Date</th>
            <th className="py-2 pr-2">Description</th>
            <th className="py-2 text-right">Amount</th>
            <th className="py-2 pl-2">Status</th>
          </tr>
        </thead>
        <tbody className="font-bold text-gray-800">
          <tr className="border-b border-gray-100">
            <td className="py-2 pr-2">1 Mar 2026</td>
            <td className="py-2 pr-2">Initial deposit</td>
            <td className="py-2 text-right tabular-nums">£1,750</td>
            <td className="py-2 pl-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800">
                Paid
              </span>
            </td>
          </tr>
          <tr>
            <td className="py-2 pr-2">15 Mar 2026</td>
            <td className="py-2 pr-2">Final payment</td>
            <td className="py-2 text-right tabular-nums">£1,750</td>
            <td className="py-2 pl-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800">
                Paid
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CommsTab({ candidate, caseId }) {
  const navigate = useNavigate();
  const candidateName =
    typeof candidate === "string" && candidate.trim() ? candidate : "Candidate";
  const initial = candidateName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "c1",
      side: "candidate",
      sender: candidateName,
      text: "Hi — I've uploaded my passport copy. Please let me know if you need anything else.",
      time: "1 Apr · 10:32am",
    },
    {
      id: "c2",
      side: "you",
      sender: "You",
      text: "Thanks! I still need your English language certificate — please upload by 10 Apr.",
      time: "1 Apr · 11:05am",
    },
  ]);

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        side: "you",
        sender: "You",
        text: draft.trim(),
        time: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-secondary bg-secondary/10 px-3 py-1.5 text-xs font-black text-secondary"
        >
          Candidate chat
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/caseworker/messages${caseId ? `?caseId=${encodeURIComponent(caseId)}` : ""}`,
            )
          }
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-600"
        >
          Open full communication
        </button>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.side === "you" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                message.side === "you"
                  ? "bg-gradient-to-br from-secondary to-indigo-500 text-white"
                  : "bg-secondary/15 text-secondary"
              }`}
            >
              {message.side === "you" ? "You" : initial}
            </div>
            <div className={`max-w-[85%] ${message.side === "you" ? "text-right" : ""}`}>
              <p className="text-[10px] font-bold text-gray-500 mb-1">
                {message.sender}
              </p>
              <div
                className={`rounded-2xl px-3 py-2 text-left inline-block ${
                  message.side === "you"
                    ? "rounded-br-sm border border-secondary/20 bg-secondary/10"
                    : "rounded-bl-sm border border-gray-100 bg-gray-50"
                }`}
              >
                <p className="text-sm font-bold text-gray-800">{message.text}</p>
                <p className="text-[10px] text-gray-500 mt-1">{message.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          className="rounded-xl bg-secondary px-4 py-2 text-xs font-black text-white"
        >
          <Send className="inline mr-1" size={14} />
          Send
        </button>
      </div>
    </div>
  );
}

function NotesTab({ caseId, userName }) {
  const { notes, notesLoading: loading, fetchNotes, addNote } = useCaseDetail();
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!caseId) return;
    fetchNotes(caseId);
  }, [caseId, fetchNotes]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !caseId) return;
    try {
      await addNote({ caseId: Number(caseId), content: newNote });
      setNewNote("");
      await fetchNotes(caseId);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Add an internal note…"
        rows={3}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-y"
      />
      <button
        type="button"
        onClick={handleSaveNote}
        disabled={!newNote.trim()}
        className="rounded-xl bg-secondary px-3 py-2 text-xs font-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save note
      </button>
      {loading ? (
        <p className="text-sm text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes added yet.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-gray-100 bg-gray-50/80 p-4"
          >
            <p className="text-[11px] font-bold text-gray-500 mb-1">
              {note.author?.first_name && note.author?.last_name
                ? `${note.author.first_name} ${note.author.last_name}`
                : userName}{" "}
              · {new Date(note.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm font-bold text-gray-800">{note.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

function TimelineTab({ candidate }) {
  const items = [
    {
      dot: "blue",
      title: "Document uploaded — Passport copy",
      time: `1 Apr 2026 · by ${candidate}`,
      body: null,
    },
    {
      dot: "green",
      title: "Status changed → Documents received",
      time: "1 Apr 2026",
      body: null,
    },
    {
      dot: "blue",
      title: "Document uploaded — Certificate of sponsorship",
      time: "28 Mar 2026 · by sponsor HR",
      body: null,
    },
    {
      dot: "yellow",
      title: "Task created — Request English language cert",
      time: "20 Mar 2026",
      body: "Due 10 Apr 2026",
    },
    {
      dot: "green",
      title: "Case created and onboarded",
      time: "1 Mar 2026",
      body: null,
    },
  ];
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 pb-5 relative">
          {i < items.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
          )}
          <div
            className={`relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black ${
              item.dot === "green"
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : item.dot === "yellow"
                  ? "border-amber-500 bg-amber-50 text-amber-600"
                  : "border-secondary bg-secondary/10 text-secondary"
            }`}
          >
            {item.dot === "green" ? <Check size={12} /> : "●"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{item.title}</p>
            <p className="text-[11px] font-bold text-gray-500 mt-0.5">
              {item.time}
            </p>
            {item.body && (
              <p className="text-xs font-bold text-gray-600 mt-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                {item.body}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditLogsTab({ caseId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: "last30",
    status: "all"
  });

  const fetchAuditLogs = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await getCaseAuditLogs(caseId, {
        page: 1,
        limit: 20,
        dateRange: filters.dateRange,
        status: filters.status
      });
      
      if (res.data?.status === 'success') {
        setLogs(res.data.data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId, filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h4 className="text-sm font-black text-secondary uppercase tracking-wide">
          Case Audit Logs
        </h4>
        <div className="flex gap-2">
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 3 months</option>
            <option value="all">All time</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary/30"
          >
            <option value="all">All status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Timestamp", "User", "Action", "Resource", "Status", "Details"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No audit logs found for this case
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-secondary">
                            {log.initials}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-secondary">{log.user}</p>
                          <p className="text-[10px] text-gray-500">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.actionClass}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{log.resource}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.statusClass}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Cases;
