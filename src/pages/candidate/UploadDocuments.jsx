import { useState, useRef, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Upload,
  FileText,
  X,
  Eye,
  FolderOpen,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Modal from "../../components/Modal";
import {
  uploadDocuments as uploadDocumentsApi,
  getUserDocuments,
  downloadDocument,
  triggerDownload,
} from "../../services/documentApi";
import useCandidate from "../../hooks/useCandidate";

const DOC_TYPES = [
  "— Select document type —",
  "Passport",
  "Bank statement",
  "Payslip",
  "Employment contract",
  "Certificate of sponsorship",
  "Utility bill",
  "Academic certificate",
  "BRP Card",
  "National ID",
  "Other",
];

// Map document status → badge style
const STATUS_STYLES = {
  approved:     "border-emerald-200 bg-emerald-50 text-emerald-700",
  uploaded:     "border-amber-200 bg-amber-50 text-amber-800",
  under_review: "border-amber-200 bg-amber-50 text-amber-800",
  rejected:     "border-red-200 bg-red-50 text-red-700",
  missing:      "border-gray-200 bg-gray-50 text-gray-500",
};

const STATUS_ICON = {
  approved:     <CheckCircle2 className="inline mr-1 -mt-0.5" size={11} />,
  uploaded:     <Clock className="inline mr-1 -mt-0.5" size={11} />,
  under_review: <Clock className="inline mr-1 -mt-0.5" size={11} />,
  rejected:     <AlertCircle className="inline mr-1 -mt-0.5" size={11} />,
  missing:      null,
};

const UploadDocuments = () => {
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id || user?.userId;

  const [docType, setDocType]         = useState(DOC_TYPES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile]               = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Document history from API
  const [history, setHistory]         = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const [viewItem, setViewItem]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef(null);

  const { myApplication, getMyApplication } = useCandidate();

  // ── Load uploaded documents & application data ─────────────────────────────
  const loadDocuments = useCallback(async () => {
    if (!userId) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      await getMyApplication(); // Get application to find active case ID
      const res = await getUserDocuments(userId);
      setHistory(res.data?.data?.documents ?? []);
    } catch {
      setHistoryError("Failed to load documents. Please refresh.");
    } finally {
      setHistoryLoading(false);
    }
  }, [userId, getMyApplication]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // ── File selection ─────────────────────────────────────────────────────────
  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPick = useCallback((f) => {
    if (!f) return;
    const allowed = [
      "application/pdf", "image/jpeg", "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      setUploadError("Unsupported file type. Use PDF, JPG, PNG, or DOC.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setUploadError("File is larger than 10 MB.");
      return;
    }
    setFile(f);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onPick(f);
    },
    [onPick]
  );

  // ── Real upload ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (docType === DOC_TYPES[0]) {
      setUploadError("Please select a document type.");
      return;
    }
    if (!file) {
      setUploadError("Please choose a file to upload.");
      return;
    }
    if (!userId) {
      setUploadError("Session error — please log in again.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Find active case ID if available
      const activeCase = myApplication?._relatedData?.cases?.[0];
      const caseIdToAttach = activeCase ? activeCase.id : undefined;

      await uploadDocumentsApi(
        [file],
        {
          userId,
          documentType: docType,
          documentCategory: "candidate",
          userFileName: description.trim() || file.name,
          caseId: caseIdToAttach, // Attach case ID so caseworker sees it
        },
        (pct) => setUploadProgress(pct)
      );

      setUploadSuccess(true);
      clearFile();
      setDocType(DOC_TYPES[0]);
      setDescription("");
      // Refresh document list
      await loadDocuments();
    } catch (err) {
      setUploadError(
        err?.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async (item) => {
    setDownloading(true);
    try {
      const res = await downloadDocument(item.id);
      triggerDownload(res.data, item.userFileName || item.documentName);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const fmtSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Upload documents
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Upload required documents for your visa application. Supported: PDF, JPG, PNG, DOC (max 10 MB).
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-6 items-start">
        {/* ── Upload panel ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-7 shadow-sm space-y-5">
          {/* Document type */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Document type <span className="text-red-500">*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Description / filename (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Passport — front and back pages"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
            />
          </div>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-secondary bg-secondary/5"
                : "border-gray-200 bg-gray-50/80 hover:border-primary/40"
            }`}
          >
            <FolderOpen className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-sm font-black text-gray-800">Drag and drop your file here</p>
            <p className="text-xs font-bold text-gray-500 mt-1">Or click to browse from your device</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-5 py-2.5 text-xs font-black text-secondary hover:bg-secondary hover:text-white transition-colors"
            >
              Browse file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
          </div>

          {/* Selected file preview */}
          {file && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-xs font-black text-secondary shrink-0">
                {file.name.split(".").pop()?.toUpperCase() ?? "—"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-800 truncate">{file.name}</p>
                <p className="text-[11px] font-bold text-gray-500">{fmtSize(file.size)}</p>
                {uploading && (
                  <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white"
                  aria-label="Remove file"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Error / success banners */}
          {uploadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 size={14} /> Document uploaded successfully!
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading… {uploadProgress}%
              </>
            ) : (
              <>
                <Upload size={18} /> Upload document
              </>
            )}
          </button>
        </div>

        {/* ── Uploaded history panel ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-secondary flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Uploaded documents
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">{history.length} files</span>
              <button
                type="button"
                onClick={loadDocuments}
                className="p-1.5 rounded-lg text-gray-400 hover:text-secondary hover:bg-gray-100"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="animate-spin text-secondary" size={28} />
              <p className="text-xs font-bold text-gray-400">Loading documents…</p>
            </div>
          ) : historyError ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-red-300 mb-2" size={28} />
              <p className="text-xs font-bold text-red-500">{historyError}</p>
              <button
                onClick={loadDocuments}
                className="mt-3 text-xs font-black text-secondary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <FolderOpen className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs font-bold text-gray-400">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[min(70vh,520px)] overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3 first:pt-0">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-[9px] font-black text-secondary shrink-0">
                    {(item.documentName || item.userFileName || "").split(".").pop()?.toUpperCase() || "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 truncate">
                      {item.userFileName || item.documentName}
                    </p>
                    <p className="text-[11px] font-bold text-gray-500">
                      {item.documentType} · {fmtDate(item.uploadedAt || item.created_at)} · {fmtSize(item.fileSize)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${STATUS_STYLES[item.status] || STATUS_STYLES.missing}`}>
                      {STATUS_ICON[item.status]}
                      {item.status?.replace("_", " ") || "Unknown"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewItem(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-secondary hover:border-secondary hover:bg-secondary/5"
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        disabled={downloading}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-gray-500 hover:border-gray-400 disabled:opacity-50"
                        title="Download"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Document detail modal ─────────────────────────────────────────────── */}
      <Modal
        open={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        title={viewItem?.userFileName ?? viewItem?.documentName ?? "Document"}
        titleId="upload-history-view"
        maxWidthClass="max-w-md"
        bodyClassName="p-5"
      >
        {viewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Type</p>
                <p className="font-black text-gray-800">{viewItem.documentType || "—"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Size</p>
                <p className="font-black text-gray-800">{fmtSize(viewItem.fileSize)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Uploaded</p>
                <p className="font-black text-gray-800">{fmtDate(viewItem.uploadedAt || viewItem.created_at)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Status</p>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[viewItem.status] || STATUS_STYLES.missing}`}>
                  {viewItem.status?.replace("_", " ") || "—"}
                </span>
              </div>
            </div>
            {viewItem.reviewNotes && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Review notes</p>
                <p className="text-xs font-bold text-amber-800">{viewItem.reviewNotes}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { handleDownload(viewItem); setViewItem(null); }}
                disabled={downloading}
                className="flex-1 rounded-xl bg-secondary py-3 text-sm font-black text-white hover:bg-secondary-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UploadDocuments;
