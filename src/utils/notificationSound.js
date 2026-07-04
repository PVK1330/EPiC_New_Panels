import { useSyncExternalStore } from "react";

// Single shared "ding" for every panel's notification bell.
//
// The file lives in public/sounds/ so it is served from the frontend origin,
// cached by the browser after the first play, and swappable for a different
// sound without touching code (keep the same filename).
const SOUND_URL = "/sounds/notification.mp3";

// Per-device preference. localStorage (not Redux) so it survives reloads,
// works identically for tenant and superadmin panels, and needs no backend.
const STORAGE_KEY = "notification_sound_enabled";
const PREF_EVENT = "notification-sound-pref-changed";

// A burst of notifications (e.g. the SLA-breach cron creating several at once)
// must produce ONE ding, not a machine-gun of them.
const THROTTLE_MS = 3000;

let audio = null;
let lastPlayedAt = 0;

const ensureAudio = () => {
  if (!audio) {
    audio = new Audio(SOUND_URL);
    audio.preload = "auto";
    audio.volume = 0.5;
  }
  return audio;
};

// ── Autoplay unlock ───────────────────────────────────────────────────────────
// Browsers only allow audio started DURING a user gesture; a notification can
// arrive at any time, long after the last click. So on the first gesture after
// page load we prime the shared element with a muted play()+pause() — the
// browser then treats this element as user-activated and allows later
// programmatic plays (the same trick Slack/WhatsApp Web use). Until that first
// gesture happens, nothing can make a page audible — that is a hard browser
// policy, not a bug.
let unlocked = false;

const removeUnlockListeners = () => {
  window.removeEventListener("pointerdown", unlockOnFirstGesture, true);
  window.removeEventListener("keydown", unlockOnFirstGesture, true);
};

const unlockOnFirstGesture = () => {
  if (unlocked) return;
  try {
    const a = ensureAudio();
    a.muted = true;
    const p = a.play();
    const finishPriming = () => {
      a.pause();
      try {
        a.currentTime = 0;
      } catch {
        /* not loaded yet */
      }
      a.muted = false;
    };
    if (p && typeof p.then === "function") {
      p.then(() => {
        unlocked = true;
        finishPriming();
        removeUnlockListeners();
      }).catch(() => {
        a.muted = false; // didn't stick — retry on the next gesture
      });
    } else {
      unlocked = true;
      finishPriming();
      removeUnlockListeners();
    }
  } catch {
    /* priming is best-effort */
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlockOnFirstGesture, true);
  window.addEventListener("keydown", unlockOnFirstGesture, true);
}

export const isNotificationSoundEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true; // storage blocked (private mode) → default on, no persistence
  }
};

export const setNotificationSoundEnabled = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(Boolean(enabled)));
  } catch {
    /* storage blocked — toggle still applies to this page via the event */
  }
  window.dispatchEvent(new Event(PREF_EVENT));
};

/**
 * Play the notification chime. Safe to call from anywhere, any number of
 * times: respects the user's mute preference, throttles bursts, and never
 * throws — browsers reject play() until the user has interacted with the
 * page (autoplay policy), which we deliberately swallow.
 */
export const playNotificationSound = () => {
  if (!isNotificationSoundEnabled()) return;

  const now = Date.now();
  if (now - lastPlayedAt < THROTTLE_MS) return;
  lastPlayedAt = now;

  try {
    const a = ensureAudio();
    a.muted = false; // in case a ding lands mid-priming
    try {
      a.currentTime = 0;
    } catch {
      /* not loaded yet */
    }
    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {}); // NotAllowedError before first user interaction
    }
  } catch {
    /* sound must never break the app */
  }
};

// React binding for the mute toggle — re-renders subscribers when the
// preference changes in this tab (custom event) or another tab (storage event).
const subscribe = (onChange) => {
  window.addEventListener(PREF_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREF_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

export const useNotificationSoundEnabled = () =>
  useSyncExternalStore(subscribe, isNotificationSoundEnabled);
