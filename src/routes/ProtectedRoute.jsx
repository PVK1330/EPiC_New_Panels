import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardRouteForUser } from '../utils/authResponse';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target = getDashboardRouteForUser(user);
    const currentPath = window.location.pathname.replace(/\/$/, '');
    if (currentPath === target.replace(/\/$/, '')) return children;
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
