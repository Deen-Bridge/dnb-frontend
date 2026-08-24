# Secure document upload

How educator KYC documents (government ID, teaching/school certificate) get
from the browser into the review queue, and why the existing upload helper is
not used for them.

## Why not the Cloudinary helper

`lib/utils/cloudinaryUpload.js` posts to an **unsigned** Cloudinary upload
preset and returns `result.secure_url` — a permanently public asset URL. That
is the right trade-off for a course thumbnail and the wrong one for a passport
scan. Its `validateFile()` also checks only `file.size` and `file.type`, and
`file.type` is derived from the filename, so a renamed `.exe` passes.

Verification documents therefore use a separate path. A test
(`__tests__/documents/noPublicUpload.test.js`) fails the build if any file on
that path imports the Cloudinary uploader or grows a public-URL field.

## Client pre-flight

`lib/verification/documents/policy.js` → `validateDocumentFile(file)` runs
three checks, in order, before any network call:

| # | Check | Catches |
|---|-------|---------|
| 1 | Declared MIME is PDF / JPEG / PNG | wrong file picked |
| 2 | Size ≤ 10 MB | oversized scans |
| 3 | Leading bytes match the declared type | renamed executables, mislabelled files |

Check 3 is the one that matters. `lib/verification/documents/fileSignature.js`
reads the first 12 bytes and compares them against the known signatures:

- PDF — `25 50 44 46 2D` (`%PDF-`)
- JPEG — `FF D8 FF`
- PNG — `89 50 4E 47 0D 0A 1A 0A`

Recognisably hostile payloads (`MZ`, ELF, ZIP, RAR, gzip, `#!`) are named in
the rejection message rather than reported as a generic failure.

A file that fails validation never reaches the network — no signed upload
target is requested for it.

## Upload flow

Contract agreed with the educator-verification pipeline (dnb-backend#92):

```
1. POST /api/educators/applications/documents/upload-url
     → { documentId, uploadUrl, method, headers, expiresAt }

2. PUT <uploadUrl>                      (storage origin, short-lived, write-only)
     bare axios client — withCredentials: false, no Authorization header

3. POST /api/educators/applications/documents/:id/complete
     → { documentId, status: "scan_pending" | "accepted" | "rejected" }

4. GET  /api/educators/applications/documents/:id      (poll while scanning)
     → { documentId, status, scanMessage }

   DELETE /api/educators/applications/documents/:id     (remove / replace)
```

Step 2 deliberately uses a **bare** `axios` client rather than the app's
`axiosInstance`. The signed URL points at a third-party storage origin, and the
shared request interceptor would otherwise attach the user's bearer token to
it.

## What the client stores

Only `{ documentId, documentType, status, filename, uploadedAt }`. There is no
URL field, because no durable URL is ever produced. Viewing a submitted
document is a separate, deliberate call — `fetchDocumentSignedUrl()` in
`lib/actions/educators/fetchVerificationStatus.js` — which mints a fresh
time-limited URL on demand.

This is also why `next.config.mjs` needs no new `images.remotePatterns` entry:
the upload preview is a local `blob:` object URL built from the `File` the user
picked, and nothing renders a stored document as a remote image.

## UI

`components/organisms/educator-onboarding/DocumentUpload.jsx`, reachable at
`/educator-onboarding/documents` (step 4 of educator onboarding, entered from
the liveness capture step).

Per slot: drag/drop, click-to-browse, mobile camera capture (`capture="environment"`),
per-file progress, inline preview, replace, remove, and a *scan pending* state
that resolves to accepted or rejected.

## Tests

| File | Covers |
|------|--------|
| `__tests__/documents/magicBytes.test.js` | signature detection; renamed `.exe`, mislabelled PNG, ZIP-as-PNG; size and type gates |
| `__tests__/documents/DocumentUpload.test.jsx` | the real component → hook → action path: rejection before any network call, signed-URL upload, progress, scan pending → accepted/rejected, replace, remove, no public URL |
| `__tests__/documents/noPublicUpload.test.js` | static guard that the Cloudinary unsigned path stays out of the document flow |
| `e2e/documents.spec.js` | browser smoke: drag/drop, camera input, scan resolution, rejection before network (not run in CI) |

Run: `npm test`, and `npm run build && npx playwright test e2e/documents.spec.js`
for the e2e spec.
