import { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import { CASE_VISIBILITY_OPTIONS } from "./permissionsData";
import { FiCheck, FiShield, FiUser, FiX, FiLock, FiUnlock } from "react-icons/fi";

// ─── Mock caseworker list (replace with real data / prop) ─────────────────────
const CASEWORKERS = [
  { id: "ap", name: "Alice Patel",   initials: "AP", avatarBg: "bg-blue-500",   role: "Senior Caseworker" },
  { id: "mg", name: "Marcus Green",  initials: "MG", avatarBg: "bg-green-500",  role: "Caseworker" },
  { id: "jo", name: "James Osei",    initials: "JO", avatarBg: "bg-red-500",    role: "Caseworker" },
  { id: "sr", name: "Sofia Rahman",  initials: "SR", avatarBg: "bg-purple-500", role: "Junior Caseworker" },
  { id: "lk", name: "Lena Kim",      initials: "LK", avatarBg: "bg-amber-500",  role: "Senior Caseworker" },
];

const CASEWORKER_OPTIONS = [
  { value: "", label: "Select a caseworker…" },
  ...CASEWORKERS.map((c) => ({ value: c.id, label: c.name })),
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ToggleRow = ({ title, description, checked, onChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div>
      <p className="text-sm font-bold text-secondary">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

// Badge chip for a granted caseworker
const PermissionChip = ({ worker, onRevoke }) => (
  <div className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 bg-green-50 border border-green-200 rounded-lg">
    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white shrink-0 ${worker.avatarBg}`}>
      {worker.initials}
    </div>
    <span className="text-xs font-semibold text-green-800">{worker.name}</span>
    <button
      type="button"
      onClick={() => onRevoke(worker.id)}
      className="ml-0.5 text-green-400 hover:text-red-500 transition-colors"
      aria-label={`Revoke payment access for ${worker.name}`}
    >
      <FiX size={12} />
    </button>
  </div>
);

// ─── Payment Permission Section ───────────────────────────────────────────────

const PaymentPermissionSection = () => {
  const [selectedId, setSelectedId] = useState("");
  const [granted, setGranted] = useState(new Set(["ap"])); // Alice has access by default
  const [flash, setFlash] = useState(null); // { id, type: "grant" | "revoke" }

  const selectedWorker = CASEWORKERS.find((c) => c.id === selectedId);
  const alreadyGranted = selectedId ? granted.has(selectedId) : false;

  function handleGrant() {
    if (!selectedId || alreadyGranted) return;
    setGranted((prev) => new Set([...prev, selectedId]));
    setFlash({ id: selectedId, type: "grant" });
    setSelectedId("");
    setTimeout(() => setFlash(null), 2000);
  }

  function handleRevoke(id) {
    setGranted((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setFlash({ id, type: "revoke" });
    setTimeout(() => setFlash(null), 2000);
  }

  const grantedWorkers = CASEWORKERS.filter((c) => granted.has(c.id));
  const flashWorker = flash ? CASEWORKERS.find((c) => c.id === flash.id) : null;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
          <FiShield size={13} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-black text-secondary uppercase tracking-wide">Payment Details Access</p>
          <p className="text-[11px] text-gray-400">Grant individual caseworkers permission to view payment information</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 bg-white">

        {/* Grant control row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Input
              label="Select Caseworker"
              name="paymentCaseworker"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              options={CASEWORKER_OPTIONS}
            />
          </div>

          {/* Selected worker preview */}
          {selectedWorker && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 shrink-0 self-end mb-0 sm:mb-0">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-white ${selectedWorker.avatarBg}`}>
                {selectedWorker.initials}
              </div>
              <span className="font-semibold text-secondary">{selectedWorker.name}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{selectedWorker.role}</span>
              {alreadyGranted && (
                <span className="ml-1 flex items-center gap-0.5 text-green-600 font-bold">
                  <FiCheck size={11} /> Access granted
                </span>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={handleGrant}
            disabled={!selectedId || alreadyGranted}
            className="rounded-xl shrink-0 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiUnlock size={13} />
            Grant Access
          </Button>
        </div>

        {/* Flash feedback */}
        {flash && flashWorker && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            flash.type === "grant"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {flash.type === "grant" ? <FiUnlock size={12} /> : <FiLock size={12} />}
            {flash.type === "grant"
              ? `Payment access granted to ${flashWorker.name}`
              : `Payment access revoked for ${flashWorker.name}`}
          </div>
        )}

        {/* Granted list */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
            Caseworkers with payment access
            {grantedWorkers.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 font-black text-[9px]">
                {grantedWorkers.length}
              </span>
            )}
          </p>

          {grantedWorkers.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <FiUser size={13} className="text-gray-300" />
              <p className="text-xs text-gray-400">No caseworkers have been granted payment access yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {grantedWorkers.map((w) => (
                <PermissionChip key={w.id} worker={w} onRevoke={handleRevoke} />
              ))}
            </div>
          )}
        </div>

        {/* Summary note */}
        <p className="text-[11px] text-gray-400 leading-relaxed pt-1 border-t border-gray-100">
          <span className="font-bold text-gray-500">Note:</span> Caseworkers not listed here will see payment fields
          redacted. Changes take effect immediately and are logged in the audit trail.
        </p>
      </div>
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────

const VisibilityControlsPanel = () => {
  const [financial, setFinancial] = useState(true);
  const [compliance, setCompliance] = useState(true);
  const [caseScope, setCaseScope] = useState("own");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black text-secondary">Visibility Controls</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Organisation-wide visibility rules for sensitive data
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <ToggleRow
          title="Financial Visibility"
          description="Toggle access to all financial data and reports for eligible roles"
          checked={financial}
          onChange={setFinancial}
        />
        <ToggleRow
          title="Compliance Visibility"
          description="Show compliance dashboard and audit data to authorised users"
          checked={compliance}
          onChange={setCompliance}
        />

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex-1 w-full">
            <Input
              label="Case Visibility Scope"
              name="caseScope"
              value={caseScope}
              onChange={(e) => setCaseScope(e.target.value)}
              options={CASE_VISIBILITY_OPTIONS}
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Controls which cases each caseworker can view by default
            </p>
          </div>
        </div>

        {/* ── New: Payment permission per caseworker ── */}
        <PaymentPermissionSection />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" variant="primary" onClick={handleSave} className="rounded-xl">
            Save Visibility Settings
          </Button>
          {saved && (
            <span className="text-xs font-bold text-green-600">Settings saved locally.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisibilityControlsPanel;
