import { useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2, Send } from "lucide-react";

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";
const Field = ({ label, required, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const DECLARATIONS = [
  { key: "accuracyConfirmed", label: "I confirm that all the information provided in this application is accurate and complete to the best of my knowledge." },
  { key: "dutiesUnderstood", label: "I understand the duties and responsibilities of a licensed sponsor under UK immigration law." },
  { key: "dataConsent", label: "I consent to the processing of personal data provided in this application for the purposes of assessing the licence application." },
];

export default function Step8Declarations({ data, onChange, onBack, onSubmit, submitting, submitErrors }) {
  const dec = data.declarations || {};

  const set = (key, val) => onChange({ declarations: { ...dec, [key]: val } });

  const allChecked = DECLARATIONS.every((d) => dec[d.key] === true);
  const canSubmit = allChecked && dec.signatoryName?.trim() && dec.signedDate;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Declarations &amp; Submit</h2>
        <p className="text-sm font-bold text-gray-400">Make your declarations and submit your application.</p>
      </div>

      {/* Declaration checkboxes */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Declarations *</p>
        {DECLARATIONS.map(({ key, label }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!dec[key]}
              onChange={(e) => set(key, e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-primary shrink-0"
            />
            <span className={`text-sm font-bold leading-relaxed ${dec[key] ? "text-secondary" : "text-gray-500"}`}>{label}</span>
          </label>
        ))}
      </div>

      {/* Signatory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Signatory Full Name" required>
          <input value={dec.signatoryName || ""} onChange={(e) => set("signatoryName", e.target.value)} className={inp} placeholder="Full legal name" />
        </Field>
        <Field label="Signatory Role / Job Title">
          <input value={dec.signatoryRole || ""} onChange={(e) => set("signatoryRole", e.target.value)} className={inp} placeholder="e.g. Director" />
        </Field>
        <Field label="Date of Signature" required>
          <input type="date" value={dec.signedDate || ""} onChange={(e) => set("signedDate", e.target.value)} className={inp} />
        </Field>
      </div>

      {/* Submission errors */}
      {submitErrors?.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm font-black text-red-600">Please complete all required sections before submitting:</p>
          </div>
          <ul className="space-y-1 ml-6 list-disc">
            {submitErrors.map((e, i) => (
              <li key={i} className="text-xs font-bold text-red-500">{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} disabled={submitting} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40">
          Back
        </button>
        <button
          onClick={() => !submitting && canSubmit && onSubmit({ declarations: dec })}
          disabled={!canSubmit || submitting}
          className="bg-secondary text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-secondary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Submitting…</>
          ) : (
            <><Send size={16} /> Submit Application</>
          )}
        </button>
      </div>
    </div>
  );
}
