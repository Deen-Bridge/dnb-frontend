import { Serwist } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  StaleWhileRevalidate,
  NetworkFirst,
} from "serwist";

const PRECACHE_ENTRIES = self.__SW_MANIFEST || [];
const RELEASE_ID = PRECACHE_ENTRIES
  .map((entry) => entry.revision || entry.url)
  .join("-")
  .replace(/[^a-z0-9-]/gi, "")
  .slice(-24) || "development";
const RUNTIME_CACHE_PREFIX = "dnb-runtime-";
const cacheName = (name) => `${RUNTIME_CACHE_PREFIX}${name}-${RELEASE_ID}`;

function hasCredentials(request) {
  return Boolean(
    request.headers.get("Authorization") || request.headers.get("Cookie")
  );
}

function isPrivatePath(pathname) {
  return /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?(?:admin|dashboard|account|educator-onboarding)(?:\/|$)/i.test(pathname);
}

function isPublicDocumentRequest({ request, url, sameOrigin }) {
  return (
    sameOrigin &&
    request.method === "GET" &&
    request.destination === "document" &&
    !hasCredentials(request) &&
    !isPrivatePath(url.pathname)
  );
}

const serwist = new Serwist({
  precacheEntries: PRECACHE_ENTRIES,
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: cacheName("google-fonts"),
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
        cacheName: cacheName("static-font-assets"),
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
        cacheName: cacheName("next-static-assets"),
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
        cacheName: cacheName("next-static-images"),
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
        cacheName: cacheName("next-optimized-images"),
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
      matcher: ({ sameOrigin, url }) =>
        sameOrigin && url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ sameOrigin }) => !sameOrigin,
      handler: new NetworkOnly(),
    },
    {
      matcher: isPublicDocumentRequest,
      handler: new NetworkFirst({
        cacheName: cacheName("pages"),
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
      matcher: ({ sameOrigin, request }) =>
        sameOrigin && request.method === "GET" && !hasCredentials(request),
      handler: new NetworkFirst({
        cacheName: cacheName("same-origin-others"),
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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const cleanup = caches.keys().then((names) =>
    Promise.all(
      names
        .filter(
          (name) =>
            name.startsWith(RUNTIME_CACHE_PREFIX) &&
            !name.includes(`-${RELEASE_ID}`)
        )
        .map((name) => caches.delete(name))
    )
  );
  event.waitUntil(cleanup.catch((error) => console.error("[service-worker] activate", error)));
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
