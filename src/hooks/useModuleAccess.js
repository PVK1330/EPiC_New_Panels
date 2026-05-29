import { useSelector } from 'react-redux';
import { selectAllowedModules } from '../store/slices/authSlice';

export default function useModuleAccess() {
  const allowedModules = useSelector(selectAllowedModules);

  const user = useSelector((state) => state.auth.user);
  const isPlatformPanel =
    user?.role === 'superadmin' &&
    (user?.organisation_id == null || user?.organisation_id === '');

  const canAccess = (moduleKey) => {
    if (!moduleKey) return true;
    if (!user) return false;
    if (isPlatformPanel) return true;
    if (!allowedModules || !Array.isArray(allowedModules) || allowedModules.length === 0) return true;
    if (allowedModules.includes('*')) return true;
    return allowedModules.includes(moduleKey);
  };

  return { canAccess };
}
