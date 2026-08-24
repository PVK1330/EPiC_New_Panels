import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { syncTeamsMeetings } from "../services/teamsApi";
import { useToast } from "../context/ToastContext";

/**
 * Pulls meetings already booked in Outlook/Teams or Google Calendar into the
 * in-app calendar on demand.
 *
 * The calendar also refreshes itself on load (the list endpoints sync in the
 * background, rate-limited server-side), so this button is for "I just booked
 * something in Outlook, show it now" — and, more importantly, it is the only
 * place a broken connection reports itself. A background sync that fails is
 * silent by design; this one says why.
 */
const SyncCalendarButton = ({ onSynced, className = "" }) => {
  const [syncing, setSyncing] = useState(false);
  const { showToast } = useToast();

  const handleSync = async () => {
    try {
      setSyncing(true);
      const body = await syncTeamsMeetings();

      showToast({
        message: body?.message || "Calendar synced.",
        variant: body?.status === "error" ? "danger" : "success",
      });

      if (onSynced) await onSynced();
    } catch (error) {
      showToast({
        message:
          error?.response?.data?.message ||
          "Could not reach your connected calendar. Try reconnecting Microsoft or Google.",
        variant: "danger",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={syncing}
      title="Pull in meetings already booked in Outlook/Teams or Google Calendar"
      className={`flex items-center gap-2 px-4 py-2 border border-secondary text-secondary rounded-xl hover:bg-secondary/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
      {syncing ? "Syncing…" : "Sync calendar"}
    </button>
  );
};

export default SyncCalendarButton;
