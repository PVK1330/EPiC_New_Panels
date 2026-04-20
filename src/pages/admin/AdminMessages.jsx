import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

export default function AdminMessages() {
  const { 
    threads, 
    messagesByThread, 
    loading, 
    fetchThread, 
    sendMessage: apiSendMessage,
    refreshAll 
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
    console.log("AdminMessages handleSend triggered. Text:", text, "ActiveId:", activeId);
    
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
    <motion.div
      className="flex flex-col gap-4 pb-6 h-[calc(100vh-140px)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MessagePanel
        title="Admin Messages"
        subtitle="Manage secure communications with caseworkers, candidates, and businesses."
        threads={threads}
        activeThreadId={activeId}
        onSelectThread={setActiveId}
        query={query}
        onQueryChange={setQuery}
        messagesByThread={messagesByThread}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
      />
    </motion.div>
  );
}
