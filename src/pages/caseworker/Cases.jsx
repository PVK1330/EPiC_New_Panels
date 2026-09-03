import { useMemo, useState, useCallback, useEffect, Fragment, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Download,
  Lock,
  Eye,
  MessageSquare,
  UserRoundCog,
  X,
  CalendarClock,
  ArrowRightLeft,
  Table,
  LayoutGrid,
  FileText,
  Clock,
  Check,
} from "lucide-react";
import { useSelector } from "react-redux";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import PageTitle from "../../components/common/PageTitle";
import SearchInput from "../../components/common/SearchInput";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import {
  TableShell,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
} from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import DatePicker from "../../components/DatePicker";
import CaseTimeline from "../../components/CaseTimeline";
import {
  getCaseworkerCases,
  getVisaTypes,
  getPetitionTypes,
  getAllUsers,
  createCaseworkerCase,
  updateCaseworkerCase,
  getDepartments,
  getCaseworkerCaseDetails,
  exportCases,
  updatePipelineStage,
  assignCase,
} from "../../services/caseApi";
import { useToast } from "../../context/ToastContext";
import CaseworkerApplicationTab from "../../components/caseDetail/CaseworkerApplicationTab";
import { sendBiometricSlot } from "../../services/workflowApi";
import { formatDate, formatDateLong } from "../../utils/datetime";
import CasesOverviewTab from "./tabs/CasesOverviewTab";
import CasesDocumentsTab from "./tabs/CasesDocumentsTab";
import CasesTasksTab from "./tabs/CasesTasksTab";
import CasesPaymentsTab from "./tabs/CasesPaymentsTab";
import CasesNotesTab from "./tabs/CasesNotesTab";
import {
  PAGE_SIZE,
  REASSIGN_REASONS,
  STATUS_CHIPS,
  VISA_OPTIONS,
  PRIORITY_OPTIONS,
  NEW_CASE_VISA,
  CASE_STATUS_EDIT,
  CASE_PAYMENT_EDIT,
  priorityLevels,
  priorityBadge,
  emptyNewCaseForm,
  caseToEditForm,
  emptyReassignForm,
  formatTarget,
  badgeStatus,
  badgePriority,
  badgePayment,
  badgeVisa,
  loadColor,
  priorityLabel,
  CaseworkerMultiSelect,
} from "./casesHelpers.jsx";

// Lazy: pulls in react-quill (heavy rich-text editor) — only load when the CCL tab opens.
const CaseDetailCcl = lazy(() => import("../../components/caseDetail/CaseDetailCcl"));

