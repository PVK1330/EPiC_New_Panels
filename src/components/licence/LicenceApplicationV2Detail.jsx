import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, FileText, CheckCircle2, XCircle, Clock, UserPlus, X, Check, Download } from "lucide-react";
import {
  getAdminLicenceV2,
  getCaseworkerLicenceV2,
  verifyAppendixDocument,
  rejectAppendixDocument
} from "../../services/licenceV2Api";
import LicenceStages from "./LicenceStages";
import { getCaseworkers } from "../../services/caseWorker";
import { assignLicenceCaseworker, downloadAdminLicenceDocument, downloadCaseworkerLicenceDocument } from "../../services/licenceApi";
import Modal from "../Modal";
import toast from "react-hot-toast";

const ROUTE_LABELS = {
  SkilledWorker: "Skilled Worker", Student: "Student", ScaleUp: "Scale-up",
  GBM: "Global Business Mobility", GAE: "Government Authorised Exchange",
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-bold text-secondary break-words">{value ?? "—"}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
    <h3 className="text-sm font-black text-secondary mb-4">{title}</h3>
    {children}
  </div>
);

const money = (v, ccy = "GBP") =>
  v == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(Number(v));

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
      const downloader = role === "admin" ? downloadAdminLicenceDocument : downloadCaseworkerLicenceDocument;
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

  const handleVerifyDoc = async (docId) => {
    if (actioningDocId) return;
    try {
      setActioningDocId(docId);
      await verifyAppendixDocument(role, id, docId);
      toast.success("Document verified");
      
      const fetcher = role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
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
      // Rejection is a negative outcome — surface it with a danger (red) toast, not the
      // green success style used for verification.
      toast.error("Document rejected");

      const fetcher = role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
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
      setSelectedCaseworkerIds(Array.isArray(app.assignedcaseworkerId) ? app.assignedcaseworkerId : []);
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
      await assignLicenceCaseworker(id, { caseworkerIds: selectedCaseworkerIds });
      toast.success("Caseworker(s) assigned successfully");
      setShowAssignModal(false);
      
      // Refresh application details
      const fetcher = role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
      const res = await fetcher(id);
      setApp(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Assignment failed. Please try again.");
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const fetcher = role === "caseworker" ? getCaseworkerLicenceV2 : getAdminLicenceV2;
        const res = await fetcher(id);
        if (active) setApp(res.data.data);
      } catch (e) {
        if (active) setError(e?.response?.data?.message || "Failed to load application");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id, role]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="animate-spin text-primary" size={26} /></div>;
  }
  if (error || !app) {
    return <div className="p-8 text-center text-sm font-bold text-gray-500">{error || "Application not found."}</div>;
  }

  const org = app.organisationInfo || {};
  const ao = app.authorisingOfficer || {};
  const kc = app.keyContact || {};
  const dec = app.declaration || {};

  return (
    <div className="space-y-6 pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-secondary">Licence Application #{app.id}</h1>
          <p className="text-sm text-gray-500 font-bold">Version 2 · Submitted {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-GB") : "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all text-xs font-black uppercase border border-blue-100 cursor-pointer"
            >
              <UserPlus size={14} /> Assign
            </button>
          )}
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-primary/10 text-primary">{app.status}</span>
          <span className="text-sm font-black text-secondary">{money(app.fee?.total, app.fee?.currency)}</span>
        </div>
      </div>

      <LicenceStages applicationId={app.id} app={app} viewerRole={role} />

      <Section title="Licence Routes">
        <div className="flex flex-wrap gap-2">
          {(app.routes || []).length === 0 && <span className="text-sm text-gray-400">None</span>}
          {(app.routes || []).map((r) => (
            <span key={r} className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-secondary">{ROUTE_LABELS[r] || r}</span>
          ))}
        </div>
      </Section>

      <Section title="Organisation Information">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Organisation type" value={org.organisationType} />
          <Field label="Companies House no." value={org.companiesHouseNumber} />
          <Field label="PAYE reference" value={org.payeReference} />
          <Field label="Accounts Office ref." value={org.accountsOfficeReference} />
          <Field label="VAT number" value={org.vatNumber} />
          <Field label="Trading start date" value={org.tradingStartDate} />
          <Field label="Charity" value={org.charityStatus ? `Yes${org.charityNumber ? ` (${org.charityNumber})` : ""}` : "No"} />
          <Field label="SIC codes" value={(org.sicCodes || []).join(", ")} />
          <Field label="Regions" value={(org.regions || []).join(", ")} />
          <Field label="Accreditations" value={(org.accreditations || []).join(", ")} />
          <Field label="Previous trading names" value={(org.previousTradingNames || []).join(", ")} />
        </div>
      </Section>

      <Section title={`CoS Requirements (${(app.cosRequirements || []).length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] font-black text-gray-400 uppercase">
              <th className="py-2 pr-3">SOC</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Salary</th><th className="py-2 pr-3">Duration</th><th className="py-2 pr-3">Candidate</th>
            </tr></thead>
            <tbody>
              {(app.cosRequirements || []).map((c) => (
                <tr key={c.id} className="border-t border-gray-50">
                  <td className="py-2 pr-3 font-bold">{c.socCode || "—"}</td>
                  <td className="py-2 pr-3">{c.roleTitle || "—"}</td>
                  <td className="py-2 pr-3">{c.salary ? money(c.salary, c.salaryCurrency) : "—"}</td>
                  <td className="py-2 pr-3">{c.sponsorshipDurationMonths ? `${c.sponsorshipDurationMonths} mo` : "—"}</td>
                  <td className="py-2 pr-3">{c.candidateName || "—"}</td>
                </tr>
              ))}
              {(app.cosRequirements || []).length === 0 && <tr><td colSpan={5} className="py-3 text-gray-400">None</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Appendix A Documents">
        <div className="space-y-2">
          {(app.appendixDocuments || []).map((d) => {
            const Icon = d.verificationStatus === "Verified" ? CheckCircle2 : d.verificationStatus === "Rejected" ? XCircle : Clock;
            const tone = d.verificationStatus === "Verified" ? "text-emerald-600" : d.verificationStatus === "Rejected" ? "text-red-600" : "text-amber-600";
            
            const isUploaded = !!d.filePath;
            const uploadedDocs = (app.appendixDocuments || []).filter(doc => doc.filePath);
            const downloadIdx = isUploaded ? uploadedDocs.findIndex(doc => doc.id === d.id) : -1;
            const filename = d.filePath ? d.filePath.split(/[\\/]/).pop() : d.documentName;

            return (
              <div key={d.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={15} className="text-gray-400 shrink-0" />
                  {isUploaded ? (
                    <button
                      onClick={() => handleDownload(downloadIdx, filename)}
                      className="text-sm font-bold text-primary hover:underline text-left truncate flex items-center gap-1"
                      title="Click to download"
                    >
                      {d.documentName}
                      <Download size={12} className="shrink-0" />
                    </button>
                  ) : (
                    <span className="text-sm font-bold text-gray-400 truncate">
                      {d.documentName}{d.required && <span className="text-red-500"> *</span>}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-auto">
                  <span className="text-[11px] font-black text-gray-500">{d.receivedStatus || "Not Received"}</span>
                  <span className={`flex items-center gap-1 text-[11px] font-black ${tone}`}><Icon size={13} /> {d.verificationStatus || "Pending"}</span>
                  {isUploaded && d.verificationStatus !== "Verified" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleVerifyDoc(d.id)}
                        disabled={actioningDocId === d.id}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => openRejectModal(d.id)}
                        disabled={actioningDocId === d.id || d.verificationStatus === "Rejected"}
                        title={d.verificationStatus === "Rejected" ? "Already rejected" : "Reject document"}
                        className="px-2 py-0.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50 disabled:hover:text-red-600"
                      >
                        {d.verificationStatus === "Rejected" ? "Rejected" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {(app.appendixDocuments || []).length === 0 && <p className="text-sm text-gray-400">No documents.</p>}
        </div>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Authorising Officer">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={[ao.title, ao.firstName, ao.lastName].filter(Boolean).join(" ")} />
            <Field label="Date of birth" value={ao.dob} />
            <Field label="Nationality" value={ao.nationality} />
            <Field label="NI number" value={ao.niNumber} />
            <Field label="Immigration status" value={ao.immigrationStatus} />
            <Field label="Convictions" value={ao.hasConvictions ? "Declared" : "None"} />
            <Field label="Email" value={ao.email} />
            <Field label="Phone" value={ao.phone} />
          </div>
        </Section>
        <Section title="Key Contact">
          {kc.sameAsAuthorisingOfficer ? (
            <p className="text-sm font-bold text-gray-500">Same as Authorising Officer</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={[kc.title, kc.firstName, kc.lastName].filter(Boolean).join(" ")} />
              <Field label="Job title" value={kc.jobTitle} />
              <Field label="Email" value={kc.email} />
              <Field label="Phone" value={kc.phone} />
            </div>
          )}
        </Section>
      </div>

      <Section title={`Level 1 Users (${(app.level1Users || []).length})`}>
        <div className="space-y-2">
          {(app.level1Users || []).map((u) => (
            <div key={u.id} className="flex flex-wrap gap-x-6 gap-y-1 text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="font-bold text-secondary">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</span>
              <span className="text-gray-500">{u.email || "—"}</span>
              <span className="text-gray-500">{u.jobTitle || "—"}</span>
              {u.isAuthorisingOfficer && <span className="text-[11px] font-black text-primary">AO</span>}
            </div>
          ))}
          {(app.level1Users || []).length === 0 && <p className="text-sm text-gray-400">None</p>}
        </div>
      </Section>

      <Section title="Declarations">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Accuracy confirmed" value={dec.accuracyConfirmed ? "Yes" : "No"} />
          <Field label="Duties understood" value={dec.dutiesUnderstood ? "Yes" : "No"} />
          <Field label="Data consent" value={dec.dataConsent ? "Yes" : "No"} />
          <Field label="Signatory" value={dec.signatoryName} />
          <Field label="Signatory role" value={dec.signatoryRole} />
          <Field label="Signed date" value={dec.signedDate} />
        </div>
      </Section>

      {/* Assign Caseworker Modal */}
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
                {assignLoading ? <Loader2 size={16} className="animate-spin" /> : <><UserPlus size={16} /> Confirm Assignment</>}
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
                <p className="text-xs font-bold text-gray-400">No caseworkers available to assign.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {caseworkers.map((cw) => {
                  const isSelected = selectedCaseworkerIds.some((id) => String(id) === String(cw.id));
                  return (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCaseworkerIds(selectedCaseworkerIds.filter((id) => String(id) !== String(cw.id)));
                        } else {
                          setSelectedCaseworkerIds([...selectedCaseworkerIds, cw.id]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                        isSelected
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-gray-50 border-gray-100 text-secondary hover:border-gray-200"
                      } shadow-sm group cursor-pointer`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-black">{cw.first_name} {cw.last_name}</p>
                        <p className="text-[10px] opacity-70 font-bold">{cw.email}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "bg-primary border-primary" : "border-gray-200"
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Document Modal (admin + caseworker) — replaces the native prompt */}
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
              {actioningDocId ? <Loader2 size={16} className="animate-spin" /> : <><XCircle size={16} /> Reject Document</>}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-500">
            Tell the sponsor why this document was rejected. They'll be notified and asked to re-upload a corrected copy, and this status updates everywhere the document appears.
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
