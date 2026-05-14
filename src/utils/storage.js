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
