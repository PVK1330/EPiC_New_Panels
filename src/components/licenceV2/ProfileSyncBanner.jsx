import { Building2, RefreshCw, Loader2 } from "lucide-react";

/**
 * Shown at the top of Steps 5 / 6 / 7 to indicate that personnel fields were
 * pre-filled from the Business Profile and offer a one-click re-sync.
 */
export default function ProfileSyncBanner({ onSync, syncing, syncedAt }) {
  const label = syncedAt
    ? `Last synced ${new Date(syncedAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Pull your latest Business Profile data into this form";

  return (
    <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 rounded-2xl px-4 py-3 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Building2 size={14} className="text-blue-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-black text-blue-700 leading-tight">Pre-filled from Business Profile</p>
          <p className="text-[10px] font-bold text-blue-400 leading-tight mt-0.5">{label}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-black text-xs px-3 py-1.5 hover:bg-blue-100 transition-all disabled:opacity-40 shadow-sm"
      >
        {syncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
        Sync from Profile
      </button>
    </div>
  );
}
