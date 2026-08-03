import { useState, useEffect, useMemo } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiDownload,
  FiUpload,
  FiCheck,
  FiEye,
  FiFolder,
  FiPrinter,
  FiBriefcase,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import useCandidate from "../../hooks/useCandidate";
import useAdmin from "../../hooks/useAdmin";
import { useToast } from "../../context/ToastContext";
import CandidateApplicationForm from "../../components/CandidateApplicationForm/CandidateApplicationForm";
import CandidateApplicationReadonly, {
  printCandidateApplication,
} from "../../components/CandidateApplicationForm/CandidateApplicationReadonly";
import useDownloads from "../../hooks/useDownloads";
import {
  APPLICATION_FIELD_LABELS,
  getInitialApplicationFormData,
  CUSTOM_FIELD_TYPE_OPTIONS,
} from "../../components/CandidateApplicationForm/initialFormState";
import {
  mapApplicationToCandidateRow,
  candidateRowToApplicationForm,
  pruneCustomResponsesToDefinitions,
} from "../../components/CandidateApplicationForm/applicationFormMapping";
import {
  createCandidate,
  toggleCandidateStatus,
  getCandidateById,
  updateAdminCandidateApplication,
  exportCandidateApplicationsExcel,
  importCandidateApplicationsExcel,
  downloadImportSampleTemplate,
  assignCandidateBusiness,
} from "../../services/candidateApi";
import { getSponsors } from "../../services/sponsorApi";
import { getApiError } from "../../utils/apiError";
import { RoleBadge, StatusBadge } from "../../components/common/Badge";
import PageTitle from "../../components/common/PageTitle";
import SearchInput from "../../components/common/SearchInput";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import Pagination from "../../components/common/Pagination";
import {
  TableShell,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TABLE_CLASS,
} from "../../components/common/Table";
import TableActionButton from "../../components/common/TableActionButton";
import { formatDateLong } from "../../utils/datetime";
import { AVATAR_COLORS, initialsFrom, fullName } from "./adminHelpers";

const PASSWORD_MIN = 6;

/** Canonical inline chip classes (matches Badge component sizing). */
const CHIP_BASE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest";

/** Session draft for Add client application wizard (partial saves before account creation). */
const ADMIN_CREATE_APPLICATION_DRAFT_KEY = "elitepic_admin_create_application_draft";

const CASE_CHIPS = {
  "On Track": "bg-green-100 text-green-700",
  "Due Soon": "bg-yellow-100 text-yellow-700",
  "Overdue": "bg-red-100 text-red-600",
  "In Review": "bg-blue-100 text-blue-700",
  "Completed": "bg-gray-100 text-gray-600",
  "On Hold": "bg-orange-100 text-orange-600",
};

const PAYMENT_CHIPS = {
  "Paid": "bg-green-100 text-green-700",
  "Partial": "bg-yellow-100 text-yellow-700",
  "Outstanding": "bg-red-100 text-red-600",
  "Waived": "bg-gray-100 text-gray-500",
};

const VISA_CHIPS = {
  "Skilled Worker": "bg-blue-100 text-blue-700",
  "Student Visa": "bg-purple-100 text-purple-700",
  "ILR": "bg-indigo-100 text-indigo-700",
  "Graduate Visa": "bg-yellow-100 text-yellow-700",
  "Sponsor Licence": "bg-teal-100 text-teal-700",
  "Global Talent": "bg-cyan-100 text-cyan-700",
  "Family Visa": "bg-pink-100 text-pink-700",
  "Youth Mobility": "bg-lime-100 text-lime-700",
  "Visitor Visa": "bg-orange-100 text-orange-700",
};

/** Maps each application field key → the form step it appears in. */
const FIELD_STEP_MAP = {
  applicationType: "Personal",   firstName: "Personal",     lastName: "Personal",
  email: "Personal",             gender: "Personal",        contactNumber: "Personal",
  relationshipStatus: "Personal",address: "Personal",
  nationality: "Nationality",    birthCountry: "Nationality", placeOfBirth: "Nationality",
  dob: "Nationality",            passportNumber: "Nationality", issuingAuthority: "Nationality",
  issueDate: "Nationality",      expiryDate: "Nationality", passportAvailable: "Nationality",
  nationalIdNumber: "Identity",  idIssuingAuthorityNational: "Identity",
  otherNationality: "Identity",  ukLicense: "Identity",     medicalTreatment: "Identity",
  ukStayDuration: "Identity",    contactNumber2: "Identity",
  previousAddress: "Identity",   startDate: "Identity",     endDate: "Identity",
  parentName: "Parent",          parentRelation: "Parent",  parentDob: "Parent",
  parentNationality: "Parent",   sameNationality: "Parent",
  parent2Name: "Parent",         parent2Relation: "Parent", parent2Dob: "Parent",
  parent2Nationality: "Parent",  parent2SameNationality: "Parent",
  illegalEntry: "Travel & visa", overstayed: "Travel & visa", breach: "Travel & visa",
  falseInfo: "Travel & visa",    otherBreach: "Travel & visa",
  refusedVisa: "Travel & visa",  refusedEntry: "Travel & visa",
  refusedPermission: "Travel & visa", refusedAsylum: "Travel & visa",
  deported: "Travel & visa",     removed: "Travel & visa",
  requiredToLeave: "Travel & visa", banned: "Travel & visa",
  visitedOther: "Status",        countryVisited: "Status",  visitReason: "Status",
  entryDate: "Status",           leaveDate: "Status",       visaType: "Status",
  brpNumber: "Status",           visaEndDate: "Status",     niNumber: "Status",
  sponsored: "Status",           englishProof: "Status",
};

