import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, token } = useSelector((state) => state.auth);
  const { login, register, logout, isLoading } = useAuth();

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout, register, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
