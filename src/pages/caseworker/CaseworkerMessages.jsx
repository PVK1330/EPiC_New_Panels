import { useState, useEffect, useMemo } from "react";
import SearchBar from "../../components/SearchBar";
import FilterTabs from "../../components/FilterTabs";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

const CaseworkerMessages = () => {
  const { 
    threads, 
    messagesByThread, 
    loading, 
    fetchThread, 
    sendMessage: apiSendMessage 
  } = useMessaging();

  const [activeId, setActiveId] = useState(null);
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

  // Set first thread as active initially if available
  useEffect(() => {
    if (filteredThreads.length > 0 && !activeId) {
      setActiveId(filteredThreads[0].id);
    }
  }, [filteredThreads, activeId]);

  // Load messages when active thread changes
  useEffect(() => {
    if (activeId) {
      fetchThread(activeId);
    }
  }, [activeId, fetchThread]);

  const handleSend = async () => {
    const text = draft.trim();
    console.log("CaseworkerMessages handleSend triggered. Text:", text, "ActiveId:", activeId);
    
    if (!text || !activeId) {
      console.warn("handleSend returning early: missing text or activeId");
      return;
    }
    
    const result = await apiSendMessage(activeId, text);
    if (result.success) {
      setDraft("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 pb-6">
      <div className="flex items-center justify-between px-2 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tight">Messaging Center</h1>
          <p className="text-sm font-bold text-gray-500">Manage case communications and team updates.</p>
        </div>
        <FilterTabs active={activeFilter} onChange={setActiveFilter} />
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
