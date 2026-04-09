import { FileText, Paperclip, Search, Send } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

/**
 * Reusable messages UI used across portals (Candidate/Caseworker/Business/Admin).
 *
 * threads: [{ id, initials, name, role?, preview, time, unread, avatarClass }]
 * messagesByThread: { [threadId]: [{ id, from: 'me'|'them', text, meta, attachment? }] }
 */
const MessagePanel = ({
  title = "Messages",
  subtitle,
  embedded = false,
  /** When false, skip negative horizontal margins (use inside layouts that already pad, e.g. Candidate). */
  fullBleed = true,
  threads = [],
  activeThreadId,
  onSelectThread,
  query,
  onQueryChange,
  messagesByThread,
  draft,
  onDraftChange,
  onSend,
  placeholder = "Type a message…",
  showOnline = false,
  onlineThreadId,
}) => {
  const messagesScrollRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeMeta = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId],
  );

  const messages = messagesByThread?.[activeThreadId] ?? [];

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [activeThreadId, messages.length]);

  return (
    <div
      className={
        embedded
          ? "min-h-0"
          : fullBleed
            ? "flex flex-col gap-0 h-screen overflow-hidden -mx-4 md:-mx-8 px-4 md:px-8 animate-in fade-in duration-500"
            : "flex flex-col gap-0 h-screen overflow-hidden animate-in fade-in duration-500"
      }
    >
      {!embedded && (
        <header className="pt-2 pb-4 shrink-0">
          <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-bold text-gray-500 mt-1">{subtitle}</p>
          )}
        </header>
      )}

      <div
        className={`${embedded
            ? "rounded-b-xl rounded-tr-xl border border-gray-200 bg-white overflow-hidden flex flex-col lg:grid lg:grid-cols-[minmax(260px,300px)_1fr] h-full border-t-0"
            : "rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col lg:grid lg:grid-cols-[minmax(260px,300px)_1fr] flex-1"
          }`}
      >
        {/* Thread list */}
        <aside className="border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/80 flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange?.(e.target.value)}
                placeholder="Search messages…"
                className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectThread?.(t.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${activeThreadId === t.id
                    ? "bg-secondary/10 border-l-2 border-l-secondary"
                    : "hover:bg-gray-100/80 border-l-2 border-l-transparent"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${t.avatarClass}`}
                  >
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900 truncate">
                        {t.name}
                      </span>
                      {t.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-white">
                          {t.unread}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] font-bold text-gray-400 shrink-0">
                        {t.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 truncate mt-0.5 pl-11">
                      {t.preview}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex flex-col h-full bg-white min-w-0 overflow-hidden">
          {activeMeta ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/90 shrink-0">
                <div
                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-black ${activeMeta.avatarClass}`}
                >
                  {activeMeta.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900">
                    {activeMeta.name}
                  </p>
                  <p className="text-xs font-bold text-gray-500">
                    {activeMeta.role ?? "Secure thread"}
                  </p>
                </div>
                {showOnline && onlineThreadId && activeThreadId === onlineThreadId && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-black text-emerald-600">
                      Online
                    </span>
                  </div>
                )}
              </div>

              <div
                ref={messagesScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 overscroll-contain custom-scrollbar scroll-smooth"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${msg.from === "me" ? "self-end items-end" : "self-start"
                      }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm font-bold leading-relaxed ${msg.from === "me"
                          ? "bg-secondary text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 border border-gray-100 rounded-bl-sm"
                        }`}
                    >
                      {msg.text}
                      {msg.attachment && (
                        <div
                          className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${msg.from === "me"
                              ? "bg-white/15 text-white"
                              : "bg-white border border-gray-200 text-gray-700"
                            }`}
                        >
                          <FileText size={14} />
                          {msg.attachment}
                        </div>
                      )}
                    </div>
                    {msg.meta && (
                      <p
                        className={`text-[11px] font-bold text-gray-400 mt-1 ${msg.from === "me" ? "text-right" : ""
                          }`}
                      >
                        {msg.meta}
                      </p>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-100 bg-gray-50/90 shrink-0">
                <div className="flex gap-2 items-end">
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-secondary hover:border-secondary/30 transition-colors"
                    title="Attach document"
                  >
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={draft}
                      onChange={(e) => onDraftChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onSend?.();
                        }
                      }}
                      placeholder={placeholder}
                      rows={1}
                      className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-none max-h-32 overflow-y-auto custom-scrollbar"
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onSend}
                    className="shrink-0 rounded-full bg-primary p-3 text-white hover:bg-primary-dark shadow-md shadow-primary/20 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-gray-500">No conversations found.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagePanel;

