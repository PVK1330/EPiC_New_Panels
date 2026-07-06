import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardRouteForUser } from '../utils/authResponse';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, allowedRoleIds }) => {
  const { user } = useSelector((state) => state.auth);
  const { sessionChecked } = useAuthContext();

  // Wait for session restoration before making redirect decisions
  if (!user && !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // BUG-048: strict role gate. Previously, if the current path matched the user's
  // own dashboard route we returned children even when the role was not allowed —
  // that let a wrong-role user through via URL manipulation. Always redirect a
  // disallowed role to their own dashboard (or /login if that can't be resolved),
  // never render the gated children.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target = getDashboardRouteForUser(user) || '/login';
    return <Navigate to={target} replace />;
  }

  // Per-role narrowing for routes that must not be reachable by every platform
  // sub-role. All platform staff share the "superadmin" panel role, but the real
  // role_id is preserved — e.g. GDPR erasure is restricted to the superadmin
  // (role_id 5), mirroring the backend permission gate.
  if (allowedRoleIds && !allowedRoleIds.includes(Number(user.role_id))) {
    const target = getDashboardRouteForUser(user) || '/login';
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
