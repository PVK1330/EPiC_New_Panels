import { useState, useCallback, useEffect, useRef, useMemo, useContext } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import messagingApi from "../services/messagingApi";
import { getMessagingSocketUrl } from "../utils/socketOrigin";
import { formatTime, formatDateLong } from "../utils/datetime";
import ToastContext from "../context/ToastContext";
import { getApiError } from "../utils/apiError";

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

const parseMessageContent = (content) => {
  let contentObj = content;
  try {
    if (typeof content === "string" && content.startsWith("{")) {
      contentObj = JSON.parse(content);
    }
  } catch {
    // plain text
  }
  if (typeof contentObj === "object" && contentObj != null) {
    return {
      text: contentObj.content || "",
      attachmentName: contentObj.originalName || null,
    };
  }
  return {
    text: typeof contentObj === "string" ? contentObj : "",
    attachmentName: null,
  };
};

const threadPreviewFromLastMessage = (lastMsg) => {
  if (!lastMsg) return "No messages yet";
  if (lastMsg.messageType === "file") {
    const { attachmentName } = parseMessageContent(lastMsg.content);
    return attachmentName ? `📎 ${attachmentName}` : "📎 Attachment";
  }
  const { text } = parseMessageContent(lastMsg.content);
  return text || "No messages yet";
};

const formatThreadListTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return formatTime(d);
  }
  return formatDateLong(d, { month: "short" });
};

const sortThreadsByRecent = (list) =>
  [...list].sort((a, b) => {
    const timeA = a.rawTime ? new Date(a.rawTime).getTime() : 0;
    const timeB = b.rawTime ? new Date(b.rawTime).getTime() : 0;
    return timeB - timeA;
  });

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
    meta: formatTime(msg.createdAt),
    attachment: msg.messageType === "file" ? (originalName || "Attachment") : null,
    attachmentUrl: msg.messageType === "file" ? attachmentUrl : null,
    isRead: Boolean(msg.isRead),
    // Phase 2 UAT 3.4: sent → delivered → read (shown as ticks on my messages).
    status:
      msg.status ||
      (msg.readAt || msg.isRead ? "read" : msg.deliveredAt ? "delivered" : "sent"),
  };
};

// Upgrade a message's status; never downgrade (read > delivered > sent).
const STATUS_RANK = { sent: 1, delivered: 2, read: 3 };
const upgradeStatus = (current, next) =>
  (STATUS_RANK[next] || 0) > (STATUS_RANK[current] || 0) ? next : current;

/**
 * @param {object} [opts]
 * @param {number|string|null|undefined} [opts.activeThreadPartnerId] — other user id for the open thread (inbox + socket context)
 */
