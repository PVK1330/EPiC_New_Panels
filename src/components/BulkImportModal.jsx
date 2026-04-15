import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload, FiDownload, FiCheckCircle, FiAlertCircle, FiFile, FiTrash2 } from "react-icons/fi";

// ── CSV → row mapper ──────────────────────────────────────────────────────────
const COLUMN_MAP = {
  firstname:       "firstName",
  first_name:      "firstName",
  "first name":    "firstName",
  lastname:        "lastName",
  last_name:       "lastName",
  "last name":     "lastName",
  dob:             "dob",
  "date of birth": "dob",
  dateofbirth:     "dob",
  gender:          "gender",
  nationality:     "nationality",
  countryofbirth:  "countryOfBirth",
  "country of birth": "countryOfBirth",
  email:           "email",
  phone:           "phone",
  mobile:          "phone",
  address:         "address",
  city:            "city",
  postcode:        "postcode",
  "post code":     "postcode",
  country:         "country",
  passportnumber:  "passportNumber",
  "passport number": "passportNumber",
  passportexpiry:  "passportExpiry",
  "passport expiry": "passportExpiry",
  ninumber:        "niNumber",
  "ni number":     "niNumber",
  nino:            "niNumber",
  brpnumber:       "brpNumber",
  "brp number":    "brpNumber",
  brp:             "brpNumber",
  visatype:        "visaType",
  "visa type":     "visaType",
  visaexpiry:      "visaExpiry",
  "visa expiry":   "visaExpiry",
  casestatus:      "caseStatus",
  "case status":   "caseStatus",
  status:          "caseStatus",
  righttowork:     "rightToWork",
  "right to work": "rightToWork",
  rtw:             "rightToWork",
  jobtitle:        "jobTitle",
  "job title":     "jobTitle",
  linkedbusiness:  "linkedBusiness",
  "linked business": "linkedBusiness",
  employer:        "linkedBusiness",
  business:        "linkedBusiness",
  employmentstart: "employmentStart",
  "employment start": "employmentStart",
  "start date":    "employmentStart",
  paymentstatus:   "paymentStatus",
  "payment status": "paymentStatus",
  payment:         "paymentStatus",
  feeamount:       "feeAmount",
  "fee amount":    "feeAmount",
  fee:             "feeAmount",
};

const AVATAR_COLORS = [
  "bg-blue-500","bg-yellow-500","bg-red-500","bg-purple-500",
  "bg-green-500","bg-pink-500","bg-teal-500","bg-orange-500",
];

const normalizeHeader = (h) => h.trim().toLowerCase().replace(/\s+/g, " ");

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

  const rawHeaders = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  const headers = rawHeaders.map(normalizeHeader);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    if (values.every((v) => !v)) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      const field = COLUMN_MAP[h];
      if (field) obj[field] = values[idx] || "";
    });
    rows.push(obj);
  }

  if (rows.length === 0) throw new Error("No valid data rows found in the CSV.");
  return rows;
};

