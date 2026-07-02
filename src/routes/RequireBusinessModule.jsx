import { useLocation, Navigate } from "react-router-dom";
import useModuleAccess from "../hooks/useModuleAccess";
import { businessModuleForPath } from "./businessModuleRoutes";

/**
 * Route-level plan-based module guard for the /business subtree (mirrors
 * RequireAdminModule). Redirects to the dashboard when the org's plan does not
 * include the requested module, closing the direct-URL bypass that sidebar-only
 * filtering leaves open (frontend-guards-1).
 *
 * canAccess() fails OPEN on an empty/unloaded allowedModules list, so this only
 * restricts once the plan's module list is known.
 */
export default function RequireBusinessModule({ children }) {
  const { pathname } = useLocation();
  const { canAccess } = useModuleAccess();

  const moduleKey = businessModuleForPath(pathname);
  if (moduleKey && !canAccess(moduleKey)) {
    return <Navigate to="/business/dashboard" replace />;
  }
  return children;
}
