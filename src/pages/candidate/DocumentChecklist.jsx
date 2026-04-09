import { useMemo, useState } from "react";
import {
  IdCard,
  Home,
  Wallet,
  Briefcase,
  FileText,
  CheckCircle2,
  Upload,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";

const FILTERS = [
  { id: "all", label: "All documents" },
  { id: "required", label: "Required" },
  { id: "uploaded", label: "Uploaded" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const initialDocs = [
  {
    id: "1",
    sectionKey: "identity",
    sectionLabel: "Identity documents",
    SectionIcon: IdCard,
    name: "Valid Passport",
    mandatory: true,
    note: "All pages — must be valid for 6+ months beyond visa end date",
    status: "required",
    icon: FileText,
  },
  {
    id: "2",
    sectionKey: "identity",
    sectionLabel: "Identity documents",
    SectionIcon: IdCard,
    name: "Biometric Residence Permit (BRP)",
    mandatory: false,
    note: "If previously held a UK visa",
    status: "approved",
    icon: FileText,
  },
  {
    id: "3",
    sectionKey: "identity",
    sectionLabel: "Identity documents",
    SectionIcon: IdCard,
    name: "Passport-size photographs",
    mandatory: true,
    note: "2 recent photos, white background, within 6 months",
    status: "uploaded",
    icon: FileText,
  },
  {
    id: "4",
    sectionKey: "address",
    sectionLabel: "Address proof",
    SectionIcon: Home,
    name: "Utility bill",
    mandatory: true,
    note: "Not older than 3 months — gas, electric or water",
    status: "required",
    icon: Home,
  },
  {
    id: "5",
    sectionKey: "address",
    sectionLabel: "Address proof",
    SectionIcon: Home,
    name: "Bank statement",
    mandatory: true,
    note: "Last 3 months showing address",
    status: "approved",
    icon: Wallet,
  },
  {
    id: "6",
    sectionKey: "financial",
    sectionLabel: "Financial documents",
    SectionIcon: Wallet,
    name: "Bank statements (3 months)",
    mandatory: true,
    note: "Balance must exceed £1,270 for 28 days",
    status: "rejected",
    icon: Wallet,
  },
  {
    id: "7",
    sectionKey: "financial",
    sectionLabel: "Financial documents",
    SectionIcon: Wallet,
    name: "Payslips (last 3 months)",
    mandatory: true,
    note: "Must show employer name and NI number",
    status: "uploaded",
    icon: Wallet,
  },
  {
    id: "8",
    sectionKey: "employment",
    sectionLabel: "Employment documents",
    SectionIcon: Briefcase,
    name: "Certificate of sponsorship (CoS)",
    mandatory: true,
    note: "Must be provided by licensed UK employer",
    status: "required",
    icon: Briefcase,
  },
  {
    id: "9",
    sectionKey: "employment",
    sectionLabel: "Employment documents",
    SectionIcon: Briefcase,
    name: "Employment contract",
    mandatory: true,
    note: "Signed copy showing role, salary, and start date",
    status: "approved",
    icon: Briefcase,
  },
  {
    id: "10",
    sectionKey: "employment",
    sectionLabel: "Employment documents",
    SectionIcon: Briefcase,
    name: "Academic qualifications",
    mandatory: false,
    note: "Degree or professional certificates relevant to the role",
    status: "required",
    icon: Briefcase,
  },
];

function statusBadgeClass(status) {
  switch (status) {
    case "required":
      return "border-red-200 bg-red-50 text-red-700";
    case "uploaded":
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
    case "required":
      return "Required";
    case "uploaded":
      return "Uploaded";
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
  const [docs] = useState(initialDocs);
  const [viewDoc, setViewDoc] = useState(null);

  const stats = useMemo(() => {
    const approved = docs.filter((d) => d.status === "approved").length;
    const uploaded = docs.filter((d) => d.status === "uploaded").length;
    const required = docs.filter(
      (d) => d.status === "required" || d.status === "rejected",
    ).length;
    const done = approved + uploaded;
    const pct = docs.length
      ? Math.round((done / docs.length) * 100)
      : 0;
    return { approved, uploaded, required, pct };
  }, [docs]);

  const filtered = useMemo(() => {
    if (filter === "all") return docs;
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
    status === "uploaded" || status === "approved" || status === "rejected";

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
              Required
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
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide transition-all ${
              filter === f.id
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
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              doc.mandatory
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
                      {canView(doc.status) && (
                        <button
                          type="button"
                          onClick={() => setViewDoc(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-600 hover:border-secondary hover:bg-secondary/5 hover:text-secondary"
                        >
                          <Eye size={14} />
                          View document
                        </button>
                      )}
                      {doc.status === "required" && (
                        <button
                          type="button"
                          onClick={() => setViewDoc(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-600 hover:border-secondary hover:bg-secondary/5 hover:text-secondary"
                        >
                         <Eye size={14} />
                           View document
                       </button>
                      )}
                      {doc.status === "rejected" && (
                        <Link
                          to="/candidate/upload-documents"
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <Upload size={14} />
                          Re-upload
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

      <Modal
        open={Boolean(viewDoc)}
        onClose={() => setViewDoc(null)}
        title={viewDoc ? viewDoc.name : "Document"}
        titleId="checklist-view-doc"
        maxWidthClass="max-w-md"
        bodyClassName="p-5"
      >
        {viewDoc && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-600">{viewDoc.note}</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
              <FileText className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-xs font-bold text-gray-500">
                Preview not available in demo — connect storage to show the file.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewDoc(null)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                to="/candidate/upload-documents"
                onClick={() => setViewDoc(null)}
                className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-black text-white hover:bg-primary-dark"
              >
                Replace / upload
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentChecklist;
