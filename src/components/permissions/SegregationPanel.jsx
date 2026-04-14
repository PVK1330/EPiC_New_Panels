import { useState } from "react";
import Input from "../Input";
import Button from "../Button";

const SegregationPanel = () => {
  const [policyNotes, setPolicyNotes] = useState(
    "External users never receive internal-only case notes or sponsor financial identifiers."
  );
  const [escalationEmail, setEscalationEmail] = useState("security@elitepic.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black text-secondary">Internal / External Segregation</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Data boundaries between staff and portal users (clients & sponsors)
        </p>
      </div>
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-secondary/30 border-l-4 border-l-secondary bg-blue-50/40">
            <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">Internal Users</p>
            <p className="text-sm font-bold text-secondary mb-1">Super Admin, Admin, Caseworker</p>
            <p className="text-xs text-gray-500 mb-4">Full operational access within licence constraints</p>
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800">
                Can view internal notes
              </span>
              <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800">
                Can view financial controls
              </span>
              <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800">
                Full audit log access
              </span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 border-l-4 border-l-gray-400 bg-gray-50/80">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">External Users</p>
            <p className="text-sm font-bold text-secondary mb-1">Client, Sponsor</p>
            <p className="text-xs text-gray-500 mb-4">Portal-only; scoped to own submissions</p>
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-200 text-gray-700">
                Internal notes hidden
              </span>
              <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-200 text-gray-700">
                Financial controls hidden
              </span>
              <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-200 text-gray-700">
                Own data only
              </span>
            </div>
          </div>
        </div>

        <div>
          <Input
            label="Escalation Contact Email"
            name="escalationEmail"
            type="email"
            value={escalationEmail}
            onChange={(e) => setEscalationEmail(e.target.value)}
            placeholder="security@organisation.com"
          />
        </div>

        <div>
          <Input
            label="Segregation Policy Notes"
            name="policyNotes"
            value={policyNotes}
            onChange={(e) => setPolicyNotes(e.target.value)}
            rows={4}
            placeholder="Document how internal vs external segregation is enforced…"
          />
        </div>

        {/* <pre className="p-4 rounded-xl bg-gray-900 text-green-400 text-xs font-mono overflow-x-auto border border-gray-700">
          <span className="text-gray-500">{"// Segregation logic (reference)"}</span>
          {"\n"}
          <span className="text-purple-400">if</span> (user.type === <span className="text-amber-300">&apos;external&apos;</span>) {"{"}
          {"\n"}  hideInternalNotes = <span className="text-green-400">true</span>;
          {"\n"}  hideFinancialControls = <span className="text-green-400">true</span>;
          {"\n"}
          {"}"}
        </pre> */}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" onClick={handleSave} className="rounded-xl">
            Save Segregation Policy
          </Button>
          {saved && (
            <span className="text-xs font-bold text-green-600">Policy saved locally.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegregationPanel;
