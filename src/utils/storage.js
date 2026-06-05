const USER_KEY = 'epic_user';
const MODULES_KEY = 'epic_allowed_modules';
// Legacy key — the JWT is no longer stored in localStorage (it lives in an
// HttpOnly cookie set by the backend). Kept only to purge stale values below.
const LEGACY_TOKEN_KEY = 'epic_token';

export const getUser = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));

export const getAllowedModules = () => {
  try {
    return JSON.parse(localStorage.getItem(MODULES_KEY) || '[]');
  } catch {
    return [];
  }
};
export const setAllowedModules = (modules) => {
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules ?? []));
};

export const clearAuth = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MODULES_KEY);
  // Defensive cleanup of any JWT left behind by older builds.
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

// Superadmin impersonation: the handoff itself no longer exposes a JWT — it uses
// a single-use ticket and an HttpOnly cookie (see impersonationTicket.service.js
// and AuthHandoffPage.jsx). These helpers only retain the superadmin's own user
// object (non-sensitive) so the UI can offer "return to platform"; the token
// argument is kept null and never persisted.
const IMPERSONATOR_TOKEN_KEY = 'epic_superadmin_token';
const IMPERSONATOR_USER_KEY = 'epic_superadmin_user';

export const saveImpersonatorSession = (token, user) => {
  if (token) sessionStorage.setItem(IMPERSONATOR_TOKEN_KEY, token);
  if (user) sessionStorage.setItem(IMPERSONATOR_USER_KEY, JSON.stringify(user));
};

export const getImpersonatorSession = () => {
  const token = sessionStorage.getItem(IMPERSONATOR_TOKEN_KEY);
  const userRaw = sessionStorage.getItem(IMPERSONATOR_USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
};

export const clearImpersonatorSession = () => {
  sessionStorage.removeItem(IMPERSONATOR_TOKEN_KEY);
  sessionStorage.removeItem(IMPERSONATOR_USER_KEY);
};
