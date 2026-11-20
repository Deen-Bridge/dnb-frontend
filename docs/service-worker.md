# Service-worker release contract

The app has one authoritative registration: `/sw.js`, installed by
`ServiceWorkerProvider`. Push notifications use that registration through
`navigator.serviceWorker.ready`; no feature may register a second worker.

## Cache ownership

- Serwist owns precache entries generated during `next build`.
- Runtime caches are named `dnb-runtime-<purpose>-<release-id>`. The release id
  is derived from the generated precache manifest, so a new build gets a new
  runtime namespace.
- API requests, requests with authorization/cookie headers, private routes,
  and cross-origin media are network-only. This prevents tokens, authenticated
  responses, admin pages, and private media from entering Cache Storage.
- On activation, the worker deletes old `dnb-runtime-*` namespaces. Logout
  also clears the runtime namespaces from the page.

## Update and rollback procedure

An updated worker remains waiting. The page shows a reload prompt and sends
`SKIP_WAITING` only after the user confirms. The `controllerchange` event then
reloads the page so the document and static assets come from the same release.

If a deployment is broken, deploy a corrected worker with the same process. For
an emergency invalidation, deploy a worker that deletes the `dnb-runtime-*`
namespaces and leaves `skipWaiting` disabled until the fixed release is ready.
The registration, install, and redundant-worker failures are reported through
the `dnb:service-worker-error` event and the browser console for telemetry
collection.
