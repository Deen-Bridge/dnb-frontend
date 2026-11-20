/**
 * Renders a JSON-LD structured-data script with serialization-safe content.
 * Fields that are undefined, functions, or would otherwise break JSON
 * serialization are dropped so malformed API payloads can never emit an
 * invalid <script type="application/ld+json">.
 */
export function JsonLd({ data }) {
  if (!data) return null;

  let html = null;
  try {
    html = JSON.stringify(data, (key, value) =>
      value === undefined || typeof value === "function" ? undefined : value
    );
  } catch {
    return null;
  }

  if (!html) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default JsonLd;