import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { RiUserAddLine } from "react-icons/ri";
import { Search, Check } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { getCaseworkers, assignCase, getTeamCapacity, getAllCasesForDropdown } from "../../services/caseApi";
import { useToast } from "../../context/ToastContext";

const AdminAssign = () => {
  const { showToast } = useToast();
  const [caseId, setCaseId] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [assignTo, setAssignTo] = useState([]);
  const [reason, setReason] = useState("");
  const [reasonErr, setReasonErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [cases, setCases] = useState([]);
  const [caseworkers, setCaseworkers] = useState([]);
  const [teamCapacity, setTeamCapacity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const [casesRes, cwRes, capacityRes] = await Promise.all([
          getAllCasesForDropdown(),
          getCaseworkers({ limit: 999 }),
          getTeamCapacity()
        ]);
        
        if (casesRes?.data?.data?.cases) {
          setCases(casesRes.data.data.cases);
        }
        // getAllUsers returns { candidate:[], sponsor:[], caseworker:[] } (singular key)
        if (cwRes?.data?.data?.caseworker) {
          setCaseworkers(cwRes.data.data.caseworker);
        } else if (cwRes?.data?.data?.caseworkers) {
          setCaseworkers(cwRes.data.data.caseworkers);
        } else if (Array.isArray(cwRes?.data?.data)) {
          setCaseworkers(cwRes.data.data);
        }
        if (capacityRes?.data?.data) {
          setTeamCapacity(capacityRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFetchError(error.response?.data?.message || 'Failed to load cases and caseworkers. Please refresh.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const CASE_OPTIONS = useMemo(() => {
    return cases.map((c) => ({
      value: c.caseId,
      label: `${c.caseId} — ${c.candidate ? `${c.candidate.first_name} ${c.candidate.last_name}` : 'Unknown'}`,
    }));
  }, [cases]);

  const ASSIGN_TO_OPTIONS = useMemo(() => {
    return caseworkers.map((w) => ({
      value: w.id,
      label: `${w.first_name} ${w.last_name}`,
    }));
  }, [caseworkers]);

  const TEAM = useMemo(() => {
    return teamCapacity.map((m) => ({
      name: m.name,
      pct: Math.min(100, (m.val / 25) * 100),
      val: m.val,
      bar: m.val >= 20 ? "bg-red-500" : m.val >= 15 ? "bg-amber-400" : m.val >= 10 ? "bg-green-500" : "bg-blue-500",
    }));
  }, [teamCapacity]);

  const current = useMemo(() => {
    const selectedCase = cases.find((c) => c.caseId === caseId);
    let cwNames = "";

    if (selectedCase) {
      // Prefer the embedded caseworkers array (full objects) the API returns
      if (Array.isArray(selectedCase.caseworkers) && selectedCase.caseworkers.length > 0) {
        cwNames = selectedCase.caseworkers
          .map(cw => `${cw.first_name} ${cw.last_name}`)
          .join(", ");
      } else {
        // Fall back to ID lookup against the separately fetched caseworkers list
        const cwIds = Array.isArray(selectedCase.assignedcaseworkerId)
          ? selectedCase.assignedcaseworkerId
          : selectedCase.assignedcaseworkerId
          ? [selectedCase.assignedcaseworkerId]
          : [];
        cwNames = caseworkers
          .filter(cw => cwIds.map(Number).includes(Number(cw.id)))
          .map(cw => `${cw.first_name} ${cw.last_name}`)
          .join(", ");
      }
    }

    return {
      caseworker: cwNames || "Unassigned",
      caseLabel: selectedCase
        ? `${selectedCase.caseId} — ${
            selectedCase.candidate
              ? `${selectedCase.candidate.first_name} ${selectedCase.candidate.last_name}`
              : "Unknown"
          }`
        : "",
    };
  }, [caseId, cases, caseworkers]);

  const filteredCaseOptions = useMemo(() => {
    if (!caseSearch) return CASE_OPTIONS;
    return CASE_OPTIONS.filter((c) =>
      c.label.toLowerCase().includes(caseSearch.toLowerCase())
    );
  }, [caseSearch, CASE_OPTIONS]);

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

  const recommended = useMemo(() => {
    if (teamCapacity.length === 0) return null;
    const lowest = teamCapacity.reduce((min, curr) => curr.val < min.val ? curr : min, teamCapacity[0]);
    return lowest.name;
  }, [teamCapacity]);

  const submit = async () => {
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
    setLoading(true);
    try {
      const assignToNames = caseworkers
        .filter(cw => assignTo.includes(cw.id))
        .map(cw => `${cw.first_name} ${cw.last_name}`)
        .join(', ');
      
      await assignCase(caseId, {
        assignTo: assignTo,
        assignToName: assignToNames,
        reason: reason
      });
      
      showToast({
        message: "Case reassigned successfully",
        variant: "success"
      });
      
      // Refresh data
      const [casesRes, capacityRes] = await Promise.all([
        getCases(),
        getTeamCapacity()
      ]);
      
      if (casesRes?.data?.data?.cases) {
        setCases(casesRes.data.data.cases);
      }
      if (capacityRes?.data?.data) {
        setTeamCapacity(capacityRes.data.data);
      }
      
      setCaseId("");
      setAssignTo([]);
      setReason("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Error assigning case:', error);
      showToast({
        message: error.response?.data?.message || "Failed to reassign case",
        variant: "danger"
      });
    } finally {
      setLoading(false);
    }
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

      {/* API error banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 font-medium">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold text-red-600 underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

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
              <label className="text-sm font-medium text-gray-700">
                Case ID
                {fetchLoading && <span className="ml-2 text-xs text-gray-400 font-normal animate-pulse">Loading cases…</span>}
                {!fetchLoading && cases.length === 0 && !fetchError && <span className="ml-2 text-xs text-amber-500 font-normal">No cases found</span>}
                {!fetchLoading && cases.length > 0 && <span className="ml-2 text-xs text-gray-400 font-normal">({filteredCaseOptions.length} available)</span>}
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                disabled={fetchLoading}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none disabled:opacity-60 disabled:cursor-wait"
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
                {caseworkers.map((worker) => (
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
                      <p className="text-sm font-bold text-secondary">{worker.first_name} {worker.last_name}</p>
                      <p className="text-xs text-gray-500">{worker.email}</p>
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
              disabled={!caseId || assignTo.length === 0 || loading}
            >
              {loading ? 'Assigning...' : 'Confirm Reassignment'}
            </Button>
            {saved && <p className="text-xs font-bold text-green-600">Reassignment saved successfully.</p>}
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
              {recommended ? (
                <span className="font-black text-green-600">{recommended}</span>
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
              {recommended && " has lowest active caseload"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default AdminAssign;
