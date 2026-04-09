import { Bell, Check, Filter, Trash2 } from "lucide-react";
import { useMemo } from "react";

/**
 * Reusable notifications list UI for all portals.
 *
 * notifications: [{ id, type?, icon?, title, body|message, time|timestamp, unread|read }]
 */
const NotificationsPanel = ({
  embedded = false,
  title = "Notifications",
  subtitle,
  notifications = [],
  filter = "all",
  onFilterChange,
  onMarkRead,
  onDelete,
  showDelete = false,
  emptyText = "No notifications at the moment",
}) => {
  const normalized = useMemo(
    () =>
      notifications.map((n) => {
        const unread = typeof n.unread === "boolean" ? n.unread : !n.read;
        return {
          id: n.id,
          type: n.type ?? "info",
          icon: n.icon,
          title: n.title,
          body: n.body ?? n.message ?? "",
          time: n.time ?? n.timestamp ?? "",
          unread,
        };
      }),
    [notifications],
  );

  const unreadCount = useMemo(() => normalized.filter((n) => n.unread).length, [normalized]);

  const filtered = useMemo(() => {
    if (filter === "all") return normalized;
    if (filter === "unread") return normalized.filter((n) => n.unread);
    return normalized.filter((n) => n.type === filter);
  }, [normalized, filter]);

  const typeStyles = (type) => {
    switch (type) {
      case "alert":
      case "error":
        return "border-red-200 bg-red-50 hover:bg-red-100/60";
      case "success":
        return "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/60";
      case "warning":
        return "border-amber-200 bg-amber-50 hover:bg-amber-100/60";
      case "info":
      default:
        return "border-blue-200 bg-blue-50 hover:bg-blue-100/60";
    }
  };

  return (
    <div className={embedded ? "min-h-0" : "space-y-6 animate-in fade-in duration-500"}>
      {!embedded && (
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm font-bold text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {unreadCount > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2">
              <p className="text-primary font-black text-sm">{unreadCount} Unread</p>
            </div>
          )}
        </header>
      )}

      <div className={embedded ? "rounded-b-xl rounded-tr-xl border border-gray-200 bg-white p-5 md:p-6 border-t-0" : "rounded-xl border border-gray-200 bg-white p-5 md:p-6"}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gray-400" />
            <h2 className="text-lg font-black text-secondary tracking-tight">{title}</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>

          {onFilterChange && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="alert">Alerts</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div
                key={n.id}
                className={`border rounded-xl p-4 flex items-start gap-4 transition-colors cursor-pointer ${typeStyles(n.type)} ${n.unread ? "border-l-[3px] border-l-secondary" : ""}`}
                onClick={() => onMarkRead?.(n.id)}
                role={onMarkRead ? "button" : undefined}
                tabIndex={onMarkRead ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!onMarkRead) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onMarkRead(n.id);
                  }
                }}
              >
                <div className="mt-0.5 shrink-0">
                  {n.icon ? (
                    <span className="text-xl" aria-hidden>
                      {n.icon}
                    </span>
                  ) : (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 border border-black/5">
                      <Check size={16} className={n.unread ? "text-secondary" : "text-gray-400"} />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-900 font-black text-sm truncate">{n.title}</h3>
                    {n.unread && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                  </div>
                  <p className="text-gray-600 text-xs font-bold mt-1 leading-relaxed">{n.body}</p>
                  {n.time && <p className="text-gray-400 text-[11px] font-bold mt-2">{n.time}</p>}
                </div>

                {showDelete && onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(n.id);
                    }}
                    className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-600 hover:text-primary shrink-0"
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="border border-gray-200 rounded-xl p-8 text-center bg-white">
              <Bell size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm font-bold">{emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;

