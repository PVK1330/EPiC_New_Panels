import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { logoutUser } from '../../services/auth.service';
import { getSecuritySettings } from '../../services/platformSettingsApi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SessionTimeout = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // BUG-010: this is now the single app-wide inactivity mechanism. Superadmins
  // previously had a separate useIdleTimer that read inactivity_timeout_minutes
  // from the platform security settings; preserve that source for superadmins
  // while every other role uses the env-configured default.
  const [platformTimeoutMinutes, setPlatformTimeoutMinutes] = useState(null);
  const isSuperadmin = String(user?.role || '').toLowerCase() === 'superadmin';

  // Timeout values in milliseconds
  // Get from env, fallback to 60 if not set. Default is 60 minutes.
  const idleTimeoutMinutes =
    (isSuperadmin && platformTimeoutMinutes) ||
    Number(import.meta.env.VITE_SESSION_IDLE_TIMEOUT) ||
    60;

  // Calculate when to show the warning. If timeout is <= 5 mins, show warning at half the time.
  const warningThresholdMinutes = idleTimeoutMinutes > 5 ? 5 : idleTimeoutMinutes / 2;
  const timeoutMs = idleTimeoutMinutes * 60 * 1000;
  const warningMs = (idleTimeoutMinutes - warningThresholdMinutes) * 60 * 1000;

  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const performLogout = useCallback(async () => {
    try {
      // Log the event before clearing auth state
      await api.post('/api/audit-logs/client-event', {
        action: 'SESSION_TIMEOUT',
        resource: 'Session',
        details: `Auto-logout due to ${idleTimeoutMinutes} minutes of inactivity.`
      });
    } catch (err) {
      // Ignore if it fails, we still need to logout
    }

    // Clear the server session + httpOnly auth cookies, otherwise /api/auth/me
    // would silently restore the session on the next page load.
    try {
      await logoutUser();
    } catch (err) {
      // Ignore — local state is cleared regardless.
    }

    dispatch(logout());
    setShowWarning(false);
    toast.error('You have been logged out due to inactivity.');
    navigate('/login');
  }, [dispatch, navigate, idleTimeoutMinutes]);

  // Superadmin-only: pull the configured inactivity timeout from platform settings.
  useEffect(() => {
    if (!token || !isSuperadmin) {
      setPlatformTimeoutMinutes(null);
      return;
    }
    let cancelled = false;
    getSecuritySettings()
      .then((res) => {
        const minutes = res?.data?.data?.settings?.inactivity_timeout_minutes;
        if (!cancelled && Number.isFinite(Number(minutes)) && Number(minutes) > 0) {
          setPlatformTimeoutMinutes(Number(minutes));
        }
      })
      .catch(() => {
        // Settings unreachable — fall back to the env/default timeout.
      });
    return () => {
      cancelled = true;
    };
  }, [token, isSuperadmin]);

  const startTimers = useCallback(() => {
    if (!token) return;

    clearTimeout(timerRef.current);
    clearTimeout(warningTimerRef.current);

    // Set timer to show warning
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, warningMs);

    // Set timer to logout
    timerRef.current = setTimeout(() => {
      performLogout();
    }, timeoutMs);
  }, [token, warningMs, timeoutMs, performLogout]);

  const resetTimers = useCallback(() => {
    if (showWarning) {
      setShowWarning(false);
    }
    startTimers();
  }, [startTimers, showWarning]);

  useEffect(() => {
    if (!token) {
      clearTimeout(timerRef.current);
      clearTimeout(warningTimerRef.current);
      setShowWarning(false);
      return;
    }

    startTimers();

    // DOM Events
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    
    // Custom event dispatched from api.js interceptor
    const apiEvent = 'reset-idle-timer';

    const handleInteraction = () => resetTimers();

    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });
    
    window.addEventListener(apiEvent, handleInteraction);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(warningTimerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      window.removeEventListener(apiEvent, handleInteraction);
    };
  }, [token, startTimers, resetTimers]);

  // Reset timer on route change
  useEffect(() => {
    if (token) {
      resetTimers();
    }
  }, [location.pathname, token, resetTimers]);

  return (
    <>
      {children}
      
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session Expiring Soon</h3>
            <p className="text-gray-600 mb-6">
              Your session will expire in {warningThresholdMinutes} minutes due to inactivity. Would you like to stay signed in?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={performLogout}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={resetTimers}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors shadow-sm"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimeout;
