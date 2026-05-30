import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from '../hooks/useAuth';
import { setCredentials } from '../store/slices/authSlice';
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
        }
      })
      .catch(() => {
        // Not authenticated — cookie missing or expired
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
