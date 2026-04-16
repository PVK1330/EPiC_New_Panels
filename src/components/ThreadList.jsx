const roleBadge = {
  Candidate: "bg-indigo-100 text-indigo-700",
  Sponsor: "bg-amber-100 text-amber-700",
  Internal: "bg-rose-100 text-rose-700",
};

const statusDot = {
  Active: "bg-emerald-400",
  Pending: "bg-amber-400",
  Review: "bg-sky-400",
};

const ThreadList = ({ threads, activeThreadId, onSelectThread }) => {
  return (
    <ul className="divide-y divide-slate-100">
      {threads.length === 0 && (
        <li className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span className="text-sm font-medium">No conversations found</span>
        </li>
      )}
      {threads.map((thread) => {
        const isActive = thread.id === activeThreadId;
        return (
          <li key={thread.id}>
            <button
              onClick={() => onSelectThread(thread.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-4 transition-all duration-150 group
                ${isActive
                  ? "bg-indigo-50 border-l-4 border-indigo-500"
                  : "border-l-4 border-transparent hover:bg-slate-50"
                }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${thread.avatarColor} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                  {thread.initials}
                </div>
                {thread.status && (
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusDot[thread.status] ?? "bg-slate-300"}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`font-semibold text-sm truncate ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                    {thread.name}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">{thread.time}</span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${roleBadge[thread.role] ?? "bg-slate-100 text-slate-500"}`}>
                    {thread.role}
                  </span>
                  {thread.caseId && (
                    <span className="text-xs text-slate-400 font-mono">{thread.caseId}</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate ${isActive ? "text-indigo-500" : "text-slate-500"}`}>
                    {thread.preview}
                  </p>
                  {thread.unread > 0 && (
                    <span className="shrink-0 bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {thread.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ThreadList;
