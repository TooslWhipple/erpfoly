import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const envAllowedDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

// ponytail: wildcard ngrok hosts so tunnels work without editing env each session
const allowedDevOrigins = [
  ...new Set([
    ...envAllowedDevOrigins,
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
  ]),
];

const backendProxyTarget =
  process.env.BACKEND_PROXY_TARGET?.trim() || "http://localhost:3001";

// El CDN de Vercel añade `Access-Control-Allow-Origin: *` a las respuestas
// estáticas y prerenderizadas, y no hay forma de quitarlo: solo de sobrescribirlo.
// Se fija al origen de producción del propio proyecto; las peticiones del mismo
// origen (incluidas las previews) no consultan CORS, así que nada legítimo cambia.
const vercelOrigin =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

const securityHeaders = [
  ...(vercelOrigin
    ? [
        {
          key: "Access-Control-Allow-Origin",
          value: `https://${vercelOrigin}`,
        },
      ]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  ...(isDev ? { allowedDevOrigins } : {}),
  outputFileTracingRoot: path.resolve(__dirname),
  transpilePackages: ["@mui/x-date-pickers"],
  reactCompiler: true,
  reactStrictMode: true,
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    if (!isDev) return [];

    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
