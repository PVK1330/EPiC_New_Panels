import { createSlice } from '@reduxjs/toolkit';
import { getToken, getUser, setToken, setUser, clearAuth } from '../../utils/storage';
import { normalizeAuthUser } from '../../utils/authResponse';

const getAllowedModules = () => {
  try {
    return JSON.parse(localStorage.getItem('epic_allowed_modules') || '[]');
  } catch {
    return [];
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: normalizeAuthUser(getUser()),
    token: getToken(),
    allowedModules: getAllowedModules(),
  },
  reducers: {
    setCredentials: (state, action) => {
      const user = normalizeAuthUser(action.payload.user);
      const allowedModules = action.payload.allowedModules ?? [];
      state.user = user;
      state.token = action.payload.token;
      state.allowedModules = allowedModules;
      setToken(action.payload.token);
      setUser(user);
      localStorage.setItem('epic_allowed_modules', JSON.stringify(allowedModules));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.allowedModules = [];
      clearAuth();
      localStorage.removeItem('epic_allowed_modules');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectAllowedModules = (state) => state.auth.allowedModules;
export default authSlice.reducer;
