import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLE_ROUTES } from '../utils/constants';

const RoleRoute = () => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) return <Navigate to="/login" replace />;

  return <Navigate to={ROLE_ROUTES[user.role_id] || '/login'} replace />;
};

export default RoleRoute;
