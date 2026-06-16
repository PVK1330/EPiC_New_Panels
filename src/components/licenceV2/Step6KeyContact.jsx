import { Loader2 } from "lucide-react";
import ProfileSyncBanner from "./ProfileSyncBanner";

const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";
const Field = ({ label, required, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default function Step6KeyContact({ data, onChange, onNext, onBack, saving, onSyncFromProfile, syncing, personnelSyncedAt }) {
  const kc = data.keyContact || {};
  const ao = data.authorisingOfficer || {};
  const same = !!kc.sameAsAuthorisingOfficer;

  const set = (key, val) => onChange({ keyContact: { ...kc, [key]: val } });
  const toggleSame = (checked) => {
    if (checked) {
      onChange({
        keyContact: {
          sameAsAuthorisingOfficer: true,
          firstName: ao.firstName || "",
          lastName: ao.lastName || "",
          email: ao.email || "",
          phone: ao.phone || "",
          title: ao.title || "",
          jobTitle: kc.jobTitle || "",
        },
      });
    } else {
      onChange({ keyContact: { ...kc, sameAsAuthorisingOfficer: false } });
    }
  };

  const canContinue = same || (kc.firstName?.trim() && kc.lastName?.trim() && kc.email?.trim() && kc.phone?.trim());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Key Contact</h2>
        <p className="text-sm font-bold text-gray-400">The Key Contact is the main day-to-day liaison for the sponsor licence. They may be the same person as the Authorising Officer.</p>
      </div>

      {onSyncFromProfile && (
        <ProfileSyncBanner onSync={onSyncFromProfile} syncing={syncing} syncedAt={personnelSyncedAt} />
      )}

      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
        <input
          type="checkbox"
          id="sameAsAO"
          checked={same}
          onChange={(e) => toggleSame(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="sameAsAO" className="text-sm font-black text-secondary">
          Same as Authorising Officer ({[ao.firstName, ao.lastName].filter(Boolean).join(" ") || "not entered yet"})
        </label>
      </div>

      {!same && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="First Name" required>
            <input value={kc.firstName || ""} onChange={(e) => set("firstName", e.target.value)} className={inp} placeholder="First name" />
          </Field>
          <Field label="Last Name" required>
            <input value={kc.lastName || ""} onChange={(e) => set("lastName", e.target.value)} className={inp} placeholder="Last name" />
          </Field>
          <Field label="Email" required>
            <input type="email" value={kc.email || ""} onChange={(e) => set("email", e.target.value)} className={inp} placeholder="keycontact@company.com" />
          </Field>
          <Field label="Phone" required>
            <input type="tel" value={kc.phone || ""} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+44 7700 000000" />
          </Field>
          <Field label="Job Title">
            <input value={kc.jobTitle || ""} onChange={(e) => set("jobTitle", e.target.value)} className={inp} placeholder="e.g. HR Manager" />
          </Field>
        </div>
      )}

      {same && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm font-bold text-blue-700">
          Key contact details will be taken from the Authorising Officer.
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">
          Back
        </button>
        <button
          onClick={() => canContinue && onNext({ keyContact: kc })}
          disabled={!canContinue || saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
