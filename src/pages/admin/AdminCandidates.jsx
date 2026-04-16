import { useState, useMemo, useEffect } from "react";
import {
  FiEye, FiEdit2, FiTrash2, FiSearch, FiPlus,
  FiDownload, FiChevronDown, FiChevronUp, FiFolder, FiUpload,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import BulkImportModal from "../../components/BulkImportModal";
import CandidateApplicationForm from "../../components/CandidateApplicationForm/CandidateApplicationForm";
import {
  APPLICATION_FIELD_LABELS,
  getInitialApplicationFormData,
  loadFieldVisibilityFromStorage,
  saveFieldVisibilityToStorage,
  loadCustomFieldDefinitionsFromStorage,
  saveCustomFieldDefinitionsToStorage,
  createCustomFieldDefinition,
  CUSTOM_FIELD_TYPE_OPTIONS,
} from "../../components/CandidateApplicationForm/initialFormState";
import {
  mapApplicationToCandidateRow,
  candidateRowToApplicationForm,
  pruneCustomResponsesToDefinitions,
} from "../../components/CandidateApplicationForm/applicationFormMapping";

// ─── Static Data ──────────────────────────────────────────────────────────────
const INITIAL_CANDIDATES = [
  {
    id: 1,
    firstName: "Priya",   lastName: "Sharma",  initials: "PS",
    dob: "1992-03-14",    dobDisplay: "14 Mar 1992",
    gender: "Female",     nationality: "Indian",    countryOfBirth: "India",
    email: "p.sharma@technovauk.com",            phone: "+44 7700 200111",
    passportNumber: "P4521893K",                 passportExpiry: "2030-06-01",
    niNumber: "AB 12 34 56 C",                   brpNumber: "BRP00112233",
    visaType: "Skilled Worker",   caseStatus: "On Track",
    visaExpiry: "2027-01-12",     rightToWork: "Verified",
    jobTitle: "Software Engineer", linkedBusiness: "TechNova Ltd", employmentStart: "2022-03-01",
    paymentStatus: "Paid",         feeAmount: "£2,500",
    address: "15 Maple Close",    city: "London",     postcode: "E1 6RF", country: "United Kingdom",
    avatarBg: "bg-blue-500",
  },
  {
    id: 2,
    firstName: "James",   lastName: "Okoye",   initials: "JO",
    dob: "1988-08-22",    dobDisplay: "22 Aug 1988",
    gender: "Male",       nationality: "Nigerian",  countryOfBirth: "Nigeria",
    email: "j.okoye@globalhire.co.uk",           phone: "+44 7700 200222",
    passportNumber: "B8834521X",                 passportExpiry: "2026-11-15",
    niNumber: "CD 23 45 67 E",                   brpNumber: "BRP00445566",
    visaType: "ILR",              caseStatus: "Due Soon",
    visaExpiry: "2026-06-02",     rightToWork: "Verified",
    jobTitle: "Operations Manager", linkedBusiness: "GlobalHire Inc", employmentStart: "2019-09-01",
    paymentStatus: "Partial",      feeAmount: "£3,200",
    address: "8 Cedar Lane",      city: "Birmingham", postcode: "B2 5TF", country: "United Kingdom",
    avatarBg: "bg-yellow-500",
  },
  {
    id: 3,
    firstName: "Li",      lastName: "Wei",      initials: "LW",
    dob: "1995-11-08",    dobDisplay: "08 Nov 1995",
    gender: "Male",       nationality: "Chinese",   countryOfBirth: "China",
    email: "l.wei@apexconsulting.co.uk",         phone: "+44 7700 200333",
    passportNumber: "E9901234Z",                 passportExpiry: "2025-04-20",
    niNumber: "EF 34 56 78 G",                   brpNumber: "BRP00778899",
    visaType: "Graduate Visa",    caseStatus: "Overdue",
    visaExpiry: "2026-02-14",     rightToWork: "Expired",
    jobTitle: "Data Analyst",     linkedBusiness: "Apex Consulting",  employmentStart: "2023-07-01",
    paymentStatus: "Outstanding", feeAmount: "£1,800",
    address: "22 Birch Way",      city: "Manchester", postcode: "M1 3KL", country: "United Kingdom",
    avatarBg: "bg-red-500",
  },
  {
    id: 4,
    firstName: "Amara",   lastName: "Diallo",   initials: "AD",
    dob: "1990-06-15",    dobDisplay: "15 Jun 1990",
    gender: "Female",     nationality: "Senegalese", countryOfBirth: "Senegal",
    email: "a.diallo@brightstudent.ac.uk",       phone: "+44 7700 200444",
    passportNumber: "F2214567H",                 passportExpiry: "2028-09-30",
    niNumber: "GH 45 67 89 I",                   brpNumber: "BRP00991122",
    visaType: "Student Visa",     caseStatus: "In Review",
    visaExpiry: "2027-09-30",     rightToWork: "Pending",
    jobTitle: "Postgraduate Student", linkedBusiness: "Independent", employmentStart: "",
    paymentStatus: "Paid",        feeAmount: "£1,200",
    address: "5 Oak Street",      city: "Leeds",      postcode: "LS1 2AB", country: "United Kingdom",
    avatarBg: "bg-purple-500",
  },
  {
    id: 5,
    firstName: "Sofia",   lastName: "Rossi",    initials: "SR",
    dob: "1994-02-28",    dobDisplay: "28 Feb 1994",
    gender: "Female",     nationality: "Italian",   countryOfBirth: "Italy",
    email: "s.rossi@technovauk.com",             phone: "+44 7700 200555",
    passportNumber: "G3378901J",                 passportExpiry: "2031-03-15",
    niNumber: "JK 56 78 90 L",                   brpNumber: "BRP00334455",
    visaType: "Skilled Worker",   caseStatus: "On Track",
    visaExpiry: "2028-03-15",     rightToWork: "Verified",
    jobTitle: "UX Designer",      linkedBusiness: "TechNova Ltd",  employmentStart: "2021-05-01",
    paymentStatus: "Paid",        feeAmount: "£2,800",
    address: "31 Elm Road",       city: "Bristol",    postcode: "BS1 4XY", country: "United Kingdom",
    avatarBg: "bg-green-500",
  },
];

const KPI_STATS = [
  { label: "Total Clients",      value: "1,284", bg: "bg-blue-50",   color: "text-blue-600"   },
  { label: "Active Cases",       value: 347,     bg: "bg-green-50",  color: "text-green-600"  },
  { label: "Visa Expiry Alerts", value: 18,      bg: "bg-red-50",    color: "text-red-500"    },
  { label: "Outstanding Fees",   value: "£61k",  bg: "bg-yellow-50", color: "text-yellow-600" },
];

const VISA_TYPE_OPTIONS = [
  { value: "Skilled Worker",   label: "Skilled Worker"                   },
  { value: "Student Visa",     label: "Student Visa"                     },
  { value: "ILR",              label: "ILR — Indefinite Leave to Remain" },
  { value: "Graduate Visa",    label: "Graduate Visa"                    },
  { value: "Sponsor Licence",  label: "Sponsor Licence"                  },
  { value: "Global Talent",    label: "Global Talent Visa"               },
  { value: "Family Visa",      label: "Family Visa"                      },
  { value: "Youth Mobility",   label: "Youth Mobility Scheme"            },
  { value: "Visitor Visa",     label: "Visitor Visa"                     },
  { value: "Other",            label: "Other"                            },
];

const CASE_STATUS_OPTIONS = [
  { value: "On Track",  label: "On Track"  },
  { value: "Due Soon",  label: "Due Soon"  },
  { value: "Overdue",   label: "Overdue"   },
  { value: "In Review", label: "In Review" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold",   label: "On Hold"   },
];

const PAYMENT_OPTIONS = [
  { value: "Paid",        label: "Paid in Full"    },
  { value: "Partial",     label: "Partial Payment" },
  { value: "Outstanding", label: "Outstanding"     },
  { value: "Waived",      label: "Waived"          },
];

// ─── Chip colour maps ─────────────────────────────────────────────────────────
const CASE_CHIPS = {
  "On Track":  "bg-green-100 text-green-700",
  "Due Soon":  "bg-yellow-100 text-yellow-700",
  "Overdue":   "bg-red-100 text-red-600",
  "In Review": "bg-blue-100 text-blue-700",
  "Completed": "bg-gray-100 text-gray-600",
  "On Hold":   "bg-orange-100 text-orange-600",
};

const PAYMENT_CHIPS = {
  "Paid":        "bg-green-100 text-green-700",
  "Partial":     "bg-yellow-100 text-yellow-700",
  "Outstanding": "bg-red-100 text-red-600",
  "Waived":      "bg-gray-100 text-gray-500",
};

const VISA_CHIPS = {
  "Skilled Worker":  "bg-blue-100 text-blue-700",
  "Student Visa":    "bg-purple-100 text-purple-700",
  "ILR":             "bg-indigo-100 text-indigo-700",
  "Graduate Visa":   "bg-yellow-100 text-yellow-700",
  "Sponsor Licence": "bg-teal-100 text-teal-700",
  "Global Talent":   "bg-cyan-100 text-cyan-700",
  "Family Visa":     "bg-pink-100 text-pink-700",
  "Youth Mobility":  "bg-lime-100 text-lime-700",
  "Visitor Visa":    "bg-orange-100 text-orange-700",
};

const AVATAR_COLORS = [
  "bg-blue-500","bg-yellow-500","bg-red-500","bg-purple-500",
  "bg-green-500","bg-pink-500","bg-teal-500","bg-orange-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const expiryColor = (date) => {
  if (!date) return "text-gray-400";
  const days = (new Date(date) - new Date()) / 86400000;
  if (days < 0)   return "text-red-500 font-bold";
  if (days < 90)  return "text-red-500";
  if (days < 180) return "text-yellow-600";
  return "text-green-600";
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminCandidates = () => {
  const [candidates, setCandidates]     = useState(INITIAL_CANDIDATES);
  const [search, setSearch]             = useState("");
  const [visaFilter, setVisaFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payFilter, setPayFilter]       = useState("All");
  const [modal, setModal]               = useState({ type: null, data: null });
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState(getInitialApplicationFormData);
  const [fieldVisibility, setFieldVisibility] = useState(loadFieldVisibilityFromStorage);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState(
    loadCustomFieldDefinitionsFromStorage
  );
  const [fieldPanelOpen, setFieldPanelOpen] = useState(false);
  const [detailTab, setDetailTab]       = useState("overview");

  useEffect(() => { saveFieldVisibilityToStorage(fieldVisibility); }, [fieldVisibility]);
  useEffect(() => { saveCustomFieldDefinitionsToStorage(customFieldDefinitions); }, [customFieldDefinitions]);

  const toggleFieldVisibility = (key) =>
    setFieldVisibility((prev) => ({ ...prev, [key]: prev[key] === false }));

  const addCustomFieldRow = () =>
    setCustomFieldDefinitions((prev) => [...prev, createCustomFieldDefinition()]);

  const updateCustomFieldRow = (id, patch) =>
    setCustomFieldDefinitions((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const removeCustomFieldRow = (id) =>
    setCustomFieldDefinitions((prev) => prev.filter((d) => d.id !== id));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates.filter((c) => {
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchSearch = !q || name.includes(q) || c.nationality.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchVisa   = visaFilter   === "All" || c.visaType     === visaFilter;
      const matchStatus = statusFilter === "All" || c.caseStatus   === statusFilter;
      const matchPay    = payFilter    === "All" || c.paymentStatus === payFilter;
      return matchSearch && matchVisa && matchStatus && matchPay;
    });
  }, [candidates, search, visaFilter, statusFilter, payFilter]);

  const openCreate = () => { setApplicationForm(getInitialApplicationFormData()); setModal({ type: "create", data: null }); };
  const openEdit   = (c) => { setApplicationForm(candidateRowToApplicationForm(c)); setModal({ type: "edit", data: c }); };
  const openView   = (c) => setModal({ type: "view",   data: c });
  const openDelete = (c) => setModal({ type: "delete", data: c });
  const closeModal = ()  => setModal({ type: null, data: null });

  const validateApplication = (payload) => {
    const errs = [];
    if (!payload.firstName?.toString().trim()) errs.push("First name is required");
    if (!payload.lastName?.toString().trim())  errs.push("Last name is required");
    if (!payload.email?.toString().trim())     errs.push("Email is required");
    else if (!/\S+@\S+\.\S+/.test(payload.email)) errs.push("Enter a valid email");
    return errs;
  };

  const handleApplicationSave = (payload) => {
    const errs = validateApplication(payload);
    if (errs.length) { alert(errs.join("\n")); return; }

    const rowExtras = modal.type === "edit" && modal.data
      ? {
          caseStatus:      modal.data.caseStatus,
          rightToWork:     modal.data.rightToWork,
          jobTitle:        modal.data.jobTitle,
          linkedBusiness:  modal.data.linkedBusiness,
          employmentStart: modal.data.employmentStart,
          paymentStatus:   modal.data.paymentStatus,
          feeAmount:       modal.data.feeAmount,
          city:            modal.data.city,
          postcode:        modal.data.postcode,
          country:         modal.data.country,
        }
      : {};

    const payloadClean = pruneCustomResponsesToDefinitions(payload, customFieldDefinitions);
    const mapped  = mapApplicationToCandidateRow(payloadClean, rowExtras);
    const initials = [mapped.firstName?.[0] || "?", mapped.lastName?.[0] || "?"].join("").toUpperCase();
    const avatarBg = AVATAR_COLORS[candidates.length % AVATAR_COLORS.length];

    if (modal.type === "create") {
      setCandidates((p) => [...p, { id: Date.now(), ...mapped, initials, avatarBg }]);
    } else if (modal.type === "edit" && modal.data) {
      setCandidates((p) =>
        p.map((c) => c.id !== modal.data.id ? c : { ...c, ...mapped, initials })
      );
    }
    closeModal();
  };

  const handleDelete = () => {
    setCandidates((p) => p.filter((c) => c.id !== modal.data.id));
    closeModal();
  };

  // ── Bulk import handler ────────────────────────────────────────────────────
  const handleBulkImport = (newCandidates) => {
    setCandidates((prev) => [...prev, ...newCandidates]);
  };

  const isFormModal = modal.type === "create" || modal.type === "edit";

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#004ca5] tracking-tight">Clients / Candidates</h1>
          <p className="text-sm text-gray-500 mt-0.5">All registered clients and their case details</p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          {/* Application form fields toggle */}
          <button
            type="button"
            onClick={() => setFieldPanelOpen((o) => !o)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Application form fields
            {fieldPanelOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Export */}
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <FiDownload size={14} />
              Export
            </button>

            {/* ── Upload Bulk Data ───────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => setBulkImportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#c8102e] rounded-xl transition-colors shadow-sm"
            >
              <FiUpload size={14} />
              import Data
            </button>

            {/* ── Add Client ─────────────────────────────────────────────── */}
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#c8102e] rounded-xl transition-colors shadow-sm"
            >
              <FiPlus size={14} />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* ── Field Visibility Panel ───────────────────────────────────────────── */}
      {fieldPanelOpen && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-6">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">
              Choose which built-in application inputs are visible to candidates (and in the admin stepper). Preferences are saved in this browser.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[min(50vh,28rem)] overflow-y-auto pr-1">
              {Object.entries(APPLICATION_FIELD_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-indigo-600 shrink-0"
                    checked={fieldVisibility[key] !== false}
                    onChange={() => toggleFieldVisibility(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-bold text-gray-800 mb-1">Custom fields</p>
            <p className="text-xs text-gray-500 mb-3">
              Add extra questions (short text, long text, date, or number). They appear under "Additional information" on the last step.
            </p>
            <div className="space-y-2">
              {customFieldDefinitions.map((def) => (
                <div
                  key={def.id}
                  className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-end rounded-xl border border-gray-100 bg-gray-50/80 p-3"
                >
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Question label</label>
                    <input
                      type="text"
                      value={def.label}
                      onChange={(e) => updateCustomFieldRow(def.id, { label: e.target.value })}
                      placeholder="e.g. Previous UK employer name"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Input type</label>
                    <select
                      value={def.type}
                      onChange={(e) => updateCustomFieldRow(def.id, { type: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      {CUSTOM_FIELD_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomFieldRow(def.id)}
                    className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCustomFieldRow}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-100"
            >
              <FiPlus size={16} />
              Add another field
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_STATS.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, nationality…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={visaFilter}   onChange={(e) => setVisaFilter(e.target.value)}   className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-600">
              <option value="All">All Visa Types</option>
              {VISA_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-600">
              <option value="All">All Case Status</option>
              {CASE_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={payFilter}    onChange={(e) => setPayFilter(e.target.value)}    className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-600">
              <option value="All">All Payment Status</option>
              {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name","DOB","Nationality","Linked Business","Visa Type","Case Status","Visa Expiry","Payment","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                    No clients match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${c.avatarBg}`}>
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{c.firstName} {c.lastName}</p>
                          <p className="text-[11px] text-gray-400 whitespace-nowrap">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap font-mono">{c.dobDisplay}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.nationality}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.linkedBusiness}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${VISA_CHIPS[c.visaType] ?? "bg-gray-100 text-gray-500"}`}>
                        {c.visaType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${CASE_CHIPS[c.caseStatus] ?? "bg-gray-100 text-gray-500"}`}>
                        {c.caseStatus}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-xs font-mono whitespace-nowrap ${expiryColor(c.visaExpiry)}`}>
                      {fmtDate(c.visaExpiry)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${PAYMENT_CHIPS[c.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                        {c.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(c)}   className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-blue-50   rounded-lg transition-colors" title="View">  <FiEye    size={14} /></button>
                        <button onClick={() => openEdit(c)}   className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-blue-50   rounded-lg transition-colors" title="Edit">  <FiEdit2  size={14} /></button>
                        <button onClick={() => openDelete(c)} className="p-2 text-gray-400 hover:text-red-500   hover:bg-red-50    rounded-lg transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-indigo-600">{filtered.length}</span> of{" "}
            <span className="font-bold text-indigo-600">{candidates.length}</span> clients
          </p>
        </div>
      </div>

      {/* ── Bulk Import Modal ────────────────────────────────────────────────── */}
      <BulkImportModal
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImport={handleBulkImport}
        existingCount={candidates.length}
      />

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
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
            fieldVisibility={fieldVisibility}
            customFieldDefinitions={customFieldDefinitions}
            formData={applicationForm}
            setFormData={setApplicationForm}
            onAdminSubmit={handleApplicationSave}
            onAdminCancel={closeModal}
          />
        )}
      </Modal>

      {/* ── View Modal ───────────────────────────────────────────────────────── */}
      <Modal
        open={modal.type === "view"}
        onClose={() => { closeModal(); setDetailTab("overview"); }}
        title={modal.data ? `Client — ${modal.data.firstName} ${modal.data.lastName}` : ""}
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        {modal.data && (() => {
          const c = modal.data;
          return (
            <>
              <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/80 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black text-gray-900">{c.firstName} {c.lastName}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${CASE_CHIPS[c.caseStatus] ?? "bg-gray-100 text-gray-500"}`}>{c.caseStatus}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${PAYMENT_CHIPS[c.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>{c.paymentStatus}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-50"
                >
                  Edit client
                </button>
              </div>

              <div className="shrink-0 flex gap-0 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 no-scrollbar">
                {[
                  { id: "overview",       label: "Overview"      },
                  { id: "documents",      label: "Documents"     },
                  { id: "immigration",    label: "Immigration"   },
                  { id: "employment",     label: "Employment"    },
                  { id: "address",        label: "Address"       },
                  { id: "timeline",       label: "Timeline"      },
                  { id: "communications", label: "Communication" },
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

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wide mb-3">Personal Information</h4>
                        <div className="space-y-3">
                          {[
                            ["Full Name",    `${c.firstName} ${c.lastName}`],
                            ["Date of Birth", c.dobDisplay],
                            ["Gender",        c.gender],
                            ["Nationality",   c.nationality],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                              <p className="text-sm font-bold text-gray-900">{val || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wide mb-3">Contact Information</h4>
                        <div className="space-y-3">
                          {[
                            ["Email",   c.email],
                            ["Phone",   c.phone],
                            ["Address", c.address || "Not provided"],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                              <p className="text-sm font-bold text-gray-900">{val || "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-100">
                      {[
                        ["Passport Number", c.passportNumber],
                        ["Passport Expiry", fmtDate(c.passportExpiry)],
                        ["NI Number",       c.niNumber || "Not provided"],
                        ["BRP Number",      c.brpNumber || "Not provided"],
                      ].map(([lbl, val]) => (
                        <div key={lbl}>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                          <p className="text-sm font-bold text-gray-900">{val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {[
                        ["Payment Status", c.paymentStatus],
                        ["Fee Amount",     c.feeAmount || "Not specified"],
                      ].map(([lbl, val]) => (
                        <div key={lbl}>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                          <p className="text-sm font-bold text-gray-900">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailTab === "documents" && (
                  <div className="text-center py-12">
                    <FiFolder size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No documents uploaded yet</p>
                  </div>
                )}

                {detailTab === "immigration" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      ["Visa Type",     c.visaType],
                      ["Visa Expiry",   fmtDate(c.visaExpiry)],
                      ["Case Status",   c.caseStatus],
                      ["Right to Work", c.rightToWork],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                        <p className="text-sm font-bold text-gray-900">{val || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === "employment" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      ["Job Title",       c.jobTitle || "Not specified"],
                      ["Linked Business", c.linkedBusiness],
                      ["Employment Start",fmtDate(c.employmentStart)],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                        <p className="text-sm font-bold text-gray-900">{val || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === "address" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Street Address</p>
                      <p className="text-sm font-bold text-gray-900">{c.address || "Not provided"}</p>
                    </div>
                    {[
                      ["City",     c.city],
                      ["Postcode", c.postcode],
                      ["Country",  c.country],
                    ].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">{lbl}</p>
                        <p className="text-sm font-bold text-gray-900">{val || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === "timeline" && (
                  <div className="text-center py-12">
                    <FiFolder size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No timeline events recorded yet</p>
                  </div>
                )}

                {detailTab === "communications" && (
                  <div className="text-center py-12">
                    <FiFolder size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No communications recorded yet</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Client"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost"  onClick={closeModal}   className="rounded-xl">Cancel</Button>
            <Button variant="danger" onClick={handleDelete} className="rounded-xl">Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-black text-indigo-600">{modal.data?.firstName} {modal.data?.lastName}</span>?
            All linked case data will be permanently removed.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminCandidates;
