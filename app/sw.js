import { Serwist } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  StaleWhileRevalidate,
  NetworkFirst,
} from "serwist";
import {
  isPrivateNavigationPath,
  isPublicNavigationPath,
  PRIVATE_RUNTIME_CACHE_NAMES,
} from "../lib/pwa/cache-policy";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 8,
            maxAgeSeconds: 365 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler: new CacheFirst({
        cacheName: "static-font-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 8,
            maxAgeSeconds: 30 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: /\/_next\/static\/.+\.(?:js|css|json)$/i,
      handler: new CacheFirst({
        cacheName: "next-static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: /\/_next\/static\/media\/.+\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif)$/i,
      handler: new CacheFirst({
        cacheName: "next-static-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: /\/_next\/image\?url=.+$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "next-optimized-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "cloudinary-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 48,
            maxAgeSeconds: 7 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: ({ sameOrigin, url }) =>
        sameOrigin && url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ sameOrigin }) => !sameOrigin,
      handler: new NetworkOnly(),
    },
    {
      // Private navigations are never persisted or served from a shared cache.
      matcher: ({ request, url, sameOrigin }) =>
        request.mode === "navigate" &&
        sameOrigin &&
        isPrivateNavigationPath(url.pathname),
      handler: new NetworkOnly(),
    },
    {
      // Only the explicit public route allowlist may use an offline page cache.
      matcher: ({ request, url, sameOrigin }) =>
        request.mode === "navigate" &&
        sameOrigin &&
        isPublicNavigationPath(url.pathname),
      handler: new NetworkFirst({
        cacheName: "public-pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 24,
            maxAgeSeconds: 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    // API and unclassified same-origin requests are network-only by default.
    { matcher: ({ sameOrigin }) => sameOrigin, handler: new NetworkOnly() },
    {
      matcher: /.*/i,
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: {
      document: "/offline",
    },
  },
});

serwist.addEventListeners();

const clearPrivateCaches = async () => {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => PRIVATE_RUNTIME_CACHE_NAMES.includes(name))
      .map((name) => caches.delete(name))
  );
};

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_PRIVATE_CACHES") {
    event.waitUntil(clearPrivateCaches());
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearPrivateCaches());
});

// ─── Web Push notifications (issue #197) ────────────────────────────────────
// The backend delivers pushes via the web-push library. Payloads are JSON of
// the shape { title, body, icon, badge, tag, url, type, data }.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Deen Bridge";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-192x192-maskable.png",
    tag: payload.tag || payload.type || "deenbridge",
    renotify: Boolean(payload.renotify),
    requireInteraction: Boolean(payload.requireInteraction),
    data: { url: payload.url || "/dashboard", ...(payload.data || {}) },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Focus an existing tab on the target route, or open a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
