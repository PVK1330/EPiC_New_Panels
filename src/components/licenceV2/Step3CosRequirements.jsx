import { Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";

const EMPTY_ROW = {
  socCode: "", roleTitle: "", numberOfWorkers: 1,
  salary: "", salaryCurrency: "GBP", sponsorshipDurationMonths: "",
};

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";

const Field = ({ label, required, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

function RoleRow({ index, row, onChange, onRemove, totalRows }) {
  const [expanded, setExpanded] = useState(index === 0);
  const set = (key, val) => onChange({ ...row, [key]: val });

  const summary = [row.roleTitle, row.socCode].filter(Boolean).join(" · ") || `Role ${index + 1}`;
  const count = row.numberOfWorkers > 1 ? ` · ${row.numberOfWorkers} workers` : "";

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 text-sm font-black text-secondary hover:bg-gray-100 transition-all"
      >
        <span>#{index + 1} — {summary}{count}</span>
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
            <input
              value={row.socCode ?? ""}
              onChange={(e) => set("socCode", e.target.value)}
              className={inp}
              placeholder="e.g. 2135"
            />
          </Field>
          <Field label="Job Title / Role" required>
            <input
              value={row.roleTitle ?? ""}
              onChange={(e) => set("roleTitle", e.target.value)}
              className={inp}
              placeholder="e.g. Software Engineer"
            />
          </Field>
          <Field label="Number of Workers Required" required>
            <input
              type="number"
              min={1}
              max={9999}
              value={row.numberOfWorkers ?? 1}
              onChange={(e) => set("numberOfWorkers", Math.max(1, parseInt(e.target.value) || 1))}
              className={inp}
            />
          </Field>
          <Field label="Indicative Annual Salary" required>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={row.salary ?? ""}
                onChange={(e) => set("salary", e.target.value)}
                className={inp}
                placeholder="e.g. 35000"
              />
              <select
                value={row.salaryCurrency ?? "GBP"}
                onChange={(e) => set("salaryCurrency", e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-black text-secondary outline-none w-24"
              >
                <option>GBP</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </Field>
          <Field label="Sponsorship Duration (months)" required>
            <input
              type="number"
              min={1}
              max={120}
              value={row.sponsorshipDurationMonths ?? ""}
              onChange={(e) => set("sponsorshipDurationMonths", e.target.value)}
              className={inp}
              placeholder="e.g. 24"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

export default function Step3CosRequirements({ data, onChange, onNext, onBack, saving }) {
  const reqs = data.cosRequirements?.length ? data.cosRequirements : [{ ...EMPTY_ROW }];

  const update = (i, val) => onChange({ cosRequirements: reqs.map((r, idx) => (idx === i ? val : r)) });
  const addRow = () => onChange({ cosRequirements: [...reqs, { ...EMPTY_ROW }] });
  const removeRow = (i) => onChange({ cosRequirements: reqs.filter((_, idx) => idx !== i) });

  const totalWorkers = reqs.reduce((sum, r) => sum + (parseInt(r.numberOfWorkers) || 0), 0);
  const canContinue = totalWorkers > 0 && reqs.some((r) => r.socCode?.trim() && r.roleTitle?.trim() && r.salary && r.numberOfWorkers >= 1 && r.sponsorshipDurationMonths);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">CoS Requirements</h2>
        <p className="text-sm font-bold text-gray-400">
          List each role type you intend to fill. Add one row per role — include the headcount, SOC code, and indicative salary.
          Individual candidate details are assigned after the licence is granted.
        </p>
      </div>

      <div className="space-y-3">
        {reqs.map((row, i) => (
          <RoleRow
            key={i}
            index={i}
            row={row}
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
        <Plus size={16} /> Add Another Role
      </button>

      {totalWorkers > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-black text-secondary">Total CoS requested</span>
          <span className="text-lg font-black text-primary">{totalWorkers}</span>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all"
        >
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
