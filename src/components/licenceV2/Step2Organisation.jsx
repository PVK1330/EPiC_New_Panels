import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import ProfileSyncBanner from "./ProfileSyncBanner";
import DatePicker from "../DatePicker";

const ORG_TYPES = [
  "Limited Company",
  "Limited Liability Partnership",
  "Public Limited Company",
  "Partnership",
  "Sole Trader",
  "Charity",
  "Government / Public Sector",
  "Other",
];

const Field = ({ label, required, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";

function TagInput({ values = [], onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 min-h-[48px]">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs font-black text-secondary rounded-lg px-2 py-1">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-gray-400 hover:text-red-500">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={placeholder}
        className="flex-1 min-w-[100px] bg-transparent text-sm font-bold text-secondary outline-none"
      />
    </div>
  );
}

export default function Step2Organisation({ data, onChange, onNext, onBack, saving, onSyncFromProfile, syncing, personnelSyncedAt }) {
  const org = data.organisationInfo || {};
  const set = (key, val) => onChange({ organisationInfo: { ...org, [key]: val } });

  const canContinue = org.organisationType && org.companiesHouseNumber && org.tradingStartDate;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Organisation Information</h2>
        <p className="text-sm font-bold text-gray-400">Tell us about your organisation's legal structure and registration details.</p>
      </div>

      {onSyncFromProfile && (
        <ProfileSyncBanner onSync={onSyncFromProfile} syncing={syncing} syncedAt={personnelSyncedAt} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Organisation Type" required>
          <select value={org.organisationType || ""} onChange={(e) => set("organisationType", e.target.value)} className={inp}>
            <option value="">Select type</option>
            {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>

        <Field label="Companies House Number" required>
          <input value={org.companiesHouseNumber || ""} onChange={(e) => set("companiesHouseNumber", e.target.value)} className={inp} placeholder="e.g. 12345678" />
        </Field>

        <Field label="PAYE Reference">
          <input value={org.payeReference || ""} onChange={(e) => set("payeReference", e.target.value)} className={inp} placeholder="123/AB45678" />
        </Field>

        <Field label="Accounts Office Reference">
          <input value={org.accountsOfficeReference || ""} onChange={(e) => set("accountsOfficeReference", e.target.value)} className={inp} placeholder="123PA00123456" />
        </Field>

        <Field label="VAT Number">
          <input value={org.vatNumber || ""} onChange={(e) => set("vatNumber", e.target.value)} className={inp} placeholder="GB 123456789" />
        </Field>

        <Field label="Trading Start Date" required>
          <DatePicker
            name="tradingStartDate"
            value={org.tradingStartDate || ""}
            onChange={(e) => set("tradingStartDate", e.target.value)}
            placeholder="Select date"
          />
        </Field>
      </div>

      {/* Charity */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="charityStatus"
          checked={!!org.charityStatus}
          onChange={(e) => set("charityStatus", e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="charityStatus" className="text-sm font-black text-secondary">Registered charity</label>
      </div>
      {org.charityStatus && (
        <Field label="Charity Number">
          <input value={org.charityNumber || ""} onChange={(e) => set("charityNumber", e.target.value)} className={inp} placeholder="Charity Commission number" />
        </Field>
      )}

      <Field label="SIC Codes">
        <TagInput values={org.sicCodes || []} onChange={(v) => set("sicCodes", v)} placeholder="Type code + Enter" />
        <p className="text-[11px] font-bold text-gray-400 mt-1">Standard Industrial Classification codes. Press Enter after each.</p>
      </Field>

      <Field label="UK Regions of Operation">
        <TagInput values={org.regions || []} onChange={(v) => set("regions", v)} placeholder="e.g. London, South East" />
      </Field>

      <Field label="Accreditations / Memberships">
        <TagInput values={org.accreditations || []} onChange={(v) => set("accreditations", v)} placeholder="e.g. ISO 9001, CIPD" />
      </Field>

      <Field label="Previous Trading Names">
        <TagInput values={org.previousTradingNames || []} onChange={(v) => set("previousTradingNames", v)} placeholder="Any former business names" />
      </Field>

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl transition-all hover:bg-gray-200 active:scale-95">
          Back
        </button>
        <button
          onClick={() => canContinue && onNext({ organisationInfo: org })}
          disabled={!canContinue || saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
