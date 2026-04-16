import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setup2FA, verifySetup2FA, disable2FA, verifyTwoFactor } from '../services/auth.service';
import { setCredentials } from '../store/slices/authSlice';
import { ROLE_NAMES, ROLE_ROUTES } from '../utils/constants';

const useTwoFactor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const setupTwoFactor = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await setup2FA();
      return res.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSetup = async (token, backupCodes) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await verifySetup2FA({ token, backupCodes });
      return res.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async (password) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await disable2FA({ password });
      return res.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLoginTwoFactor = async (email, password, token) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await verifyTwoFactor({ email, password, token });
      const { user: userData, token: jwtToken } = res.data;
      const role = ROLE_NAMES[userData.role_id] || 'candidate';
      dispatch(setCredentials({ user: { ...userData, role }, token: jwtToken }));
      sessionStorage.removeItem('pending_2fa_email');
      sessionStorage.removeItem('pending_2fa_password');
      navigate(ROLE_ROUTES[userData.role_id] || '/candidate/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupTwoFactor,
    confirmSetup,
    disableTwoFactor,
    verifyLoginTwoFactor,
    isLoading,
    error,
  };
};

export default useTwoFactor;
