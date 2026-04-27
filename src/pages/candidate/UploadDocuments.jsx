import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  Eye,
  FolderOpen,
} from "lucide-react";
import Modal from "../../components/Modal";

const DOC_TYPES = [
  "— Select document type —",
  "Passport",
  "Bank statement",
  "Payslip",
  "Employment contract",
  "Certificate of sponsorship",
  "Utility bill",
  "Academic certificate",
  "Other",
];

const initialHistory = [
  {
    id: "h1",
    name: "Passport.pdf",
    version: "v1",
    date: "Uploaded 8 Apr 2026",
    status: "Approved",
    statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    id: "h2",
    name: "Bank_Statement_Mar.pdf",
    version: "v2",
    date: "Uploaded 10 Apr 2026",
    status: "Under review",
    statusClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    id: "h3",
    name: "Employment_Contract.pdf",
    version: "v1",
    date: "Uploaded 9 Apr 2026",
    status: "Approved",
    statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    id: "h4",
    name: "Payslip_March.pdf",
    version: "v1",
    date: "Uploaded 10 Apr 2026",
    status: "Under review",
    statusClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    id: "h5",
    name: "Bank_Statement_Feb.pdf",
    version: "v1",
    date: "Uploaded 5 Apr 2026",
    status: "Rejected",
    statusClass: "border-red-200 bg-red-50 text-red-700",
  },
];

const UploadDocuments = () => {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [viewItem, setViewItem] = useState(null);
  const inputRef = useRef(null);

  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPick = useCallback((f) => {
    if (!f) return;
    const ok =
      f.type === "application/pdf" ||
      f.type === "image/jpeg" ||
      f.type === "image/png";
    if (!ok) {
      alert("Please use PDF, JPG, or PNG (max 10MB in production).");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("File is larger than 10MB.");
      return;
    }
    setFile(f);
    setUploadProgress(0);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onPick(f);
    },
    [onPick],
  );

  const simulateUpload = () => {
    if (docType === DOC_TYPES[0]) {
      alert("Select a document type.");
      return;
    }
    if (!file) {
      alert("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 12;
      setUploadProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(t);
        setUploading(false);
        const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            name: file.name,
            version: "v1",
            date: `Uploaded ${new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`,
            status: "Under review",
            statusClass: "border-amber-200 bg-amber-50 text-amber-800",
          },
          ...prev,
        ]);
        clearFile();
        alert("Document uploaded (demo). It will appear in your history as under review.");
      }
    }, 120);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Upload documents
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Upload required documents for your visa application. Supported: PDF,
          JPG, PNG (max 10MB).
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-7 shadow-sm space-y-5">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Document type
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
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Passport — front and back pages"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
            />
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-all ${dragOver
              ? "border-secondary bg-secondary/5"
              : "border-gray-200 bg-gray-50/80 hover:border-primary/40"
              }`}
          >
            <FolderOpen className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-sm font-black text-gray-800">
              Drag and drop your file here
            </p>
            <p className="text-xs font-bold text-gray-500 mt-1">
              Or click to browse from your device
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-5 py-2.5 text-xs font-black text-secondary hover:bg-secondary hover:text-white transition-colors"
            >
              Browse file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-xs font-black text-secondary shrink-0">
                {file.name.split(".").pop()?.toUpperCase() ?? "—"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-800 truncate">
                  {file.name}
                </p>
                <p className="text-[11px] font-bold text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploading && (
                  <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white"
                aria-label="Remove file"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={simulateUpload}
            disabled={uploading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload size={18} />
            {uploading ? "Uploading…" : "Upload document"}
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-secondary flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Uploaded documents
            </h2>
            <span className="text-xs font-bold text-gray-400">
              {history.length} files
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[min(70vh,520px)] overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center gap-3 first:pt-0"
              >
                <FileText className="text-gray-400 shrink-0" size={22} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-800 truncate">
                    {item.name}{" "}
                    <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 ml-1">
                      {item.version}
                    </span>
                  </p>
                  <p className="text-[11px] font-bold text-gray-500">
                    {item.date}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${item.statusClass}`}
                  >
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewItem(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-secondary hover:border-secondary hover:bg-secondary/5"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        title={viewItem?.name ?? "Document"}
        titleId="upload-history-view"
        maxWidthClass="max-w-md"
        bodyClassName="p-5"
      >
        {viewItem && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500">{viewItem.date}</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
              <FileText className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-xs font-bold text-gray-500">
                Demo preview — connect file storage to open the real document.
              </p>
            </div>
            <span
              className={`inline-block text-[11px] font-black uppercase px-3 py-1 rounded-full border ${viewItem.statusClass}`}
            >
              {viewItem.status}
            </span>
            <button
              type="button"
              onClick={() => setViewItem(null)}
              className="w-full rounded-xl border-2 border-gray-200 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UploadDocuments;
