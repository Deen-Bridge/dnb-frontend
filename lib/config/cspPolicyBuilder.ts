export type AppDeployEnvironment = "development" | "preview" | "production";

export interface CspBuildOptions {
  environment: AppDeployEnvironment;
  apiOrigin: string;
  reportOnly?: boolean;
  reportUri?: string;
}

export function buildContentSecurityPolicyHeader(options: CspBuildOptions): {
  headerName: "Content-Security-Policy" | "Content-Security-Policy-Report-Only";
  headerValue: string;
} {
  const apiOrigin = options.apiOrigin.trim();
  const connectSources = [
    "'self'",
    apiOrigin,
    "https://horizon-testnet.stellar.org",
    "https://horizon.stellar.org",
  ];
  if (options.environment === "development") {
    connectSources.push("ws://localhost:3000");
  }

  const directives = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (options.reportUri) {
    directives.push(`report-uri ${options.reportUri}`);
  }

  return {
    headerName: options.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy",
    headerValue: directives.join("; "),
  };
}
