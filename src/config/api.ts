/**
 * Backend API base URL. Must include /api (Nest global prefix).
 * Prefer NEXT_PUBLIC_ so the value is available in the browser.
 */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001/api";
