import { useState, useEffect, useMemo } from "react";
import SearchBar from "../../components/SearchBar";
import FilterTabs from "../../components/FilterTabs";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

const CaseworkerMessages = () => {
  const [activeId, setActiveId] = useState(null);
  const {
    threads,
    messagesByThread,
    loading,
    fetchThread,
    sendMessage: apiSendMessage,
  } = useMessaging({ activeThreadPartnerId: activeId });
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Filter live threads by role if needed
  const filteredThreads = useMemo(() => {
    let base = threads;
    if (activeFilter !== "All") {
      base = base.filter((t) => t.role?.toLowerCase() === activeFilter.toLowerCase());
    }
    return base;
  }, [threads, activeFilter]);

  const activeCaseId = useMemo(
    () => threads.find((t) => t.id === activeId)?.caseId ?? null,
    [threads, activeId],
  );

  // Set first thread as active initially if available
  useEffect(() => {
    if (filteredThreads.length > 0 && !activeId) {
      setActiveId(filteredThreads[0].id);
    }
  }, [filteredThreads, activeId]);

  // Load messages when active thread changes
  useEffect(() => {
    if (activeId) {
      fetchThread(activeId, activeCaseId);
    }
  }, [activeId, activeCaseId, fetchThread]);

  const handleSend = async (file) => {
    const text = draft.trim();
    if (!text && !file) return false;
    if (!activeId) return false;

    const result = await apiSendMessage(activeId, text, activeCaseId, file);
    if (result.success) {
      setDraft("");
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col min-h-0 h-[calc(100dvh-7rem)] sm:h-[calc(100vh-140px)] max-h-[calc(100dvh-4rem)] gap-3 sm:gap-4 pb-4 sm:pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 shrink-0 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-secondary tracking-tight">
            Messaging Center
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-500 line-clamp-2">
            Manage case communications and team updates.
          </p>
        </div>
        <div className="shrink-0 overflow-x-auto pb-1 -mb-1">
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <MessagePanel
          embedded={true}
          threads={filteredThreads}
          activeThreadId={activeId}
          onSelectThread={setActiveId}
          query={query}
          onQueryChange={setQuery}
          messagesByThread={messagesByThread}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          showOnline
        />
      </div>
    </div>
  );
};

export default CaseworkerMessages;
