# Analytics consent and payload policy

Optional analytics is denied until the user explicitly grants consent. Unknown
and denied states must not enqueue or send analytics events. Events must pass
through payload minimization before dispatch; tokens, secrets, payment data,
wallet addresses, message content, URLs, raw identifiers, and emails are not
allowed. Consent changes are local, auditable state and callers must discard
queued optional events when consent is revoked or the user logs out.
