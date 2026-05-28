const USER_KEY = 'epic_user';
const MODULES_KEY = 'epic_allowed_modules';
const TOKEN_KEY = 'epic_token';

export const getUser = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));

export const getToken = () => localStorage.getItem(TOKEN_KEY) || null;
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

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
  localStorage.removeItem(TOKEN_KEY);
};

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