const Cases = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
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
  const [stageSaving, setStageSaving] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [pendingBiometricStage, setPendingBiometricStage] = useState(null);
  const { showToast } = useToast();
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState(emptyNewCaseForm);
  const [newCaseErrors, setNewCaseErrors] = useState({});
  const [editCaseId, setEditCaseId] = useState(null);
  const [editCaseForm, setEditCaseForm] = useState(() => emptyNewCaseForm());
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

  const handleExport = async () => {
    try {
      const params = {
        search,
        status: chip === "all" ? "" : chip,
        priority:
          priorityFilter === "All priorities"
            ? ""
            : priorityFilter.toLowerCase(),
        visaTypeId: visaFilter === "All visa types" ? "" : visaFilter,
      };
      const response = await exportCases(params);

      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `caseworker_cases_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast({ message: "Export successful!", variant: "success" });
    } catch (error) {
      console.error("Export failed:", error);
      showToast({
        message: error?.response?.data?.message || "Export failed. Please try again.",
        variant: "danger",
      });
    }
  };

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
        const mappedCases = (response.data?.data?.cases || []).map((c) => ({
          caseId: c.caseId || `#C-${c.id}`,
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "Unknown",
          business: c.sponsor
            ? c.sponsor.sponsorProfile?.companyName ||
              c.sponsor.sponsorProfile?.tradingName ||
              `${c.sponsor.first_name} ${c.sponsor.last_name || ""}`.trim()
            : "No sponsor (private client)",
          visa: c.visaType?.name || "Unknown",
          status: mapApiStatus(c.status),
          legacyStatus: c.status,
          caseStage: c.caseStage,
          target: c.targetSubmissionDate || c.created_at,
          created_at: c.created_at,
          decisionDate: c.decisionDate,
          submissionDate: c.submissionDate,
          biometricsDate: c.biometricsDate,
          priority: c.priority?.toLowerCase() || "medium",
          payment: mapPaymentStatus(c.paidAmount, c.totalAmount),
          totalAmount: c.totalAmount || 0,
          paidAmount: c.paidAmount || 0,
          amountStatus: c.amountStatus || "Not Submitted",
          amountNotes: c.amountNotes || "",
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.department,
          sponsor: c.sponsor,
          proposedAmount: c.proposedAmount ?? null,
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
        setCases([]);
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

  //  Reassign state 
  const [reassignCaseId, setReassignCaseId] = useState(null);
  const [reassignForm, setReassignForm] = useState(emptyReassignForm());
  const [reassignErrors, setReassignErrors] = useState({});
  // Map: caseId †’ { caseworker, reason, at }
  const [reassignments, setReassignments] = useState({});
  // 

  const handleWorkflowStageChange = useCallback(
    async (caseStage) => {
      if (!caseStage) return;
      if (!detailCase?.caseId) return;
      if (caseStage === "biometrics_booked" || caseStage === "biometrics_confirmation_sent") {
        setPendingBiometricStage(caseStage);
        setBiometricModalOpen(true);
        return;
      }
      setStageSaving(true);
      try {
        const res = await updatePipelineStage(detailCase.caseId, caseStage);
        const updated = res?.data?.data?.case;
        setDetailCase((prev) =>
          prev
            ? {
                ...prev,
                caseStage: updated?.caseStage ?? caseStage,
                legacyStatus: updated?.status ?? prev.legacyStatus,
              }
            : null,
        );
        setCases((prev) =>
          prev.map((item) =>
            item.caseId === detailCase.caseId ? { ...item, caseStage } : item,
          ),
        );
        showToast({ message: "Workflow stage updated." });
      } catch (err) {
        showToast({
          message: err?.response?.data?.message || "Failed to update stage.",
          variant: "danger",
        });
      } finally {
        setStageSaving(false);
      }
    },
    [detailCase?.caseId, showToast],
  );

  const handleRefreshCase = useCallback(async () => {
    if (!detailCase?.caseId) return;
    try {
      const res = await getCaseworkerCaseDetails(detailCase.caseId);
      const data = res?.data?.data;
      if (data) {
        const updatedDetail = {
          ...detailCase,
          caseStage: data.overview?.caseStage,
          status: mapApiStatus(data.overview?.status),
          legacyStatus: data.overview?.status,
          priority: data.overview?.priority?.toLowerCase() || "medium",
          target: data.overview?.targetSubmissionDate || data.overview?.created_at,
          totalAmount: data.financial?.totalFee || 0,
          paidAmount: data.financial?.paidAmount || 0,
          amountStatus: data.financial?.amountStatus || "Not Submitted",
          proposedAmount: data.overview?.proposedAmount ?? data.financial?.proposedAmount ?? null,
        };

        setDetailCase(updatedDetail);
        setCases((prev) =>
          prev.map((item) =>
            item.caseId === detailCase.caseId ? updatedDetail : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to refresh case details:", err);
    }
  }, [detailCase, getCaseworkerCaseDetails, mapApiStatus]);

  const confirmBiometricBooking = async (payload) => {
    if (!detailCase?.caseId) return;
    setStageSaving(true);
    try {
      const caseId = detailCase.caseId;
      if (pendingBiometricStage === "biometrics_confirmation_sent") {
        // Use dedicated workflow API
        await sendBiometricSlot(caseId, {
          location: payload.biometricLocation,
          appointmentDate: payload.biometricDate,
          appointmentTime: payload.biometricTime,
          appointmentDay: payload.biometricDay,
          instructions: payload.biometricInstructions,
        });
        showToast({
          message: "Confirmation sent candidate notified by email & in-app",
          variant: "success",
        });
      } else {
        await updatePipelineStage(caseId, "biometrics_booked", payload);
        showToast({
          message: "Biometrics booked candidate notified",
          variant: "success",
        });
      }
      // Re-fetch detail
      const res = await getCaseworkerCaseDetails(caseId);
      const data = res?.data?.data;
      if (data?.overview) {
        setDetailCase((prev) =>
          prev
            ? { ...prev, caseStage: pendingBiometricStage }
            : prev,
        );
      }
      setBiometricModalOpen(false);
      setPendingBiometricStage(null);
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to book biometrics",
      });
    } finally {
      setStageSaving(false);
    }
  };

  const openDetail = useCallback((c) => {
    setNewCaseOpen(false);
    setEditCaseId(null);
    setReassignCaseId(null);
    setDetailCase(c);
    setDetailTab("overview");
  }, []);

  const closeDetail = useCallback(() => setDetailCase(null), []);

  useEffect(() => {
    const ref = location.state?.openCaseRef;
    if (!ref || loading || !cases.length) return;
    const found = cases.find(
      (c) => c.caseId === ref || String(c.id) === String(ref),
    );
    if (found) {
      openDetail(found);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [cases, loading, location.state, location.pathname, openDetail, navigate]);

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
        const mappedCases = (response.data?.data?.cases || []).map((c) => ({
          caseId: c.caseId || `#C-${c.id}`,
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "Unknown",
          business: c.sponsor
            ? c.sponsor.sponsorProfile?.companyName ||
              c.sponsor.sponsorProfile?.tradingName ||
              `${c.sponsor.first_name} ${c.sponsor.last_name || ""}`.trim()
            : "No sponsor (private client)",
          visa: c.visaType?.name || "Unknown",
          status: mapApiStatus(c.status),
          legacyStatus: c.status,
          caseStage: c.caseStage,
          target: c.targetSubmissionDate || c.created_at,
          created_at: c.created_at,
          decisionDate: c.decisionDate,
          submissionDate: c.submissionDate,
          biometricsDate: c.biometricsDate,
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
          proposedAmount: c.proposedAmount ?? null,
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

    //  Required selections 
    if (!newCaseForm.candidateId) e.candidateId = "Please select a candidate";
    // Sponsor is optional (BUG-031) — private clients have no sponsor.
    if (!newCaseForm.visaTypeId) e.visaTypeId = "Please select a visa type";

    //  Caseworkers: 1 or 2 required 
    const n = newCaseForm.assignedCaseworkerIds?.length || 0;
    if (n < 1 || n > 2) e.assignedCaseworkers = "Select 1 or 2 caseworkers";

    //  Target submission date: required, valid, not in the past 
    if (!newCaseForm.targetSubmissionDate) {
      e.targetSubmissionDate = "Please choose a target date";
    } else {
      const picked = new Date(`${newCaseForm.targetSubmissionDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(picked.getTime())) {
        e.targetSubmissionDate = "Enter a valid date";
      } else if (picked < today) {
        e.targetSubmissionDate = "Target date cannot be in the past";
      }
    }

    //  Financials: non-negative, total > 0, paid ‰¤ total 
    const total = Number(newCaseForm.totalAmount);
    const paid = Number(newCaseForm.paidAmount);
    const salary = Number(newCaseForm.salaryOffered);
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
        const mappedCases = (response.data?.data?.cases || []).map((c) => ({
          caseId: c.caseId || `#C-${c.id}`,
          candidate: c.candidate
            ? `${c.candidate.first_name} ${c.candidate.last_name}`
            : "Unknown",
          business: c.sponsor
            ? c.sponsor.sponsorProfile?.companyName ||
              c.sponsor.sponsorProfile?.tradingName ||
              `${c.sponsor.first_name} ${c.sponsor.last_name || ""}`.trim()
            : "No sponsor (private client)",
          visa: c.visaType?.name || "Unknown",
          status: mapApiStatus(c.status),
          legacyStatus: c.status,
          caseStage: c.caseStage,
          target: c.targetSubmissionDate || c.created_at,
          created_at: c.created_at,
          decisionDate: c.decisionDate,
          submissionDate: c.submissionDate,
          biometricsDate: c.biometricsDate,
          priority: c.priority?.toLowerCase() || "medium",
          payment: mapPaymentStatus(c.paidAmount, c.totalAmount),
          id: c.id,
          candidateId: c.candidateId,
          sponsorId: c.sponsorId,
          businessId: c.businessId,
          department: c.department,
          sponsor: c.sponsor,
          proposedAmount: c.proposedAmount ?? null,
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

  //  Reassign handlers 
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

  const submitReassign = useCallback(async () => {
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

    const selectedCaseworkers = reassignForm.caseworkerIds
      .map((id) => caseworkers.find((w) => w.id === id))
      .filter(Boolean);
    const reason =
      reassignForm.reasonPreset === "Other"
        ? reassignForm.reasonCustom.trim()
        : reassignForm.reasonPreset;

    try {
      await assignCase(reassignCaseId, {
        assignTo: reassignForm.caseworkerIds,
        reason,
        assignToName: selectedCaseworkers
          .map((cw) => `${cw.first_name} ${cw.last_name}`)
          .join(", "),
      });
      setReassignments((prev) => ({
        ...prev,
        [reassignCaseId]: {
          caseworkers: selectedCaseworkers.map((cw) => ({
            name: `${cw.first_name} ${cw.last_name}`,
            role: cw.role || "Caseworker",
          })),
          reason,
          at: new Date(),
        },
      }));
      showToast({ message: "Case reassigned successfully." });
      closeReassign();
    } catch (e) {
      console.error("Reassign error:", e);
      showToast({
        variant: "danger",
        message: e?.response?.data?.message || "Failed to reassign case.",
      });
    }
  }, [reassignCaseId, reassignForm, closeReassign, caseworkers, showToast]);
  // 

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
      <PageTitle
        title="Case Management"
        subtitle="Manage visa cases and applications"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate("/caseworker/pipeline")}
            >
              <LayoutGrid size={18} />
              Pipeline View
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download size={18} />
              Export
            </Button>
            <Button variant="primary" onClick={openNewCaseModal}>
              <Plus size={18} strokeWidth={2.5} />
              Add New Cases
            </Button>
          </>
        }
      />

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
              {error && (
                <div className="w-full py-4 px-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700">
                  {error}
                </div>
              )}
              {!error && (
                <>
                  <SearchInput
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search cases..."
                    className="flex-1 min-w-[200px] max-w-md"
                  />
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

          {loading ? (
            <TableShell>
              <Tbody>
                <Tr>
                  <Td colSpan={10} className="p-0">
                    <TableSkeleton rows={8} cols={10} />
                  </Td>
                </Tr>
              </Tbody>
            </TableShell>
          ) : (
          <TableShell>
                <Thead>
                  <Tr>
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
                    ].map((h) => (
                      <Th key={h} className="whitespace-nowrap">
                        {h}
                      </Th>
                    ))}
                    <Th align="right" className="whitespace-nowrap">
                      ACTIONS
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pageSlice.length === 0 ? (
                    <Tr>
                      <Td colSpan={10} className="p-0">
                        <EmptyState
                          icon={FileText}
                          title="No cases found"
                          subtitle="No cases match your filters."
                        />
                      </Td>
                    </Tr>
                  ) : (
                    pageSlice.map((c, idx) => {
                      const st = badgeStatus(c.status);
                      const reassigned = reassignments[c.caseId];
                      return (
                        <Fragment key={c.id || c.caseId || idx}>
                          {/*  Main data row  */}
                          <Tr
                            className={reassigned ? "border-b-0" : ""}
                            onClick={() => openDetail(c)}
                          >
                            <Td className="text-sm font-bold text-secondary">
                              {c.caseId}
                            </Td>
                            <Td className="text-sm font-bold text-gray-900">
                              {c.candidate?.first_name && c.candidate?.last_name
                                ? `${c.candidate.first_name} ${c.candidate.last_name}`
                                : c.candidate || "-"}
                            </Td>
                            <Td className="text-sm font-bold text-gray-900">
                              {c.sponsor?.first_name && c.sponsor?.last_name
                                ? `${c.sponsor.first_name} ${c.sponsor.last_name}`
                                : c.business || "-"}
                            </Td>
                            <Td className="text-sm font-bold text-gray-600">
                              {c.department?.name || c.department || "-"}
                            </Td>
                            <Td className="text-sm font-bold text-gray-600">
                              {c.caseworker || "Unassigned"}
                            </Td>
                            <Td>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${badgeVisa(c.visa)}`}
                              >
                                {c.visa}
                              </span>
                            </Td>
                            <Td>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${badgePriority(c.priority)}`}
                              >
                                {priorityLabel(c.priority)}
                              </span>
                            </Td>
                            <Td>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${st.className}`}
                              >
                                {st.label}
                              </span>
                            </Td>
                            <Td className="text-sm font-bold text-gray-600 tabular-nums whitespace-nowrap">
                              {formatTarget(c.target)}
                            </Td>
                            <Td align="right">
                              <div
                                className="flex justify-end gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => openDetail(c)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-600 hover:border-secondary/40 hover:text-secondary transition-colors"
                                  title="View case"
                                >
                                  <Eye size={14} />
                                </button>
                                {/* <button
                                  type="button"
                                  onClick={() => openCaseEdit(c)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-secondary hover:bg-secondary/5 transition-colors"
                                  title="Edit case"
                                >
                                  <Pencil size={14} />
                                </button> */}
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
                                {/*  Reassign button  */}
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
                            </Td>
                          </Tr>

                          {/*  Reassignment info banner row  */}
                          {reassigned && (
                            <Tr
                              key={`${c.caseId}-reassigned`}
                              className="bg-violet-50/60 border-b border-violet-100"
                            >
                              <td colSpan={10} className="px-4 py-2">
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
                            </Tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </Tbody>
          </TableShell>
          )}
          <Pagination
            page={pageClamped}
            totalPages={totalPages}
            total={pagination.total}
            limit={PAGE_SIZE}
            onPageChange={(next) => setPage(next)}
          />
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

      {/*  NEW CASE MODAL  */}
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
                    Sponsor <span className="text-gray-400 font-normal">(optional)</span>
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
                            (selectedSponsor
                              ? `${selectedSponsor.first_name} ${selectedSponsor.last_name}`
                              : ""),
                        }));
                        if (newCaseErrors.businessId)
                          setNewCaseErrors((prev) => ({
                            ...prev,
                            businessId: "",
                          }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.businessId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">No sponsor (private client)</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.sponsorProfile?.companyName ||
                            s.sponsorProfile?.tradingName ||
                            `${s.first_name} ${s.last_name}`}
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
                  Target Submission Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="targetSubmissionDate"
                  value={newCaseForm.targetSubmissionDate}
                  onChange={handleInputChange}
                  error={newCaseErrors.targetSubmissionDate}
                  min={new Date().toISOString().split("T")[0]}
                  placeholder="Select target date"
                />
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
                  min="0"
                  step="0.01"
                  value={newCaseForm.salaryOffered}
                  onChange={handleInputChange}
                  placeholder="Annual salary"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.salaryOffered ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.salaryOffered && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.salaryOffered}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Total Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  min="0"
                  step="0.01"
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
                  min="0"
                  step="0.01"
                  value={newCaseForm.paidAmount}
                  onChange={handleInputChange}
                  placeholder="Amount paid so far"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.paidAmount ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.paidAmount && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.paidAmount}
                  </p>
                )}
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

      {/*  REASSIGN MODAL  */}
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
              onChange={(ids) =>
                setReassignForm((f) => ({ ...f, caseworkerIds: ids }))
              }
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
                <option value="">Select a reason</option>
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
                  placeholder="Explain why this case is being reassigned"
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

      {/*  CASE DETAIL MODAL  */}
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
                      Reassigned †’{" "}
                      {reassignments[detailCase.caseId].caseworkers
                        .map((c) => c.name)
                        .join(" · ")}
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
                {/* <button
                  type="button"
                  onClick={() => openCaseEdit(detailCase)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-secondary hover:bg-secondary/5"
                >
                  Edit case
                </button> */}
              </div>
            </div>

            <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar">
              {[
                { id: "overview", label: "Overview" },
                { id: "application", label: "Application" },
                { id: "documents", label: "Documents" },
                { id: "tasks", label: "Tasks" },
                { id: "payments", label: "Payments" },
                { id: "ccl", label: "Client Care Letter" },
                { id: "notes", label: "Notes" },
                { id: "timeline", label: "Timeline" },
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

            <div className="flex-1 p-4 sm:p-6">
              {detailTab === "overview" && (
                <CasesOverviewTab
                  c={detailCase}
                  userName={user?.name || "You"}
                  onStageChange={handleWorkflowStageChange}
                  stageSaving={stageSaving}
                  onRefresh={handleRefreshCase}
                />
              )}
              {detailTab === "application" && (
                <CaseworkerApplicationTab
                  caseDetail={detailCase}
                  userName={user?.name || "Caseworker"}
                />
              )}
              {detailTab === "documents" && (
                <CasesDocumentsTab
                  caseId={detailCase?.id}
                  candidateId={detailCase?.candidateId}
                />
              )}
              {detailTab === "tasks" && <CasesTasksTab caseId={detailCase?.id} />}
              {detailTab === "ccl" && (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <CaseDetailCcl caseId={detailCase?.id} />
                </Suspense>
              )}
              {detailTab === "payments" && (
                <CasesPaymentsTab
                  caseDetail={detailCase}
                  onUpdate={(updated) => {
                    setDetailCase((prev) =>
                      prev ? { ...prev, ...updated } : null,
                    );
                    setCases((prev) =>
                      prev.map((item) =>
                        item.id === detailCase?.id
                          ? { ...item, ...updated }
                          : item,
                      ),
                    );
                  }}
                />
              )}
              {detailTab === "notes" && (
                <CasesNotesTab
                  caseId={detailCase?.id}
                  userName={user?.name || "Caseworker"}
                />
              )}
              {detailTab === "timeline" && (
                <CaseTimeline caseId={detailCase?.id} currentUser={user} />
              )}
            </div>
          </>
        )}
      </Modal>

      {/*  NEW CASE MODAL  */}
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
                    Sponsor <span className="text-gray-400 font-normal">(optional)</span>
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
                            (selectedSponsor
                              ? `${selectedSponsor.first_name} ${selectedSponsor.last_name}`
                              : ""),
                        }));
                        if (newCaseErrors.businessId)
                          setNewCaseErrors((prev) => ({
                            ...prev,
                            businessId: "",
                          }));
                      }}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${newCaseErrors.businessId ? "border-red-400" : "border-gray-300"}`}
                    >
                      <option value="">No sponsor (private client)</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.sponsorProfile?.companyName ||
                            s.sponsorProfile?.tradingName ||
                            `${s.first_name} ${s.last_name}`}
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
                  Target Submission Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="targetSubmissionDate"
                  value={newCaseForm.targetSubmissionDate}
                  onChange={handleInputChange}
                  error={newCaseErrors.targetSubmissionDate}
                  min={new Date().toISOString().split("T")[0]}
                  placeholder="Select target date"
                />
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
                  min="0"
                  step="0.01"
                  value={newCaseForm.salaryOffered}
                  onChange={handleInputChange}
                  placeholder="Annual salary"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.salaryOffered ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.salaryOffered && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.salaryOffered}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                  Total Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  min="0"
                  step="0.01"
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
                  min="0"
                  step="0.01"
                  value={newCaseForm.paidAmount}
                  onChange={handleInputChange}
                  placeholder="Amount paid so far"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary ${newCaseErrors.paidAmount ? "border-red-300" : "border-gray-200"}`}
                />
                {newCaseErrors.paidAmount && (
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {newCaseErrors.paidAmount}
                  </p>
                )}
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

export default Cases;
