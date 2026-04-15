import { useEffect, useRef } from "react";

const roleBadge = {
  Candidate: "bg-indigo-100 text-indigo-700",
  Sponsor: "bg-amber-100 text-amber-700",
  Internal: "bg-rose-100 text-rose-700",
};

const statusLabel = {
  Active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  Pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  Review: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-400" },
};

const ChatBox = ({ thread, messages, draft, onDraftChange, onSend, onBack }) => {
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const status = statusLabel[thread?.status] ?? statusLabel["Active"];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-white shadow-sm shrink-0">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mr-1"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${thread.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}>
          {thread.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-800 text-sm leading-tight">{thread.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[thread.role] ?? "bg-slate-100 text-slate-600"}`}>
              {thread.role}
            </span>
            {thread.caseId && (
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">{thread.caseId}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block w-2 h-2 rounded-full ${status.dot}`} />
            <span className={`text-xs font-medium ${status.text}`}>{thread.status}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Call">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="View Profile">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="More Options">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.from === "me";
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${thread.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0 mb-1`}>
                  {thread.initials}
                </div>
              )}
              <div className={`max-w-[72%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${isMe
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}>
                  {msg.text}
                  {msg.attachment && (
                    <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
                      ${isMe ? "bg-indigo-500 text-indigo-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {msg.attachment}
                    </div>
                  )}
                </div>
                <span className={`text-xs text-slate-400 px-1 ${isMe ? "text-right" : "text-left"}`}>
                  {msg.meta}
                </span>
              </div>
              {isMe && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mb-1">
                  Me
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          {/* Attach */}
          <button className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors pb-0.5" title="Attach file">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 max-h-32 leading-relaxed"
            style={{ overflowY: draft.split("\n").length > 3 ? "auto" : "hidden" }}
          />

          {/* Emoji */}
          <button className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors pb-0.5" title="Emoji">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send */}
          <button
            onClick={onSend}
            disabled={!draft.trim()}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl p-2 transition-all duration-150 disabled:cursor-not-allowed"
            title="Send"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 px-1">Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs">Shift+Enter</kbd> for new line</p>
      </div>
    </div>
  );
};

export default ChatBox;