const STEP_BADGE = {
  "Personal":     "bg-blue-50 text-blue-600 border-blue-100",
  "Nationality":  "bg-purple-50 text-purple-600 border-purple-100",
  "Identity":     "bg-amber-50 text-amber-600 border-amber-100",
  "Parent":       "bg-green-50 text-green-600 border-green-100",
  "Travel & visa":"bg-orange-50 text-orange-600 border-orange-100",
  "Status":       "bg-teal-50 text-teal-600 border-teal-100",
};


/**
 * Map a stored visa value ("Skilled Worker Visa", "Indefinite Leave to Remain (ILR)")
 * to the canonical short label used as the VISA_CHIPS / filter key ("Skilled Worker",
 * "ILR"). Matching is normalised (lowercased, alphanumerics-only substring), mirroring
 * the backend's visa-type filter so chips colour correctly regardless of phrasing.
 */
const VISA_CANONICAL_LABELS = [
  "Skilled Worker",
  "Student Visa",
  "ILR",
  "Graduate Visa",
  "Sponsor Licence",
  "Global Talent",
  "Family Visa",
  "Youth Mobility",
  "Visitor Visa",
];

function normaliseVisa(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function canonicalVisaLabel(value) {
  if (!value) return "—";
  const norm = normaliseVisa(value);
  if (!norm) return "—";
  // "ilr" must also match "indefiniteleavetoremain".
  const match = VISA_CANONICAL_LABELS.find((label) => {
    const n = normaliseVisa(label);
    return norm.includes(n) || n.includes(norm);
  });
  if (match) return match;
  if (norm.includes("indefiniteleave")) return "ILR";
  return value; // unknown — show the raw stored value
}

const ROLE_OPTIONS = [{ value: "1", label: "Client" }];

const VISA_TYPE_OPTIONS = [
  { value: "Skilled Worker", label: "Skilled Worker" },
  { value: "Student Visa", label: "Student Visa" },
  { value: "ILR", label: "ILR — Indefinite Leave to Remain" },
  { value: "Graduate Visa", label: "Graduate Visa" },
  { value: "Sponsor Licence", label: "Sponsor Licence" },
  { value: "Global Talent", label: "Global Talent Visa" },
  { value: "Family Visa", label: "Family Visa" },
  { value: "Youth Mobility", label: "Youth Mobility Scheme" },
  { value: "Visitor Visa", label: "Visitor Visa" },
  { value: "Other", label: "Other" },
];

const CASE_STATUS_OPTIONS = [
  { value: "On Track", label: "On Track" },
  { value: "Due Soon", label: "Due Soon" },
  { value: "Overdue", label: "Overdue" },
  { value: "In Review", label: "In Review" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold", label: "On Hold" },
];

const PAYMENT_OPTIONS = [
  { value: "Paid", label: "Paid in Full" },
  { value: "Partial", label: "Partial Payment" },
  { value: "Outstanding", label: "Outstanding" },
  { value: "Waived", label: "Waived" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EDIT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EMPTY_CREATE = {
  first_name: "",
  last_name: "",
  email: "",
  country_code: "+44",
  mobile: "",
  role_id: "1",
  password: "",
  confirm_password: "",
};


function displayRoleName(row) {
  const n = row?.Role?.name;
  if (!n) return "Client";
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function formatStatusLabel(status) {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return status || "—";
}

function formatDate(date) {
  return formatDateLong(date, { month: 'short' }) || "—";
}

export default function AdminCandidates() {
  const { showToast } = useToast();
  const { candidates, pagination, loading, fetchCandidates } = useCandidate();
  const {
    applicationFieldSettings,
    applicationCustomFields,
    applicationFieldsLoading,
    fetchApplicationFieldSettings,
    toggleBuiltinFieldVisibilityById,
    fetchApplicationCustomFields,
    addApplicationCustomField,
    removeApplicationCustomField,
  } = useAdmin();
  const { downloadAdminCandidateApplicationPdf } = useDownloads();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visaFilter, setVisaFilter] = useState("All");
  const [payFilter, setPayFilter] = useState("All");

  const [modal, setModal] = useState({ type: null, data: null });
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [detailTab, setDetailTab] = useState("overview");
  const [applicationForm, setApplicationForm] = useState(getInitialApplicationFormData);
  const [fieldPanelOpen, setFieldPanelOpen] = useState(false);
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newCustomType, setNewCustomType] = useState("text");

  const visibilityForCandidateForm = useMemo(() => {
    const vis = {};
    for (const row of applicationFieldSettings) {
      vis[row.field_key] = row.is_visible !== false;
    }
    for (const key of Object.keys(APPLICATION_FIELD_LABELS)) {
      if (vis[key] === undefined) vis[key] = true;
    }
    return vis;
  }, [applicationFieldSettings]);

  const customDefsForForm = useMemo(
    () =>
      applicationCustomFields.map((cf) => ({
        id: cf.field_id,
        label: cf.label,
        type: cf.field_type,
      })),
    [applicationCustomFields],
  );

  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Assign-to-business modal state
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [assignBusinessId, setAssignBusinessId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchApplicationFieldSettings();
    fetchApplicationCustomFields();
  }, [fetchApplicationFieldSettings, fetchApplicationCustomFields]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, visaFilter, payFilter]);

  const statusParam = statusFilter === "All" ? "all" : statusFilter;
  const visaParam = visaFilter === "All" ? "" : visaFilter;
  const payParam = payFilter === "All" ? "" : payFilter;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        visaParam,
        payParam,
      );
      if (cancelled) return;
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    page,
    debouncedSearch,
    statusFilter,
    visaFilter,
    payFilter,
    fetchCandidates,
    showToast,
    statusParam,
    visaParam,
    payParam,
  ]);

  const handleBuiltinToggle = async (row, checked) => {
    const r = await toggleBuiltinFieldVisibilityById(row.id, checked);
    if (!r.ok) {
      showToast({ message: getApiError(r.error), variant: "danger" });
    }
  };

  const handleAddCustomField = async () => {
    if (!newCustomLabel.trim()) {
      showToast({ message: "Enter a question label", variant: "danger" });
      return;
    }
    const r = await addApplicationCustomField({
      label: newCustomLabel.trim(),
      field_type: newCustomType,
    });
    if (r.ok) {
      setNewCustomLabel("");
      setNewCustomType("text");
      showToast({ message: "Custom field added", variant: "success" });
    } else {
      showToast({ message: getApiError(r.error), variant: "danger" });
    }
  };

  const handleRemoveCustomField = async (id) => {
    const r = await removeApplicationCustomField(id);
    if (r.ok) {
      showToast({ message: "Field removed", variant: "success" });
    } else {
      showToast({ message: getApiError(r.error), variant: "danger" });
    }
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    setCreateForm(EMPTY_CREATE);
    setEditForm(null);
    setErrors({});
    setDetailTab("overview");
    setImportResults(null);
    setImportFile(null);
  };

  const openCreate = () => {
    let initial = getInitialApplicationFormData();
    try {
      const raw = sessionStorage.getItem(ADMIN_CREATE_APPLICATION_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          initial = { ...initial, ...parsed };
        }
      }
    } catch {
      /* ignore */
    }
    setApplicationForm(initial);
    setErrors({});
    setModal({ type: "create", data: null });
  };

  const openEdit = async (row) => {
    try {
      console.log("Edit candidate data:", row);

      // Fetch complete candidate data with application details
      const res = await getCandidateById(row.id);
      const candidateData = res.data?.data?.candidate;

      if (candidateData) {
        console.log("Fetched candidate data:", candidateData);
        const mappedForm = candidateRowToApplicationForm(candidateData);
        console.log("Mapped form data:", mappedForm);
        setApplicationForm(mappedForm);
        setErrors({});
        setModal({ type: "edit", data: candidateData });
      } else {
        showToast({ message: "Failed to load candidate data", variant: "danger" });
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
      showToast({ message: getApiError(error), variant: "danger" });
    }
  };

  const openView = async (row) => {
    try {
      console.log("View candidate data:", row);

      // Fetch complete candidate data with application details
      const res = await getCandidateById(row.id);
      const candidateData = res.data?.data?.candidate;

      if (candidateData) {
        console.log("Fetched candidate data for view:", candidateData);
        const mappedForm = candidateRowToApplicationForm(candidateData);
        setApplicationForm(mappedForm);
        setErrors({});
        setModal({ type: "view", data: candidateData });
      } else {
        showToast({ message: "Failed to load candidate data", variant: "danger" });
      }
    } catch (error) {
      console.error("Error fetching candidate data for view:", error);
      showToast({ message: getApiError(error), variant: "danger" });
    }
  };

  const openDelete = (row) => {
    setModal({ type: "delete", data: row });
  };

  const loadBusinesses = async () => {
    setBusinessesLoading(true);
    try {
      // Pull active sponsors/businesses for the assignment dropdown.
      const res = await getSponsors(1, 200, "", "active");
      setBusinesses(res.data?.data?.sponsors ?? []);
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
      setBusinesses([]);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const openAssign = (row) => {
    const caseRecord = row.cases?.[0] || {};
    setAssignBusinessId(caseRecord.sponsorId ? String(caseRecord.sponsorId) : "");
    setModal({ type: "assign", data: row });
    if (!businesses.length) loadBusinesses();
  };

  const handleAssign = async () => {
    if (!modal.data) return;
    setAssigning(true);
    try {
      const businessId = assignBusinessId ? Number(assignBusinessId) : null;
      const res = await assignCandidateBusiness(modal.data.id, businessId);
      showToast({
        message:
          res.data?.message ||
          (businessId ? "Client assigned to business" : "Client unassigned"),
        variant: "success",
      });
      closeModal();
      const r = await fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        visaParam,
        payParam,
      );
      if (!r.ok) showToast({ message: getApiError(r.error), variant: "danger" });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setAssigning(false);
    }
  };


  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };


  const validateCreate = () => {
    const errs = {};
    if (!createForm.first_name.trim()) errs.first_name = "First name is required";
    if (!createForm.last_name.trim()) errs.last_name = "Last name is required";
    if (!createForm.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(createForm.email))
      errs.email = "Enter a valid email";
    if (!createForm.country_code.trim())
      errs.country_code = "Country code is required";
    if (!createForm.mobile.trim()) errs.mobile = "Mobile is required";
    if (!createForm.password) errs.password = "Password is required";
    else if (createForm.password.length < PASSWORD_MIN)
      errs.password = `Password must be at least ${PASSWORD_MIN} characters`;
    if (!createForm.confirm_password)
      errs.confirm_password = "Please confirm password";
    else if (createForm.password !== createForm.confirm_password)
      errs.confirm_password = "Passwords do not match";
    return errs;
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.first_name.trim()) errs.first_name = "First name is required";
    if (!editForm.last_name.trim()) errs.last_name = "Last name is required";
    if (!editForm.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(editForm.email))
      errs.email = "Enter a valid email";
    if (!editForm.country_code.trim())
      errs.country_code = "Country code is required";
    if (!editForm.mobile.trim()) errs.mobile = "Mobile is required";
    return errs;
  };

  const handleApplicationSave = (payload) => {
    const rowExtras = modal.type === "edit" && modal.data
      ? {
          caseStatus:      modal.data.cases?.[0]?.status || "On Track",
          paymentStatus:   modal.data.cases?.[0]?.paymentStatus || "Outstanding",
        }
      : {};

    const payloadClean = pruneCustomResponsesToDefinitions(payload, customDefsForForm);
    const mapped = mapApplicationToCandidateRow(payloadClean, {
      ...rowExtras,
      isNewApplication: modal.type === "create"
    });

    // Use the mapped fields - now separated into user data and application data
    const backendData = {
      // Core user fields
      first_name: mapped.userData.first_name,
      last_name: mapped.userData.last_name,
      email: mapped.userData.email,
      country_code: mapped.userData.country_code || "+44",
      mobile: mapped.userData.mobile,
      role_id: 1,
      password: payload.password || "",
      confirm_password: payload.confirmPassword || "",

      // Legacy/CRM fields for compatibility
      phone: mapped.userData.phone,
      passportExpiry: mapped.userData.passportExpiry,
      visaExpiry: mapped.userData.visaExpiry,
      countryOfBirth: mapped.userData.countryOfBirth,

      // Case-related fields
      caseStatus: mapped.userData.caseStatus,
      rightToWork: mapped.userData.rightToWork,
      jobTitle: mapped.userData.jobTitle,
      linkedBusiness: mapped.userData.linkedBusiness,
      employmentStart: mapped.userData.employmentStart,
      paymentStatus: mapped.userData.paymentStatus,
      feeAmount: mapped.userData.feeAmount,
      city: mapped.userData.city,
      postcode: mapped.userData.postcode,
      country: mapped.userData.country,

      // Store complete application data as backup
      applicationData: mapped.userData.applicationData,

      // Application data for child table
      application: mapped.applicationData,
    };

    if (modal.type === "create") {
      handleCreateWithApplication(backendData);
    } else if (modal.type === "edit" && modal.data) {
      handleUpdateApplicationOnly(modal.data.id, mapped, payloadClean);
    }
  };

  /** Persist partial progress without closing the modal (edit → API; create → sessionStorage). */
  const handleApplicationSaveDraft = async (payload) => {
    const payloadClean = pruneCustomResponsesToDefinitions(payload, customDefsForForm);

    if (modal.type === "edit" && modal.data) {
      const rowExtras = {
        caseStatus: modal.data.cases?.[0]?.status || "On Track",
        paymentStatus: modal.data.cases?.[0]?.paymentStatus || "Outstanding",
      };
      const mapped = mapApplicationToCandidateRow(payloadClean, {
        ...rowExtras,
        isNewApplication: false,
      });
      try {
        const body = {
          ...mapped.applicationData,
          first_name: mapped.userData.first_name,
          last_name: mapped.userData.last_name,
          email: mapped.userData.email,
          country_code: mapped.userData.country_code,
          mobile: mapped.userData.mobile,
          caseworkerId: payloadClean.caseworkerId,
        };
        const res = await updateAdminCandidateApplication(modal.data.id, body);
        showToast({
          message: res.data?.message || "Draft saved",
          variant: "success",
        });
        const r = await fetchCandidates(
          page,
          limit,
          debouncedSearch.trim(),
          statusParam,
          visaParam,
          payParam,
        );
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      } catch (e) {
        console.error("Save draft error:", e);
        showToast({ message: getApiError(e), variant: "danger" });
      }
      return;
    }

    if (modal.type === "create") {
      try {
        sessionStorage.setItem(
          ADMIN_CREATE_APPLICATION_DRAFT_KEY,
          JSON.stringify(payload),
        );
        showToast({
          message:
            "Draft saved on this device. It reloads when you open Add client.",
          variant: "success",
        });
      } catch (e) {
        showToast({
          message: getApiError(e) || "Could not save draft",
          variant: "danger",
        });
      }
    }
  };

  const handleUpdateApplicationOnly = async (candidateId, mapped, payloadClean) => {
    setSaving(true);
    try {
      const body = {
        ...mapped.applicationData,
        first_name: mapped.userData.first_name,
        last_name: mapped.userData.last_name,
        email: mapped.userData.email,
        country_code: mapped.userData.country_code,
        mobile: mapped.userData.mobile,
        caseworkerId: payloadClean.caseworkerId,
      };
      const res = await updateAdminCandidateApplication(candidateId, body);
      const updated = res.data?.data?.candidate;
      showToast({
        message: res.data?.message || "Client updated successfully",
        variant: "success",
      });
      if (updated) {
        setApplicationForm(candidateRowToApplicationForm(updated));
      }
      closeModal();
      fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        visaParam,
        payParam,
      ).then((r) => {
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      });
    } catch (e) {
      console.error("Update application error:", e);
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateWithApplication = async (data) => {
    setSaving(true);
    try {
      const res = await createCandidate(data);
      showToast({
        message: res.data?.message || "Client created successfully",
        variant: "success",
      });
      closeModal();
      try {
        sessionStorage.removeItem(ADMIN_CREATE_APPLICATION_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      if (page !== 1) setPage(1);
      else {
        const r = await fetchCandidates(
          1,
          limit,
          debouncedSearch.trim(),
          statusParam,
          visaParam,
          payParam,
        );
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setSaving(false);
    }
  };


  const handleToggle = async (row) => {
    setToggleId(row.id);
    try {
      const res = await toggleCandidateStatus(row.id);
      showToast({
        message: res.data?.message || "Status updated",
        variant: "success",
      });
      {
        const r = await fetchCandidates(
          page,
          limit,
          debouncedSearch.trim(),
          statusParam,
          visaParam,
          payParam,
        );
        if (!r.ok) {
          showToast({ message: getApiError(r.error), variant: "danger" });
        }
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setToggleId(null);
    }
  };


  const handleDelete = async () => {
    const row = modal.data;
    if (row.status === "inactive") {
      showToast({ message: "Account is already deactivated", variant: "success" });
      closeModal();
      return;
    }
    setDeleteId(row.id);
    try {
      const res = await toggleCandidateStatus(row.id);
      showToast({
        message: res.data?.message || "Client deactivated",
        variant: "success",
      });
      closeModal();
      const r = await fetchCandidates(
        page,
        limit,
        debouncedSearch.trim(),
        statusParam,
        visaParam,
        payParam,
      );
      if (!r.ok) {
        showToast({ message: getApiError(r.error), variant: "danger" });
      }
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      showToast({ message: "Please select an Excel file", variant: "danger" });
      return;
    }

    setImporting(true);
    try {
      const res = await importCandidateApplicationsExcel(importFile);
      const data = res.data?.data || {};
      const { successful, failed, total_processed, results } = data;

      // Collect newly-created candidates that have temporary passwords
      const newAccounts = (results?.success || []).filter((r) => r.created && r.temporary_password);

      setImportResults({ successful, failed, total_processed, errors: results?.errors || [], newAccounts });
      setImportFile(null);

      await fetchCandidates(page, limit, debouncedSearch.trim(), statusParam, visaParam, payParam);
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = async () => {
    setDownloadingSample(true);
    try {
      const res = await downloadImportSampleTemplate();
      const blob = new Blob([res.data], {
        type: res.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "candidate-import-sample.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setDownloadingSample(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportCandidateApplicationsExcel({
        search: debouncedSearch.trim(),
        status: statusParam,
        visaType: visaParam,
        paymentStatus: payParam,
      });

      const blob = new Blob([res.data], {
        type:
          res.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `candidate-applications_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        message: "Applications exported successfully",
        variant: "success",
      });
    } catch (e) {
      showToast({ message: getApiError(e), variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  const isFormModal = modal.type === "create" || modal.type === "edit";
  const totalPages = pagination.pages || 1;
  const startIdx =
    pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const endIdx = Math.min(page * pagination.limit, pagination.total);

  return (
    <motion.div
      className="space-y-4 pb-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageTitle
        title="Clients"
        subtitle="All registered clients and their case details"
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-xl shadow-sm"
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FiDownload size={14} />
              )}
              Export
            </Button>
            <Button
              type="button"
              onClick={() => setModal({ type: "import" })}
              disabled={importing}
              className="rounded-xl shadow-sm"
            >
              {importing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FiUpload size={14} />
              )}
              Import Data
            </Button>
            <Button onClick={openCreate} className="rounded-xl shadow-sm">
              <FiPlus size={14} />
              Add Client
            </Button>
          </>
        }
      />

      {fieldPanelOpen && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          {applicationFieldsLoading && (
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading field settings…
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              Built-in fields — toggle visibility for clients.
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Hidden fields are removed from the client application form. Each badge shows which form step the field belongs to.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[min(50vh,28rem)] overflow-y-auto pr-1">
              {[...applicationFieldSettings]
                .sort((a, b) => (a.field_order ?? 0) - (b.field_order ?? 0))
                .map((row) => {
                  const step = FIELD_STEP_MAP[row.field_key];
                  const badgeCls = step ? STEP_BADGE[step] : "bg-gray-100 text-gray-500 border-gray-200";
                  return (
                    <label
                      key={row.id ?? row.field_key}
                      className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-indigo-600 shrink-0"
                        checked={row.is_visible !== false}
                        onChange={(e) => handleBuiltinToggle(row, e.target.checked)}
                        disabled={applicationFieldsLoading}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-gray-700 leading-snug">{row.field_label}</span>
                        {step && (
                          <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeCls}`}>
                            {step}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-bold text-gray-800 mb-1">Custom fields</p>
            <p className="text-xs text-gray-500 mb-3">
              Extra questions on the last step of the application form.
            </p>
            <div className="space-y-2">
              {applicationCustomFields.map((cf) => (
                <div
                  key={cf.id}
                  className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-center rounded-xl border border-gray-100 bg-gray-50/80 p-3"
                >
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-sm font-semibold text-gray-800">{cf.label}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mt-0.5">{cf.field_type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(cf.id)}
                    disabled={applicationFieldsLoading}
                    className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Question label</label>
                <input
                  type="text"
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  placeholder="e.g. Previous UK employer name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Input type</label>
                <select
                  value={newCustomType}
                  onChange={(e) => setNewCustomType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                >
                  {CUSTOM_FIELD_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                disabled={applicationFieldsLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
              >
                <FiPlus size={16} />
                Add field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Clients</p>
          <p className="text-2xl font-black text-blue-600">{pagination.total || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Active Cases</p>
          <p className="text-2xl font-black text-green-600">{candidates.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Visa Expiry Alerts</p>
          <p className="text-2xl font-black text-red-500">0</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Outstanding Fees</p>
          <p className="text-2xl font-black text-yellow-600">£0</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, nationality…"
            className="flex-1 min-w-[200px]"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <select value={visaFilter} onChange={(e) => setVisaFilter(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all">
              <option value="All">All Visa Types</option>
              {VISA_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all">
              <option value="All">All Status</option>
              {STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all">
              <option value="All">All Payment Status</option>
              {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={10} />
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={FiFolder}
            title="No clients found"
            subtitle="No clients match your search."
          />
        ) : (
        <div className={TABLE_CLASS.scroll}>
          <table className="w-full min-w-[600px] border-collapse text-left">
            <Thead>
              <tr>
                {["Name","DOB","Nationality","Linked Business","Visa Type","Case Status","Visa Expiry","Payment","Status"].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
                <Th align="right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {
                candidates.map((c, idx) => {
                  // Use application data from CandidateApplication table
                  const app = c.application || {};
                  const caseRecord = c.cases?.[0] || {};
                  const dob = app.dob ? formatDate(app.dob) : c.dob ? formatDate(c.dob) : '—';
                  // visaType: prefer application field, then nested visaType name from Case.
                  // Normalise to the canonical short label so the chip colours correctly.
                  const visaTypeRaw = app.visaType || caseRecord.visaType?.name || '';
                  const visaType = canonicalVisaLabel(visaTypeRaw);
                  const caseStatus = caseRecord.status || '—';
                  const visaExpiry = app.visaEndDate ? formatDate(app.visaEndDate) : '—';
                  // Compute payment status from Case amounts
                  const total = parseFloat(caseRecord.totalAmount || 0);
                  const paid  = parseFloat(caseRecord.paidAmount  || 0);
                  const paymentStatus = total === 0 ? '—'
                    : paid >= total   ? 'Paid'
                    : paid > 0        ? 'Partial'
                    : 'Outstanding';
                  const linkedBusiness =
                    caseRecord.sponsor?.sponsorProfile?.companyName ||
                    (caseRecord.sponsor
                      ? `${caseRecord.sponsor.first_name || ""} ${caseRecord.sponsor.last_name || ""}`.trim()
                      : "") ||
                    caseRecord.businessName ||
                    '—';
                  const nationality = app.nationality || caseRecord.nationality || c.nationality || '—';

                  return (
                    <Tr key={`${c.id}-${idx}`}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {initialsFrom(c)}
                          </div>
                          <div>
                            <p className={`${TABLE_CLASS.cellPrimary} whitespace-nowrap`}>{fullName(c)}</p>
                            <RoleBadge role="Client" />
                          </div>
                        </div>
                      </Td>
                      <Td className="text-xs text-gray-500 whitespace-nowrap font-mono">{dob}</Td>
                      <Td className="whitespace-nowrap">{nationality}</Td>
                      <Td className="whitespace-nowrap">{linkedBusiness}</Td>
                      <Td className="whitespace-nowrap">
                        <span className={`${CHIP_BASE} ${VISA_CHIPS[visaType] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {visaType}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">
                        <span className={`${CHIP_BASE} ${CASE_CHIPS[caseStatus] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {caseStatus}
                        </span>
                      </Td>
                      <Td className="text-xs font-mono whitespace-nowrap text-gray-500">{visaExpiry}</Td>
                      <Td className="whitespace-nowrap">
                        <span className={`${CHIP_BASE} ${PAYMENT_CHIPS[paymentStatus] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {paymentStatus}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggle(c)}
                          className="cursor-pointer"
                          title="Toggle status"
                        >
                          <StatusBadge status={formatStatusLabel(c.status)} />
                        </button>
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1 relative z-10">
                          <TableActionButton label="View" onClick={() => openView(c)}><FiEye size={16} /></TableActionButton>
                          <TableActionButton label="Edit" variant="edit" onClick={() => openEdit(c)}><FiEdit2 size={16} /></TableActionButton>
                          <TableActionButton label={caseRecord.sponsorId ? "Reassign business" : "Assign to business"} onClick={() => openAssign(c)}><FiBriefcase size={16} /></TableActionButton>
                          <TableActionButton label="Delete" variant="danger" onClick={() => openDelete(c)}><FiTrash2 size={16} /></TableActionButton>
                        </div>
                      </Td>
                    </Tr>
                  );
                })
              }
            </Tbody>
          </table>
        </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={pagination.total}
            limit={pagination.limit || limit}
            onPageChange={setPage}
          />
          {totalPages <= 1 && (
            <p className="text-xs font-bold text-gray-500">
              Showing {candidates.length} of {pagination.total} clients
            </p>
          )}
        </div>
      </div>

      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={modal.type === "create" ? "Add New Client" : "Edit Client"}
        maxWidthClass="max-w-5xl"
        bodyClassName="px-4 py-4 sm:px-6 sm:py-5"
      >
        {isFormModal && (
          <CandidateApplicationForm
            key={modal.type === "create" ? "create" : String(modal.data?.id)}
            variant="admin"
            embedded
            adminShowAllBuiltinFields
            fieldVisibility={visibilityForCandidateForm}
            customFieldDefinitions={customDefsForForm}
            formData={applicationForm}
            setFormData={setApplicationForm}
            onAdminSubmit={handleApplicationSave}
            onAdminSaveDraft={handleApplicationSaveDraft}
            onAdminCancel={closeModal}
            adminSubmitBusy={saving}
          />
        )}
      </Modal>

      <Modal
        open={modal.type === "view"}
        onClose={() => { closeModal(); setDetailTab("overview"); }}
        title={modal.data ? `Client — ${fullName(modal.data)}` : ""}
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        {modal.data && (() => {
          const c = modal.data;
          const app = c.application || {};
          const dob = formatDate(app.dob || c.dob);
          const caseStatus = c.cases?.[0]?.status || '—';
          const paymentStatus = c.cases?.[0]?.paymentStatus || '—';
          return (
            <>
              <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/80 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-gray-900">{fullName(c)}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`${CHIP_BASE} ${CASE_CHIPS[caseStatus] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>{caseStatus}</span>
                    <span className={`${CHIP_BASE} ${PAYMENT_CHIPS[paymentStatus] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>{paymentStatus}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {c.cases?.[0] && (
                    <a
                      href={`/admin/case-detail/${c.cases[0].id}`}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white hover:bg-indigo-700 inline-flex items-center print:hidden"
                    >
                      View Case Dashboard
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => printCandidateApplication()}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 print:hidden"
                  >
                    <FiPrinter size={14} />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const candidateId = c?.id ?? c?.userId;
                        if (!candidateId) throw new Error("Candidate id not found");
                        await downloadAdminCandidateApplicationPdf(candidateId);
                        showToast({ message: "PDF downloaded." });
                      } catch (e) {
                        showToast({ message: e.message || "PDF failed", variant: "danger" });
                      }
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 print:hidden"
                  >
                    <FiDownload size={14} />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 print:hidden"
                  >
                    Edit client
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar print:hidden">
                {[
                  { id: "overview",       label: "Overview"      },
                  { id: "immigration",    label: "Immigration"   },
                  { id: "employment",     label: "Employment"    },
                  { id: "address",        label: "Address"       },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailTab(t.id)}
                    className={`shrink-0 border-b-2 px-3 sm:px-4 py-3 text-xs font-black transition-colors whitespace-nowrap ${
                      detailTab === t.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-4 sm:p-6">
                <CandidateApplicationReadonly
                  candidate={c}
                  customFieldDefinitions={customDefsForForm}
                  tabId={detailTab}
                />
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Deactivate Client"
        maxWidthClass="max-w-sm"
        bodyClassName="px-4 py-4 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteId != null}
              onClick={handleDelete}
              className="rounded-xl"
            >
              {deleteId != null ? "Deactivating…" : "Deactivate"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to deactivate{" "}
            <span className="font-black text-secondary">
              {modal.data ? fullName(modal.data) : ""}
            </span>
            ? The account will be set to inactive.
          </p>
        </div>
      </Modal>

      <Modal
        open={modal.type === "assign"}
        onClose={closeModal}
        title="Assign to Business"
        maxWidthClass="max-w-md"
        bodyClassName="px-4 py-4 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={assigning || businessesLoading}
              onClick={handleAssign}
              className="rounded-xl"
            >
              {assigning
                ? "Saving…"
                : assignBusinessId
                  ? "Assign"
                  : "Unassign"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <FiBriefcase size={16} className="text-indigo-600" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Link{" "}
              <span className="font-black text-secondary">
                {modal.data ? fullName(modal.data) : ""}
              </span>{" "}
              to a business. The client will appear in that business's
              portal (My Clients / Workers).
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Business
            </label>
            <select
              value={assignBusinessId}
              onChange={(e) => setAssignBusinessId(e.target.value)}
              disabled={businessesLoading}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all disabled:opacity-60"
            >
              <option value="">
                {businessesLoading ? "Loading businesses…" : "— No business (unassign) —"}
              </option>
              {businesses.map((b) => {
                const company = b.sponsorProfile?.companyName;
                const name = `${b.first_name || ""} ${b.last_name || ""}`.trim();
                return (
                  <option key={b.id} value={String(b.id)}>
                    {company ? `${company} (${name})` : name || b.email}
                  </option>
                );
              })}
            </select>
            {!businessesLoading && businesses.length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">
                No active businesses found. Create one under Businesses first.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={modal.type === "import"}
        onClose={closeModal}
        title="Import applications (Excel)"
        maxWidthClass="max-w-md"
        bodyClassName="px-4 py-4 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              {importResults ? "Close" : "Cancel"}
            </Button>
            {!importResults && (
              <Button
                variant="primary"
                disabled={importing || !importFile}
                onClick={handleBulkImport}
                className="rounded-xl"
              >
                {importing ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Importing…
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            )}
          </>
        }
      >
        {importResults ? (
          /* ── Results view shown after import completes ── */
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xl font-black text-gray-800">{importResults.total_processed ?? 0}</p>
                <p className="text-[10px] font-bold uppercase text-gray-400 mt-0.5">Rows</p>
              </div>
              <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                <p className="text-xl font-black text-green-700">{importResults.successful ?? 0}</p>
                <p className="text-[10px] font-bold uppercase text-green-500 mt-0.5">Success</p>
              </div>
              <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                <p className="text-xl font-black text-red-600">{importResults.failed ?? 0}</p>
                <p className="text-[10px] font-bold uppercase text-red-400 mt-0.5">Failed</p>
              </div>
            </div>

            {importResults.newAccounts?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                <p className="text-xs font-black text-amber-800">
                  New accounts created — save these temporary passwords
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {importResults.newAccounts.map((a) => (
                    <div key={a.email} className="flex items-center justify-between gap-3 rounded-lg bg-white border border-amber-100 px-3 py-2">
                      <span className="text-xs font-semibold text-gray-700 truncate">{a.email}</span>
                      <code className="text-xs font-black text-amber-700 shrink-0 bg-amber-100 px-2 py-0.5 rounded">
                        {a.temporary_password}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResults.errors?.length > 0 && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 space-y-1.5">
                <p className="text-xs font-black text-red-700">Errors</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResults.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">
                      <span className="font-bold">Row {e.row}:</span> {e.error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setImportResults(null)}
              className="w-full text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              ← Import another file
            </button>
          </div>
        ) : (
          /* ── Upload view ── */
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 space-y-1.5">
              <p className="text-xs font-bold text-blue-800">How to import</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Download the sample template below for the correct column headers</li>
                <li>Each row is matched by <span className="font-bold">Email</span> (required) or User ID</li>
                <li>Existing clients are updated; new emails create accounts with a temporary password</li>
                <li>Dates must be in <span className="font-bold">YYYY-MM-DD</span> format (e.g. 1990-05-15)</li>
                <li>Yes/No fields accept <span className="font-bold">Yes</span> or <span className="font-bold">No</span></li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleDownloadSample}
              disabled={downloadingSample}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {downloadingSample ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FiDownload size={14} />
              )}
              Download sample template (.xlsx)
            </button>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="hidden"
                id="import-file-input"
              />
              <label
                htmlFor="import-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FiUpload size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {importFile ? importFile.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    .xlsx or .xls — max 5MB
                  </p>
                </div>
              </label>
            </div>

            {importFile && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <FiCheck size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">File selected</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImportFile(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
