import { createSlice } from '@reduxjs/toolkit';
import { getUser, setUser, clearAuth, getAllowedModules, setAllowedModules, getToken, setToken } from '../../utils/storage';
import { normalizeAuthUser } from '../../utils/authResponse';

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
      const allowedModules = action.payload.allowedModules ?? state.allowedModules;
      state.user = user;
      state.allowedModules = allowedModules;
      setUser(user);
      setAllowedModules(allowedModules);
      
      if (action.payload.token !== undefined) {
        state.token = action.payload.token;
        if (action.payload.token) {
          setToken(action.payload.token);
        }
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        setUser(updatedUser);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.allowedModules = [];
      clearAuth();
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export const selectAllowedModules = (state) => state.auth.allowedModules;
export default authSlice.reducer;
