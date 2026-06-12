import { Plus, Trash2, Loader2 } from "lucide-react";

const EMPTY_L1 = { firstName: "", lastName: "", email: "", phone: "", jobTitle: "", isAuthorisingOfficer: false };
const inp = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-secondary outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20";
const Field = ({ label, required, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

function L1Row({ index, user, onChange, onRemove, totalRows }) {
  const set = (key, val) => onChange({ ...user, [key]: val });
  return (
    <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">User {index + 1}</p>
        {totalRows > 1 && (
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" required>
          <input value={user.firstName} onChange={(e) => set("firstName", e.target.value)} className={inp} placeholder="First name" />
        </Field>
        <Field label="Last Name" required>
          <input value={user.lastName} onChange={(e) => set("lastName", e.target.value)} className={inp} placeholder="Last name" />
        </Field>
        <Field label="Email" required>
          <input type="email" value={user.email} onChange={(e) => set("email", e.target.value)} className={inp} placeholder="user@company.com" />
        </Field>
        <Field label="Phone">
          <input type="tel" value={user.phone} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+44 7700 000000" />
        </Field>
        <Field label="Job Title">
          <input value={user.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} className={inp} placeholder="e.g. HR Coordinator" />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`l1-ao-${index}`}
          checked={!!user.isAuthorisingOfficer}
          onChange={(e) => set("isAuthorisingOfficer", e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor={`l1-ao-${index}`} className="text-sm font-bold text-secondary">This person is also the Authorising Officer</label>
      </div>
    </div>
  );
}

export default function Step7Level1Users({ data, onChange, onNext, onBack, saving }) {
  const users = data.level1Users?.length ? data.level1Users : [{ ...EMPTY_L1 }];

  const update = (i, val) => onChange({ level1Users: users.map((u, idx) => (idx === i ? val : u)) });
  const addUser = () => onChange({ level1Users: [...users, { ...EMPTY_L1 }] });
  const removeUser = (i) => onChange({ level1Users: users.filter((_, idx) => idx !== i) });

  const canContinue = users.some((u) => u.firstName?.trim() && u.lastName?.trim() && u.email?.trim());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-secondary mb-1">Level 1 Users</h2>
        <p className="text-sm font-bold text-gray-400">
          Level 1 Users have full access to the Sponsor Management System. Add at least one. They must be paid employees or directors.
        </p>
      </div>

      <div className="space-y-4">
        {users.map((user, i) => (
          <L1Row
            key={i}
            index={i}
            user={user}
            onChange={(val) => update(i, val)}
            onRemove={() => removeUser(i)}
            totalRows={users.length}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addUser}
        className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm font-black text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Level 1 User
      </button>

      <div className="flex justify-between">
        <button onClick={onBack} className="bg-gray-100 text-secondary font-black px-6 py-3 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">
          Back
        </button>
        <button
          onClick={() => canContinue && onNext({ level1Users: users })}
          disabled={!canContinue || saving}
          className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
