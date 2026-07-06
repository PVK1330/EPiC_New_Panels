import { useCallback, useEffect, useState } from "react";
import {
  getPushPublicKey,
  subscribeToPush as apiSubscribe,
  unsubscribeFromPush as apiUnsubscribe,
} from "../services/notificationApi";

// Web Push (desktop notifications) — Instagram-style: once the user enables
// the toggle and grants the browser permission, the backend can raise an
// OS-level notification through the browser's push service even when no
// ElitePic tab is open (browser itself must be running).

const SW_URL = "/sw.js";

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// VAPID public key (base64url) → Uint8Array, as PushManager.subscribe expects.
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const getRegistration = async () => {
  // register() is idempotent — returns the existing registration when already
  // installed, so calling it on every check is safe and self-healing.
  return navigator.serviceWorker.register(SW_URL);
};

export const getExistingPushSubscription = async () => {
  if (!isPushSupported()) return null;
  try {
    const reg = await getRegistration();
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
};

/**
 * Enable desktop notifications for this browser.
 * MUST be called from a user gesture (the toggle click) — browsers only allow
 * the permission prompt during one.
 * @returns {{ ok: boolean, reason?: 'unsupported'|'denied'|'server-disabled'|'error' }}
 */
export const enableDesktopPush = async () => {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, reason: "denied" };

    const res = await getPushPublicKey();
    const { enabled, publicKey } = res.data?.data || {};
    if (!enabled || !publicKey) return { ok: false, reason: "server-disabled" };

    const reg = await getRegistration();
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    await apiSubscribe({ subscription: subscription.toJSON() });
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
};

/** Disable desktop notifications for this browser (removes server row too). */
export const disableDesktopPush = async () => {
  if (!isPushSupported()) return { ok: true };
  try {
    const reg = await getRegistration();
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe().catch(() => {});
      await apiUnsubscribe({ endpoint }).catch(() => {});
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
};

/**
 * React binding for the desktop-notifications toggle.
 * `enabled` means: browser permission granted AND this browser holds a live
 * push subscription.
 */
export const useDesktopPush = () => {
  const supported = isPushSupported();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    (async () => {
      const sub = await getExistingPushSubscription();
      if (!cancelled) {
        setEnabled(Boolean(sub) && Notification.permission === "granted");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const toggle = useCallback(async () => {
    if (!supported || busy) return { ok: false, reason: "unsupported" };
    setBusy(true);
    try {
      if (enabled) {
        const result = await disableDesktopPush();
        if (result.ok) setEnabled(false);
        return result;
      }
      const result = await enableDesktopPush();
      if (result.ok) setEnabled(true);
      return result;
    } finally {
      setBusy(false);
    }
  }, [supported, busy, enabled]);

  return { supported, enabled, busy, toggle };
};
