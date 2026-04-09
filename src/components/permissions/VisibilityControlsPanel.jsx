import { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import { CASE_VISIBILITY_OPTIONS } from "./permissionsData";

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
