import { Loader2 } from "lucide-react";
import ProfileSyncBanner from "./ProfileSyncBanner";

const TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"];
const IMMIGRATION_STATUSES = [
  "British Citizen",
  "Indefinite Leave to Remain",
  "Indefinite Leave to Enter",
  "Settled Status (EU)",
  "Other Leave to Remain",
  "Other",
];

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";
const Field = ({ label, required, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default function Step5AuthorisingOfficer({ data, onChange, onNext, onBack, saving, onSyncFromProfile, syncing, personnelSyncedAt }) {
  const ao = data.authorisingOfficer || {};
  const set = (key, val) => onChange({ authorisingOfficer: { ...ao, [key]: val } });

  const required = ["firstName", "lastName", "dob", "nationality", "niNumber", "immigrationStatus"];
  const canContinue = required.every((f) => ao[f]?.trim?.() || (typeof ao[f] === "string" && ao[f]));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Authorising Officer</h2>
        <p className="text-sm font-bold text-gray-400">
          The Authorising Officer is the senior person responsible for the sponsor licence. They must be a paid director, partner, or senior employee.
        </p>
      </div>

      {onSyncFromProfile && (
        <ProfileSyncBanner onSync={onSyncFromProfile} syncing={syncing} syncedAt={personnelSyncedAt} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Title">
          <select value={ao.title || ""} onChange={(e) => set("title", e.target.value)} className={inp}>
            <option value="">Select</option>
            {TITLES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>

        <div /> {/* spacer */}

        <Field label="First Name" required>
          <input value={ao.firstName || ""} onChange={(e) => set("firstName", e.target.value)} className={inp} placeholder="First name" />
        </Field>

        <Field label="Last Name" required>
          <input value={ao.lastName || ""} onChange={(e) => set("lastName", e.target.value)} className={inp} placeholder="Last name" />
        </Field>

        <Field label="Date of Birth" required>
          <input type="date" value={ao.dob || ""} onChange={(e) => set("dob", e.target.value)} className={inp} />
        </Field>

        <Field label="Nationality" required>
          <input value={ao.nationality || ""} onChange={(e) => set("nationality", e.target.value)} className={inp} placeholder="e.g. British" />
        </Field>

        <Field label="National Insurance Number" required>
          <input value={ao.niNumber || ""} onChange={(e) => set("niNumber", e.target.value.toUpperCase())} className={inp} placeholder="AB 12 34 56 C" />
        </Field>

        <Field label="Immigration Status" required>
          <select value={ao.immigrationStatus || ""} onChange={(e) => set("immigrationStatus", e.target.value)} className={inp}>
            <option value="">Select status</option>
            {IMMIGRATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Email">
          <input type="email" value={ao.email || ""} onChange={(e) => set("email", e.target.value)} className={inp} placeholder="ao@company.com" />
        </Field>

        <Field label="Phone">
          <input type="tel" value={ao.phone || ""} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+44 7700 000000" />
        </Field>
      </div>

      {/* Convictions */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasConvictions"
            checked={!!ao.hasConvictions}
            onChange={(e) => set("hasConvictions", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor="hasConvictions" className="text-sm font-black text-secondary">
            I have unspent criminal convictions to declare
          </label>
        </div>
        {ao.hasConvictions && (
          <Field label="Convictions Details" required>
            <textarea
              value={ao.convictionsDetails || ""}
              onChange={(e) => set("convictionsDetails", e.target.value)}
              className={`${inp} resize-none`}
              rows={4}
              placeholder="Provide details of all unspent convictions…"
            />
          </Field>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">
          Back
        </button>
        <button
          onClick={() => canContinue && onNext({ authorisingOfficer: ao })}
          disabled={!canContinue || saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
