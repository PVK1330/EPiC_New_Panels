import { useSelector } from 'react-redux';
import { selectAllowedModules } from '../store/slices/authSlice';

export default function useModuleAccess() {
  const allowedModules = useSelector(selectAllowedModules);
  const token = useSelector((state) => state.auth.token);

  const canAccess = (moduleKey) => {
    if (!moduleKey) return true;
    if (!token) return false;
    if (!allowedModules || allowedModules.length === 0) return true;
    if (allowedModules.includes('*')) return true;
    return allowedModules.includes(moduleKey);
  };

  return { canAccess };
}
