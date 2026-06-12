import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const EMPTY_COS = {
  socCode: "", roleTitle: "", salary: "", salaryCurrency: "GBP",
  candidateName: "", candidateNationality: "", candidateDob: "",
  candidateEmail: "", sponsorshipDurationMonths: "",
};

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";
const Field = ({ label, children, required }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

function CosRow({ index, cos, onChange, onRemove, totalRows }) {
  const [expanded, setExpanded] = useState(index === 0);
  const set = (key, val) => onChange({ ...cos, [key]: val });
  const summary = [cos.roleTitle, cos.socCode].filter(Boolean).join(" · ") || `Requirement ${index + 1}`;

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 text-sm font-black text-secondary hover:bg-gray-100 transition-all"
      >
        <span>#{index + 1} — {summary}</span>
        <div className="flex items-center gap-3">
          {totalRows > 1 && (
            <span
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
            >
              <Trash2 size={15} />
            </span>
          )}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SOC Code" required>
            <input value={cos.socCode ?? ""} onChange={(e) => set("socCode", e.target.value)} className={inp} placeholder="e.g. 2135" />
          </Field>
          <Field label="Role Title" required>
            <input value={cos.roleTitle ?? ""} onChange={(e) => set("roleTitle", e.target.value)} className={inp} placeholder="e.g. Software Engineer" />
          </Field>
          <Field label="Gross Salary (£)" required>
            <div className="flex gap-2">
              <input type="number" min={0} value={cos.salary ?? ""} onChange={(e) => set("salary", e.target.value)} className={inp} placeholder="35000" />
              <select value={cos.salaryCurrency ?? "GBP"} onChange={(e) => set("salaryCurrency", e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-black text-secondary outline-none w-24">
                <option>GBP</option><option>USD</option><option>EUR</option>
              </select>
            </div>
          </Field>
          <Field label="Sponsorship Duration (months)" required>
            <input type="number" min={1} max={120} value={cos.sponsorshipDurationMonths ?? ""} onChange={(e) => set("sponsorshipDurationMonths", e.target.value)} className={inp} placeholder="24" />
          </Field>
          <Field label="Candidate Name">
            <input value={cos.candidateName ?? ""} onChange={(e) => set("candidateName", e.target.value)} className={inp} placeholder="If known" />
          </Field>
          <Field label="Candidate Nationality">
            <input value={cos.candidateNationality ?? ""} onChange={(e) => set("candidateNationality", e.target.value)} className={inp} placeholder="e.g. Indian" />
          </Field>
          <Field label="Candidate Date of Birth">
            <input type="date" value={cos.candidateDob ?? ""} onChange={(e) => set("candidateDob", e.target.value)} className={inp} />
          </Field>
          <Field label="Candidate Email">
            <input type="email" value={cos.candidateEmail ?? ""} onChange={(e) => set("candidateEmail", e.target.value)} className={inp} placeholder="candidate@example.com" />
          </Field>
        </div>
      )}
    </div>
  );
}

export default function Step3CosRequirements({ data, onChange, onNext, onBack, saving }) {
  const reqs = data.cosRequirements?.length ? data.cosRequirements : [{ ...EMPTY_COS }];

  const update = (i, val) => {
    const next = reqs.map((r, idx) => (idx === i ? val : r));
    onChange({ cosRequirements: next });
  };
  const addRow = () => onChange({ cosRequirements: [...reqs, { ...EMPTY_COS }] });
  const removeRow = (i) => onChange({ cosRequirements: reqs.filter((_, idx) => idx !== i) });

  const canContinue = reqs.some((r) => r.socCode?.trim() && r.roleTitle?.trim() && r.salary && r.sponsorshipDurationMonths);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">CoS Requirements</h2>
        <p className="text-sm font-bold text-gray-400">Add at least one Certificate of Sponsorship requirement. Each row represents one sponsored worker or role.</p>
      </div>

      <div className="space-y-3">
        {reqs.map((cos, i) => (
          <CosRow
            key={i}
            index={i}
            cos={cos}
            onChange={(val) => update(i, val)}
            onRemove={() => removeRow(i)}
            totalRows={reqs.length}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm font-black text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Another Requirement
      </button>

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">
          Back
        </button>
        <button
          onClick={() => canContinue && onNext({ cosRequirements: reqs })}
          disabled={!canContinue || saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
