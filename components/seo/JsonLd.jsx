/** Serialize public structured data for safe HTML script embedding. */
export function serializeJsonLd(data) {
  if (!data) return null;
  try {
    const html = JSON.stringify(data, (key, value) =>
      value === undefined || typeof value === "function" ? undefined : value
    );
    return html?.replace(/[<>&\u2028\u2029]/g, (character) => ({
      "<": "\\u003c",
      ">": "\\u003e",
      "&": "\\u0026",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029",
    })[character]);
  } catch {
    return null;
  }
}

export function JsonLd({ data }) {
  const html = serializeJsonLd(data);
  if (!html) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default JsonLd;
