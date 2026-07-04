import { API_BASE_URL } from "./constants";

/**
 * Origin for Socket.IO — ALWAYS the same host as the REST `API_BASE_URL`.
 *
 * - Production builds set VITE_API_BASE_URL (see .env.production →
 *   https://server.elitepic.co.uk), so the socket connects straight to the API.
 * - In development the env var is left unset: this returns "" and socket.io
 *   connects same-origin, where the Vite dev proxy (vite.config.js) forwards
 *   /socket.io to the backend on localhost:5000 (ws: true). That keeps the
 *   HttpOnly auth cookie same-origin on tenant subdomains — connecting the
 *   socket directly to localhost:5000 in dev would drop the cookie and fail
 *   the handshake.
 * - Safety net: a production page must NEVER end up on a localhost/dev-server
 *   socket. If a prod build somehow ships without the env var, derive the API
 *   origin from the platform domain (server.<platform>) instead of falling
 *   back to the page/dev origin.
 */
export function getMessagingSocketUrl() {
  const configured = String(API_BASE_URL || "").trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return configured.replace(/\/+$/, "");
    }
  }

  if (import.meta.env.PROD && typeof window !== "undefined") {
    const platform = String(
      import.meta.env.VITE_PLATFORM_DOMAIN || "",
    ).toLowerCase();
    const host = window.location.hostname.toLowerCase();
    if (
      platform &&
      platform !== "localhost" &&
      host !== "localhost" &&
      host !== "127.0.0.1"
    ) {
      return `${window.location.protocol}//server.${platform}`;
    }
  }

  // Dev: same-origin → Vite proxy forwards /socket.io to localhost:5000.
  return "";
}
