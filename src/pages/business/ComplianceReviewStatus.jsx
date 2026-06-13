import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, Upload, MessageSquare } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { formatDateLong } from "../../utils/datetime";
import {
  ENTITY_CONFIG,
  SPONSOR_ENTITIES,
  recordStatus,
  getSponsorItems,
  sponsorRespond,
} from "../../services/complianceReviewApi";
import ComplianceStatusBadge from "../../components/compliance/ComplianceStatusBadge";
import SponsorRespondModal from "../../components/compliance/SponsorRespondModal";

export default function ComplianceReviewStatus() {
  const { showToast } = useToast();
  const [entity, setEntity] = useState(SPONSOR_ENTITIES[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [respond, setRespond] = useState({ open: false, record: null });
  const [busy, setBusy] = useState(false);

  const cfg = ENTITY_CONFIG[entity];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getSponsorItems(entity);
      setItems(res?.data?.data || []);
    } catch (err) {
      showToast({ message: "Failed to load compliance items", variant: "danger" });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  const handleRespond = async ({ notes, evidence }) => {
    if (!respond.record) return;
    try {
      setBusy(true);
      await sponsorRespond(entity, respond.record.id, { notes, evidence });
      showToast({ message: "Response submitted for re-review", variant: "success" });
      setRespond({ open: false, record: null });
      fetchItems();
    } catch (err) {
      showToast({ message: err?.response?.data?.message || "Failed to submit response", variant: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      (cfg.title(r) || "").toLowerCase().includes(q) || (cfg.subtitle(r) || "").toLowerCase().includes(q)
    );
  }, [items, search, cfg]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <ClipboardCheck className="text-primary" size={36} />
          Compliance Review Status
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Track the review status of your compliance submissions and respond to information requests.
        </p>
      </div>

      {/* Entity tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-3xl border border-gray-100 p-2 shadow-sm">
        {SPONSOR_ENTITIES.map((key) => (
          <button
            key={key}
            onClick={() => { setEntity(key); setSearch(""); }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              entity === key ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {ENTITY_CONFIG[key].label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
        <input
          type="text"
          placeholder="Search your submissions..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm focus:border-primary/20 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              {["Item", "Submitted", "Review Status", "Reviewer Comment", "Action"].map((h) => (
                <th key={h} className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 ${h === "Action" ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-6 h-16 bg-gray-50/20" /></tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((r) => {
                const status = recordStatus(entity, r);
                const needsResponse = status === "Information Requested";
                return (
                  <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-secondary">{cfg.title(r)}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5 max-w-[240px] truncate">{cfg.subtitle(r)}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">
                      {r.created_at ? formatDateLong(r.created_at, { month: "short" }) : "—"}
                    </td>
                    <td className="px-6 py-5"><ComplianceStatusBadge status={r[cfg.statusField]} /></td>
                    <td className="px-6 py-5">
                      {r.reviewNotes ? (
                        <p className="text-xs font-bold text-gray-600 italic max-w-[220px] truncate" title={r.reviewNotes}>
                          "{r.reviewNotes}"
                        </p>
                      ) : (
                        <span className="text-xs font-bold text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setRespond({ open: true, record: r })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                          needsResponse
                            ? "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                        title={needsResponse ? "Respond to information request" : "Upload additional evidence"}
                      >
                        {needsResponse ? <MessageSquare size={14} /> : <Upload size={14} />}
                        {needsResponse ? "Respond" : "Add Evidence"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center">
                <ClipboardCheck className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-sm font-bold text-gray-400">No {cfg.label.toLowerCase()} submitted yet.</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <SponsorRespondModal
        open={respond.open}
        itemTitle={respond.record ? `${cfg.label} · ${cfg.title(respond.record)}` : ""}
        busy={busy}
        onClose={() => setRespond({ open: false, record: null })}
        onSubmit={handleRespond}
      />
    </div>
  );
}
