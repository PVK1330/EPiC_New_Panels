import { useLocation, Navigate } from "react-router-dom";
import useModuleAccess from "../hooks/useModuleAccess";
import { adminModuleForPath } from "./adminModuleRoutes";

/**
 * Route-level plan-based module guard for the /admin subtree. Redirects to the
 * dashboard when the org's plan does not include the requested module, closing
 * the direct-URL bypass that sidebar-only filtering leaves open.
 *
 * canAccess() fails OPEN on an empty/unloaded allowedModules list, so this only
 * restricts once the plan's module list is known — a transient empty list (e.g.
 * mid-session-restore) never locks a legitimate admin out. The hard payment gate
 * is enforced separately by the backend middleware + api.js 403 interceptor.
 */
export default function RequireAdminModule({ children }) {
  const { pathname } = useLocation();
  const { canAccess } = useModuleAccess();

  const moduleKey = adminModuleForPath(pathname);
  if (moduleKey && !canAccess(moduleKey)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}
