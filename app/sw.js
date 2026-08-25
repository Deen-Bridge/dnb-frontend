import { Serwist } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  StaleWhileRevalidate,
  NetworkFirst,
} from "serwist";

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
      matcher: /\/api\/books\/[^/]+\/preview/i,
      handler: new StaleWhileRevalidate({
        cacheName: "book-previews",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 7 * 24 * 60 * 60,
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
      matcher: ({ request, url, sameOrigin }) =>
        request.headers.get("Content-Type")?.includes("text/html") &&
        sameOrigin,
      handler: new NetworkFirst({
        cacheName: "pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: ({ sameOrigin, url }) => sameOrigin,
      handler: new NetworkFirst({
        cacheName: "same-origin-others",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
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
