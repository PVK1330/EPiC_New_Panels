import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { RiUserAddLine } from "react-icons/ri";
import Input from "../../components/Input";
import Button from "../../components/Button";

const CASE_OPTIONS = [
  { value: "vf2841", label: "#VF-2841 — Priya Sharma" },
  { value: "vf2839", label: "#VF-2839 — James Okoye" },
  { value: "vf2835", label: "#VF-2835 — Li Wei" },
];

const CASE_META = {
  vf2841: { current: "Alice Patel", caseLabel: "#VF-2841 — Priya Sharma" },
  vf2839: { current: "Alice Patel", caseLabel: "#VF-2839 — James Okoye" },
  vf2835: { current: "Alice Patel", caseLabel: "#VF-2835 — Li Wei" },
};

const ASSIGN_TO_OPTIONS = [
  { value: "alice", label: "Alice Patel (21 active)" },
  { value: "marcus", label: "Marcus Green (16 active)" },
  { value: "fatima", label: "Fatima Khan (18 active)" },
  { value: "james", label: "James Osei (23 active)" },
  { value: "rina", label: "Rina Mehta (13 active)" },
];

const TEAM = [
  { name: "Alice Patel", pct: 87, val: 21, bar: "bg-blue-500" },
  { name: "Marcus Green", pct: 65, val: 16, bar: "bg-green-500" },
  { name: "Fatima Khan", pct: 72, val: 18, bar: "bg-amber-400" },
  { name: "James Osei", pct: 92, val: 23, bar: "bg-red-500" },
  { name: "Rina Mehta", pct: 50, val: 13, bar: "bg-blue-400" },
];

const AdminAssign = () => {
  const [caseId, setCaseId] = useState("vf2841");
  const [assignTo, setAssignTo] = useState("marcus");
  const [reason, setReason] = useState("");
  const [reasonErr, setReasonErr] = useState("");
  const [saved, setSaved] = useState(false);

  const current = useMemo(() => CASE_META[caseId] || CASE_META.vf2841, [caseId]);

  const recommended = "Rina Mehta";

  const submit = () => {
    if (!reason.trim()) {
      setReasonErr("Reason is required");
      return;
    }
    setReasonErr("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <RiUserAddLine size={32} className="text-primary shrink-0 mt-1" />
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Assign / Reassign Cases</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage case assignments and workload distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Reassign Case</h2>
          <div className="space-y-4">
            <Input
              label="Case ID"
              name="caseId"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              options={CASE_OPTIONS}
            />
            <Input
              label="Current Caseworker"
              name="current"
              value={current.current}
              onChange={() => {}}
              readOnly
            />
            <Input
              label="Assign To"
              name="assignTo"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              options={ASSIGN_TO_OPTIONS}
            />
            <Input
              label="Reason for Reassignment"
              name="reason"
              value={reason}
              onChange={(e) => { setReason(e.target.value); setReasonErr(""); }}
              rows={4}
              placeholder="Enter reason (e.g. leave, capacity, expertise)…"
              error={reasonErr}
            />
            <Button type="button" variant="primary" className="rounded-xl w-full sm:w-auto" onClick={submit}>
              Confirm Reassignment
            </Button>
            {saved && <p className="text-xs font-bold text-green-600">Reassignment saved locally.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Team Capacity at a Glance</h2>
          <div className="space-y-4">
            {TEAM.map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <p className="text-xs font-semibold text-gray-600 w-28 shrink-0 truncate">{m.name}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${m.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-black text-secondary w-6 text-right tabular-nums">{m.val}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 align-middle" />
              Recommended:{" "}
              <span className="font-black text-green-600">{recommended}</span> has lowest active caseload
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAssign;
