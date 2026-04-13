import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { RiUserAddLine } from "react-icons/ri";
import { Search, Check } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { INITIAL_CASES } from "../../data/casesData";

const CASE_WORKERS = [
  { id: "alice", name: "Alice Patel", active: 21 },
  { id: "marcus", name: "Marcus Green", active: 16 },
  { id: "fatima", name: "Fatima Khan", active: 18 },
  { id: "james", name: "James Osei", active: 23 },
  { id: "rina", name: "Rina Mehta", active: 13 },
];

const CASE_OPTIONS = INITIAL_CASES.map((c) => ({
  value: c.caseId,
  label: `${c.caseId} — ${c.candidate}`,
}));

const ASSIGN_TO_OPTIONS = CASE_WORKERS.map((w) => ({
  value: w.id,
  label: `${w.name} (${w.active} active)`,
}));

const TEAM = [
  { name: "Alice Patel", pct: 87, val: 21, bar: "bg-blue-500" },
  { name: "Marcus Green", pct: 65, val: 16, bar: "bg-green-500" },
  { name: "Fatima Khan", pct: 72, val: 18, bar: "bg-amber-400" },
  { name: "James Osei", pct: 92, val: 23, bar: "bg-red-500" },
  { name: "Rina Mehta", pct: 50, val: 13, bar: "bg-blue-400" },
];

const AdminAssign = () => {
  const [caseId, setCaseId] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [assignTo, setAssignTo] = useState([]);
  const [reason, setReason] = useState("");
  const [reasonErr, setReasonErr] = useState("");
  const [saved, setSaved] = useState(false);

  const current = useMemo(() => {
    const selectedCase = INITIAL_CASES.find((c) => c.caseId === caseId);
    return selectedCase || { caseworker: "Unassigned", caseLabel: "" };
  }, [caseId]);

  const filteredCaseOptions = useMemo(() => {
    if (!caseSearch) return CASE_OPTIONS;
    return CASE_OPTIONS.filter((c) =>
      c.label.toLowerCase().includes(caseSearch.toLowerCase())
    );
  }, [caseSearch]);

  const toggleWorkerSelection = (workerId) => {
    setAssignTo((prev) => {
      if (prev.includes(workerId)) {
        return prev.filter((id) => id !== workerId);
      } else if (prev.length < 2) {
        return [...prev, workerId];
      }
      return prev;
    });
  };

  const recommended = "Rina Mehta";

  const submit = () => {
    if (!caseId) {
      setReasonErr("Please select a case");
      return;
    }
    if (assignTo.length === 0) {
      setReasonErr("Please select at least one caseworker (max 2)");
      return;
    }
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
          <p className="text-sm text-gray-500 mt-0.5">Manage case assignments and workload distribution (max 2 caseworkers per case)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-black text-secondary pb-3 mb-4 border-b border-gray-100">Reassign Case</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Case ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Case ID</label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              >
                <option value="">Select a case</option>
                {filteredCaseOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Current Caseworker</label>
              <input
                type="text"
                value={current.caseworker || "Unassigned"}
                readOnly
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 bg-gray-50"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-800 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                Maximum 2 caseworkers can be assigned to a single case
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Assign Caseworkers (Max 2)</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {CASE_WORKERS.map((worker) => (
                  <label
                    key={worker.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      assignTo.includes(worker.id)
                        ? "border-secondary bg-secondary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={assignTo.includes(worker.id)}
                      onChange={() => toggleWorkerSelection(worker.id)}
                      disabled={!assignTo.includes(worker.id) && assignTo.length >= 2}
                      className="accent-secondary rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-secondary">{worker.name}</p>
                      <p className="text-xs text-gray-500">{worker.active} active cases</p>
                    </div>
                    {assignTo.includes(worker.id) && (
                      <Check size={16} className="text-green-600" />
                    )}
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-600">
                  Caseworkers selected:
                </span>
                <span className={`text-xs font-black ${
                  assignTo.length === 2 ? "text-green-600" : assignTo.length === 1 ? "text-blue-600" : "text-gray-400"
                }`}>
                  {assignTo.length}/2
                </span>
              </div>
              {assignTo.length === 2 && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <Check size={12} />
                  Maximum caseworkers reached
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Reason for Reassignment</label>
              <textarea
                name="reason"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setReasonErr(""); }}
                rows={4}
                placeholder="Enter reason (e.g. leave, capacity, expertise)…"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
              {reasonErr && <span className="text-xs text-red-500">{reasonErr}</span>}
            </div>
            <Button
              type="button"
              variant="primary"
              className="rounded-xl w-full sm:w-auto"
              onClick={submit}
              disabled={!caseId || assignTo.length === 0}
            >
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
