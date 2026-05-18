import { useSelector } from 'react-redux';
import { selectAllowedModules } from '../store/slices/authSlice';

export default function useModuleAccess() {
  const allowedModules = useSelector(selectAllowedModules);

  const canAccess = (moduleKey) => {
    if (!moduleKey) return true;
    if (!allowedModules || allowedModules.length === 0) return false;
    if (allowedModules.includes('*')) return true;
    return allowedModules.includes(moduleKey);
  };

  return { canAccess };
}