const rowToCandidateShape = (row, index, existingCount) => {
  const firstName = row.firstName || "";
  const lastName  = row.lastName  || "";
  const initials  = [firstName[0] || "?", lastName[0] || "?"].join("").toUpperCase();
  const avatarBg  = AVATAR_COLORS[(existingCount + index) % AVATAR_COLORS.length];

  const dob = row.dob || "";
  const dobDisplay = dob
    ? (() => { try { return new Date(dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return dob; } })()
    : "";

  return {
    id:             Date.now() + index,
    firstName,
    lastName,
    initials,
    avatarBg,
    dob,
    dobDisplay,
    gender:          row.gender          || "",
    nationality:     row.nationality     || "",
    countryOfBirth:  row.countryOfBirth  || "",
    email:           row.email           || "",
    phone:           row.phone           || "",
    address:         row.address         || "",
    city:            row.city            || "",
    postcode:        row.postcode        || "",
    country:         row.country         || "United Kingdom",
    passportNumber:  row.passportNumber  || "",
    passportExpiry:  row.passportExpiry  || "",
    niNumber:        row.niNumber        || "",
    brpNumber:       row.brpNumber       || "",
    visaType:        row.visaType        || "Other",
    visaExpiry:      row.visaExpiry      || "",
    caseStatus:      row.caseStatus      || "On Track",
    rightToWork:     row.rightToWork     || "Pending",
    jobTitle:        row.jobTitle        || "",
    linkedBusiness:  row.linkedBusiness  || "Independent",
    employmentStart: row.employmentStart || "",
    paymentStatus:   row.paymentStatus   || "Outstanding",
    feeAmount:       row.feeAmount       || "",
    customResponses: {},
  };
};

// ── Template CSV content ──────────────────────────────────────────────────────
const TEMPLATE_CSV = `firstName,lastName,dob,gender,nationality,countryOfBirth,email,phone,address,city,postcode,country,passportNumber,passportExpiry,niNumber,brpNumber,visaType,visaExpiry,caseStatus,rightToWork,jobTitle,linkedBusiness,employmentStart,paymentStatus,feeAmount
John,Doe,1990-05-15,Male,British,United Kingdom,john.doe@example.com,+44 7700 123456,12 High Street,London,EC1A 1BB,United Kingdom,P1234567A,2030-01-01,AB 12 34 56 C,BRP00123456,Skilled Worker,2027-06-30,On Track,Verified,Software Engineer,TechNova Ltd,2022-01-10,Paid,£2500
Jane,Smith,1992-08-22,Female,Australian,Australia,jane.smith@example.com,+44 7700 654321,7 Park Lane,Manchester,M1 2AB,United Kingdom,P7654321B,2029-11-15,CD 23 45 67 E,BRP00654321,Graduate Visa,2026-09-30,In Review,Pending,Data Analyst,Apex Consulting,2023-03-01,Partial,£1800
`;

const downloadTemplate = () => {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "candidate_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// ── Component ─────────────────────────────────────────────────────────────────
const BulkImportModal = ({ open, onClose, onImport, existingCount = 0 }) => {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState([]);
  const [error, setError]         = useState("");
  const [importing, setImporting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [dragging, setDragging]   = useState(false);
  const fileInputRef              = useRef(null);

  const reset = () => {
    setFile(null);
    setPreview([]);
    setError("");
    setImporting(false);
    setSuccess(false);
    setDragging(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const processFile = useCallback((f) => {
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file (.csv)");
      return;
    }
    setFile(f);
    setError("");
    setSuccess(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows      = parseCsvText(e.target.result);
        const candidates = rows.map((r, i) => rowToCandidateShape(r, i, existingCount));
        setPreview(candidates);
      } catch (err) {
        setError(err.message || "Failed to parse CSV.");
        setPreview([]);
        setFile(null);
      }
    };
    reader.readAsText(f);
  }, [existingCount]);

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImport = () => {
    if (!preview.length) return;
    setImporting(true);
    setTimeout(() => {
      onImport(preview);
      setImporting(false);
      setSuccess(true);
      setTimeout(handleClose, 1400);
    }, 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <FiUpload size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">Import Bulk Data</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Upload a CSV file to add multiple clients at once</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">

              {/* Template download */}
              <div className="flex items-center justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-indigo-700">Download Template</p>
                  <p className="text-[11px] text-indigo-400 mt-0.5">Use our CSV template to ensure correct column formatting</p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-black text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm shrink-0"
                >
                  <FiDownload size={13} />
                  Template CSV
                </button>
              </div>

              {/* Drop zone */}
              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 py-12 px-6 text-center ${
                    dragging
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-gray-50/60 hover:border-indigo-300 hover:bg-indigo-50/40"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-indigo-100" : "bg-gray-100"}`}>
                    <FiUpload size={24} className={dragging ? "text-indigo-500" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-700">
                      {dragging ? "Drop your CSV here" : "Drag & drop your CSV file here"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse — only .csv files supported</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <FiFile size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <FiAlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-semibold">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2.5 rounded-xl border border-green-100 bg-green-50 px-4 py-3"
                >
                  <FiCheckCircle size={16} className="text-green-500 shrink-0" />
                  <p className="text-sm text-green-700 font-black">
                    {preview.length} client{preview.length !== 1 ? "s" : ""} imported successfully!
                  </p>
                </motion.div>
              )}

              {/* Preview table */}
              {preview.length > 0 && !success && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-gray-700">
                      Preview —{" "}
                      <span className="text-indigo-600">{preview.length} row{preview.length !== 1 ? "s" : ""}</span> ready to import
                    </p>
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      First 5 shown
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          {["Name", "Email", "Nationality", "Visa Type", "Case Status", "Payment"].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {preview.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 ${row.avatarBg}`}>
                                  {row.initials}
                                </div>
                                {row.firstName} {row.lastName}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.email || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.nationality || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.visaType || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.caseStatus || "—"}</td>
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.paymentStatus || "—"}</td>
                          </tr>
                        ))}
                        {preview.length > 5 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-2 text-center text-[11px] text-gray-400 font-semibold bg-gray-50/80">
                              + {preview.length - 5} more row{preview.length - 5 !== 1 ? "s" : ""}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Column guide */}
              <details className="group rounded-xl border border-gray-100 bg-gray-50/60">
                <summary className="flex items-center justify-between px-4 py-3 text-xs font-black text-gray-600 cursor-pointer select-none list-none">
                  <span>Supported column names</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform inline-block">▾</span>
                </summary>
                <div className="px-4 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    "firstName / first_name",
                    "lastName / last_name",
                    "dob / dateOfBirth",
                    "gender",
                    "nationality",
                    "countryOfBirth",
                    "email",
                    "phone / mobile",
                    "address",
                    "city",
                    "postcode",
                    "country",
                    "passportNumber",
                    "passportExpiry",
                    "niNumber / nino",
                    "brpNumber / brp",
                    "visaType",
                    "visaExpiry",
                    "caseStatus / status",
                    "rightToWork / rtw",
                    "jobTitle",
                    "linkedBusiness / employer",
                    "employmentStart",
                    "paymentStatus / payment",
                    "feeAmount / fee",
                  ].map((col) => (
                    <span key={col} className="text-[10px] font-mono bg-white border border-gray-100 rounded-lg px-2 py-1 text-gray-600">
                      {col}
                    </span>
                  ))}
                </div>
              </details>
            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[11px] text-gray-400 font-semibold">
                {preview.length > 0 ? `${preview.length} client${preview.length !== 1 ? "s" : ""} ready` : "No file selected"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!preview.length || importing || success}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Importing…
                    </>
                  ) : success ? (
                    <><FiCheckCircle size={14} /> Imported!</>
                  ) : (
                    <><FiUpload size={14} /> Import {preview.length > 0 ? `${preview.length} Client${preview.length !== 1 ? "s" : ""}` : "Data"}</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkImportModal;
