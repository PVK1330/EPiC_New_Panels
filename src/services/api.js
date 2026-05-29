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

// Attach organisation slug header (token is no longer attached via Authorization, it uses HttpOnly cookies)
api.interceptors.request.use((config) => {
  const orgSlug = getOrganisationSlugFromHost();
  if (orgSlug) {
    config.headers["X-Organisation-Slug"] = orgSlug;
  }
  return config;
});

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
        await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
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
