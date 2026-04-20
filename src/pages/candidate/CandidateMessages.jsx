import { useState, useEffect } from "react";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

export default function CandidateMessages() {
  const { 
    threads, 
    messagesByThread, 
    loading, 
    fetchThread, 
    sendMessage: apiSendMessage 
  } = useMessaging();

  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  // Set first thread as active initially if available
  useEffect(() => {
    if (threads.length > 0 && !activeId) {
      setActiveId(threads[0].id);
    }
  }, [threads, activeId]);

  // Load messages when active thread changes
  useEffect(() => {
    if (activeId) {
      fetchThread(activeId);
    }
  }, [activeId, fetchThread]);

  const handleSend = async () => {
    const text = draft.trim();
    console.log("CandidateMessages handleSend triggered. Text:", text, "ActiveId:", activeId);
    
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
  );
}

