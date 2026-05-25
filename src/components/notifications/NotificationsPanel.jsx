import { Bell, Check, Filter, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
          priority: n.priority,
          metadata: n.metadata,
        };
      }),
    [notifications],
  );

  const unreadCount = useMemo(() => normalized.filter((n) => n.unread).length, [normalized]);

  const filtered = useMemo(() => {
    if (filter === "all") return normalized;
    if (filter === "unread") return normalized.filter((n) => n.unread);
    if (filter === "read") return normalized.filter((n) => !n.unread);
    return normalized.filter((n) => n.type === filter);
  }, [normalized, filter]);

  const [selectedNotification, setSelectedNotification] = useState(null);

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
                <option value="read">Read</option>
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
                onClick={() => {
                  onMarkRead?.(n.id);
                  setSelectedNotification(n);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onMarkRead?.(n.id);
                    setSelectedNotification(n);
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

      {/* Notification Details Modal */}
      {selectedNotification && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-sm font-black text-secondary">Notification Details</h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-secondary">{selectedNotification.title}</h4>
                {selectedNotification.priority && (
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    selectedNotification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    selectedNotification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedNotification.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedNotification.priority} Priority
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{selectedNotification.body}</p>
              
              {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notification Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                    {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm font-semibold text-secondary mt-0.5 break-words">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Received: {selectedNotification.time}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationsPanel;

