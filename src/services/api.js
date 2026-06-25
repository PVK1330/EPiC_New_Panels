import axios from "axios";
import { toast } from "react-hot-toast";
import store from "../store";
import { logout } from "../store/slices/authSlice";
import { API_BASE_URL } from "../utils/constants";
import { getOrganisationSlugFromHost } from "../utils/organisationHost";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// ── CSRF (double-submit cookie) ───────────────────────────────────────────────
// The token is read from the /api/csrf-token RESPONSE BODY and held in memory —
// NOT from document.cookie. This is essential for the multi-tenant setup: the
// frontend runs on tenant subdomains (e.g. acme.localhost) while the API sets its
// cookie on a different host (localhost), so the page cannot read that cookie.
// The browser still sends the cookie automatically to the API host; we echo the
// same token value in the header, so the server's double-submit check matches.
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["get", "head", "options"]);

let csrfToken = null;
let csrfBootstrap = null;

// Returns a valid CSRF token, fetching a fresh one when missing or when force=true
// (e.g. after a 403 because the server restarted with a new secret).
async function ensureCsrfToken(force = false) {
  if (csrfToken && !force) return csrfToken;
  if (!csrfBootstrap) {
    csrfBootstrap = axios
      .get(`${API_BASE_URL}/api/csrf-token`, { withCredentials: true })
      .then((res) => {
        csrfToken = res?.data?.csrfToken ?? res?.data?.data?.csrfToken ?? null;
        return csrfToken;
      })
      .catch(() => null)
      .finally(() => { csrfBootstrap = null; });
  }
  return csrfBootstrap;
}

// Attach organisation slug header, and the CSRF token on mutating requests.
// (The JWT itself is sent automatically via the HttpOnly cookie.)
api.interceptors.request.use(async (config) => {
  const orgSlug = getOrganisationSlugFromHost();
  if (orgSlug) {
    config.headers["X-Organisation-Slug"] = orgSlug;
  }

  const method = (config.method || "get").toLowerCase();
  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    if (!token) {
      // BUG-021: never send a mutating request without CSRF protection. Abort and
      // surface a clear, recoverable error instead of silently firing unprotected.
      throw new axios.Cancel(
        "Security token unavailable. Please refresh the page and try again.",
      );
    }
    config.headers[CSRF_HEADER] = token;
  }
  return config;
});

export { ensureCsrfToken };

// Flag to prevent infinite retry loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('reset-idle-timer'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/');

    // Self-heal a stale/invalid CSRF token: fetch a fresh one and retry once.
    if (
      error.response?.status === 403 &&
      /csrf/i.test(error.response?.data?.message || "") &&
      originalRequest &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      const token = await ensureCsrfToken(true);
      if (token) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers[CSRF_HEADER] = token;
        return api(originalRequest);
      }
    }

    // Org subscription expired: an admin hit a gated endpoint. Funnel them to the
    // renewal page so they can pay & reactivate. (/api/billing/* is exempt, so
    // this never fires there — no redirect loop.)
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "SUBSCRIPTION_EXPIRED" &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/admin/subscription")
    ) {
      window.location.href = "/admin/subscription";
      return Promise.reject(error);
    }

    // Sponsor licence inactive: a gated business action (CoS request, sponsored
    // worker, worker sponsorship action) was blocked by requireActiveSponsorLicence.
    // Surface the server's message once and refresh the cached licence state so the
    // UI re-gates. `__licenceBlocked` lets callers skip their own duplicate toast.
    if (
      error.response?.status === 403 &&
      /licence is not active/i.test(error.response?.data?.message || "")
    ) {
      error.__licenceBlocked = true;
      if (typeof window !== "undefined") {
        toast.error(error.response.data.message, { id: "licence-inactive" });
        window.dispatchEvent(new Event("licence:refresh"));
      }
      return Promise.reject(error);
    }

    // If we get a 401 and it's NOT the auth endpoint, try to refresh
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshCsrf = await ensureCsrfToken();
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: refreshCsrf ? { [CSRF_HEADER]: refreshCsrf } : {},
          },
        );
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);

        // Ask the server to clear both cookies (Set-Cookie: Max-Age=0).
        // Best-effort — we navigate to /login regardless of whether this call
        // succeeds so a network failure here doesn't trap the user.
        try {
          const logoutCsrf = await ensureCsrfToken();
          await axios.post(
            `${API_BASE_URL}/api/auth/logout`,
            {},
            {
              withCredentials: true,
              headers: logoutCsrf ? { [CSRF_HEADER]: logoutCsrf } : {},
            },
          );
        } catch {
          // swallow — clearing cookies is best-effort
        }

        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    if (error.response?.status === 401 && isAuthEndpoint && originalRequest.url.includes('/refresh')) {
      store.dispatch(logout());
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
