const TOKEN_KEY = 'epic_token';
const USER_KEY = 'epic_user';

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  if (token === 'undefined' || token === 'null') return null;
  return token;
};
export const setToken = (t) => {
  localStorage.setItem(TOKEN_KEY, t);
  localStorage.setItem('token', t);
};
export const getUser = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem(USER_KEY);
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
