# Verification document access

The review page never receives a document blob or a long-lived public URL. It requests a short-lived signed URL from the authenticated document endpoint for the selected document ID. The backend must authorize the reviewer against the application, scope the signature to that document, record a document-access audit event without logging the URL or contents, and reject expired, cross-application, and non-reviewer requests.

Preview loading, failure, and expiry are explicit UI states; no preview failure changes or implies an approval decision. The signed URL is loaded with `no-referrer`, and the public profile link uses the canonical `/educators/:profileId` route.
