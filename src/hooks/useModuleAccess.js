import { useSelector } from 'react-redux';
import { selectAllowedModules } from '../store/slices/authSlice';

export default function useModuleAccess() {
  const allowedModules = useSelector(selectAllowedModules);

  const user = useSelector((state) => state.auth.user);
  const isPlatformSuperAdmin =
    user?.role_id === 5 &&
    (user?.organisation_id == null || user?.organisation_id === '');

  const canAccess = (moduleKey) => {
    if (!moduleKey) return true;
    if (!user) return false;
    if (isPlatformSuperAdmin) return true;
    if (user?.organisation_id == null || user?.organisation_id === '') {
      // Platform staff: must be explicitly allowed
      if (!allowedModules || !Array.isArray(allowedModules)) return false;
      return allowedModules.includes(moduleKey) || allowedModules.includes('*');
    }
    // Tenant users: fail closed while modules are loading (empty list = not yet resolved)
    if (!allowedModules || !Array.isArray(allowedModules)) return false;
    if (allowedModules.length === 0) return false;
    if (allowedModules.includes('*')) return true;
    return allowedModules.includes(moduleKey);
  };

  return { canAccess };
}
