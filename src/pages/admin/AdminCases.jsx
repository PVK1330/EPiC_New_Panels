import { useState } from "react";
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
} from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";

const stats = [
  {
    label: "Total Cases",
    value: 156,
    bg: "bg-blue-100",
    color: "text-blue-600",
    Icon: FileText,
  },
  {
    label: "Pending",
    value: 23,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
    Icon: Clock,
  },
  {
    label: "Approved",
    value: 89,
    bg: "bg-green-100",
    color: "text-green-600",
    Icon: CheckCircle,
  },
  {
    label: "Rejected",
    value: 8,
    bg: "bg-red-100",
    color: "text-red-600",
    Icon: XCircle,
  },
];

const initialCases = [
  {
    caseId: "#CAS-001",
    candidate: "John Smith",
    business: "Tech Solutions Ltd",
    visaType: "H-1B",
    status: "Approved",
    submitted: "2024-01-15",
    priority: "high",
    caseworker: "Emily Davis",
    totalAmount: 5000,
    paidAmount: 5000,
    notes: "All documents submitted.",
    candidateId: "C-1001",
    businessId: "B-2001",
    caseworkerId: "CW-301",
    targetSubmissionDate: "2024-02-01",
    nationality: "American",
    jobTitle: "Software Engineer",
    department: "Engineering",
    salaryOffered: 120000,
    petitionType: "New",
    lcaNumber: "I-200-24001",
    receiptNumber: "EAC2401234567",
  },
  {
    caseId: "#CAS-002",
    candidate: "Sarah Johnson",
    business: "Global Tech Inc",
    visaType: "L-1A",
    status: "Pending",
    submitted: "2024-01-18",
    priority: "medium",
    caseworker: "Mark Lee",
    totalAmount: 4500,
    paidAmount: 2000,
    notes: "Awaiting additional docs.",
    candidateId: "C-1002",
    businessId: "B-2002",
    caseworkerId: "CW-302",
    targetSubmissionDate: "2024-02-15",
    nationality: "Canadian",
    jobTitle: "Product Manager",
    department: "Product",
    salaryOffered: 135000,
    petitionType: "Extension",
    lcaNumber: "I-200-24002",
    receiptNumber: "",
  },
];

const visaTypes = [
  "H-1B",
  "L-1A",
  "L-1B",
  "O-1",
  "E-2",
  "TN",
  "H-2B",
  "B-1/B-2",
  "F-1",
  "J-1",
];
const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
const petitionTypes = [
  "New",
  "Extension",
  "Amendment",
  "Transfer",
  "Consular Processing",
];

