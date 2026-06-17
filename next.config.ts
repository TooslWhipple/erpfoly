import type { NextConfig } from "next";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  reactCompiler: true,
  reactStrictMode: true,
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
};

export default nextConfig;
