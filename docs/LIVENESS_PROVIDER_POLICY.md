# Liveness provider policy

The browser may use the deterministic mock adapter only when `NODE_ENV` is `development` or `test`. Production configuration must explicitly select `persona` or `onfido`; an unset, mock, or unsupported provider fails configuration resolution before a verification session starts.

If provider resolution fails in the onboarding UI, the capture enters an explicit failure state and does not issue a verification token. Provider credentials remain server-side. Release evidence should include the selected provider, configuration check, and a staging trace for unavailable, timeout, rejected, and successful captures.
