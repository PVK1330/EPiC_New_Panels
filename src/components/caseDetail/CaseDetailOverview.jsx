import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { formatDateLong } from "../../utils/datetime";
import CaseWorkflowProgress from "../case/CaseWorkflowProgress";
import CaseWorkflowBadge from "../case/CaseWorkflowBadge";

const Field = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{label}</p>
    <div className="text-sm font-semibold text-secondary">{children}</div>
  </div>
);

const CaseDetailOverview = ({ data }) => {
  const c = data.candidate;
  const s = data.sponsor;
  const k = data.case;
  const p = data.progress;

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-gray-100">
          Candidate Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">{c.fullName}</Field>
          <Field label="Date of Birth">{c.dob}</Field>
          <Field label="Nationality">{c.nationality}</Field>
          <Field label="Passport No.">
            <span className="font-mono text-xs">{c.passport}</span>
          </Field>
          <Field label="Email">
            <span className="text-primary font-semibold">{c.email}</span>
          </Field>
          <Field label="Phone">
            <span className="font-mono text-xs">{c.phone}</span>
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-gray-100">
          Sponsor Information
        </h3>
        {/* BUG-031: a private client has no sponsor — show that plainly instead of
            a grid of "N/A" fields that reads like missing data. */}
        {s.hasSponsor === false ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name">
              <span className="text-gray-500 font-semibold">No sponsor (private client)</span>
            </Field>
            <Field label="Assigned Caseworker">{s.caseworker}</Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name">{s.company}</Field>
            <Field label="Licence No.">
              <span className="font-mono text-xs">{s.licenceNo}</span>
            </Field>
            <Field label="Licence Status">
              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-black bg-green-100 text-green-800">
                {s.licenceStatus}
              </span>
            </Field>
            <Field label="Licence Expiry">
              <span className="text-green-600 font-bold">{s.licenceExpiry}</span>
            </Field>
            <Field label="Contact">{s.contact}</Field>
            <Field label="Assigned Caseworker">{s.caseworker}</Field>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-gray-100">
          Case Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Visa Type</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
              {k.visaType}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Workflow stage</p>
            <CaseWorkflowBadge caseRecord={{ caseStage: k.caseStage, status: k.caseStatus }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Legacy status</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-black bg-gray-100 text-gray-700">
              {k.caseStatus || "—"}
            </span>
          </div>
          <Field label="Date Opened">{k.dateOpened}</Field>
          <Field label="Target Date">
            <span className="text-green-600 font-bold">{k.targetDate}</span>
          </Field>
          <Field label="Visa Expiry">
            <span className="text-green-600 font-bold">{k.visaExpiry}</span>
          </Field>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Payment Status</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-black bg-green-100 text-green-800">
              {k.paymentStatus}
            </span>
          </div>
          {k.proposedAmount != null && Number(k.proposedAmount) > 0 && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">
                Admin CCL fee (candidate payment due)
              </p>
              <p className="text-lg font-black text-emerald-900">
                £
                {Number(k.proposedAmount).toLocaleString("en-GB", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-[10px] font-bold text-emerald-800/80 mt-0.5">
                Client Care Letter fee set at assignment — this is what the candidate must pay.
              </p>
            </div>
          )}
        </div>
      </div>

      <CaseWorkflowProgress
        caseRecord={{ caseStage: k.caseStage, status: k.caseStatus }}
        compact
      />

      {(k.biometricLocation || k.biometricsDate || k.biometricTime) && (
        <div className="bg-white rounded-xl border border-primary/20 shadow-sm p-5 lg:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Biometrics appointment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Location">{k.biometricLocation || "—"}</Field>
            <Field label="Date">
              {k.biometricsDate
                ? formatDateLong(k.biometricsDate, { month: "short" })
                : "—"}
              {k.biometricDay ? ` (${k.biometricDay})` : ""}
            </Field>
            <Field label="Time slot">{k.biometricTime || "—"}</Field>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 pb-2 border-b border-gray-100">
          Case Progress
        </h3>
        <div className="mb-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
            <span>Overall Completion</span>
            <span>{p.pct}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${p.pct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 border-l-[3px] border-l-green-500">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Documents</p>
            <p className="text-sm font-black text-green-600 mt-1">{p.documents}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 border-l-[3px] border-l-amber-400">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Tasks</p>
            <p className="text-sm font-black text-amber-600 mt-1">{p.tasks}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 border-l-[3px] border-l-green-500">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Payment</p>
            <p className="text-sm font-black text-green-600 mt-1">{p.payment}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 border-l-[3px] border-l-secondary">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Days Left</p>
            <p className="text-sm font-black text-secondary mt-1">{p.daysLeft}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CaseDetailOverview;
