import { createSlice } from '@reduxjs/toolkit';
import { getToken, getUser, setToken, setUser, clearAuth } from '../../utils/storage';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUser(),
    token: getToken(),
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      setToken(action.payload.token);
      setUser(action.payload.user);
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
