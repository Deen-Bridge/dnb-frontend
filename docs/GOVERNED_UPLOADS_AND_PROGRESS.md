# Governed uploads and per-user course progress

## Uploads

Course and reel media now request a short-lived upload target from
`POST /api/uploads/targets`. The request contains only a governed resource kind
(`course-thumbnail`, `course-video`, or `reel-poster`), the browser-observed size,
and MIME type. Callers cannot supply a Cloudinary preset or folder.

The client verifies the returned target before sending bytes: it must be
unexpired, scoped to the requested kind, contain a non-empty server-controlled
folder, and authorize the file's size and MIME type. The upload response is an
asset ID in `pending_scan` state, never a public `secure_url`; publication must
wait for the server's ownership, metadata, and moderation checks. The server
should expire and garbage-collect unclaimed assets and enforce per-user quota
and rate limits.

## Course progress

Progress cache and availability are scoped by API environment, authenticated
user, and course. A failure for one user or course no longer disables syncing
for everyone in the browser. Local entries carry `updatedAt` and `version`;
reconciliation chooses the newest entry while preserving completion when the
completion policy has already been met. The hook exposes `syncStatus` and
`retrySync` so the UI can represent offline/degraded operation honestly and
retry deliberately after a route or account change.
