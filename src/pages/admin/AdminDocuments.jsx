import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiSend,
  FiClipboard,
  FiFileText,
  FiUploadCloud,
  FiDownload,
} from "react-icons/fi";
import { RiFileList3Line } from "react-icons/ri";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "passport", label: "Passport" },
  { value: "cos", label: "CoS" },
  { value: "brp", label: "BRP" },
  { value: "certificate", label: "Certificate" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "approved", label: "Approved" },
  { value: "under_review", label: "Under review" },
  { value: "missing", label: "Missing" },
  { value: "rejected", label: "Rejected" },
  { value: "expiring", label: "Expiring" },
];

const DOCUMENT_ROWS = [
  {
    id: "1",
    name: "Passport Copy — Priya Sharma",
    caseId: "VF-2841",
    typeLabel: "Identity",
    typeKey: "passport",
    uploadedBy: "Alice Patel",
    version: "v2",
    expiry: "12 Jan 2031",
    status: "Approved",
    statusKey: "approved",
    statusClass: "bg-green-100 text-green-700",
    action: "view",
  },
  {
    id: "2",
    name: "Certificate of Sponsorship",
    caseId: "VF-2841",
    typeLabel: "Sponsor",
    typeKey: "cos",
    uploadedBy: "TechNova HR",
    version: "v1",
    expiry: "N/A",
    status: "Approved",
    statusKey: "approved",
    statusClass: "bg-green-100 text-green-700",
    action: "view",
  },
  {
    id: "3",
    name: "English Language Certificate",
    caseId: "VF-2841",
    typeLabel: "Language",
    typeKey: "certificate",
    uploadedBy: "Priya Sharma",
    version: "v1",
    expiry: "15 Jun 2028",
    status: "Under Review",
    statusKey: "under_review",
    statusClass: "bg-blue-100 text-blue-800",
    action: "review",
  },
  {
    id: "4",
    name: "BRP — Omar Farouk",
    caseId: "VF-2812",
    typeLabel: "Residence",
    typeKey: "brp",
    uploadedBy: "—",
    version: "—",
    expiry: "—",
    status: "Missing",
    statusKey: "missing",
    statusClass: "bg-red-100 text-red-700",
    action: "request",
  },
  {
    id: "5",
    name: "Sponsor Licence Certificate",
    caseId: "VF-2839",
    typeLabel: "Sponsor",
    typeKey: "certificate",
    uploadedBy: "GlobalHire HR",
    version: "v3",
    expiry: "08 Jul 2026",
    status: "Expiring",
    statusKey: "expiring",
    statusClass: "bg-amber-100 text-amber-800",
    action: "view",
  },
];

const TEMPLATE_ITEMS = [
  {
    id: "t1",
    name: "Certificate of Sponsorship — blank template",
    version: "v4",
    updated: "12 Mar 2026",
  },
  {
    id: "t2",
    name: "Passport & identity — upload checklist",
    version: "v2",
    updated: "03 Feb 2026",
  },
  {
    id: "t3",
    name: "BRP / residence evidence — guidance",
    version: "v1",
    updated: "28 Jan 2026",
  },
  {
    id: "t4",
    name: "English language — acceptable certificates",
    version: "v3",
    updated: "15 Jan 2026",
  },
  {
    id: "t5",
    name: "Sponsor licence — renewal cover letter",
    version: "v2",
    updated: "02 Jan 2026",
  },
];

const CASE_OPTIONS = [
  { value: "", label: "Select case" },
  { value: "VF-2841", label: "#VF-2841 — Priya Sharma" },
  { value: "VF-2812", label: "#VF-2812 — Omar Farouk" },
  { value: "VF-2839", label: "#VF-2839 — James Okoye" },
  { value: "VF-2835", label: "#VF-2835 — Li Wei" },
];

