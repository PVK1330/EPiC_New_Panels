import { useState, useMemo, useRef } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiBarChart2, FiEye, FiUserPlus, FiUpload, FiDownload, FiAlertCircle, FiCheckCircle, FiX, FiFile } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";

// Multi-select component for caseworkers
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
    <div className="relative space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Assign To <span className="text-red-500">*</span>
        <span className="text-gray-400 font-normal ml-1">(1–2 workers)</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-left text-sm bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400" : ""
        }`}
      >
        <span className={value.length ? "text-gray-900 font-semibold" : "text-gray-400"}>
          {value.length ? summaryText : "Choose caseworkers…"}
        </span>
        <span className="text-xs font-bold text-gray-400 tabular-nums shrink-0">{value.length}/2</span>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[200] cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-[210] left-0 right-0 mt-1 border border-gray-200 rounded-xl bg-white shadow-xl py-1 max-h-60 overflow-y-auto">
            {options.map((o) => {
              const checked = value.includes(o.id);
              const disabled = !checked && value.length >= 2;
              return (
                <label
                  key={o.id}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm border-b border-gray-50 last:border-0 ${
                    disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-blue-600 rounded border-gray-300"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleId(o.id)}
                  />
                  <span className="font-semibold text-gray-800">{o.name}</span>
                  <span className="text-xs font-mono text-gray-500 ml-auto">{o.id}</span>
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

const MOCK_CASES = [
  { id: "CAS-001", caseId: "#CAS-001", candidate: "John Smith", business: "Tech Solutions Ltd", visaType: "H-1B", status: "In Progress", priority: "High", submitted: "2024-01-15", deadline: "2024-02-15" },
  { id: "CAS-002", caseId: "#CAS-002", candidate: "Sarah Johnson", business: "Global Tech Inc", visaType: "L-1A", status: "Pending Review", priority: "Medium", submitted: "2024-01-18", deadline: "2024-02-20" },
  { id: "CAS-003", caseId: "#CAS-003", candidate: "Li Wei", business: "Innovation Labs", visaType: "O-1", status: "Approved", priority: "Low", submitted: "2024-01-10", deadline: "2024-02-10" },
  { id: "CAS-004", caseId: "#CAS-004", candidate: "Amara Diallo", business: "StartUp Co", visaType: "E-2", status: "Document Request", priority: "High", submitted: "2024-01-20", deadline: "2024-02-25" },
  { id: "CAS-005", caseId: "#CAS-005", candidate: "Sofia Rossi", business: "Enterprise Corp", visaType: "TN", status: "Submitted", priority: "Medium", submitted: "2024-01-22", deadline: "2024-03-01" },
];

const INITIAL_CASEWORKERS = [
  { id: 1, name: "Alice Patel", initials: "AP", email: "a.patel@visaflow.co.uk", phone: "+44 7700 100111", department: "H-1B Processing", role: "Senior Caseworker", activeCases: 21, overdue: 2, completed: 84, performance: 91, status: "Active", avatarBg: "bg-blue-500", assignedCases: [MOCK_CASES[0], MOCK_CASES[1], MOCK_CASES[2]] },
  { id: 2, name: "Marcus Green", initials: "MG", email: "m.green@visaflow.co.uk", phone: "+44 7700 100222", department: "L-1 Processing", role: "Caseworker", activeCases: 16, overdue: 5, completed: 61, performance: 74, status: "Active", avatarBg: "bg-green-500", assignedCases: [MOCK_CASES[1], MOCK_CASES[3]] },
  { id: 3, name: "James Osei", initials: "JO", email: "j.osei@visaflow.co.uk", phone: "+44 7700 100333", department: "General Processing", role: "Senior Caseworker", activeCases: 23, overdue: 8, completed: 42, performance: 58, status: "High Load", avatarBg: "bg-purple-500", assignedCases: [MOCK_CASES[2], MOCK_CASES[4], MOCK_CASES[0]] },
  { id: 4, name: "Fatima Khan", initials: "FK", email: "f.khan@visaflow.co.uk", phone: "+44 7700 100444", department: "Compliance", role: "Caseworker", activeCases: 18, overdue: 3, completed: 72, performance: 79, status: "Active", avatarBg: "bg-yellow-500", assignedCases: [MOCK_CASES[3], MOCK_CASES[1]] },
  { id: 5, name: "Rina Mehta", initials: "RM", email: "r.mehta@visaflow.co.uk", phone: "+44 7700 100555", department: "Quality Assurance", role: "Junior Caseworker", activeCases: 13, overdue: 1, completed: 95, performance: 88, status: "Active", avatarBg: "bg-pink-500", assignedCases: [MOCK_CASES[4]] },
  { id: 6, name: "David Osei", initials: "DO", email: "d.osei@visaflow.co.uk", phone: "+44 7700 100666", department: "Client Relations", role: "Manager", activeCases: 9, overdue: 0, completed: 110, performance: 96, status: "On Leave", avatarBg: "bg-teal-500", assignedCases: [MOCK_CASES[0]] },
];

const KPI_STATS = [
  { label: "Total Caseworkers", value: 24, bg: "bg-blue-50", color: "text-blue-600" },
  { label: "Active", value: 21, bg: "bg-green-50", color: "text-green-600" },
  { label: "High Load", value: 2, bg: "bg-red-50", color: "text-red-500" },
  { label: "On Leave", value: 3, bg: "bg-yellow-50", color: "text-yellow-600" },
];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-yellow-500", "bg-pink-500", "bg-teal-500", "bg-red-500",
];

const ROLE_OPTIONS = [
  { value: "Senior Caseworker", label: "Senior Caseworker" },
  { value: "Caseworker", label: "Caseworker" },
  { value: "Junior Caseworker", label: "Junior Caseworker" },
  { value: "Manager", label: "Manager" },
];

const DEPARTMENT_OPTIONS = [
  { value: "H-1B Processing", label: "H-1B Processing" },
  { value: "L-1 Processing", label: "L-1 Processing" },
  { value: "General Processing", label: "General Processing" },
  { value: "Compliance", label: "Compliance" },
  { value: "Quality Assurance", label: "Quality Assurance" },
  { value: "Client Relations", label: "Client Relations" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "High Load", label: "High Load" },
  { value: "On Leave", label: "On Leave" },
  { value: "Inactive", label: "Inactive" },
];

const STATUS_CHIPS = {
  Active: "bg-green-100 text-green-700",
  "High Load": "bg-yellow-100 text-yellow-700",
  "On Leave": "bg-blue-100 text-blue-600",
  Inactive: "bg-gray-100 text-gray-500",
};

const CASE_STATUS_CHIPS = {
  "In Progress": "bg-blue-100 text-blue-800",
  "Pending Review": "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  "Document Request": "bg-orange-100 text-orange-800",
  Submitted: "bg-purple-100 text-purple-800",
};

const PRIORITY_CHIPS = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const EMPTY_FORM = {
  name: "", email: "", phone: "",
  role: "Caseworker", department: "General Processing",
  status: "Active", password: "", confirmPassword: "",
};

const perfColor = (p) => {
  if (p >= 85) return { bar: "bg-green-500", text: "text-green-600" };
  if (p >= 70) return { bar: "bg-yellow-500", text: "text-yellow-600" };
  return { bar: "bg-red-500", text: "text-red-500" };
};

// ─── CSV HELPERS ──────────────────────────────────────────────────────────────

const CSV_TEMPLATE_HEADERS = [
  "name", "email", "phone", "role", "department",
  "status", "activeCases", "overdue", "completed", "performance",
];

const CSV_TEMPLATE_SAMPLE = [
  ["Emma Wilson", "e.wilson@visaflow.co.uk", "+44 7700 200111", "Caseworker", "H-1B Processing", "Active", "12", "1", "45", "82"],
  ["Raj Sharma", "r.sharma@visaflow.co.uk", "+44 7700 200222", "Senior Caseworker", "Compliance", "Active", "18", "3", "67", "76"],
];

function downloadCSVTemplate() {
  const rows = [CSV_TEMPLATE_HEADERS, ...CSV_TEMPLATE_SAMPLE];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "caseworkers_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ["CSV file must have a header row and at least one data row."] };

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const required = ["name", "email", "phone", "role", "department", "status"];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length) return { rows: [], errors: [`Missing required columns: ${missing.join(", ")}`] };

  const rows = [];
  const errors = [];

  lines.slice(1).forEach((line, idx) => {
    if (!line.trim()) return;
    const vals = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });

    const rowErrors = [];
    if (!obj.name) rowErrors.push("name is required");
    if (!obj.email || !/\S+@\S+\.\S+/.test(obj.email)) rowErrors.push("valid email is required");
    if (!obj.phone) rowErrors.push("phone is required");

    const validRoles = ["Senior Caseworker", "Caseworker", "Junior Caseworker", "Manager"];
    if (!validRoles.includes(obj.role)) obj.role = "Caseworker";

    const validDepts = ["H-1B Processing", "L-1 Processing", "General Processing", "Compliance", "Quality Assurance", "Client Relations"];
    if (!validDepts.includes(obj.department)) obj.department = "General Processing";

    const validStatuses = ["Active", "High Load", "On Leave", "Inactive"];
    if (!validStatuses.includes(obj.status)) obj.status = "Active";

    if (rowErrors.length) {
      errors.push(`Row ${idx + 2}: ${rowErrors.join(", ")}`);
      return;
    }

    rows.push({
      id: Date.now() + idx + Math.random(),
      name: obj.name,
      initials: obj.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
      email: obj.email,
      phone: obj.phone,
      role: obj.role,
      department: obj.department,
      status: obj.status,
      activeCases: parseInt(obj.activecases ?? obj.activeCases ?? "0") || 0,
      overdue: parseInt(obj.overdue ?? "0") || 0,
      completed: parseInt(obj.completed ?? "0") || 0,
      performance: Math.min(100, parseInt(obj.performance ?? "0") || 0),
      avatarBg: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      assignedCases: [],
    });
  });

  return { rows, errors };
}

// ─── BULK IMPORT MODAL ────────────────────────────────────────────────────────

function BulkImportModal({ open, onClose, onImport, existingCount }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // { rows, errors }
  const [step, setStep] = useState("upload"); // "upload" | "preview" | "success"
  const [importedCount, setImportedCount] = useState(0);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStep("upload");
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => { reset(); onClose(); };

  const processFile = (f) => {
    if (!f || !f.name.endsWith(".csv")) {
      setPreview({ rows: [], errors: ["Please upload a valid .csv file."] });
      setFile(null);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      setPreview(result);
      setStep("preview");
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    processFile(f);
  };

  const handleFileInput = (e) => {
    processFile(e.target.files[0]);
  };

  const handleConfirmImport = () => {
    if (!preview?.rows?.length) return;
    onImport(preview.rows);
    setImportedCount(preview.rows.length);
    setStep("success");
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        step === "success"
          ? "Import Successful"
          : step === "preview"
          ? "Preview Import Data"
          : "Import Caseworkers"
      }
      maxWidthClass="max-w-2xl"
      bodyClassName="px-5 py-5 sm:px-6"
      footer={
        step === "upload" ? (
          <Button variant="ghost" onClick={handleClose} className="rounded-xl">
            Cancel
          </Button>
        ) : step === "preview" ? (
          <>
            <Button variant="ghost" onClick={reset} className="rounded-xl">
              ← Back
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmImport}
              disabled={!preview?.rows?.length}
              className="rounded-xl"
            >
              Import {preview?.rows?.length || 0} Record{preview?.rows?.length !== 1 ? "s" : ""}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleClose} className="rounded-xl">
            Done
          </Button>
        )
      }
    >
      <AnimatePresence mode="wait">
        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
              <p className="text-sm font-bold text-blue-700">CSV Format Requirements</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Upload a <span className="font-semibold">.csv</span> file with the following columns:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {CSV_TEMPLATE_HEADERS.map((h) => (
                  <span
                    key={h}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ["name", "email", "phone", "role", "department", "status"].includes(h)
                        ? "bg-blue-200 text-blue-800"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {h}
                    {["name", "email", "phone", "role", "department", "status"].includes(h) && (
                      <span className="ml-0.5 text-red-500">*</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-blue-500">
                <span className="font-bold text-red-500">*</span> Required fields
              </p>
            </div>

            {/* Download Template */}
            <button
              onClick={downloadCSVTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <FiDownload size={14} />
              Download CSV Template
            </button>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
                dragOver
                  ? "border-blue-400 bg-blue-50 scale-[1.01]"
                  : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-white border border-gray-200"}`}>
                <FiUpload size={20} className={dragOver ? "text-blue-500" : "text-gray-400"} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">
                  {dragOver ? "Drop your file here" : "Drag & drop your CSV file"}
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse — .csv files only</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Preview ── */}
        {step === "preview" && preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* File info bar */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FiFile size={14} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{file?.name}</p>
                <p className="text-xs text-gray-500">
                  {preview.rows.length} valid record{preview.rows.length !== 1 ? "s" : ""} found
                  {preview.errors.length > 0 && ` · ${preview.errors.length} issue${preview.errors.length !== 1 ? "s" : ""} detected`}
                </p>
              </div>
              <button
                onClick={reset}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Validation errors */}
            {preview.errors.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl space-y-1.5 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-2 mb-1">
                  <FiAlertCircle size={13} className="text-yellow-600 shrink-0" />
                  <p className="text-xs font-bold text-yellow-700">
                    {preview.errors.length} row{preview.errors.length !== 1 ? "s" : ""} skipped
                  </p>
                </div>
                {preview.errors.map((err, i) => (
                  <p key={i} className="text-[11px] text-yellow-700 pl-5">• {err}</p>
                ))}
              </div>
            )}

            {/* No valid rows */}
            {preview.rows.length === 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <FiAlertCircle size={20} className="text-red-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-red-700">No valid records found</p>
                <p className="text-xs text-red-500 mt-1">Please fix the errors above and re-upload your file.</p>
              </div>
            )}

            {/* Preview table */}
            {preview.rows.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-100 text-left">
                      {["#", "Name", "Email", "Phone", "Role", "Department", "Status", "Performance"].map((h) => (
                        <th key={h} className="px-3 py-2 font-black text-gray-500 uppercase tracking-wider whitespace-nowrap text-[10px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {preview.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-3 py-2 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0 ${row.avatarBg}`}>
                              {row.initials}
                            </div>
                            <span className="font-semibold text-gray-800 whitespace-nowrap">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{row.email}</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{row.phone}</td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.role}</td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.department}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CHIPS[row.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {row.performance > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${perfColor(row.performance).bar}`}
                                  style={{ width: `${row.performance}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-bold ${perfColor(row.performance).text}`}>
                                {row.performance}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {preview.rows.length > 0 && (
              <p className="text-xs text-gray-500 text-center">
                Ready to add{" "}
                <span className="font-bold text-secondary">{preview.rows.length}</span> caseworker
                {preview.rows.length !== 1 ? "s" : ""} to the system.
              </p>
            )}
          </motion.div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="py-8 flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <FiCheckCircle size={32} className="text-green-500" />
            </div>
            <div>
              <p className="text-lg font-black text-secondary">Import Complete!</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-bold text-green-600">{importedCount}</span> caseworker
                {importedCount !== 1 ? "s" : ""} have been added to the system.
              </p>
            </div>
            <div className="px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
              Total caseworkers: <span className="font-black text-secondary">{existingCount + importedCount}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const AdminCaseworkers = () => {
  const [caseworkers, setCaseworkers] = useState(INITIAL_CASEWORKERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [modal, setModal] = useState({ type: null, data: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [reassignModal, setReassignModal] = useState({ open: false, case: null, currentCaseworker: null, targetCaseworkers: [] });
  const [reassignError, setReassignError] = useState("");
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return caseworkers.filter((c) => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchDept = deptFilter === "All" || c.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [caseworkers, search, statusFilter, deptFilter]);

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ type: "create", data: null }); };
  const openEdit = (cw) => {
    setForm({ name: cw.name, email: cw.email, phone: cw.phone, role: cw.role, department: cw.department, status: cw.status, password: "", confirmPassword: "" });
    setErrors({});
    setModal({ type: "edit", data: cw });
  };
  const openView = (cw) => setModal({ type: "view", data: cw });
  const openDelete = (cw) => setModal({ type: "delete", data: cw });
  const closeModal = () => { setModal({ type: null, data: null }); setErrors({}); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (isEdit) => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!isEdit) {
      if (!form.password) errs.password = "Password is required";
      if (!form.confirmPassword) errs.confirmPassword = "Please confirm password";
      else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    } else if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleCreate = () => {
    const errs = validate(false);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const initials = form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const avatarBg = AVATAR_COLORS[caseworkers.length % AVATAR_COLORS.length];
    setCaseworkers((p) => [...p, { id: Date.now(), name: form.name, initials, email: form.email, phone: form.phone, role: form.role, department: form.department, status: form.status, activeCases: 0, overdue: 0, completed: 0, performance: 0, avatarBg, assignedCases: [] }]);
    closeModal();
  };

  const handleUpdate = () => {
    const errs = validate(true);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCaseworkers((p) =>
      p.map((c) =>
        c.id !== modal.data.id ? c : {
          ...c, name: form.name,
          initials: form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
          email: form.email, phone: form.phone, role: form.role, department: form.department, status: form.status,
        }
      )
    );
    closeModal();
  };

  const handleDelete = () => {
    setCaseworkers((p) => p.filter((c) => c.id !== modal.data.id));
    closeModal();
  };

  const handleBulkImport = (newRows) => {
    setCaseworkers((prev) => [...prev, ...newRows]);
  };

  const openReassignModal = (caseItem, currentCaseworker) => {
    setReassignModal({ open: true, case: caseItem, currentCaseworker, targetCaseworkers: [] });
  };

  const closeReassignModal = () => {
    setReassignModal({ open: false, case: null, currentCaseworker: null, targetCaseworkers: [] });
    setReassignError("");
  };

  const handleReassign = () => {
    if (!reassignModal.targetCaseworkers || reassignModal.targetCaseworkers.length === 0) {
      setReassignError("Please select at least one caseworker.");
      return;
    }
    const currentCaseworker = caseworkers.find((cw) => cw.id === reassignModal.currentCaseworker.id);
    if (currentCaseworker && currentCaseworker.assignedCases.length <= 2) {
      setReassignError("Cannot reassign: Caseworker must have at least 2 cases assigned.");
      return;
    }
    setCaseworkers((prev) =>
      prev.map((cw) => {
        if (cw.id === reassignModal.currentCaseworker.id) {
          return { ...cw, assignedCases: cw.assignedCases.filter((c) => c.id !== reassignModal.case.id), activeCases: Math.max(0, cw.activeCases - 1) };
        }
        if (reassignModal.targetCaseworkers.includes(cw.id)) {
          return { ...cw, assignedCases: [...cw.assignedCases, reassignModal.case], activeCases: cw.activeCases + 1 };
        }
        return cw;
      })
    );
    closeReassignModal();
  };

  const isFormModal = modal.type === "create" || modal.type === "edit";

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Case Workers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Team performance and case assignment overview</p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <FiBarChart2 size={14} />
            Performance Report
          </button>

          {/* ── Import CSV Button ── */}
          <Button
            onClick={() => setBulkImportOpen(true)}
            className="rounded-xl shadow-sm"
          >
            <FiUpload size={14} />
            Import Data
          </Button>

          {/* ── Add Caseworker Button ── */}
          <Button onClick={openCreate} className="rounded-xl shadow-sm">
            <FiPlus size={14} />
            Add Caseworker
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_STATS.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-sm font-black text-secondary">All Caseworkers</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search caseworkers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-gray-50 w-48 placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="High Load">High Load</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Departments</option>
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name", "Email", "Active Cases", "Overdue", "Completed", "Performance", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    No caseworkers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((cw) => {
                  const { bar, text } = perfColor(cw.performance);
                  return (
                    <tr key={cw.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${cw.avatarBg}`}>
                            {cw.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{cw.name}</p>
                            <p className="text-[11px] text-gray-400 whitespace-nowrap">{cw.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{cw.email}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${cw.activeCases >= 20 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
                          {cw.activeCases}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${cw.overdue >= 6 ? "bg-red-100 text-red-600" : cw.overdue >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {cw.overdue}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 whitespace-nowrap">{cw.completed}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${cw.performance}%` }} />
                          </div>
                          <span className={`text-xs font-black ${text}`}>{cw.performance}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${STATUS_CHIPS[cw.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {cw.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openView(cw)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                            <FiEye size={14} />
                          </button>
                          <button onClick={() => openEdit(cw)} className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => openDelete(cw)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-secondary">{filtered.length}</span> of{" "}
            <span className="font-bold text-secondary">{caseworkers.length}</span> caseworkers
          </p>
        </div>
      </div>

      {/* ── Bulk Import Modal ──────────────────────────────────────────────────── */}
      <BulkImportModal
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImport={handleBulkImport}
        existingCount={caseworkers.length}
      />

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={modal.type === "create" ? "Add Caseworker" : "Edit Caseworker"}
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
            <Button variant="primary" onClick={modal.type === "create" ? handleCreate : handleUpdate} className="rounded-xl">
              {modal.type === "create" ? "Create Caseworker" : "Update Caseworker"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Alice Patel" required error={errors.name} />
          <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="alice@visaflow.co.uk" required error={errors.email} />
          <Input label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+44 7700 000000" required error={errors.phone} />
          <Input label="Role" name="role" value={form.role} onChange={handleChange} options={ROLE_OPTIONS} required />
          <Input label="Department" name="department" value={form.department} onChange={handleChange} options={DEPARTMENT_OPTIONS} required />
          <Input label="Status" name="status" value={form.status} onChange={handleChange} options={STATUS_OPTIONS} required />
          <Input label={modal.type === "edit" ? "New Password (optional)" : "Password"} name="password" type="password" value={form.password} onChange={handleChange} placeholder={modal.type === "edit" ? "Leave blank to keep current" : "••••••••"} required={modal.type === "create"} error={errors.password} />
          <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required={modal.type === "create"} error={errors.confirmPassword} />
        </div>
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Caseworker"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
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
            <span className="font-black text-secondary">{modal.data?.name}</span>? All assigned cases will need to be reassigned.
          </p>
        </div>
      </Modal>

      {/* ── View Caseworker Details Modal ────────────────────────────────────── */}
      <Modal
        open={modal.type === "view"}
        onClose={closeModal}
        title="Caseworker Details"
        maxWidthClass="max-w-4xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <Button variant="ghost" onClick={closeModal} className="rounded-xl">Close</Button>
        }
      >
        {modal.data && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${modal.data.avatarBg}`}>
                {modal.data.initials}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-secondary">{modal.data.name}</h3>
                <p className="text-sm text-gray-600">{modal.data.role} · {modal.data.department}</p>
                <p className="text-xs text-gray-500 mt-1">{modal.data.email} · {modal.data.phone}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${STATUS_CHIPS[modal.data.status]}`}>
                  {modal.data.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-black text-blue-600">{modal.data.activeCases}</p>
                <p className="text-xs text-gray-600">Active Cases</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-black text-red-600">{modal.data.overdue}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-black text-green-600">{modal.data.completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-black text-purple-600">{modal.data.performance}%</p>
                <p className="text-xs text-gray-600">Performance</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary uppercase tracking-wide mb-3">Assigned Cases</h4>
              {modal.data.assignedCases && modal.data.assignedCases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Case ID", "Candidate", "Business", "Visa Type", "Status", "Priority", "Deadline", "Actions"].map((h) => (
                          <th key={h} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modal.data.assignedCases.map((caseItem) => (
                        <tr key={caseItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-mono text-xs">{caseItem.caseId}</td>
                          <td className="py-2 px-3">{caseItem.candidate}</td>
                          <td className="py-2 px-3">{caseItem.business}</td>
                          <td className="py-2 px-3">{caseItem.visaType}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CASE_STATUS_CHIPS[caseItem.status]}`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_CHIPS[caseItem.priority]}`}>
                              {caseItem.priority}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs">{caseItem.deadline}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => openReassignModal(caseItem, modal.data)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <FiUserPlus size={12} />
                              Reassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No cases assigned to this caseworker.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reassign Case Modal ──────────────────────────────────────────────── */}
      <Modal
        open={reassignModal.open}
        onClose={closeReassignModal}
        title="Reassign Case"
        maxWidthClass="max-w-lg"
        maxHeightClass="max-h-[80vh]"
        marginBottomClass="mb-8"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeReassignModal} className="rounded-xl">Cancel</Button>
            <Button
              variant="primary"
              onClick={handleReassign}
              className="rounded-xl"
              disabled={!reassignModal.targetCaseworkers || reassignModal.targetCaseworkers.length === 0}
            >
              Reassign Case
            </Button>
          </>
        }
      >
        {reassignModal.case && reassignModal.currentCaseworker && (
          <div className="space-y-4">
            {reassignError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-700">{reassignError}</p>
              </div>
            )}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">Case to Reassign</p>
              <p className="text-xs text-gray-600">{reassignModal.case.caseId} · {reassignModal.case.candidate}</p>
              <p className="text-xs text-gray-500">{reassignModal.case.business} · {reassignModal.case.visaType}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-700 mb-1">From</p>
              <p className="text-xs text-blue-600">{reassignModal.currentCaseworker.name} ({reassignModal.currentCaseworker.assignedCases?.length ?? 0} cases assigned)</p>
            </div>
            <CaseworkerMultiSelect
              options={caseworkers
                .filter((cw) => cw.id !== reassignModal.currentCaseworker.id)
                .map((cw) => ({ id: cw.id, name: cw.name }))}
              value={reassignModal.targetCaseworkers}
              onChange={(ids) => {
                setReassignModal((prev) => ({ ...prev, targetCaseworkers: ids }));
                setReassignError("");
              }}
              error={reassignError && reassignModal.targetCaseworkers.length === 0 ? reassignError : ""}
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default AdminCaseworkers;
