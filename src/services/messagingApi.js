import api from "./api";

/**
 * Messaging API service for EPiC CRM.
 * Maps to the backend endpoints for thread-based messaging.
 */

/**
 * Get available users to chat with.
 * Returns a list of users based on current user's role.
 */
export const getAvailableChatUsers = () => api.get("/api/messages/users");

/**
 * Get all conversations for the current user.
 * Returns a list of thread previews (Inbox).
 */
export const getConversations = () => api.get("/api/messages/conversations");

/**
 * Get the full message thread with a specific user.
 * @param {string|number} otherUserId - ID of the user to load thread with.
 * @param {string|number} [caseId] - Optional case ID context.
 */
export const getMessageThread = (otherUserId, caseId) => {
  const params = caseId ? { caseId } : {};
  return api.get(`/api/messages/${otherUserId}`, { params });
};

/**
 * Send a message.
 * @param {Object} data
 * @param {number|string} data.receiverId
 * @param {string} data.content
 * @param {string} [data.messageType='text']
 * @param {number|string} [data.caseId]
 */
export const sendMessage = (data) => api.post("/api/messages", data);

/**
 * Mark messages from a specific sender as read.
 * @param {number|string} senderId
 */
export const markMessagesAsRead = (senderId) => 
  api.put("/api/messages/mark-read", { senderId });

export default {
  getAvailableChatUsers,
  getConversations,
  getMessageThread,
  sendMessage,
  markMessagesAsRead
};
