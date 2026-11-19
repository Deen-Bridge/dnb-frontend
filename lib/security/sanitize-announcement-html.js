const ALLOWED_TAGS = new Set(["P", "STRONG", "EM", "UL", "OL", "LI", "A", "BR", "H1", "H2", "H3", "BLOCKQUOTE"]);

export function sanitizeAnnouncementUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, "https://deenbridge.invalid");
    if (url.protocol !== "https:" || url.origin !== "https://deenbridge.invalid") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function sanitizeAnnouncementHtml(value) {
  if (typeof value !== "string" || typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(value, "text/html");
  const walk = (node) => {
    [...node.children].forEach((child) => {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        child.replaceWith(...child.childNodes);
        return;
      }
      [...child.attributes].forEach((attribute) => {
        if (child.tagName !== "A" || !["href", "title"].includes(attribute.name)) {
          child.removeAttribute(attribute.name);
        }
      });
      if (child.tagName === "A") {
        const href = sanitizeAnnouncementUrl(child.getAttribute("href"));
        if (href) {
          child.setAttribute("href", href);
          child.setAttribute("rel", "noreferrer noopener");
        } else {
          child.replaceWith(...child.childNodes);
          return;
        }
      }
      walk(child);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
