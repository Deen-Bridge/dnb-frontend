# JSON-LD security boundary

Issue [#766](https://github.com/Deen-Bridge/dnb-frontend/issues/766) routes
structured data through `components/seo/JsonLd`. Serialization escapes `<`,
`>`, `&`, U+2028, and U+2029 before JSON is embedded in an HTML script
element, preventing a user-authored `</script>` sequence from terminating it.

Only public, allowlisted profile/book/course/site fields may be passed to the
helper. Private pages must not emit structured data. The layout-level site
schema uses the same helper, so there is one tested embedding path.
