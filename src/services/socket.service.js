import { io } from "socket.io-client";
import { getMessagingSocketUrl } from "../utils/socketOrigin";

let socketInstance = null;

// Auth is cookie-based: the browser sends the HttpOnly `token` cookie on the
// Socket.IO handshake because withCredentials is enabled. No JWT is read from
// localStorage. The backend (socketServer.js) reads the token from that cookie.
const createSocket = () =>
  io(getMessagingSocketUrl(), {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

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
