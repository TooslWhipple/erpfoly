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

const nextConfig: NextConfig = {
  ...(isDev ? { allowedDevOrigins } : {}),
  outputFileTracingRoot: path.resolve(__dirname),
  transpilePackages: ["@mui/x-date-pickers"],
  reactCompiler: true,
  reactStrictMode: true,
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
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
