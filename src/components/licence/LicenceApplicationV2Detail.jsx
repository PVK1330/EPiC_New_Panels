import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  X,
  Check,
  Download,
  Eye,
  Building2,
  Briefcase,
  Users,
  ShieldCheck,
  Globe,
  User,
  Phone,
  Mail,
  Hash,
  Calendar,
  BadgeCheck,
  AlertTriangle,
  ClipboardList,
  Landmark,
  Star,
} from "lucide-react";
import {
  getAdminLicenceV2,
  getCaseworkerLicenceV2,
  verifyAppendixDocument,
  rejectAppendixDocument,
} from "../../services/licenceV2Api";
import LicenceStages from "./LicenceStages";
import { getCaseworkers } from "../../services/caseWorker";
import {
  assignLicenceCaseworker,
  downloadAdminLicenceDocument,
  downloadCaseworkerLicenceDocument,
} from "../../services/licenceApi";
import Modal from "../Modal";
import toast from "react-hot-toast";

const ROUTE_LABELS = {
  SkilledWorker: "Skilled Worker",
  Student: "Student",
  ScaleUp: "Scale-up",
  GBM: "Global Business Mobility",
  GAE: "Government Authorised Exchange",
};

const ROUTE_COLOURS = {
  SkilledWorker: "bg-blue-50 text-blue-700 border-blue-100",
  Student: "bg-violet-50 text-violet-700 border-violet-100",
  ScaleUp: "bg-emerald-50 text-emerald-700 border-emerald-100",
  GBM: "bg-amber-50 text-amber-700 border-amber-100",
  GAE: "bg-rose-50 text-rose-700 border-rose-100",
};

const STATUS_COLOURS = {
  "Pending": "bg-gray-100 text-gray-600",
  "Under Review": "bg-blue-100 text-blue-700",
  "Information Requested": "bg-amber-100 text-amber-700",
  "Government Processing": "bg-violet-100 text-violet-700",
  "Decision Pending": "bg-orange-100 text-orange-700",
  "Licence Granted": "bg-emerald-100 text-emerald-700",
  "Licence Rejected": "bg-red-100 text-red-700",
};

const Field = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
      {Icon && <Icon size={10} />}
      {label}
    </p>
    <p className="text-sm font-bold text-secondary break-words leading-snug">
      {value ?? <span className="text-gray-300">—</span>}
    </p>
  </div>
);

const BoolChip = ({ value }) =>
  value ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={11} /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-black bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
      <XCircle size={11} /> No
    </span>
  );

