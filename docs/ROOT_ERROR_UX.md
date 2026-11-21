# Root error and not-found UX

Issue [#737](https://github.com/Deen-Bridge/dnb-frontend/issues/737) defines
the fallback behavior used before a locale-aware application shell is
available. Unknown locale state uses English, left-to-right direction, and
does not attempt to infer a user's language from untrusted URL data.

The global error page exposes three safe actions: retry the document, return to
the `/en` home route, and contact support. It never renders raw exception
details. Sentry receives one capture for the rendered error, and its returned
event ID is shown as a non-sensitive reference; a local `WEB-...` reference is
used if telemetry is unavailable. The not-found page offers the same safe home
and support paths without treating a missing route as an application failure.
