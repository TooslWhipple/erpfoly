/**
 * Google Maps JavaScript API key for browser usage (optional).
 * Prefer NEXT_PUBLIC_ so values are available on the client.
 */
export const googleMapsBrowserApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.GOOGLE_MAPS_API_KEY ??
  "";
