import { io } from "socket.io-client";
import { getMessagingSocketUrl } from "../utils/socketOrigin";

let socketInstance = null;

// Auth is cookie-based: the browser sends the HttpOnly `token` cookie on the
// Socket.IO handshake because withCredentials is enabled. No JWT is read from
// localStorage. The backend (socketServer.js) reads the token from that cookie.
const createSocket = () => {
  const socket = io(getMessagingSocketUrl(), {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
  });
  // Prevent unhandled connect_error events from surfacing as console errors
  // when auth isn't ready yet (e.g. page loads before cookie is propagated).
  socket.on("connect_error", () => {});
  return socket;
};

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = createSocket();
  }
  return socketInstance;
};

const socketService = {
  connect() {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  },

  disconnect() {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  on(event, handler) {
    if (!event || typeof handler !== "function") return;
    getSocket().on(event, handler);
  },

  off(event, handler) {
    if (!socketInstance || !event) return;
    if (handler) {
      socketInstance.off(event, handler);
      return;
    }
    socketInstance.off(event);
  },

  emit(event, payload) {
    if (!event) return;
    getSocket().emit(event, payload);
  },
};

export default socketService;
