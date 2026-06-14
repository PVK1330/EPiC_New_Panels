import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from '../hooks/useAuth';
import { setCredentials } from '../store/slices/authSlice';
import { setOrgSettings } from '../store/slices/orgSettingsSlice';
import { normalizeAuthUser } from '../utils/authResponse';
import { apiClient } from '../services/axios.instance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user } = useSelector((state) => state.auth);
  const { login, register, logout, isLoading } = useAuth();
  const dispatch = useDispatch();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Restore session on page refresh via httpOnly cookie
  useEffect(() => {
    if (user || sessionChecked) return;

    let cancelled = false;
    apiClient.get('/api/auth/me')
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        if (data?.user) {
          const normalized = normalizeAuthUser(data.user);
          dispatch(setCredentials({
            user: normalized,
            token: 'httpOnly',
            allowedModules: data.allowedModules ?? [],
          }));
          if (data.user.organisation) {
            dispatch(setOrgSettings(data.user.organisation));
          }
        }
      })
      .catch((err) => {
        // BUG-024: a failed /auth/me means no valid session (cookie missing or
        // expired). This is expected for logged-out visitors on public pages, so
        // we do NOT force a redirect here — route guards already send protected
        // routes to /login. We surface it for diagnostics instead of swallowing.
        if (err?.response && err.response.status !== 401) {
          // 401 is the normal "not authenticated" case; anything else is unusual.
          console.warn('Session restoration check failed:', err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });

    return () => { cancelled = true; };
  }, [user, sessionChecked, dispatch]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, register, isLoading, sessionChecked }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
