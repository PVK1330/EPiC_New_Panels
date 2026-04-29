import { ChevronLeft, FileText, Paperclip, Search, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";

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
  filterNode,
}) => {
  const messagesScrollRef = useRef(null);
  const chatEndRef = useRef(null);
  const isLg = useMediaQuery("(min-width: 1024px)");
  /** Below lg: list-only vs chat-only */
  const [mobileListOpen, setMobileListOpen] = useState(true);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInternalSend = async () => {
    if (onSend) {
      const success = await onSend(selectedFile);
      if (success !== false) {
        clearFile();
      }
    }
  };

  useEffect(() => {
    if (isLg) setMobileListOpen(true);
  }, [isLg]);

  useEffect(() => {
    if (activeThreadId == null && !isLg) setMobileListOpen(true);
  }, [activeThreadId, isLg]);

  const activeMeta = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId],
  );

  const messages = messagesByThread?.[activeThreadId] ?? [];

  const handleSelectThread = useCallback(
    (id) => {
      onSelectThread?.(id);
      if (!isLg) setMobileListOpen(false);
    },
    [onSelectThread, isLg],
  );

  const handleBackToList = useCallback(() => {
    setMobileListOpen(true);
  }, []);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [activeThreadId, messages.length]);

  const showListColumn = isLg || mobileListOpen;
  const showChatColumn = isLg || !mobileListOpen;

  const outerClass = embedded
    ? "min-h-0 flex-1 flex flex-col max-h-full"
    : fullBleed
      ? "flex flex-col gap-0 min-h-0 flex-1 max-h-[100dvh] h-[min(100dvh,100vh)] overflow-hidden -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 animate-in fade-in duration-500"
      : "flex flex-col gap-0 min-h-0 h-full max-h-full w-full overflow-hidden animate-in fade-in duration-500";

  return (
    <div className={outerClass}>
      {!embedded && (
        <header className="pt-2 pb-3 sm:pb-4 shrink-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-secondary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </header>
      )}

      <div
        className={
          embedded
            ? "rounded-b-xl rounded-tr-xl border border-gray-200 bg-white overflow-hidden flex flex-col lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] flex-1 min-h-0 min-w-0"
            : "rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] flex-1 min-h-0 min-w-0"
        }
      >
        {/* Thread list */}
        <aside
          className={`border-gray-200 bg-gray-50/80 flex flex-col overflow-hidden min-h-0 min-w-0 transition-[flex,opacity] duration-200 lg:border-b-0 lg:border-r lg:flex ${
            showListColumn
              ? "flex-1 lg:flex-none lg:h-auto border-b lg:border-b-0 min-h-[min(40dvh,280px)] lg:min-h-0"
              : "hidden lg:flex"
          }`}
        >
          <div className="p-2 sm:p-3 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange?.(e.target.value)}
                placeholder="Search messages…"
                className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none min-h-[44px]"
              />
            </div>
            {filterNode && <div className="mt-2 -mb-1 overflow-x-auto pb-1">{filterNode}</div>}
          </div>

          <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain custom-scrollbar touch-pan-y">
            {threads.map((t, index) => (
              <button
                key={t.id || index}
                type="button"
                onClick={() => handleSelectThread(t.id)}
                className={`w-full text-left px-3 sm:px-4 py-3 min-h-[56px] border-b border-gray-100 transition-colors active:bg-gray-100/90 ${activeThreadId === t.id
                    ? "bg-secondary/10 border-l-2 border-l-secondary"
                    : "hover:bg-gray-100/80 border-l-2 border-l-transparent"
                  }`}
              >
                <div className="flex items-start gap-2 sm:gap-2.5">
                  <div
                    className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${t.avatarClass}`}
                  >
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-black text-gray-900 truncate max-w-[65%] sm:max-w-none">
                        {t.name}
                      </span>
                      {t.role && (
                        <span className="text-[10px] font-black text-secondary px-1.5 py-0.5 bg-secondary/10 rounded border border-secondary/20 shrink-0">
                          {t.role}
                        </span>
                      )}
                      {t.caseDisplayId && (
                        <span className="text-[10px] font-black text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/20 shrink-0">
                          {t.caseDisplayId}
                        </span>
                      )}
                      {t.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-black text-white min-w-[1.25rem] text-center">
                          {t.unread}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] font-bold text-gray-400 shrink-0">
                        {t.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 truncate mt-1 pr-1">
                      {t.preview}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <section
          className={`flex flex-col w-full min-w-0 flex-1 bg-white overflow-hidden min-h-0 ${
            showChatColumn ? "flex-1 lg:flex" : "hidden lg:flex"
          }`}
        >
          {activeMeta ? (
            <>
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 flex items-center gap-2 sm:gap-3 bg-gray-50/90 shrink-0">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="lg:hidden shrink-0 -ml-1 rounded-full p-2 text-gray-700 hover:bg-gray-200/80 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Back to conversations"
                >
                  <ChevronLeft size={22} strokeWidth={2.5} />
                </button>
                <div
                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-black shrink-0 ${activeMeta.avatarClass}`}
                >
                  {activeMeta.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">
                    {activeMeta.name}
                  </p>
                  <p className="text-xs font-bold text-gray-500 truncate">
                    {activeMeta.role ?? "Secure thread"}
                  </p>
                </div>
                {showOnline && onlineThreadId && activeThreadId === onlineThreadId && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-black text-emerald-600 hidden sm:inline">
                      Online
                    </span>
                  </div>
                )}
              </div>

              <div
                ref={messagesScrollRef}
                className="flex w-full min-w-0 flex-1 flex-col gap-2 sm:gap-2.5 overflow-y-auto p-3 sm:p-4 min-h-0 overscroll-contain custom-scrollbar scroll-smooth touch-pan-y"
              >
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex w-full min-w-0 ${msg.from === "me" ? "justify-end pl-8 sm:pl-12" : "justify-start pr-8 sm:pr-12"
                      }`}
                  >
                    <div className="flex max-w-[min(100%,20rem)] sm:max-w-[min(100%,24rem)] flex-col">
                      <div
                        className={`rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-bold leading-relaxed break-words [overflow-wrap:anywhere] ${msg.from === "me"
                            ? "bg-secondary text-white rounded-br-md rounded-tr-md"
                            : "bg-gray-100 text-gray-800 border border-gray-100 rounded-bl-md rounded-tl-md"
                          }`}
                      >
                        {msg.text}
                        {msg.attachment && (
                          <div
                            onClick={() => {
                              if (msg.attachmentUrl) {
                                // Assume backend is serving uploads directly or prepend API URL
                                const url = msg.attachmentUrl.startsWith('http') 
                                  ? msg.attachmentUrl 
                                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${msg.attachmentUrl}`;
                                window.open(url, '_blank');
                              }
                            }}
                            className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${msg.from === "me"
                                ? "bg-white/15 text-white hover:bg-white/25"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                            title="Click to download"
                          >
                            <FileText size={14} className="shrink-0" />
                            <span className="truncate">{msg.attachment}</span>
                          </div>
                        )}
                      </div>
                      {msg.meta && (
                        <p
                          className={`text-[11px] font-bold text-gray-400 mt-1 px-1 ${msg.from === "me" ? "text-right" : "text-left"
                            }`}
                        >
                          {msg.meta}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-2 sm:p-3 border-t border-gray-100 bg-gray-50/90 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {selectedFile && (
                  <div className="mb-2 px-3 flex items-center gap-2">
                    <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold max-w-full">
                      <FileText size={14} className="shrink-0" />
                      <span className="truncate">{selectedFile.name}</span>
                      <button 
                        onClick={clearFile}
                        className="p-1 hover:bg-primary/20 rounded-full transition-colors shrink-0 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 items-end max-w-full">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-full border border-gray-200 bg-white p-2.5 sm:p-3 text-gray-500 hover:text-secondary hover:border-secondary/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Attach document"
                  >
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 min-w-0 relative">
                    <textarea
                      value={draft}
                      onChange={(e) => onDraftChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleInternalSend();
                        }
                      }}
                      placeholder={placeholder}
                      rows={1}
                      className="w-full rounded-2xl sm:rounded-full border border-gray-200 bg-white px-3.5 sm:px-4 py-3 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-none max-h-32 min-h-[44px] overflow-y-auto custom-scrollbar leading-snug"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleInternalSend}
                    className="shrink-0 rounded-full bg-primary p-2.5 sm:p-3 text-white hover:bg-primary-dark shadow-md shadow-primary/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm font-bold">
              {threads.length === 0
                ? "No conversations yet."
                : "Select a conversation from the list."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagePanel;
