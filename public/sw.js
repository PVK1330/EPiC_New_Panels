/* ElitePic service worker — Web Push (desktop notifications).
 *
 * Chrome/Edge/Firefox keep this worker registered even when no ElitePic tab is
 * open; the browser wakes it when the backend sends a push, and we show an
 * OS-level notification. Clicking it focuses an existing ElitePic window (or
 * opens one) at the notification's target page.
 *
 * NOTE: the OS toast uses the SYSTEM notification sound — pages can only play
 * custom audio while a tab is open (that path is handled in-app by
 * notificationSound.js, which also chimes for background tabs).
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "New notification", message: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "New notification";
  const options = {
    body: payload.message || "",
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    // Same tag replaces rather than stacks duplicates of one notification.
    tag: payload.tag || undefined,
    data: { url: payload.url || "/" },
  };

  event.waitUntil(
    (async () => {
      // If an ElitePic window is FOCUSED, the in-page chime + badge already
      // announced it — showing an OS toast too would double-notify.
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const hasFocused = windows.some((w) => w.focused);
      if (hasFocused) return;
      await self.registration.showNotification(title, options);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Prefer re-using an open ElitePic window: focus it and route it to the
      // target page. Fall back to opening a fresh one.
      const existing = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
        if ("navigate" in existing) {
          await existing.navigate(targetUrl).catch(() => {});
        }
        return;
      }
      await self.clients.openWindow(targetUrl);
    })()
  );
});
