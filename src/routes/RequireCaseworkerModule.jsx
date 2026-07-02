import { useLocation, Navigate } from "react-router-dom";
import useModuleAccess from "../hooks/useModuleAccess";
import { caseworkerModuleForPath } from "./caseworkerModuleRoutes";

/**
 * Route-level plan-based module guard for the /caseworker subtree (mirrors
 * RequireAdminModule). Redirects to the dashboard when the org's plan does not
 * include the requested module, closing the direct-URL bypass that sidebar-only
 * filtering leaves open (frontend-guards-1, and specifically CaseworkerFinance
 * in frontend-guards-7).
 *
 * canAccess() fails OPEN on an empty/unloaded allowedModules list, so this only
 * restricts once the plan's module list is known — a transient empty list (e.g.
 * mid-session-restore) never locks a legitimate caseworker out.
 */
export default function RequireCaseworkerModule({ children }) {
  const { pathname } = useLocation();
  const { canAccess } = useModuleAccess();

  const moduleKey = caseworkerModuleForPath(pathname);
  if (moduleKey && !canAccess(moduleKey)) {
    return <Navigate to="/caseworker/dashboard" replace />;
  }
  return children;
}
