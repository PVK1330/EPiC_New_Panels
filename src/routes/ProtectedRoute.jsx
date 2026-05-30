import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardRouteForUser } from '../utils/authResponse';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target = getDashboardRouteForUser(user);
    const currentPath = window.location.pathname.replace(/\/$/, '');
    if (currentPath === target.replace(/\/$/, '')) return children;
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
