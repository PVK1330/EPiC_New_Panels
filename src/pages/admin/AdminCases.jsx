import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  UserPlus,
} from "lucide-react";
import Button from "../../components/Button";
import CaseWorkflowBadge from "../../components/case/CaseWorkflowBadge";
import { formatDate } from "../../utils/datetime";
import { getApiError } from "../../utils/apiError";
import AdminCaseFormModal from "../../components/admin/AdminCaseFormModal";
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
  getVisaTypes,
  getPetitionTypes,
  getAllUsers,
  getCaseworkers,
  updateCaseStatus,
  exportAllCases,
  getDepartments,
} from "../../services/caseApi";
import { useToast } from "../../context/ToastContext";
import AssignCaseworkerModal from "../../components/admin/AssignCaseworkerModal";




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
  "Workflow",
  "Status",
  "Submitted",
  "Actions",
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
  proposedAmount: "",
  notes: "",
};

function caseworkerNamesFromIds(ids, options = []) {
  return ids
    .map((id) => options.find((w) => w.id === id)?.name)
    .filter(Boolean);
}


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};


export default function AdminCases() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);
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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCaseRow, setAssignCaseRow] = useState(null);

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
          status: filterType === "all" ? "" : { approved: "Approved", pending: "Pending", rejected: "Rejected", review: "Under Review" }[filterType] || filterType,
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
          caseStage: c.caseStage,
          target: c.targetSubmissionDate || c.created_at,
          priority: c.priority?.toLowerCase() || "medium",
          payment: mapPaymentStatus(c.paidAmount, c.totalAmount),
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.departmentId || "",
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
          submitted: c.submitted ? formatDate(c.submitted) : formatDate(c.created_at),
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
        const msg =
          err?.response?.data?.message || "Failed to load cases. Please try again.";
        setError(msg);
        setCases([]);
        showToast({ message: msg, variant: "danger" });
      } finally {
        setLoading(false);
      }
    };

    fetchCasesFromAPI();
  }, [page, searchQuery, filterType, priorityFilter, visaTypeFilter, showToast]);

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
        const [visaRes, petitionRes, allUsersRes, caseworkersRes, deptRes] = await Promise.all([
          getVisaTypes(),
          getPetitionTypes(),
          getAllUsers(),
          getCaseworkers(),
          getDepartments(),
        ]);


        if (visaRes?.data?.data?.visa_types) {
          setVisaTypes(visaRes.data.data.visa_types);
        }


        if (petitionRes?.data?.data?.petition_types) {
          setPetitionTypes(petitionRes.data.data.petition_types);
        }

        const grouped = allUsersRes?.data?.data;
        if (grouped && !Array.isArray(grouped)) {
          setCandidates(grouped.candidate || []);
          setSponsors(grouped.sponsor || grouped.business || []);
        }

        const cwPayload = caseworkersRes?.data?.data;
        if (Array.isArray(cwPayload)) {
          setCaseworkers(cwPayload);
        } else if (cwPayload?.caseworker) {
          setCaseworkers(cwPayload.caseworker);
        } else if (grouped?.caseworker) {
          setCaseworkers(grouped.caseworker);
        } else {
          setCaseworkers([]);
        }

        if (deptRes?.data?.data?.departments) {
          setDepartments(deptRes.data.data.departments);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        showToast({
          message:
            err?.response?.data?.message ||
            "Failed to load form options. Some dropdowns may be empty.",
          variant: "danger",
        });
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

    // ── Required selections ──────────────────────────────────────────────
    if (!formData.candidateId) e.candidateId = "Please select a candidate";
    if (!formData.businessId) e.businessId = "Please select a sponsor";
    if (!formData.visaTypeId) e.visaTypeId = "Please select a visa type";

    // ── Caseworkers (optional on create, but never more than 2) ──────────
    const n = formData.assignedCaseworkerIds?.length || 0;
    if (n > 2) e.assignedCaseworkers = "Select at most 2 caseworkers";

    // ── Target submission date: required, valid, not in the past ─────────
    if (!formData.targetSubmissionDate) {
      e.targetSubmissionDate = "Please choose a target date";
    } else {
      const picked = new Date(`${formData.targetSubmissionDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(picked.getTime())) {
        e.targetSubmissionDate = "Enter a valid date";
      } else if (picked < today) {
        e.targetSubmissionDate = "Target date cannot be in the past";
      }
    }

    // ── Financials: non-negative, total > 0, paid ≤ total ────────────────
    const total = Number(formData.totalAmount);
    const paid = Number(formData.paidAmount);
    const salary = Number(formData.salaryOffered);
    if (Number.isNaN(total) || total <= 0) {
      e.totalAmount = "Total amount must be greater than 0";
    }
    if (!Number.isNaN(paid) && paid < 0) {
      e.paidAmount = "Paid amount cannot be negative";
    } else if (
      !Number.isNaN(paid) &&
      !Number.isNaN(total) &&
      total > 0 &&
      paid > total
    ) {
      e.paidAmount = "Paid amount cannot exceed the total amount";
    }
    if (!Number.isNaN(salary) && salary < 0) {
      e.salaryOffered = "Salary cannot be negative";
    }

    // ── CCL fee (proposedAmount): optional, but non-negative if present ──
    if (
      formData.proposedAmount !== "" &&
      formData.proposedAmount != null &&
      Number(formData.proposedAmount) < 0
    ) {
      e.proposedAmount = "CCL fee cannot be negative";
    }

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
        proposedAmount:
          formData.proposedAmount !== "" && formData.proposedAmount != null
            ? parseFloat(formData.proposedAmount)
            : undefined,
        notes: formData.notes,
        nationality: formData.nationality,
        jobTitle: formData.jobTitle,
        department: formData.department,
        departmentId: parseInt(formData.department) || null,
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
            ? formatDate(c.submitted)
            : formatDate(c.created_at),
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
          department: c.departmentId || "",
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
      showToast({
        message: getApiErrorMessage(
          error,
          "Error creating case. Please ensure required fields are provided.",
        ),
        variant: "danger",
      });
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
      department: c.departmentId || c.department || "",
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
        departmentId: parseInt(formData.department) || null,
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
            ? formatDate(c.submitted)
            : formatDate(c.created_at),
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
          department: c.departmentId || "",
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
      showToast({
        message: getApiErrorMessage(error, "Failed to update case."),
        variant: "danger",
      });
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
            ? formatDate(c.submitted)
            : formatDate(c.created_at),
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
          department: c.departmentId || "",
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
      showToast({
        message: getApiErrorMessage(error, "Failed to delete case."),
        variant: "danger",
      });
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
            ? formatDate(c.submitted)
            : formatDate(c.created_at),
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
          department: c.departmentId || "",
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
      showToast({
        message: getApiErrorMessage(
          error,
          `Failed to ${approveRejectAction} case.`,
        ),
        variant: "danger",
      });
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
                ? "Under Review"
                : "Pending";
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (visaTypeFilter !== "all") params.visaType = visaTypeFilter;

      const response = await exportAllCases(params);

      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cases_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting cases:", error);
      showToast({
        message: getApiErrorMessage(error, "Failed to export cases."),
        variant: "danger",
      });
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
      (filterType === "review" && c.status === "Under Review");

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
    <div className="space-y-4 pb-5">
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tight flex items-center gap-3">
            <Briefcase className="text-primary" size={24} />
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
            variant="ghost"
            onClick={() => navigate("/admin/assign")}
            title="Choose any case and assign up to two caseworkers (with audit reason)"
          >
            <UserPlus size={15} className="mr-1.5 inline" />
            Assign caseworkers
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
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, bg, color, Icon }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
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

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="px-3 py-3 border-b border-gray-100">
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
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-0 min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_COLS.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {TABLE_COLS.map((col) => (
                    <td key={col} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && filteredCases.length === 0 && (
                <tr>
                  <td colSpan={TABLE_COLS.length} className="px-4 py-8 text-center text-sm text-gray-500">
                    {error ? "Unable to display cases." : "No cases match your filters."}
                  </td>
                </tr>
              )}
              {!loading && filteredCases.map((c, i) => (
                <motion.tr
                  key={c.caseId}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-secondary">
                    {c.caseId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {c.candidate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {c.business}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[14rem]">
                    {(c.caseworkerIds?.length ?? 0) === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Unassigned
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-semibold text-secondary">
                        {getCaseworkerNames(c.caseworkerIds)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {c.visaType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${priorityBadge[c.priority]}`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <CaseWorkflowBadge
                      caseRecord={{ caseStage: c.caseStage, status: c.status }}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge[c.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {c.submitted}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
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
                        type="button"
                        onClick={() => {
                          setAssignCaseRow(c);
                          setAssignModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        title={
                          (c.caseworkerIds?.length ?? 0) > 0 ||
                            (typeof c.caseworker === "string" &&
                              !c.caseworker.includes("Unassigned"))
                            ? "Reassign caseworkers"
                            : "Assign caseworkers"
                        }
                      >
                        <UserPlus size={14} />
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
          <AdminCaseFormModal
            title="Add New Case"
            subtitle="Create a new visa case application"
            formData={formData}
            errors={errors}
            setErrors={setErrors}
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
            departments={departments}
            setFormData={setFormData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editOpen && (
          <AdminCaseFormModal
            title="Edit Case"
            subtitle={`Editing ${selectedCase?.caseId}`}
            formData={formData}
            errors={errors}
            setErrors={setErrors}
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
            departments={departments}
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
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6"
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
                  className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors ${approveRejectAction === "approve"
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
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-4 sm:p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-black text-secondary mb-2">
                Delete Case
              </h3>
              <p className="text-sm text-gray-600 mb-4">
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

      <AssignCaseworkerModal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignCaseRow(null);
        }}
        caseRow={assignCaseRow}
        onSuccess={async () => {
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
                ? formatDate(c.submitted)
                : formatDate(c.created_at),
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
              proposedAmount: c.proposedAmount,
              lcaNumber: c.lcaNumber,
              receiptNumber: c.receiptNumber,
              nationality: c.nationality,
              jobTitle: c.jobTitle,
              department: c.departmentId || "",
              salaryOffered: c.salaryOffered,
              totalAmount: c.totalAmount,
              paidAmount: c.paidAmount,
              notes: c.notes,
            }));
            setCases(mappedCases);
          }
        }}
      />
    </div>
  );
}
