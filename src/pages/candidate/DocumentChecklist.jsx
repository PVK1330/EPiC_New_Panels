import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IdCard,
  Home,
  Wallet,
  Briefcase,
  FileText,
  CheckCircle2,
  Upload,
  Eye,
  Loader2,
  AlertCircle,
  Download
} from "lucide-react";
import Modal from "../../components/Modal";
import useCandidate from "../../hooks/useCandidate";
import { downloadDocument, triggerDownload } from "../../services/documentApi";
import { useToast } from "../../context/ToastContext";

const FILTERS = [
  { id: "all", label: "All documents" },
  { id: "required", label: "Required" },
  { id: "uploaded", label: "Uploaded" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function statusBadgeClass(status) {
  switch (status) {
    case "missing":
    case "required":
      return "border-red-200 bg-red-50 text-red-700";
    case "uploaded":
    case "under_review":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-red-300 bg-red-100 text-red-800";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function statusLabel(status) {
  switch (status) {
    case "missing":
    case "required":
      return "Required";
    case "uploaded":
      return "Pending Review";
    case "under_review":
      return "Under Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

const DocumentChecklist = () => {
  const [filter, setFilter] = useState("all");
  const [viewDoc, setViewDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const { myApplication, applicationLoading, getMyApplication } = useCandidate();
  const { showToast } = useToast();

  useEffect(() => {
    getMyApplication();
  }, [getMyApplication]);

  // Combine documentSettings (requirements) and actual uploaded documents
  const docs = useMemo(() => {
    if (!myApplication) return [];
    
    const settings = myApplication._relatedData?.documentSettings || [];
    const uploads = myApplication._relatedData?.documents || [];

    const combinedList = [];

    // 1. First map all the configured required document fields
    settings.forEach((setting) => {
      // Find if user uploaded a file matching this setting
      const uploadedFile = uploads.find(u => u.documentType === setting.field_key || u.documentType === setting.field_label);
      
      combinedList.push({
        id: uploadedFile ? uploadedFile.id : `req-${setting.id}`,
        sectionKey: setting.field_key.includes("passport") || setting.field_key.includes("id") ? "identity" : "general",
        sectionLabel: setting.field_key.includes("passport") || setting.field_key.includes("id") ? "Identity documents" : "Required documents",
        SectionIcon: FileText,
        name: setting.field_label,
        mandatory: setting.is_required,
        note: `Required for your application.`,
        status: uploadedFile ? uploadedFile.status : "missing",
        icon: FileText,
        fileData: uploadedFile || null
      });
    });

    // 2. Add any other documents the user uploaded that aren't specifically mapped to a setting
    uploads.forEach((upload) => {
      const alreadyAdded = combinedList.some(item => item.fileData?.id === upload.id);
      if (!alreadyAdded) {
        combinedList.push({
          id: upload.id,
          sectionKey: "other",
          sectionLabel: "Other uploaded documents",
          SectionIcon: FileText,
          name: upload.userFileName || upload.documentName,
          mandatory: false,
          note: upload.documentType,
          status: upload.status,
          icon: FileText,
          fileData: upload
        });
      }
    });

    return combinedList;
  }, [myApplication]);

  const stats = useMemo(() => {
    const approved = docs.filter((d) => d.status === "approved").length;
    const uploaded = docs.filter((d) => d.status === "uploaded" || d.status === "under_review").length;
    const required = docs.filter((d) => d.mandatory && (d.status === "missing" || d.status === "rejected")).length;
    const totalMandatory = docs.filter((d) => d.mandatory).length;
    const doneMandatory = docs.filter((d) => d.mandatory && (d.status === "approved" || d.status === "uploaded" || d.status === "under_review")).length;
    
    const pct = totalMandatory > 0 ? Math.round((doneMandatory / totalMandatory) * 100) : 100;
    
    return { approved, uploaded, required, pct };
  }, [docs]);

  const filtered = useMemo(() => {
    if (filter === "all") return docs;
    if (filter === "required") return docs.filter((d) => d.status === "missing" || d.status === "rejected");
    if (filter === "uploaded") return docs.filter((d) => d.status === "uploaded" || d.status === "under_review");
    return docs.filter((d) => d.status === filter);
  }, [docs, filter]);

  const bySection = useMemo(() => {
    const map = new Map();
    for (const d of filtered) {
      if (!map.has(d.sectionKey)) {
        map.set(d.sectionKey, {
          key: d.sectionKey,
          label: d.sectionLabel,
          Icon: d.SectionIcon,
          items: [],
        });
      }
      map.get(d.sectionKey).items.push(d);
    }
    return Array.from(map.values());
  }, [filtered]);

  const canView = (status) =>
    status === "uploaded" || status === "approved" || status === "rejected" || status === "under_review";

  const handleDownload = async (item) => {
    if (!item.fileData) return;
    setDownloading(true);
    try {
      const res = await downloadDocument(item.fileData.id);
      triggerDownload(res.data, item.fileData.userFileName || item.fileData.documentName);
      showToast({ message: "Document download started.", variant: "success" });
    } catch {
      showToast({ message: "Download failed. Please try again.", variant: "danger" });
    } finally {
      setDownloading(false);
    }
  };

  if (applicationLoading && !myApplication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
        <p className="text-sm font-bold text-gray-400">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tight">
          Document checklist
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Track the status of all required documents for your visa application.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="grid grid-cols-3 gap-3 shrink-0 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-600 tabular-nums">
              {stats.approved}
            </p>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Approved
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600 tabular-nums">
              {stats.uploaded}
            </p>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Uploaded
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-primary tabular-nums">
              {stats.required}
            </p>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Missing
            </p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
        <div className="text-center shrink-0">
          <p className="text-2xl font-black text-secondary tabular-nums">
            {stats.pct}%
          </p>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Complete
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide transition-all ${filter === f.id
              ? "border-secondary bg-secondary text-white shadow-md shadow-secondary/20"
              : "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bySection.length === 0 ? (
        <p className="text-center py-12 text-sm font-bold text-gray-400">
          No documents in this filter.
        </p>
      ) : (
        bySection.map((section) => (
          <section key={section.key} className="space-y-3">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <section.Icon size={18} className="text-primary" />
              {section.label}
            </h2>
            <div className="space-y-2">
              {section.items.map((doc) => {
                const DocIcon = doc.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-secondary">
                        <DocIcon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-gray-900">
                            {doc.name}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${doc.mandatory
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                          >
                            {doc.mandatory ? "Mandatory" : "Optional"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mt-1">
                          {doc.note}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black border ${statusBadgeClass(doc.status)}`}
                      >
                        {doc.status === "approved" && (
                          <CheckCircle2 className="inline size-3.5 mr-1 -mt-0.5 align-middle" />
                        )}
                        {statusLabel(doc.status)}
                      </span>
                      {doc.status === "approved" && (
                        <CheckCircle2
                          className="text-emerald-500 hidden sm:block"
                          size={22}
                        />
                      )}
                      
                      {/* Actions */}
                      {canView(doc.status) && (
                        <button
                          type="button"
                          onClick={() => setViewDoc(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-600 hover:border-secondary hover:bg-secondary/5 hover:text-secondary"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      )}
                      
                      {(doc.status === "missing" || doc.status === "rejected") && (
                        <Link
                          to={`/candidate/upload-documents?documentType=${encodeURIComponent(doc.fileData?.documentType || doc.name)}&documentName=${encodeURIComponent(doc.fileData?.userFileName || doc.name)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <Upload size={14} />
                          Upload
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* Document View Modal */}
      <Modal
        open={Boolean(viewDoc)}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.fileData?.userFileName || viewDoc?.name || "Document"}
        titleId="checklist-view-doc"
        maxWidthClass="max-w-md"
        bodyClassName="p-5"
      >
        {viewDoc && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-600">{viewDoc.note}</p>
            
            {viewDoc.fileData ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Status</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusBadgeClass(viewDoc.status)}`}>
                      {statusLabel(viewDoc.status)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-1">Size</p>
                    <p className="font-black text-gray-800">
                      {viewDoc.fileData.fileSize ? `${(viewDoc.fileData.fileSize / 1024 / 1024).toFixed(2)} MB` : "—"}
                    </p>
                  </div>
                </div>
                
                {viewDoc.fileData.reviewNotes && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 mb-4">
                    <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Review notes</p>
                    <p className="text-xs font-bold text-amber-800">{viewDoc.fileData.reviewNotes}</p>
                  </div>
                )}
              </>
            ) : (
               <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
                <FileText className="mx-auto text-gray-300 mb-2" size={40} />
                <p className="text-xs font-bold text-gray-500">
                  Document has not been uploaded yet.
                </p>
              </div>
            )}
           
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewDoc(null)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              
              {viewDoc.fileData && (
                <button
                  type="button"
                  onClick={() => handleDownload(viewDoc)}
                  disabled={downloading}
                  className="flex-1 rounded-xl bg-secondary py-3 text-sm font-black text-white hover:bg-secondary-dark disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
              )}
              
              <Link
                to={`/candidate/upload-documents?documentType=${encodeURIComponent(viewDoc.fileData?.documentType || viewDoc.name)}&documentName=${encodeURIComponent(viewDoc.fileData?.userFileName || viewDoc.name)}`}
                onClick={() => setViewDoc(null)}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-black text-white hover:bg-primary-dark"
              >
                {viewDoc.fileData ? "Replace" : "Upload"}
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentChecklist;
