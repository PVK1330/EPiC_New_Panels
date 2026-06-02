import { io } from "socket.io-client";
import { getMessagingSocketUrl } from "../utils/socketOrigin";

let socketInstance = null;

const getSocketAuth = () => {
  const token = localStorage.getItem("epic_token");

  // Newer auth flows may not store a JWT in localStorage and rely on cookies.
  // Only send token when it is a real JWT-like value.
  if (token && token !== "httpOnly") {
    return { token };
  }

  return undefined;
};

const createSocket = () =>
  io(getMessagingSocketUrl(), {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: getSocketAuth(),
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
