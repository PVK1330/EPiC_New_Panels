import { useState, useCallback, useEffect } from "react";
import messagingApi from "../services/messagingApi";
import { useSelector } from "react-redux";

/**
 * Hook to manage EPiC Messaging system.
 * Handles fetching users, conversations, threads, and sending messages.
 */
const useMessaging = () => {
  const { user } = useSelector((state) => state.auth);
  const [threads, setThreads] = useState([]);
  const [messagesByThread, setMessagesByThread] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all conversations (Inbox)
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    console.log("Fetching conversations...");
    try {
      const res = await messagingApi.getConversations();
      console.log("Conversations response:", res.data);
      
      const data = res.data.data || res.data || [];
      // Map API response to Component format
      const mappedThreads = data.map(conv => {
        const otherUser = conv.user || {};
        const lastMsg = conv.lastMessage || {};
        const caseData = conv.case || {};
        
        const name = `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim();
        const preview = typeof lastMsg === 'object' ? lastMsg?.content : lastMsg;
        
        return {
          id: otherUser.id, // We use UserId to fetch threads
          conversationId: conv.id,
          name: name || "Unknown User",
          initials: name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??",
          role: otherUser.role?.name || "User",
          preview: preview || "No messages yet",
          time: String(lastMsg.createdAt || conv.lastMessageTime || "").split('T')[0],
          unread: conv.unreadCount || 0,
          caseId: caseData.id,
          caseDisplayId: caseData.caseId,
          avatarClass: "bg-indigo-600",
        };
      });
      console.log("Mapped threads:", mappedThreads);
      setThreads(mappedThreads);
      setError(null);
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch full messages for a specific user
  const fetchThread = useCallback(async (otherUserId, caseId) => {
    if (!otherUserId) return;
    console.log(`Fetching thread for user ${otherUserId}...`);
    try {
      const res = await messagingApi.getMessageThread(otherUserId, caseId);
      console.log("Thread response:", res.data);
      
      const data = res.data.data || res.data || [];
      const mappedMessages = data.map(msg => {
        // Handle nested sender object or flat structure
        const sender = msg.sender || {};
        const contentObj = msg.content;
        const textStr = typeof contentObj === 'object' ? contentObj?.content : contentObj;
        
        return {
          id: msg.id,
          from: msg.senderId === user.id ? "me" : "them",
          text: textStr || "",
          meta: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: msg.messageType === 'file' ? 'Attachment' : null
        };
      });
      
      setMessagesByThread(prev => ({
        ...prev,
        [otherUserId]: mappedMessages
      }));

      // Mark as read when thread is loaded
      if (mappedMessages.some(m => m.from === "them")) {
        await messagingApi.markMessagesAsRead(otherUserId);
      }
    } catch (err) {
      console.error("Failed to load thread", err);
    }
  }, [user?.id]);

  // Fetch available users to start new chat
  const fetchAvailableUsers = useCallback(async () => {
    try {
      const res = await messagingApi.getAvailableChatUsers();
      const data = res.data.data || res.data || [];
      const mapped = data.map(u => {
        const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
        return {
          id: u.id,
          name: name || "Unknown User",
          initials: name?.split(" ").map(n => n[0]).join("").toUpperCase() || "??",
          role: u.role?.name || "User"
        };
      });
      setAvailableUsers(mapped);
    } catch (err) {
      console.error("Failed to load available users", err);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (receiverId, content, caseId = null) => {
    console.log("Sending message to:", receiverId, "content:", content);
    try {
      const res = await messagingApi.sendMessage({
        receiverId,
        content,
        caseId,
        messageType: "text"
      });
      console.log("Send message response:", res.data);
      
      const newMessage = res.data.data || res.data;
      const textStr = typeof newMessage.content === 'object' ? newMessage.content?.content : newMessage.content;
      
      const mappedMsg = {
        id: newMessage.id,
        from: "me",
        text: textStr || "",
        meta: "Just now",
        attachment: null
      };

      setMessagesByThread(prev => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), mappedMsg]
      }));

      // Refresh conversations list to update preview
      fetchConversations();
      
      return { success: true };
    } catch (err) {
      console.error("Failed to send message", err);
      return { success: false, error: err };
    }
  }, [fetchConversations]);

  // Set up polling or initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [user?.id, fetchConversations, fetchAvailableUsers]);

  return {
    threads,
    messagesByThread,
    availableUsers,
    loading,
    error,
    fetchConversations,
    fetchThread,
    sendMessage,
    refreshAll: useCallback(() => {
        fetchConversations();
        fetchAvailableUsers();
    }, [fetchConversations, fetchAvailableUsers])
  };
};

export default useMessaging;
