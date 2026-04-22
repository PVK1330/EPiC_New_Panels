import { API_BASE_URL } from "./constants";

/** Origin for Socket.IO (same host as REST `API_BASE_URL`). */
export function getMessagingSocketUrl() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return String(API_BASE_URL).replace(/\/+$/, "");
  }
}
