import { createSlice } from '@reduxjs/toolkit';
import { normalizeAuthUser } from '../../utils/authResponse';

// We no longer rely on localStorage. Everything is memory based. 
// Rehydration happens via /api/auth/me on App load.
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null, // token is now tracked in HttpOnly cookie, but we can keep a boolean or memory flag if needed. We'll leave it for legacy selectors.
    allowedModules: [],
    isAuthenticated: false,
    isRehydrating: true,
  },
  reducers: {
    setCredentials: (state, action) => {
      const user = normalizeAuthUser(action.payload.user);
      state.user = user;
      state.allowedModules = action.payload.allowedModules ?? state.allowedModules;
      state.isAuthenticated = true;
      state.isRehydrating = false;
      
      // We don't save the actual JWT to localStorage anymore.
      if (action.payload.token) {
        state.token = "httpOnly"; 
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setRehydrated: (state) => {
      state.isRehydrating = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.allowedModules = [];
      state.isAuthenticated = false;
      state.isRehydrating = false;
      sessionStorage.clear();
      // Remove any leftover localStorage tokens from old versions to be safe
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('allowedModules');
    },
  },
});

export const { setCredentials, logout, updateUser, setRehydrated } = authSlice.actions;
export const selectAllowedModules = (state) => state.auth.allowedModules;
export default authSlice.reducer;
