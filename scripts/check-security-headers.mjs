const target = process.env.SECURITY_HEADERS_URL || process.argv[2];

if (!target) {
  console.error("Set SECURITY_HEADERS_URL or pass the deployed URL as the first argument.");
  process.exit(2);
}

const required = [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const response = await fetch(target);
if (!response.ok) {
  console.error(`Security-header check received HTTP ${response.status} from ${target}`);
  process.exit(1);
}

const missing = required.filter((name) => !response.headers.has(name));
if (missing.length) {
  console.error(`Missing required security headers: ${missing.join(", ")}`);
  process.exit(1);
}

const csp = response.headers.get("content-security-policy") || "";
for (const unsafeDirective of ["'unsafe-eval'", "script-src *", "connect-src *"]) {
  if (csp.includes(unsafeDirective)) {
    console.error(`Unsafe CSP directive found: ${unsafeDirective}`);
    process.exit(1);
  }
}

console.log(`Security headers present at ${new URL(target).origin}`);