const statusBadge = {
  Approved: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Review: "bg-blue-100 text-blue-800",
};

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
  "Visa Type",
  "Priority",
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
  visaType: "",
  petitionType: "",
  priority: "medium",
  targetSubmissionDate: "",
  lcaNumber: "",
  receiptNumber: "",
  assignedCaseworkerName: "",
  assignedCaseworkerId: "",
  salaryOffered: 0,
  totalAmount: 0,
  paidAmount: 0,
  notes: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ViewModal({ case: c, onClose }) {
  if (!c) return null;
  const rows = [
    ["Case ID", c.caseId],
    ["Status", c.status],
    ["Visa Type", c.visaType],
    ["Petition Type", c.petitionType],
    ["Priority", c.priority],
    ["Submitted", c.submitted],
    ["Target Submission", c.targetSubmissionDate],
    ["LCA Number", c.lcaNumber],
    ["Receipt Number", c.receiptNumber || "—"],
    ["Candidate", c.candidate],
    ["Candidate ID", c.candidateId],
    ["Nationality", c.nationality],
    ["Job Title", c.jobTitle],
    ["Department", c.department],
    ["Business", c.business],
    ["Business ID", c.businessId],
    ["Caseworker", c.caseworker],
    ["Caseworker ID", c.caseworkerId],
    ["Salary Offered", `$${c.salaryOffered?.toLocaleString()}`],
    ["Total Amount", `$${c.totalAmount?.toLocaleString()}`],
    ["Paid Amount", `$${c.paidAmount?.toLocaleString()}`],
    [
      "Balance",
      `$${((c.totalAmount || 0) - (c.paidAmount || 0)).toLocaleString()}`,
    ],
    ["Notes", c.notes],
  ];
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-secondary">Case Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {c.caseId} — {c.candidate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4">
          {rows.map(([label, val]) => (
            <div key={label} className={label === "Notes" ? "col-span-2" : ""}>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                {label}
              </p>
              <p className="text-sm text-gray-800 font-medium">{val || "—"}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CaseFormModal({
  title,
  subtitle,
  formData,
  errors,
  isLoading,
  onChange,
  onSubmit,
  onClose,
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
                <Input
                  label="Candidate Name"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={onChange}
                  error={errors.candidateName}
                  placeholder="Full name"
                  required
                />
                <Input
                  label="Candidate ID"
                  name="candidateId"
                  value={formData.candidateId}
                  onChange={onChange}
                  placeholder="Optional"
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
                <Input
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={onChange}
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary mb-4">
                Business Information
              </h4>
              <div className="space-y-4">
                <Input
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={onChange}
                  error={errors.businessName}
                  placeholder="Sponsoring business"
                  required
                />
                <Input
                  label="Business ID"
                  name="businessId"
                  value={formData.businessId}
                  onChange={onChange}
                  placeholder="Optional"
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
                  name="visaType"
                  value={formData.visaType}
                  onChange={onChange}
                  className={`border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${errors.visaType ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select visa type</option>
                  {visaTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.visaType && (
                  <span className="text-xs text-red-500">
                    {errors.visaType}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Petition Type
                </label>
                <select
                  name="petitionType"
                  value={formData.petitionType}
                  onChange={onChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="">Select type</option>
                  {petitionTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
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
              <Input
                label="Assigned Caseworker Name"
                name="assignedCaseworkerName"
                value={formData.assignedCaseworkerName}
                onChange={onChange}
                error={errors.assignedCaseworkerName}
                placeholder="Caseworker name"
                required
              />
              <Input
                label="Caseworker ID"
                name="assignedCaseworkerId"
                value={formData.assignedCaseworkerId}
                onChange={onChange}
                placeholder="Optional"
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
  const [cases, setCases] = useState(initialCases);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.candidateName.trim()) e.candidateName = "Required";
    if (!formData.businessName.trim()) e.businessName = "Required";
    if (!formData.visaType) e.visaType = "Required";
    if (!formData.assignedCaseworkerName.trim())
      e.assignedCaseworkerName = "Required";
    if (!formData.targetSubmissionDate) e.targetSubmissionDate = "Required";
    if (formData.totalAmount <= 0) e.totalAmount = "Must be > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const newCase = {
      caseId: `#CAS-${String(cases.length + 1).padStart(3, "0")}`,
      candidate: formData.candidateName,
      candidateId: formData.candidateId,
      business: formData.businessName,
      businessId: formData.businessId,
      visaType: formData.visaType,
      petitionType: formData.petitionType,
      status: "Pending",
      submitted: new Date().toISOString().slice(0, 10),
      priority: formData.priority,
      caseworker: formData.assignedCaseworkerName,
      caseworkerId: formData.assignedCaseworkerId,
      targetSubmissionDate: formData.targetSubmissionDate,
      lcaNumber: formData.lcaNumber,
      receiptNumber: formData.receiptNumber,
      nationality: formData.nationality,
      jobTitle: formData.jobTitle,
      department: formData.department,
      salaryOffered: formData.salaryOffered,
      totalAmount: formData.totalAmount,
      paidAmount: formData.paidAmount,
      notes: formData.notes,
    };
    setCases((prev) => [newCase, ...prev]);
    setIsLoading(false);
    setAddOpen(false);
    setFormData(emptyForm);
    setErrors({});
  };

  const openEdit = (c) => {
    setSelectedCase(c);
    setFormData({
      candidateName: c.candidate,
      candidateId: c.candidateId || "",
      nationality: c.nationality || "",
      jobTitle: c.jobTitle || "",
      department: c.department || "",
      businessName: c.business,
      businessId: c.businessId || "",
      visaType: c.visaType,
      petitionType: c.petitionType || "",
      priority: c.priority,
      targetSubmissionDate: c.targetSubmissionDate || "",
      lcaNumber: c.lcaNumber || "",
      receiptNumber: c.receiptNumber || "",
      assignedCaseworkerName: c.caseworker,
      assignedCaseworkerId: c.caseworkerId || "",
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
    await new Promise((r) => setTimeout(r, 800));
    setCases((prev) =>
      prev.map((c) =>
        c.caseId === selectedCase.caseId
          ? {
              ...c,
              candidate: formData.candidateName,
              candidateId: formData.candidateId,
              business: formData.businessName,
              businessId: formData.businessId,
              visaType: formData.visaType,
              petitionType: formData.petitionType,
              priority: formData.priority,
              targetSubmissionDate: formData.targetSubmissionDate,
              lcaNumber: formData.lcaNumber,
              receiptNumber: formData.receiptNumber,
              nationality: formData.nationality,
              jobTitle: formData.jobTitle,
              department: formData.department,
              caseworker: formData.assignedCaseworkerName,
              caseworkerId: formData.assignedCaseworkerId,
              salaryOffered: formData.salaryOffered,
              totalAmount: formData.totalAmount,
              paidAmount: formData.paidAmount,
              notes: formData.notes,
            }
          : c,
      ),
    );
    setIsLoading(false);
    setEditOpen(false);
    setFormData(emptyForm);
    setSelectedCase(null);
  };

  const handleDelete = (caseId) => {
    setCases((prev) => prev.filter((c) => c.caseId !== caseId));
    setDeleteId(null);
  };

  const openView = (c) => {
    setSelectedCase(c);
    setViewOpen(true);
  };

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
          <Button variant="ghost" onClick={() => alert("Export triggered")}>
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
              {cases.map((c, i) => (
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
                        onClick={() => openView(c)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
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
        {viewOpen && (
          <ViewModal
            case={selectedCase}
            onClose={() => {
              setViewOpen(false);
              setSelectedCase(null);
            }}
          />
        )}
      </AnimatePresence>

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
            onClose={() => {
              setAddOpen(false);
              setFormData(emptyForm);
              setErrors({});
            }}
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
            onClose={() => {
              setEditOpen(false);
              setFormData(emptyForm);
              setErrors({});
              setSelectedCase(null);
            }}
          />
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
