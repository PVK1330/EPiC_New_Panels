import axios from "axios";
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
const CSRF_COOKIE = "x-csrf-token";
const SAFE_METHODS = new Set(["get", "head", "options"]);

function readCookie(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// Ensures a CSRF cookie exists, fetching one from the backend if needed.
// The in-flight promise is shared so concurrent requests bootstrap only once.
let csrfBootstrap = null;
async function ensureCsrfToken() {
  let token = readCookie(CSRF_COOKIE);
  if (token) return token;
  if (!csrfBootstrap) {
    csrfBootstrap = axios
      .get(`${API_BASE_URL}/api/csrf-token`, { withCredentials: true })
      .catch(() => {})
      .finally(() => { csrfBootstrap = null; });
  }
  await csrfBootstrap;
  return readCookie(CSRF_COOKIE);
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
    if (token) config.headers[CSRF_COOKIE] = token;
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
        const csrfToken = await ensureCsrfToken();
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: csrfToken ? { [CSRF_COOKIE]: csrfToken } : {},
          },
        );
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
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
