import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

const BusinessMessages = () => {
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
    console.log("BusinessMessages handleSend triggered. Text:", text, "ActiveId:", activeId);
    
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
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Business Messages
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Secure communication with your caseworkers and the EPiC support team.
        </p>
      </motion.div>

      {/* Messages Container */}
      <div className="h-[calc(100vh-280px)] rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300">
        <MessagePanel
          embedded={true}
          title="Sponsor Inbox"
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
    </div>
  );
};

export default BusinessMessages;
