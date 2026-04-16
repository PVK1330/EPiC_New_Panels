import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DASHBOARD_MAP = {
  admin: '/admin/dashboard',
  caseworker: '/caseworker/dashboard',
  candidate: '/candidate/dashboard',
  business: '/business/dashboard',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target = DASHBOARD_MAP[user.role] || '/login';
    const currentPath = window.location.pathname.replace(/\/$/, '');
    if (currentPath === target.replace(/\/$/, '')) return children;
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
