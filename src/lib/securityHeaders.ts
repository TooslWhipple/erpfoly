const apiConnectSrc = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) return "http://localhost:3001/api";
  if (apiUrl.startsWith("/")) return "'self'";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return apiUrl;
  }
})();

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://cdn.nubarium.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://placehold.co",
  `connect-src 'self' ${apiConnectSrc} https://*.googleapis.com https://*.gstatic.com https://cdn.nubarium.com https://*.novu.co wss://*.novu.co`,
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicyReportOnly,
  },
];
