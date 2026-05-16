import { createSlice } from '@reduxjs/toolkit';
import { getToken, getUser, setToken, setUser, clearAuth } from '../../utils/storage';
import { normalizeAuthUser } from '../../utils/authResponse';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: normalizeAuthUser(getUser()),
    token: getToken(),
  },
  reducers: {
    setCredentials: (state, action) => {
      const user = normalizeAuthUser(action.payload.user);
      state.user = user;
      state.token = action.payload.token;
      setToken(action.payload.token);
      setUser(user);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      clearAuth();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
