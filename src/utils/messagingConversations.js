/**
 * Shared helpers for inbox/conversation API responses (dashboard widgets + hooks).
 */

export const extractConversationsFromResponse = (axiosResponse) => {
  const body = axiosResponse?.data;
  if (!body) return [];
  const payload = body.data ?? body;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.conversations)) return payload.conversations;
  if (Array.isArray(body.conversations)) return body.conversations;
  return [];
};

export const formatLastMessagePreview = (content, messageType) => {
  if (messageType === "file") {
    try {
      if (typeof content === "string" && content.startsWith("{")) {
        const parsed = JSON.parse(content);
        return parsed.originalName ? `📎 ${parsed.originalName}` : "📎 Attachment";
      }
    } catch {
      // fall through
    }
    return "📎 Attachment";
  }
  if (content == null || content === "") return "";
  if (typeof content === "object") {
    return content.content || content.originalName || "Message";
  }
  try {
    if (typeof content === "string" && content.startsWith("{")) {
      const parsed = JSON.parse(content);
      if (parsed.originalName) return `📎 ${parsed.originalName}`;
      return parsed.content || "Message";
    }
  } catch {
    // plain text
  }
  return String(content);
};

export const sortConversationsByRecent = (conversations) =>
  [...(Array.isArray(conversations) ? conversations : [])].sort((a, b) => {
    const tA = a?.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const tB = b?.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return tB - tA;
  });

export const normalizeConversationForDashboard = (conv) => {
  const last = conv?.lastMessage || {};
  const preview = formatLastMessagePreview(last.content, conv?.messageType);
  return {
    ...conv,
    user: conv.user || {},
    lastMessage: {
      ...last,
      preview: preview || "No message",
    },
  };
};
