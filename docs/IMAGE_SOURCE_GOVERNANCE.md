# Production image-source governance

Production `next/image` optimization is limited to `res.cloudinary.com`, the
controlled media origin. Cloudinary assets must be uploaded or approved by the
media/platform owners; user-generated content should use signed or validated
asset URLs rather than adding a new remote host to the application config.

The former hosts are intentionally removed from production configuration:

| Host | Decision | Reason |
| --- | --- | --- |
| `i.ibb.co` | Removed | Unowned image host |
| `media.istockphoto.com`, `images.unsplash.com`, `cdn.pixabay.com` | Removed | Licensing and provenance are not enforced by the client |
| `picsum.photos` | Removed | Placeholder/demo source |
| `logo.clearbit.com` | Removed | Third-party logo lookup is not governed |
| `lh3.googleusercontent.com` | Removed | External avatars must be proxied or persisted through the media service |
| `cloudinary-marketing-res.cloudinary.com` | Removed | Outside the application media boundary |

To approve a new origin, the media/platform owners must add its hostname, owner,
use case, and review rule to `config/approved-image-hosts.json`, then update
`next.config.mjs`. CI runs `npm run check:image-hosts` and rejects unreviewed
configuration. An unapproved URL is therefore not optimized by Next.js and must
be routed through the approved media boundary before use.
