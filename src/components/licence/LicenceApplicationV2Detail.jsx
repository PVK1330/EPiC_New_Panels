import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getAdminLicenceV2, getCaseworkerLicenceV2 } from "../../services/licenceV2Api";

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
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-primary/10 text-primary">{app.status}</span>
          <span className="text-sm font-black text-secondary">{money(app.fee?.total, app.fee?.currency)}</span>
        </div>
      </div>

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
            return (
              <div key={d.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={15} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-bold text-secondary truncate">{d.documentName}{d.required && <span className="text-red-500"> *</span>}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-black text-gray-500">{d.receivedStatus}</span>
                  <span className={`flex items-center gap-1 text-[11px] font-black ${tone}`}><Icon size={13} /> {d.verificationStatus}</span>
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
    </div>
  );
}
