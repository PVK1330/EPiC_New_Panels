import { useSelector } from 'react-redux';
import { selectAllowedModules } from '../store/slices/authSlice';

export default function useModuleAccess() {
  const allowedModules = useSelector(selectAllowedModules);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isPlatformPanel =
    user?.role === 'superadmin' &&
    (user?.organisation_id == null || user?.organisation_id === '');

  const canAccess = (moduleKey) => {
    if (!moduleKey) return true;
    if (!token) return false;
    if (allowedModules.includes('*')) return true;
    if (!allowedModules || allowedModules.length === 0) {
      return isPlatformPanel ? false : true;
    }
    return allowedModules.includes(moduleKey);
  };

  return { canAccess };
}
