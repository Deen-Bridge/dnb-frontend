const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function safeExternalUrl(value, { baseUrl, allowedHosts } = {}) {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    const url = new URL(value, baseUrl || undefined);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    if (allowedHosts && !allowedHosts.includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function externalLinkProps(value) {
  const href = safeExternalUrl(value);
  return href ? { href, target: "_blank", rel: "noopener noreferrer", referrerPolicy: "no-referrer" } : null;
}