const useMessaging = (opts = {}) => {
  const { activeThreadPartnerId } = opts;
  const { user, token } = useSelector((state) => state.auth);
  const toastCtx = useContext(ToastContext);
  const showToastRef = useRef(null);
  showToastRef.current = toastCtx?.showToast || null;
  const [threads, setThreads] = useState([]);
  const [messagesByThread, setMessagesByThread] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Live socket state — lets consumers (dropdowns) poll only as a fallback.
  const [connected, setConnected] = useState(false);

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
  const hasConnectedRef = useRef(false);

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
        const rawTime = lastMsg.createdAt || conv.lastMessageTime || null;

        return {
          id: otherUser.id,
          conversationId: conv.id,
          name: name || "Unknown User",
          initials: name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "??",
          role: normalizeRoleLabel(otherUser.role?.name),
          preview: threadPreviewFromLastMessage(lastMsg),
          time: formatThreadListTime(rawTime),
          rawTime,
          unread: conv.unreadCount ?? 0,
          caseId: caseData.id,
          caseDisplayId: caseData.caseId,
          avatarClass: "bg-indigo-600",
          profile_pic: otherUser.profile_pic || otherUser.avatar_url,
          hasLoggedIn: otherUser.hasLoggedIn,
        };
      });
      setThreads(sortThreadsByRecent(mappedThreads));
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
          profile_pic: u.profile_pic || u.avatar_url,
          hasLoggedIn: u.hasLoggedIn,
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
        let res;
        if (file) {
          const formData = new FormData();
          formData.append("receiverId", receiverId);
          formData.append("content", content || "");
          if (caseId) formData.append("caseId", caseId);
          formData.append("messageType", "file");
          formData.append("file", file);

          res = await messagingApi.sendMessage(formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } else {
          res = await messagingApi.sendMessage({
            receiverId,
            content,
            caseId,
            messageType: "text",
          });
        }

        // Phase 2 UAT 3.4: say how the message reaches someone who is not online.
        const delivery = res?.data?.delivery;
        if (delivery && !delivery.recipientOnline && delivery.emailNotificationSent) {
          showToastRef.current?.({
            variant: "info",
            message:
              "Sent. They're not in the portal right now, so we've emailed them to say a message is waiting.",
          });
        }

        // No local append — avoids duplicate when `message:new` also arrives.
        await Promise.all([fetchConversations(), fetchThread(receiverId, caseId)]);
        return { success: true };
      } catch (err) {
        console.error("Failed to send message", err);
        // Phase 2 UAT 3.4: a failed send used to look like nothing happened.
        showToastRef.current?.({
          variant: "danger",
          message: `Message not sent: ${getApiError(err, "please check your connection")}. Your text is still in the box — try again.`,
        });
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
    if (!user?.id) return undefined;

    const url = getMessagingSocketUrl();
    const socket = io(url, {
      auth: token ? { token } : {},
      // Auth lives in an HttpOnly cookie; withCredentials sends it on the handshake.
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelayMax: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // Resync after a RE-connect; the mount fetch already covers first connect.
      if (hasConnectedRef.current) {
        fetchConversationsRef.current?.();
      }
      hasConnectedRef.current = true;
      const cid = openThreadConvRef.current;
      if (cid != null && Number.isFinite(cid) && cid > 0) {
        socket.emit("thread:subscribe", { conversationId: cid });
      }
    });

    socket.on("disconnect", () => setConnected(false));

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

      const preview =
        mappedMsg.attachment
          ? `📎 ${mappedMsg.attachment}`
          : mappedMsg.text || "Message";
      const createdAt = m.createdAt || null;

      setThreads((prev) => {
        const idx = prev.findIndex((t) => Number(t.id) === other);
        if (idx === -1) {
          queueMicrotask(() => fetchConversationsRef.current?.());
          return prev;
        }
        const updated = prev.map((t) => {
          if (Number(t.id) !== other) return t;
          return {
            ...t,
            preview,
            time: formatThreadListTime(createdAt) || t.time,
            rawTime: createdAt || t.rawTime,
            unread: (isIncoming && !threadOpen)
              ? (t.unread || 0) + 1
              : (threadOpen ? 0 : t.unread),
          };
        });
        return sortThreadsByRecent(updated);
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

      const openPartner = Number(activePartnerRef.current);
      const openConv = openThreadConvRef.current;

      setThreads((prev) => {
        const idx = prev.findIndex((t) => Number(t.conversationId) === Number(cid));
        if (idx === -1) {
          queueMicrotask(() => fetchConversationsRef.current?.());
          return prev;
        }
        const updated = prev.map((t) => {
          if (Number(t.conversationId) !== Number(cid)) return t;
          const threadOpen =
            openConv != null &&
            Number(openConv) === Number(cid) &&
            openPartner === Number(t.id);
          const serverUnread = payload.unreadCount ?? t.unread;
          return {
            ...t,
            unread: threadOpen ? 0 : serverUnread,
            preview: preview || t.preview,
            time: last.createdAt
              ? formatThreadListTime(last.createdAt)
              : timeStr || t.time,
            rawTime: last.createdAt || t.rawTime,
          };
        });
        return sortThreadsByRecent(updated);
      });
    });

    socket.on("messages:delivered", (payload) => {
      const other = Number(payload?.receiverId);
      const ids = new Set((payload?.messageIds || []).map(Number));
      if (!other || !ids.size) return;
      setMessagesByThread((prev) => ({
        ...prev,
        [other]: (prev[other] || []).map((msg) =>
          msg.from === "me" && ids.has(Number(msg.id))
            ? { ...msg, status: upgradeStatus(msg.status, "delivered") }
            : msg,
        ),
      }));
    });

    socket.on("messages:read", (payload) => {
      const reader = Number(payload?.readerUserId);
      const my = me();
      if (Number(payload?.senderId) === my && reader && reader !== my) {
        // I sent these; the other person has now read them.
        setMessagesByThread((prev) => ({
          ...prev,
          [reader]: (prev[reader] || []).map((msg) =>
            msg.from === "me" ? { ...msg, isRead: true, status: "read" } : msg,
          ),
        }));
      }
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
      hasConnectedRef.current = false;
      setConnected(false);
      if (socketRef.current) {
        const s = socketRef.current;
        // Small delay to ensure any pending connection attempts are handled
        // before we forcefully disconnect during rapid remounts.
        setTimeout(() => {
          if (s.connected || s.connecting) {
            s.disconnect();
          }
        }, 50);
        socketRef.current = null;
      }
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
    connected,
    fetchConversations,
    fetchThread,
    markThreadAsRead,
    sendMessage,
    refreshAll,
  };
};

export default useMessaging;
