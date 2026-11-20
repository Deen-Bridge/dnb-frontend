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

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isPrivatePath(pathname) {
  return isPrivateNavigationPath(pathname);
}

function isPublicDocumentRequest({ request, url, sameOrigin }) {
  return (
    sameOrigin &&
    request.method === "GET" &&
    isNavigationRequest(request) &&
    !hasCredentials(request) &&
    isPublicNavigationPath(url.pathname)
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
      // Private navigations are never persisted or served from a shared cache.
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        isNavigationRequest(request) &&
        isPrivatePath(url.pathname),
      handler: new NetworkOnly(),
    },
    {
      // Only routes on the explicit public allowlist may use an offline page cache.
      matcher: isPublicDocumentRequest,
      handler: new NetworkFirst({
        cacheName: cacheName("public-pages"),
        plugins: [
          new ExpirationPlugin({
            maxEntries: 24,
            maxAgeSeconds: 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      // Generic same-origin reads stay cached only when they carry no account
      // context and are not document navigations.
      matcher: ({ request, url, sameOrigin }) =>
        sameOrigin &&
        request.method === "GET" &&
        !isNavigationRequest(request) &&
        !hasCredentials(request) &&
        !isPrivatePath(url.pathname),
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

const deleteCaches = (filter) =>
  caches
    .keys()
    .then((names) =>
      Promise.all(names.filter(filter).map((name) => caches.delete(name)))
    );

const clearLegacyPrivateCaches = () =>
  deleteCaches((name) => PRIVATE_RUNTIME_CACHE_NAMES.includes(name));

const clearPrivateCaches = () =>
  deleteCaches(
    (name) =>
      PRIVATE_RUNTIME_CACHE_NAMES.includes(name) ||
      name.startsWith(RUNTIME_CACHE_PREFIX)
  );

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_PRIVATE_CACHES") {
    event.waitUntil(
      clearPrivateCaches().catch((error) =>
        console.error("[service-worker] clear private caches", error)
      )
    );
  }
});

self.addEventListener("activate", (event) => {
  const cleanup = Promise.all([
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) =>
                name.startsWith(RUNTIME_CACHE_PREFIX) &&
                !name.includes(`-${RELEASE_ID}`)
            )
            .map((name) => caches.delete(name))
        )
      )
      .catch((error) => console.error("[service-worker] activate", error)),
    clearLegacyPrivateCaches().catch((error) =>
      console.error("[service-worker] activate", error)
    ),
  ]);
  event.waitUntil(cleanup);
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