const SectionCard = ({ title, icon: Icon, accent = "from-primary to-primary-dark", children, action }) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
    <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${accent}`} />
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <Icon size={14} className="text-secondary" />
          </div>
        )}
        <h3 className="text-sm font-black text-secondary">{title}</h3>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const money = (v, ccy = "GBP") =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: 0,
      }).format(Number(v));

/**
 * Read-only structured view of a Sponsor Licence Application V2.
 * @param {{ role: 'admin' | 'caseworker' }} props
 */
export default function LicenceApplicationV2Detail({ role = "admin" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [caseworkers, setCaseworkers] = useState([]);
  const [selectedCaseworkerIds, setSelectedCaseworkerIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [actioningDocId, setActioningDocId] = useState(null);
  const [rejectDocId, setRejectDocId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleDownload = async (index, filename) => {
    try {
      const downloader =
        role === "admin"
          ? downloadAdminLicenceDocument
          : downloadCaseworkerLicenceDocument;
      const res = await downloader(id, index);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Failed to download document");
    }
  };

  const handleView = async (index, filename) => {
    try {
      const downloader =
        role === "admin"
          ? downloadAdminLicenceDocument
          : downloadCaseworkerLicenceDocument;
      const res = await downloader(id, index, { download: false });
      const mimeType =
        res.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (err) {
      toast.error("Failed to preview document");
    }
  };

  const handleVerifyDoc = async (docId) => {
    if (actioningDocId) return;
    try {
      setActioningDocId(docId);
      await verifyAppendixDocument(role, id, docId);
      toast.success("Document verified");

      const fetcher =
        role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
      const res = await fetcher(id);
      setApp(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to verify document");
    } finally {
      setActioningDocId(null);
    }
  };

  const openRejectModal = (docId) => {
    if (actioningDocId) return;
    setRejectDocId(docId);
    setRejectReason("");
  };

  const closeRejectModal = () => {
    if (actioningDocId) return;
    setRejectDocId(null);
    setRejectReason("");
  };

  const confirmRejectDoc = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      setActioningDocId(rejectDocId);
      await rejectAppendixDocument(role, id, rejectDocId, reason);
      toast.error("Document rejected");

      const fetcher =
        role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
      const res = await fetcher(id);
      setApp(res.data.data);
      setRejectDocId(null);
      setRejectReason("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject document");
    } finally {
      setActioningDocId(null);
    }
  };

  useEffect(() => {
    if (role !== "admin") return;
    (async () => {
      try {
        const res = await getCaseworkers(1, 100);
        setCaseworkers(res.data?.data?.caseworkers || []);
      } catch (err) {
        console.error("Failed to fetch caseworkers", err);
      }
    })();
  }, [role]);

  useEffect(() => {
    if (app) {
      setSelectedCaseworkerIds(
        Array.isArray(app.assignedcaseworkerId) ? app.assignedcaseworkerId : [],
      );
    }
  }, [app]);

  const handleAssign = async () => {
    if (assignLoading) return;
    if (selectedCaseworkerIds.length === 0) {
      toast.error("Please select at least one caseworker");
      return;
    }
    try {
      setAssignLoading(true);
      await assignLicenceCaseworker(id, {
        caseworkerIds: selectedCaseworkerIds,
      });
      toast.success("Caseworker(s) assigned successfully");
      setShowAssignModal(false);

      const fetcher =
        role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
      const res = await fetcher(id);
      setApp(res.data.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Assignment failed. Please try again.",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const fetcher =
          role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
        const res = await fetcher(id);
        if (active) setApp(res.data.data);
      } catch (e) {
        if (active)
          setError(e?.response?.data?.message || "Failed to load application");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, role]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-primary" size={30} />
        <p className="text-sm font-bold text-gray-400">Loading application…</p>
      </div>
    );
  }
  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <AlertTriangle size={32} className="text-amber-400" />
        <p className="text-sm font-bold text-gray-500">{error || "Application not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-black text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const org = app.organisationInfo || {};
  const ao = app.authorisingOfficer || {};
  const kc = app.keyContact || {};
  const dec = app.declaration || {};

  const statusColour = STATUS_COLOURS[app.status] || "bg-gray-100 text-gray-600";
  const uploadedDocs = (app.appendixDocuments || []).filter((d) => d.filePath);
  const verifiedCount = (app.appendixDocuments || []).filter((d) => d.verificationStatus === "Verified").length;
  const totalDocs = (app.appendixDocuments || []).length;

  return (
    <div className="space-y-5 pb-12">
      {/* ── Back + breadcrumb ── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-primary transition-colors"
      >
        <ChevronLeft size={15} />
        Back to Applications
      </button>

      {/* ── Hero header card ── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-gray-100">
                <ClipboardList className="text-primary" size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-secondary tracking-tight">
                    Licence Application
                  </h1>
                  <span className="text-[10px] font-black text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                    #LIC-{app.id}
                  </span>
                  <span className="text-[10px] font-black bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    V2
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    Submitted{" "}
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </span>
                  {app.fee?.total && (
                    <span className="flex items-center gap-1">
                      <Landmark size={11} />
                      {money(app.fee.total, app.fee.currency)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-black px-3 py-1.5 rounded-full ${statusColour}`}>
                {app.status || "Pending"}
              </span>
              {role === "admin" && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all text-xs font-black border border-blue-100"
                >
                  <UserPlus size={13} /> Assign Caseworker
                </button>
              )}
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs font-black text-secondary">{(app.routes || []).length}</p>
              <p className="text-[10px] font-bold text-gray-400">Licence Routes</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-secondary">{(app.cosRequirements || []).length}</p>
              <p className="text-[10px] font-bold text-gray-400">CoS Requirements</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-secondary">{verifiedCount}/{totalDocs}</p>
              <p className="text-[10px] font-bold text-gray-400">Docs Verified</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-secondary">{(app.level1Users || []).length}</p>
              <p className="text-[10px] font-bold text-gray-400">Level 1 Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Workflow stages ── */}
      <LicenceStages applicationId={app.id} app={app} viewerRole={role} />

      {/* ── Licence Routes ── */}
      <SectionCard title="Licence Routes" icon={Globe} accent="from-violet-400 to-violet-600">
        {(app.routes || []).length === 0 ? (
          <p className="text-sm text-gray-400">No routes selected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(app.routes || []).map((r) => (
              <span
                key={r}
                className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${ROUTE_COLOURS[r] || "bg-gray-50 text-gray-600 border-gray-100"}`}
              >
                <BadgeCheck size={12} />
                {ROUTE_LABELS[r] || r}
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Organisation Information ── */}
      <SectionCard title="Organisation Information" icon={Building2} accent="from-blue-400 to-blue-600">
        <div className="grid sm:grid-cols-3 gap-5">
          <Field label="Organisation type" value={org.organisationType} icon={Building2} />
          <Field label="Companies House no." value={org.companiesHouseNumber} icon={Hash} />
          <Field label="PAYE reference" value={org.payeReference} icon={Hash} />
          <Field label="Accounts Office ref." value={org.accountsOfficeReference} icon={Hash} />
          <Field label="VAT number" value={org.vatNumber} icon={Hash} />
          <Field label="Trading start date" value={org.tradingStartDate} icon={Calendar} />
          <Field
            label="Charity"
            value={
              org.charityStatus
                ? `Yes${org.charityNumber ? ` · ${org.charityNumber}` : ""}`
                : "No"
            }
          />
          <Field label="SIC codes" value={(org.sicCodes || []).join(", ")} />
          <Field label="Regions" value={(org.regions || []).join(", ")} />
          <div className="sm:col-span-2">
            <Field label="Accreditations" value={(org.accreditations || []).join(", ") || "None"} />
          </div>
          <div className="sm:col-span-1">
            <Field label="Previous trading names" value={(org.previousTradingNames || []).join(", ") || "None"} />
          </div>
        </div>
      </SectionCard>

      {/* ── CoS Requirements ── */}
      <SectionCard
        title={`CoS Requirements (${(app.cosRequirements || []).length})`}
        icon={Briefcase}
        accent="from-emerald-400 to-emerald-600"
      >
        {(app.cosRequirements || []).length === 0 ? (
          <p className="text-sm text-gray-400">No CoS requirements listed.</p>
        ) : (
          <div className="overflow-auto max-h-[68vh] -mx-1">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 rounded-lg">
                  <th className="text-left px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider rounded-l-lg">Sr No</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">SOC</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">Role Title</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">Salary</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider rounded-r-lg">Candidate</th>
                </tr>
              </thead>
              <tbody>
                {(app.cosRequirements || []).map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] font-black text-secondary bg-gray-100 px-2 py-0.5 rounded font-mono">
                        {c.socCode || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold text-secondary">{c.roleTitle || "—"}</td>
                    <td className="px-3 py-2.5 font-bold text-secondary">{c.salary ? money(c.salary, c.salaryCurrency) : "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-bold">
                      {c.sponsorshipDurationMonths ? `${c.sponsorshipDurationMonths} mo` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 font-bold">{c.candidateName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Appendix A Documents ── */}
      <SectionCard
        title={`Appendix A Documents (${totalDocs})`}
        icon={FileText}
        accent="from-amber-400 to-amber-600"
        action={
          totalDocs > 0 && (
            <span className="text-[10px] font-black text-gray-400">
              {verifiedCount} of {totalDocs} verified
            </span>
          )
        }
      >
        {totalDocs === 0 ? (
          <p className="text-sm text-gray-400">No documents.</p>
        ) : (
          <div className="space-y-2">
            {(app.appendixDocuments || []).map((d) => {
              const isUploaded = !!d.filePath;
              const downloadIdx = isUploaded
                ? uploadedDocs.findIndex((doc) => doc.id === d.id)
                : -1;
              const filename = d.filePath ? d.filePath.split(/[\\/]/).pop() : d.documentName;

              const statusConfig =
                d.verificationStatus === "Verified"
                  ? { Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Verified" }
                  : d.verificationStatus === "Rejected"
                  ? { Icon: XCircle, cls: "bg-red-50 text-red-600 border-red-100", label: "Rejected" }
                  : { Icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-100", label: "Pending" };

              const isActioning = actioningDocId === d.id;

              return (
                <div
                  key={d.id}
                  className={`rounded-xl border p-3 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap transition-colors ${
                    isUploaded ? "border-gray-200 bg-white" : "border-dashed border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isUploaded ? "bg-blue-50" : "bg-gray-100"}`}>
                      <FileText size={13} className={isUploaded ? "text-blue-500" : "text-gray-400"} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isUploaded ? "text-secondary" : "text-gray-400"}`}>
                        {d.documentName}
                        {d.required && !isUploaded && <span className="text-red-400 ml-1">*</span>}
                      </p>
                      {d.receivedStatus && (
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{d.receivedStatus}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Verification status chip */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${statusConfig.cls}`}>
                      <statusConfig.Icon size={10} />
                      {statusConfig.label}
                    </span>

                    {/* View / Download / Verify / Reject */}
                    {isUploaded && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleView(downloadIdx, filename)}
                          title="Preview document"
                          disabled={isActioning}
                          className="flex items-center justify-center w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleDownload(downloadIdx, filename)}
                          title="Download document"
                          disabled={isActioning}
                          className="flex items-center justify-center w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Download size={13} />
                        </button>
                        {d.verificationStatus !== "Rejected" && (
                          <button
                            onClick={() => openRejectModal(d.id)}
                            disabled={isActioning}
                            title="Reject document"
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-[10px] font-black transition-all disabled:opacity-50"
                          >
                            {isActioning ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                            Reject
                          </button>
                        )}
                        {d.verificationStatus !== "Verified" && (
                          <button
                            onClick={() => handleVerifyDoc(d.id)}
                            disabled={isActioning}
                            title="Verify document"
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg text-[10px] font-black transition-all disabled:opacity-50"
                          >
                            {isActioning ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                            Verify
                          </button>
                        )}
                      </div>
                    )}

                    {!isUploaded && (
                      <span className="text-[10px] font-bold text-gray-400 italic">Not uploaded</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Authorising Officer + Key Contact ── */}
      <div className="grid md:grid-cols-2 gap-5">
        <SectionCard title="Authorising Officer" icon={User} accent="from-secondary to-secondary/80">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Full Name"
              value={[ao.title, ao.firstName, ao.lastName].filter(Boolean).join(" ")}
              icon={User}
            />
            <Field label="Date of Birth" value={ao.dob} icon={Calendar} />
            <Field label="Nationality" value={ao.nationality} icon={Globe} />
            <Field label="NI Number" value={ao.niNumber} icon={Hash} />
            <Field label="Immigration Status" value={ao.immigrationStatus} icon={ShieldCheck} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Convictions</p>
              <BoolChip value={ao.hasConvictions} />
            </div>
            <Field label="Email" value={ao.email} icon={Mail} />
            <Field label="Phone" value={ao.phone} icon={Phone} />
            {ao.designation && <Field label="Designation" value={ao.designation} icon={Briefcase} />}
          </div>
        </SectionCard>

        <SectionCard title="Key Contact" icon={User} accent="from-secondary to-secondary/80">
          {kc.sameAsAuthorisingOfficer ? (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
              <p className="text-sm font-bold text-blue-700">Same as Authorising Officer</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={[kc.title, kc.firstName, kc.lastName].filter(Boolean).join(" ")}
                icon={User}
              />
              <Field label="Job Title" value={kc.jobTitle} icon={Briefcase} />
              <Field label="Email" value={kc.email} icon={Mail} />
              <Field label="Phone" value={kc.phone} icon={Phone} />
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Level 1 Users ── */}
      <SectionCard
        title={`Level 1 Users (${(app.level1Users || []).length})`}
        icon={Users}
        accent="from-teal-400 to-teal-600"
      >
        {(app.level1Users || []).length === 0 ? (
          <p className="text-sm text-gray-400">No Level 1 Users added.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(app.level1Users || []).map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-secondary truncate">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                  </p>
                  {u.isAuthorisingOfficer && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                      <Star size={9} /> AO
                    </span>
                  )}
                </div>
                {u.email && (
                  <p className="text-[11px] font-bold text-gray-500 truncate flex items-center gap-1">
                    <Mail size={10} className="shrink-0 text-gray-400" />
                    {u.email}
                  </p>
                )}
                {u.jobTitle && (
                  <p className="text-[11px] font-bold text-gray-400 truncate flex items-center gap-1">
                    <Briefcase size={10} className="shrink-0 text-gray-300" />
                    {u.jobTitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Declarations ── */}
      <SectionCard title="Declarations" icon={ShieldCheck} accent="from-rose-400 to-rose-600">
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Accuracy Confirmed</p>
            <BoolChip value={dec.accuracyConfirmed} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Duties Understood</p>
            <BoolChip value={dec.dutiesUnderstood} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Data Consent</p>
            <BoolChip value={dec.dataConsent} />
          </div>
          <Field label="Signatory" value={dec.signatoryName} icon={User} />
          <Field label="Signatory Role" value={dec.signatoryRole} icon={Briefcase} />
          <Field label="Signed Date" value={dec.signedDate} icon={Calendar} />
        </div>
      </SectionCard>

      {/* ── Assign Caseworker Modal ── */}
      {role === "admin" && (
        <Modal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Caseworker"
          maxWidthClass="max-w-md"
          bodyClassName="p-6"
          footer={
            <>
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-secondary disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assignLoading || selectedCaseworkerIds.length === 0}
                className="bg-primary hover:bg-primary/95 text-white font-black text-sm px-6 py-2 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {assignLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} /> Confirm Assignment
                  </>
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Select Caseworkers
              {selectedCaseworkerIds.length > 0 && (
                <span className="ml-2 text-primary normal-case tracking-normal">
                  ({selectedCaseworkerIds.length} selected)
                </span>
              )}
            </p>
            {caseworkers.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs font-bold text-gray-400">
                  No caseworkers available to assign.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {caseworkers.map((cw) => {
                  const isSelected = selectedCaseworkerIds.some(
                    (id) => String(id) === String(cw.id),
                  );
                  return (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCaseworkerIds(
                            selectedCaseworkerIds.filter(
                              (id) => String(id) !== String(cw.id),
                            ),
                          );
                        } else {
                          setSelectedCaseworkerIds([
                            ...selectedCaseworkerIds,
                            cw.id,
                          ]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                        isSelected
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-gray-50 border-gray-100 text-secondary hover:border-gray-200"
                      } shadow-sm group cursor-pointer`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-black">
                          {cw.first_name} {cw.last_name}
                        </p>
                        <p className="text-[10px] opacity-70 font-bold">
                          {cw.email}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-200"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Reject Document Modal ── */}
      <Modal
        open={rejectDocId !== null}
        onClose={closeRejectModal}
        title="Reject Document"
        maxWidthClass="max-w-md"
        bodyClassName="p-6"
        footer={
          <>
            <button
              onClick={closeRejectModal}
              disabled={!!actioningDocId}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-secondary disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={confirmRejectDoc}
              disabled={!!actioningDocId || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-sm px-6 py-2 rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actioningDocId ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <XCircle size={16} /> Reject Document
                </>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-500 leading-relaxed">
            Tell the sponsor why this document was rejected. They'll be notified
            and asked to re-upload a corrected copy, and this status updates
            everywhere the document appears.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            autoFocus
            placeholder="e.g. The certificate has expired / the document is illegible / wrong document type"
            className="w-full text-sm font-medium text-secondary border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}
