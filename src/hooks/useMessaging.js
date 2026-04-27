import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import messagingApi from "../services/messagingApi";
import { getMessagingSocketUrl } from "../utils/socketOrigin";

const readListFromEnvelope = (resData, key) => {
  if (!resData) return [];
  const payload = resData.data ?? resData;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload[key])) return payload[key];
  return [];
};

const normalizeRoleLabel = (roleName) => {
  if (!roleName) return "User";
  return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
};

const mapApiMessageToUi = (msg, myId) => {
  let contentObj = msg.content;
  try {
    if (typeof msg.content === 'string' && msg.content.startsWith('{')) {
      contentObj = JSON.parse(msg.content);
    }
  } catch (e) {
    // Not a valid JSON string, ignore
  }

  const textStr =
    typeof contentObj === "object" && contentObj != null
      ? contentObj?.content
      : contentObj;

  const attachmentUrl = typeof contentObj === "object" && contentObj != null ? contentObj?.url : null;
  const originalName = typeof contentObj === "object" && contentObj != null ? contentObj?.originalName : null;

  return {
    id: msg.id,
    from: Number(msg.senderId) === Number(myId) ? "me" : "them",
    text: textStr || (typeof msg.content === 'string' && !msg.content.startsWith('{') ? msg.content : ""),
    meta: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    attachment: msg.messageType === "file" ? (originalName || "Attachment") : null,
    attachmentUrl: msg.messageType === "file" ? attachmentUrl : null,
    isRead: Boolean(msg.isRead),
  };
};

/**
 * @param {object} [opts]
 * @param {number|string|null|undefined} [opts.activeThreadPartnerId] — other user id for the open thread (inbox + socket context)
 */
