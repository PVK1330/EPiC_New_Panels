import { useMemo, useState } from "react";
import SearchBar from "../../components/SearchBar";
import FilterTabs from "../../components/FilterTabs";
import ThreadList from "../../components/ThreadList";
import ChatBox from "../../components/ChatBox";
import { THREADS, INITIAL_MESSAGES } from "../../data/threads";

const CaseworkerMessages = () => {
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [messagesByThread, setMessagesByThread] = useState(INITIAL_MESSAGES);
  const [showChat, setShowChat] = useState(false); // for mobile

  const activeThread = useMemo(
    () => THREADS.find((t) => t.id === activeThreadId) ?? null,
    [activeThreadId]
  );

  const filteredThreads = useMemo(() => {
    let threads = THREADS;

    // Role filter
    if (activeFilter !== "All") {
      threads = threads.filter((t) => t.role === activeFilter);
    }

    // Search query
    const q = query.trim().toLowerCase();
    if (q) {
      threads = threads.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.preview.toLowerCase().includes(q) ||
          (t.caseId && t.caseId.toLowerCase().includes(q)) ||
          t.role.toLowerCase().includes(q)
      );
    }

    return threads;
  }, [query, activeFilter]);

  const totalUnread = useMemo(
    () => THREADS.reduce((sum, t) => sum + (t.unread ?? 0), 0),
    []
  );

  const handleSelectThread = (id) => {
    setActiveThreadId(id);
    setDraft("");
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
    setActiveThreadId(null);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeThreadId) return;
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [
        ...(prev[activeThreadId] ?? []),
        {
          id: `msg-${Date.now()}`,
          from: "me",
          text,
          meta: "You · Just now",
        },
      ],
    }));
    setDraft("");
  };

  return (
    <div className="flex h-screen  overflow-hidden font-sans">
      {/* ───────── Sidebar / Thread List ───────── */}
      <aside
        className={`
          flex flex-col bg-white border-r border-slate-200 shadow-sm
          w-full md:w-80 lg:w-96 shrink-0
          ${showChat ? "hidden md:flex" : "flex"}
          md:flex
        `}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Messages</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Chat with candidates, sponsors &amp; teams
              </p>
            </div>
            {totalUnread > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center px-2 shadow-md shadow-indigo-200">
                {totalUnread}
              </span>
            )}
          </div>

          {/* Search Bar */}
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search candidates, sponsors…"
          />

          {/* Filter Tabs */}
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
        </div>

        {/* Thread Count */}
        <div className="px-5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            {filteredThreads.length} conversation{filteredThreads.length !== 1 ? "s" : ""}
          </span>
          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            Mark all read
          </button>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          <ThreadList
            threads={filteredThreads}
            activeThreadId={activeThreadId}
            onSelectThread={handleSelectThread}
          />
        </div>

        {/* Sidebar Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
              CW
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Caseworker</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors" title="Settings">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ───────── Chat Area ───────── */}
      <main
        className={`
          flex-1 flex flex-col min-w-0
          ${!showChat ? "hidden md:flex" : "flex"}
          md:flex
        `}
      >
        {activeThread ? (
          <ChatBox
            thread={activeThread}
            messages={messagesByThread[activeThreadId] ?? []}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onBack={handleBack}
          />
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-slate-600">Select a conversation</h2>
              <p className="text-sm text-slate-400 max-w-xs">
                Choose a candidate, sponsor, or team member from the left panel to start chatting.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["Candidate", "Sponsor", "Internal"].map((role) => (
                <span key={role} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-500 font-medium shadow-sm">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CaseworkerMessages;
