# URL state policy

Dashboard search, filter, sort, and page values are treated as untrusted input.
Known values are length-bounded and validated before they enter component state;
malformed values fall back to a safe default. Tokens, payment data, private
content, and account credentials must never be serialized into a URL.

Only normalized, user-shareable filters should be written back to the address bar.
Route handlers and APIs must still enforce authorization because a safe URL is
not an authorization boundary.
