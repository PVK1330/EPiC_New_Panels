import { useState, useEffect, useMemo } from "react";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

export default function CandidateMessages() {
  const [activeId, setActiveId] = useState(null);
  const {
    threads,
    messagesByThread,
    loading,
    fetchThread,
    sendMessage: apiSendMessage,
  } = useMessaging({ activeThreadPartnerId: activeId });
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const activeCaseId = useMemo(
    () => threads.find((t) => t.id === activeId)?.caseId ?? null,
    [threads, activeId],
  );

  // Set first thread as active initially if available
  useEffect(() => {
    if (threads.length > 0 && !activeId) {
      setActiveId(threads[0].id);
    }
  }, [threads, activeId]);

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
    <div className="flex flex-col min-h-0 w-full h-[min(calc(100dvh-7rem),calc(100vh-6rem))] max-h-[calc(100dvh-4rem)] sm:max-h-none">
      <MessagePanel
        title="Messages"
        subtitle="Communicate securely with your assigned caseworker."
        fullBleed={false}
        threads={threads}
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
  );
}

