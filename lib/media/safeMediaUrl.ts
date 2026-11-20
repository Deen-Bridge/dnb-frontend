const ALLOWED_HOSTS = new Set([
  "i.ibb.co",
  "media.istockphoto.com",
  "images.unsplash.com",
  "picsum.photos",
  "res.cloudinary.com",
  "cloudinary-marketing-res.cloudinary.com",
  "cdn.pixabay.com",
  "logo.clearbit.com",
  "lh3.googleusercontent.com",
]);

export function safeMediaUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