const useMessaging = (opts = {}) => {
  const { activeThreadPartnerId } = opts;
  const { user, token } = useSelector((state) => state.auth);
  const [threads, setThreads] = useState([]);
  const [messagesByThread, setMessagesByThread] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userRef = useRef(user);
  userRef.current = user;
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const activePartnerRef = useRef(activeThreadPartnerId);
  activePartnerRef.current = activeThreadPartnerId;
  const fetchConversationsRef = useRef(null);
  const fetchThreadRef = useRef(null);
  const socketRef = useRef(null);
  const prevThreadSubRef = useRef(null);
  const openThreadConvRef = useRef(null);

  const activeThreadSubConvId = useMemo(() => {
    if (activeThreadPartnerId == null) return null;
    const row = threads.find((t) => Number(t.id) === Number(activeThreadPartnerId));
    const cid = row?.conversationId;
    if (cid == null) return null;
    const n = Number(cid);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [threads, activeThreadPartnerId]);

  openThreadConvRef.current = activeThreadSubConvId;

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await messagingApi.getConversations();

      const data = readListFromEnvelope(res.data, "conversations");
      const mappedThreads = data.map((conv) => {
        const otherUser = conv.user || {};
        const lastMsg = conv.lastMessage || {};
        const caseData = conv.case || {};

        const name = `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim();
        const preview = typeof lastMsg === "object" ? lastMsg?.content : lastMsg;

        return {
          id: otherUser.id,
          conversationId: conv.id,
          name: name || "Unknown User",
          initials: name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "??",
          role: normalizeRoleLabel(otherUser.role?.name),
          preview: preview || "No messages yet",
          time: String(lastMsg.createdAt || conv.lastMessageTime || "").split("T")[0],
          unread: conv.unreadCount ?? 0,
          caseId: caseData.id,
          caseDisplayId: caseData.caseId,
          avatarClass: "bg-indigo-600",
        };
      });
      setThreads(mappedThreads);
      setError(null);
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  fetchConversationsRef.current = fetchConversations;

  const fetchThread = useCallback(async (otherUserId, caseId) => {
    if (!otherUserId) return;
    try {
      const res = await messagingApi.getMessageThread(otherUserId, caseId);

      let data = readListFromEnvelope(res.data, "messages");
      if (!data.length) {
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) data = raw;
        else if (raw && Array.isArray(raw.messages)) data = raw.messages;
      }
      const myId = userRef.current?.id;
      const mappedMessages = data.map((msg) => mapApiMessageToUi(msg, myId));

      setMessagesByThread((prev) => ({
        ...prev,
        [otherUserId]: mappedMessages,
      }));

      const hasUnreadIncoming = data.some(
        (msg) =>
          Number(msg.senderId) === Number(otherUserId) && !Boolean(msg.isRead),
      );
      if (hasUnreadIncoming) {
        await messagingApi.markMessagesAsRead(otherUserId);
        setThreads((prev) =>
          prev.map((t) =>
            Number(t.id) === Number(otherUserId) ? { ...t, unread: 0 } : t,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to load thread", err);
    }
  }, []);

  fetchThreadRef.current = fetchThread;

  const markThreadAsRead = useCallback(async (otherUserId) => {
    if (!otherUserId) return { success: false };
    try {
      await messagingApi.markMessagesAsRead(otherUserId);
      setThreads((prev) =>
        prev.map((t) =>
          Number(t.id) === Number(otherUserId) ? { ...t, unread: 0 } : t,
        ),
      );
      setMessagesByThread((prev) => {
        const current = prev?.[otherUserId] || [];
        return {
          ...prev,
          [otherUserId]: current.map((m) =>
            m.from === "them" ? { ...m, isRead: true } : m,
          ),
        };
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to mark thread as read", err);
      return { success: false, error: err };
    }
  }, []);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const res = await messagingApi.getAvailableChatUsers();
      const data = readListFromEnvelope(res.data, "users");
      const mapped = data.map((u) => {
        const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
        return {
          id: u.id,
          name: name || "Unknown User",
          email: u.email || "",
          initials: name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "??",
          role: normalizeRoleLabel(u.role?.name),
        };
      });
      setAvailableUsers(mapped);
    } catch (err) {
      console.error("Failed to load available users", err);
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId, content, caseId = null, file = null) => {
      try {
        if (file) {
          const formData = new FormData();
          formData.append("receiverId", receiverId);
          formData.append("content", content || "");
          if (caseId) formData.append("caseId", caseId);
          formData.append("messageType", "file");
          formData.append("file", file);

          await messagingApi.sendMessage(formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } else {
          await messagingApi.sendMessage({
            receiverId,
            content,
            caseId,
            messageType: "text",
          });
        }

        // No local append — avoids duplicate when `message:new` also arrives.
        await Promise.all([fetchConversations(), fetchThread(receiverId, caseId)]);
        return { success: true };
      } catch (err) {
        console.error("Failed to send message", err);
        return { success: false, error: err };
      }
    },
    [fetchConversations, fetchThread],
  );

  const refreshAll = useCallback(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, [fetchConversations, fetchAvailableUsers]);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [user?.id, fetchConversations, fetchAvailableUsers]);

  /** Socket.IO — server emits `message:new`, `conversation:updated`, `messages:read` */
  useEffect(() => {
    if (!user?.id || !token) return undefined;

    const url = getMessagingSocketUrl();
    const socket = io(url, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelayMax: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const cid = openThreadConvRef.current;
      if (cid != null && Number.isFinite(cid) && cid > 0) {
        socket.emit("thread:subscribe", { conversationId: cid });
      }
    });

    const me = () => Number(userRef.current?.id);

    socket.on("message:new", (payload) => {
      const m = payload?.message;
      if (!m || m.id == null) return;
      const my = me();
      const s = Number(m.senderId);
      const r = Number(m.receiverId);
      if (my !== s && my !== r) return;

      const other = my === s ? r : s;
      const mappedMsg = mapApiMessageToUi(m, my);

      setMessagesByThread((prev) => {
        const list = prev[other] || [];
        const mid = Number(m.id);
        if (!Number.isFinite(mid)) return prev;
        if (list.some((x) => Number(x.id) === mid)) return prev;
        return { ...prev, [other]: [...list, mappedMsg] };
      });

      const openPartner = Number(activePartnerRef.current);
      const isIncoming = s !== my;
      const threadOpen = openPartner === other;

      setThreads((prev) => {
        const idx = prev.findIndex((t) => Number(t.id) === other);
        if (idx === -1) {
          queueMicrotask(() => fetchConversationsRef.current?.());
          return prev;
        }
        return prev.map((t) => {
          if (Number(t.id) !== other) return t;
          return {
            ...t,
            preview: mappedMsg.text,
            time: String(m.createdAt || "").split("T")[0] || t.time,
          };
        });
      });

      if (threadOpen && isIncoming) {
        const tid = Number(other);
        const caseId =
          threadsRef.current?.find((t) => Number(t.id) === tid)?.caseId ?? null;
        queueMicrotask(() => fetchThreadRef.current?.(tid, caseId));
      }
    });

    socket.on("conversation:updated", (payload) => {
      const cid = payload?.conversationId;
      if (cid == null) return;
      const last = payload.lastMessage || {};
      const preview = last.content ?? "";
      const timeStr = last.createdAt
        ? String(last.createdAt).split("T")[0]
        : "";

      setThreads((prev) => {
        const idx = prev.findIndex((t) => Number(t.conversationId) === Number(cid));
        if (idx === -1) {
          queueMicrotask(() => fetchConversationsRef.current?.());
          return prev;
        }
        return prev.map((t) =>
          Number(t.conversationId) === Number(cid)
            ? {
                ...t,
                unread: payload.unreadCount ?? t.unread,
                preview: preview || t.preview,
                time: timeStr || t.time,
              }
            : t,
        );
      });
    });

    socket.on("messages:read", (payload) => {
      const reader = Number(payload?.readerUserId);
      const my = me();
      if (reader === my) {
        const sender = Number(payload?.senderId);
        setMessagesByThread((prev) => ({
          ...prev,
          [sender]: (prev[sender] || []).map((msg) =>
            msg.from === "them" ? { ...msg, isRead: true } : msg,
          ),
        }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, token]);

  useEffect(() => {
    const socket = socketRef.current;
    const next = activeThreadSubConvId;
    const prev = prevThreadSubRef.current;

    if (prev != null && prev !== next && socket?.connected) {
      socket.emit("thread:unsubscribe", { conversationId: prev });
    }
    prevThreadSubRef.current = next;

    if (!socket?.connected || next == null) {
      return undefined;
    }
    socket.emit("thread:subscribe", { conversationId: next });
    return undefined;
  }, [activeThreadSubConvId]);

  return {
    threads,
    messagesByThread,
    availableUsers,
    loading,
    error,
    fetchConversations,
    fetchThread,
    markThreadAsRead,
    sendMessage,
    refreshAll,
  };
};

export default useMessaging;
