/**
 * useIdleTimer.js
 * Superadmin-only inactivity auto-logout.
 *
 * Behaviour:
 *  - Fetches inactivity_timeout_minutes from GET /api/superadmin/settings/security
 *  - Tracks mouse, keyboard, touch, and scroll events to detect activity
 *  - Shows a warning toast 60 s before the deadline
 *  - Dispatches logout() and navigates to /login when the timer expires
 *  - Resets cleanly on any user activity
 *
 * Usage: call once inside SuperadminLayout (already authenticated).
 */

import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { logout } from "../store/slices/authSlice";
import { getSecuritySettings } from "../services/platformSettingsApi";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
const WARN_BEFORE_MS  = 60_000; // show warning 60 s before logout
const FALLBACK_MS     = 30 * 60_000; // 30 min if API is unreachable
const MIN_TIMEOUT_MS  = 60_000;      // never less than 1 min

export default function useIdleTimer() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  // Refs so callbacks always see the latest values without re-registering listeners
  const timeoutMsRef    = useRef(FALLBACK_MS);
  const logoutTimerRef  = useRef(null);
  const warnTimerRef    = useRef(null);
  const warnToastIdRef  = useRef(null);
  const mountedRef      = useRef(true);

  // ── Logout ────────────────────────────────────────────────────────────────
  const doLogout = useCallback(() => {
    if (!mountedRef.current) return;
    // Dismiss the warning toast if still showing
    if (warnToastIdRef.current) {
      toast.dismiss(warnToastIdRef.current);
      warnToastIdRef.current = null;
    }
    dispatch(logout());
    navigate("/login", { replace: true });
    toast("Signed out due to inactivity.", { icon: "🔒" });
  }, [dispatch, navigate]);

  // ── Schedule timers ───────────────────────────────────────────────────────
  const schedule = useCallback(() => {
    // Clear any existing timers
    clearTimeout(logoutTimerRef.current);
    clearTimeout(warnTimerRef.current);
    if (warnToastIdRef.current) {
      toast.dismiss(warnToastIdRef.current);
      warnToastIdRef.current = null;
    }

    const total   = timeoutMsRef.current;
    const warnAt  = Math.max(total - WARN_BEFORE_MS, 0);

    // Warning toast
    if (warnAt > 0) {
      warnTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        const secs = Math.round(WARN_BEFORE_MS / 1000);
        warnToastIdRef.current = toast(
          `You will be signed out in ${secs} seconds due to inactivity.`,
          {
            duration: WARN_BEFORE_MS,
            icon: "⚠️",
            style: { fontWeight: 600 },
          }
        );
      }, warnAt);
    }

    // Logout timer
    logoutTimerRef.current = setTimeout(doLogout, total);
  }, [doLogout]);

  // ── Reset on activity ─────────────────────────────────────────────────────
  const reset = useCallback(() => {
    schedule();
  }, [schedule]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // Fetch the configured timeout from the platform security settings
    getSecuritySettings()
      .then((res) => {
        const minutes = res.data?.data?.settings?.inactivity_timeout_minutes;
        const ms = Number.isFinite(Number(minutes))
          ? Math.max(Number(minutes) * 60_000, MIN_TIMEOUT_MS)
          : FALLBACK_MS;
        timeoutMsRef.current = ms;
      })
      .catch(() => {
        // API unreachable — use fallback; timer still runs
        timeoutMsRef.current = FALLBACK_MS;
      })
      .finally(() => {
        if (mountedRef.current) schedule();
      });

    // Attach activity listeners (passive for scroll/touch performance)
    const opts = { passive: true };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, opts));

    return () => {
      mountedRef.current = false;
      clearTimeout(logoutTimerRef.current);
      clearTimeout(warnTimerRef.current);
      if (warnToastIdRef.current) toast.dismiss(warnToastIdRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset, opts));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // schedule and reset are stable refs — intentionally omitted from deps
}
