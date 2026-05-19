import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, CheckCircle, UserPlus, X, Search } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import {
  assignCase,
  getCaseworkers,
  getPipelineCases,
  updatePipelineStage,
} from "../../services/caseApi";
import CaseWorkflowBadge from "../../components/case/CaseWorkflowBadge";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parseCaseworkersResponse(res) {
  const data = res?.data?.data;
  if (!data) return [];
  if (Array.isArray(data.caseworker)) return data.caseworker;
  if (Array.isArray(data.caseworkers)) return data.caseworkers;
  if (Array.isArray(data)) return data;
  return [];
}

function enquiryFromCase(c) {
  const candidate = c.candidate || {};
  return {
    id: c.id,
    caseId: c.caseId || `CAS-${c.id}`,
    candidateName: `${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() || "Unknown",
    visaType: c.visaType?.name || "—",
    nationality: c.nationality || "—",
    enquiryNotes: c.notes || "",
    submittedAt: c.created_at || c.submitted,
    caseStage: c.caseStage,
  };
}

export default function AdminEnquiryInbox() {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState([]);
  const [caseworkers, setCaseworkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [caseworkerId, setCaseworkerId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [internalNote, setInternalNote] = useState("");
  const [cwSearch, setCwSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pipeRes, cwRes] = await Promise.all([
        getPipelineCases(),
        getCaseworkers({ limit: 999 }),
      ]);
      const pipeline = pipeRes.data?.data || {};
      const list = pipeline.client_enquiry || [];
      setEnquiries(list.map(enquiryFromCase));
      setCaseworkers(parseCaseworkersResponse(cwRes));
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Failed to load enquiries",
      });
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCaseworkers = useMemo(() => {
    const q = cwSearch.trim().toLowerCase();
    if (!q) return caseworkers;
    return caseworkers.filter((cw) => {
      const name = `${cw.first_name || ""} ${cw.last_name || ""}`.toLowerCase();
      return name.includes(q) || String(cw.email || "").toLowerCase().includes(q);
    });
  }, [caseworkers, cwSearch]);

  const openAssign = (item) => {
    setSelected(item);
    setCaseworkerId("");
    setPriority("medium");
    setInternalNote("");
    setCwSearch("");
  };

  const closeAssign = () => setSelected(null);

  const handleAssign = async () => {
    if (!caseworkerId) {
      showToast({ variant: "danger", message: "Select a caseworker" });
      return;
    }
    if (!selected?.caseId && selected?.id == null) {
      showToast({ variant: "danger", message: "Invalid enquiry — refresh and try again" });
      return;
    }
    setSubmitting(true);
    try {
      const caseRef = selected.caseId || String(selected.id);
      const cw = caseworkers.find((c) => String(c.id) === String(caseworkerId));
      const cwName = cw ? `${cw.first_name || ""} ${cw.last_name || ""}`.trim() : "";
      await assignCase(caseRef, {
        caseworkerId,
        assignTo: [caseworkerId],
        assignToName: cwName,
        priority,
        notes: internalNote,
        reason: "Assigned from enquiry inbox — consultation started",
      });
      await updatePipelineStage(caseRef, "admin_assignment");
      showToast({ message: "Caseworker assigned — case moved to Admin Assignment" });
      closeAssign();
      await load();
    } catch (err) {
      showToast({
        variant: "danger",
        message: err?.response?.data?.message || "Assignment failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <Inbox className="text-primary" size={36} />
            Enquiry Inbox
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            New visa enquiries awaiting review and caseworker assignment
          </p>
        </motion.div>
        {!loading && (
          <span className="rounded-full bg-primary/10 text-primary text-xs font-black px-3 py-1">
            {enquiries.length} open
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-gray-400">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
          <p className="text-lg font-black text-secondary">No new enquiries</p>
          <p className="text-sm font-bold text-gray-500 mt-1">
            All client enquiries have been assigned.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enquiries.map((item) => (
            <article
              key={item.caseId}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <motion.div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[11px] font-mono font-bold text-primary">{item.caseId}</p>
                  <p className="text-base font-black text-secondary mt-0.5">{item.candidateName}</p>
                </div>
                <CaseWorkflowBadge caseRecord={{ caseStage: item.caseStage }} />
              </motion.div>
              <dl className="space-y-1.5 text-xs font-bold text-gray-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Visa</dt>
                  <dd className="text-secondary text-right">{item.visaType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Nationality</dt>
                  <dd className="text-secondary">{item.nationality}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Submitted</dt>
                  <dd className="text-secondary">{formatDate(item.submittedAt)}</dd>
                </div>
              </dl>
              {item.enquiryNotes && (
                <p className="mt-3 text-xs text-gray-600 line-clamp-3 border-t border-gray-50 pt-3">
                  {item.enquiryNotes}
                </p>
              )}
              <Button className="w-full mt-4" onClick={() => openAssign(item)}>
                <UserPlus size={16} className="mr-2 inline" />
                Review &amp; Assign
              </Button>
            </article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={closeAssign}
              aria-label="Close"
            />
            <motion.aside
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-black text-secondary">Assign enquiry</h2>
                <button
                  type="button"
                  onClick={closeAssign}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
                  <p>
                    <span className="font-bold text-gray-500">Candidate: </span>
                    {selected.candidateName}
                  </p>
                  <p>
                    <span className="font-bold text-gray-500">Visa: </span>
                    {selected.visaType}
                  </p>
                  <p>
                    <span className="font-bold text-gray-500">Nationality: </span>
                    {selected.nationality}
                  </p>
                  <p>
                    <span className="font-bold text-gray-500">Submitted: </span>
                    {formatDate(selected.submittedAt)}
                  </p>
                  {selected.enquiryNotes && (
                    <p className="pt-2 border-t border-gray-200 text-gray-700 whitespace-pre-wrap">
                      {selected.enquiryNotes}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Caseworker
                  </label>
                  <div className="relative mb-2">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="search"
                      value={cwSearch}
                      onChange={(e) => setCwSearch(e.target.value)}
                      placeholder="Search caseworkers…"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                    />
                  </div>
                  <select
                    value={caseworkerId}
                    onChange={(e) => setCaseworkerId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-bold text-secondary"
                  >
                    <option value="">Select caseworker…</option>
                    {filteredCaseworkers.map((cw) => (
                      <option key={cw.id} value={cw.id}>
                        {`${cw.first_name || ""} ${cw.last_name || ""}`.trim() || cw.email || `Caseworker #${cw.id}`}
                        {cw.email ? ` (${cw.email})` : ""}
                      </option>
                    ))}
                  </select>
                  {!loading && caseworkers.length === 0 && (
                    <p className="mt-2 text-xs font-bold text-amber-700">
                      No caseworkers found. Add users with the Caseworker role under Admin → Caseworkers.
                    </p>
                  )}
                </div>

                <motion.div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-bold text-secondary"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Internal note (optional)
                  </label>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium resize-none"
                    placeholder="Notes for the assigned caseworker…"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 px-6 py-4">
                <Button className="w-full" disabled={submitting} onClick={handleAssign}>
                  {submitting ? "Assigning…" : "Assign & Start Consultation"}
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
