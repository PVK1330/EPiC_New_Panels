import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setup2FA, verifySetup2FA, disable2FA, verifyTwoFactor } from '../services/auth.service';
import { setCredentials } from '../store/slices/authSlice';
import { getAuthUserAndToken, getDashboardRouteForUser, resolveLoginRole } from '../utils/authResponse';

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

  const verifyLoginTwoFactor = async (email, token) => {
    setIsLoading(true);
    setError('');
    try {
      // BUG-003: the password is intentionally not sent — /2fa/verify needs only { email, token }.
      const res = await verifyTwoFactor({ email, token });
      const { user: userData, allowedModules } = getAuthUserAndToken(res);
      if (!userData) {
        throw new Error(res?.message || 'Invalid 2FA response');
      }
      const role = resolveLoginRole(userData);
      const user = {
        ...userData,
        role,
        organisation_id: userData.organisation_id ?? null,
      };
      dispatch(setCredentials({
        user,
        allowedModules,
      }));
      sessionStorage.removeItem('pending_2fa_email');
      navigate(getDashboardRouteForUser(user));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
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