const UPLOAD_TYPE_OPTIONS = [
  { value: "", label: "Select document type" },
  { value: "identity", label: "Identity" },
  { value: "sponsor", label: "Sponsor" },
  { value: "language", label: "Language" },
  { value: "residence", label: "Residence" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
];

const emptyUploadForm = {
  title: "",
  caseId: "",
  docType: "",
  expiry: "",
  notes: "",
  tags: "",
  language: "",
  retention: "",
  file: null,
};

const tableHead =
  "px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap";

const TABLE_HEADER = [
  { key: "name", label: "Document name" },
  { key: "case", label: "Case ID" },
  { key: "type", label: "Type" },
  { key: "by", label: "Uploaded by" },
  { key: "ver", label: "Version" },
  { key: "exp", label: "Expiry" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", align: "right" },
];

function RowActionIcon({ kind, ariaLabel, onClick }) {
  const base =
    "inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 rounded-lg text-gray-500 transition-colors cursor-pointer relative z-10 focus:outline-none focus:ring-2 focus:ring-secondary/40";
  if (kind === "view") {
    return (
      <button
        type="button"
        className={`${base} hover:text-secondary hover:bg-blue-50 active:bg-blue-100`}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <FiEye size={17} strokeWidth={2} aria-hidden />
      </button>
    );
  }
  if (kind === "review") {
    return (
      <button
        type="button"
        className={`${base} hover:text-amber-600 hover:bg-amber-50 active:bg-amber-100`}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <FiClipboard size={17} strokeWidth={2} aria-hidden />
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`${base} hover:text-primary hover:bg-red-50 active:bg-red-100`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <FiSend size={17} strokeWidth={2} aria-hidden />
    </button>
  );
}

const AdminDocuments = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [uploadErrors, setUploadErrors] = useState({});
  const [fileLabel, setFileLabel] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [reviewRow, setReviewRow] = useState(null);
  const [toast, setToast] = useState("");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DOCUMENT_ROWS.filter((row) => {
      const matchType = typeFilter === "all" || row.typeKey === typeFilter;
      const matchStatus =
        statusFilter === "all" || row.statusKey === statusFilter;
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.caseId.toLowerCase().includes(q) ||
        row.typeLabel.toLowerCase().includes(q) ||
        row.uploadedBy.toLowerCase().includes(q);
      return matchType && matchStatus && matchSearch;
    });
  }, [search, typeFilter, statusFilter]);

  const handleUploadField = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file" && files?.length) {
      setUploadForm((prev) => ({ ...prev, file: files[0] }));
      setFileLabel(files[0].name);
      setUploadErrors((prev) => ({ ...prev, file: "" }));
    } else {
      setUploadForm((prev) => ({ ...prev, [name]: value }));
      if (uploadErrors[name])
        setUploadErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const closeUpload = () => {
    setUploadOpen(false);
    setUploadForm(emptyUploadForm);
    setUploadErrors({});
    setFileLabel("");
    setFileInputKey((k) => k + 1);
  };

  const validateUpload = () => {
    const e = {};
    if (!uploadForm.title.trim()) e.title = "Required";
    if (!uploadForm.caseId) e.caseId = "Required";
    if (!uploadForm.docType) e.docType = "Required";
    if (!uploadForm.file) e.file = "Choose a file";
    setUploadErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitUpload = (ev) => {
    ev.preventDefault();
    if (!validateUpload()) return;
    closeUpload();
  };

  const handleRowAction = (row) => {
    if (row.action === "view") {
      navigate(`/admin/case-detail/${row.caseId}`);
      return;
    }
    if (row.action === "review") {
      setReviewRow(row);
      return;
    }
    setUploadForm({
      ...emptyUploadForm,
      caseId: row.caseId,
      title: row.name,
      docType:
        row.typeKey === "brp"
          ? "residence"
          : row.typeKey === "cos"
            ? "sponsor"
            : "",
      notes: `Requested replacement for: ${row.name}`,
    });
    setFileLabel("");
    setUploadErrors({});
    setFileInputKey((k) => k + 1);
    setUploadOpen(true);
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <RiFileList3Line size={32} className="text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">
              Document Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Central document repository with versioning and templates
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Templates"
            onClick={() => setTemplatesOpen(true)}
          >
            <FiFileText size={20} /> Templates
          </button>
          <Button
            type="button"
            variant="primary"
            className="rounded-xl shadow-sm inline-flex items-center gap-2"
            onClick={() => {
              setFileInputKey((k) => k + 1);
              setUploadOpen(true);
            }}
          >
            <FiUploadCloud size={20} /> Upload document
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-end flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              aria-label="Search documents"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <Input
              label="Type"
              name="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={TYPE_FILTER_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <Input
              label="Review"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                {TABLE_HEADER.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`${tableHead} ${col.align === "right" ? "text-right" : ""} ${col.key === "actions" ? "w-[88px] min-w-[88px]" : ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No documents match your filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-secondary max-w-xs">
                      {row.name}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/case-detail/${row.caseId}`}
                        className="font-mono text-sm font-bold text-primary hover:underline"
                      >
                        #{row.caseId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {row.typeLabel}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.uploadedBy}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {row.version}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.expiry}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${row.statusClass}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right w-[88px] min-w-[88px] align-middle">
                      <div className="inline-flex justify-end">
                        <RowActionIcon
                          kind={row.action}
                          ariaLabel={
                            row.action === "view"
                              ? "Open case documents"
                              : row.action === "review"
                                ? "Open review"
                                : "Request document"
                          }
                          onClick={() => handleRowAction(row)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        title="Templates"
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
      >
        <p className="text-xs text-gray-500 mb-4">
          Standard documents your team can download and reuse.
        </p>
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {TEMPLATE_ITEMS.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50/80 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-secondary truncate">
                  {t.name}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t.version} · Updated {t.updated}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 p-2.5 rounded-xl text-gray-400 hover:text-secondary hover:bg-blue-50 transition-colors cursor-pointer z-10 relative"
                aria-label="Download template"
                onClick={() => {
                  setToast(`Download started: ${t.name}`);
                  window.setTimeout(() => setToast(""), 2800);
                }}
              >
                <FiDownload size={18} />
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title="Upload document"
        maxWidthClass="max-w-xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={closeUpload}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="upload-document-form"
              variant="primary"
              className="rounded-xl"
            >
              Save
            </Button>
          </>
        }
      >
        <form
          id="upload-document-form"
          className="space-y-4"
          onSubmit={submitUpload}
        >
          <Input
            label="Document title"
            name="title"
            value={uploadForm.title}
            onChange={handleUploadField}
            placeholder="e.g. Passport copy — front & back"
            required
            error={uploadErrors.title}
          />
          <Input
            label="Case"
            name="caseId"
            value={uploadForm.caseId}
            onChange={handleUploadField}
            options={CASE_OPTIONS}
            required
            error={uploadErrors.caseId}
          />
          <Input
            label="Document type"
            name="docType"
            value={uploadForm.docType}
            onChange={handleUploadField}
            options={UPLOAD_TYPE_OPTIONS}
            required
            error={uploadErrors.docType}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="upload-file"
              className="text-xs font-bold text-gray-600 uppercase tracking-wide"
            >
              File <span className="text-primary">*</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                key={fileInputKey}
                id="upload-file"
                name="file"
                type="file"
                onChange={handleUploadField}
                className={`w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-white hover:file:opacity-90 border rounded-xl px-3 py-2 bg-white ${
                  uploadErrors.file ? "border-primary" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-secondary/30`}
              />
            </div>
            {fileLabel && (
              <span className="text-xs text-gray-500 truncate">
                {fileLabel}
              </span>
            )}
            {uploadErrors.file && (
              <span className="text-xs text-primary">{uploadErrors.file}</span>
            )}
          </div>

          <Input
            label="Expiry date (if applicable)"
            name="expiry"
            type="date"
            value={uploadForm.expiry}
            onChange={handleUploadField}
          />

          <Input
            label="Internal notes"
            name="notes"
            value={uploadForm.notes}
            onChange={handleUploadField}
            rows={3}
            placeholder="Optional context for reviewers…"
          />

          <Input
            label="Tags"
            name="tags"
            value={uploadForm.tags}
            onChange={handleUploadField}
            placeholder="comma-separated, e.g. cos, priority, v2026"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <Input
              label="Language / locale"
              name="language"
              value={uploadForm.language}
              onChange={handleUploadField}
              placeholder="e.g. en-GB"
            />
            <Input
              label="Retention (years)"
              name="retention"
              value={uploadForm.retention}
              onChange={handleUploadField}
              placeholder="e.g. 7"
            />
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Add more fields in this form later (e.g. visibility, witness
            signatures, linked checklist IDs) — keep using{" "}
            <code className="text-gray-500">Input</code> blocks and extend{" "}
            <code className="text-gray-500">uploadForm</code> state.
          </p>
        </form>
      </Modal>

      <Modal
        open={!!reviewRow}
        onClose={() => setReviewRow(null)}
        title="Review document"
        maxWidthClass="max-w-md"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => setReviewRow(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              className="rounded-xl"
              onClick={() => {
                if (reviewRow)
                  navigate(`/admin/case-detail/${reviewRow.caseId}`);
                setReviewRow(null);
              }}
            >
              Open case
            </Button>
          </>
        }
      >
        {reviewRow && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-secondary">{reviewRow.name}</p>
            <p className="text-xs text-gray-500">
              Case{" "}
              <Link
                to={`/admin/case-detail/${reviewRow.caseId}`}
                className="font-mono font-bold text-primary hover:underline"
                onClick={() => setReviewRow(null)}
              >
                #{reviewRow.caseId}
              </Link>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              This document is awaiting review. Open the case file to add notes
              or approve.
            </p>
          </div>
        )}
      </Modal>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 max-w-[min(90vw,28rem)] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-secondary shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </motion.div>
  );
};

export default AdminDocuments;
